"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Save, Eye, Settings, Plus, LayoutTemplate, Trash, Send, ChevronDown, PlusCircle, FolderOpen, Clock, Palette, Globe, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "~/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableFieldItem } from "~/components/SortableFieldItem";
import { DraggableFieldButton } from "~/components/DraggableFieldButton";
import { SkeletonBuilder } from "~/components/SkeletonLoading";
import { StructureFieldItem } from "~/components/StructureFieldItem";
import { format } from "date-fns";

const themeColors: Record<string, string> = {
  default: "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700",
  tech: "bg-slate-900 border-blue-500",
  anime: "bg-pink-100 border-pink-400 dark:bg-pink-900 dark:border-pink-700",
  minimal: "bg-white border-black dark:bg-black dark:border-white",
  movies: "bg-red-900 border-red-500",
  games: "bg-green-900 border-green-500",
  startups: "bg-indigo-50 border-indigo-300 dark:bg-indigo-900 dark:border-indigo-700",
  os: "bg-cyan-900 border-cyan-400",
  events: "bg-orange-100 border-orange-400 dark:bg-orange-900 dark:border-orange-700",
  communities: "bg-teal-50 border-teal-400 dark:bg-teal-900 dark:border-teal-700"
};
function CanvasDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable' });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-6 overflow-auto pb-32 transition-all ${isOver ? 'bg-blue-50/50 dark:bg-blue-900/10 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.5)]' : 'bg-gray-50 dark:bg-gray-950'
        }`}
    >
      {children}
    </div>
  );
}

const MentionTextarea = ({ value, onChange, fields, placeholder, className, rows = 3 }: any) => {
  const [mentionState, setMentionState] = useState({ active: false, cursorIndex: 0, query: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);

    const match = textBeforeCursor.match(/{{([^}]*)$/);
    if (match) {
      setMentionState({
        active: true,
        cursorIndex: cursor,
        query: match[1] || ""
      });
    } else {
      setMentionState(s => ({ ...s, active: false }));
    }
  };

  const insertField = (label: string) => {
    const before = value.slice(0, mentionState.cursorIndex - mentionState.query.length - 2);
    const after = value.slice(mentionState.cursorIndex);
    const newVal = before + "{{" + label + "}}" + after;
    onChange(newVal);
    setMentionState(s => ({ ...s, active: false }));
    textareaRef.current?.focus();
  };

  const filteredFields = fields.filter((f: any) => f.label.toLowerCase().includes(mentionState.query.toLowerCase()));

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={className}
        rows={rows}
        placeholder={placeholder}
      />
      {mentionState.active && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-900 border rounded-md shadow-xl max-h-48 overflow-y-auto" style={{ top: "100%", left: 0 }}>
          <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Insert Dynamic Field</div>
          {filteredFields.length === 0 ? (
            <div className="p-3 text-sm text-gray-400">No matching fields</div>
          ) : (
            filteredFields.map((f: any) => (
              <button
                key={f.id}
                onClick={() => insertField(f.label || 'Untitled')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {f.label || 'Untitled Field'}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}


export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: form, isLoading } = trpc.forms.get.useQuery({ id });
  const { data: recentForms } = trpc.forms.list.useQuery();
  const updateMutation = trpc.forms.update.useMutation();
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      router.push("/dashboard");
    }
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isPublished, setIsPublished] = useState(false);
  const [theme, setTheme] = useState("default");
  const [fields, setFields] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'builder' | 'logic'>('builder');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [logicSettings, setLogicSettings] = useState<any>({
    defaultSubmitMessage: "Thank you! Your response has been submitted successfully.",
    rules: []
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setVisibility(form.visibility);
      setIsPublished(form.isPublished);
      setTheme(form.theme);
      setFields(form.schema?.fields || []);
      if (form.schema?.settings) {
        setLogicSettings(form.schema.settings);
      }
    }
  }, [form]);

  // Auto-save logic
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const latestState = useRef({ title, description, visibility, theme, isPublished, fields, logicSettings });

  useEffect(() => {
    latestState.current = { title, description, visibility, theme, isPublished, fields, logicSettings };
  }, [title, description, visibility, theme, isPublished, fields, logicSettings]);

  useEffect(() => {
    if (!form) return;
    const interval = setInterval(() => {
      const state = latestState.current;
      updateMutation.mutate({
        id,
        title: state.title,
        description: state.description,
        visibility: state.visibility,
        theme: state.theme,
        isPublished: state.isPublished,
        schema: { fields: state.fields, settings: state.logicSettings }
      }, {
        onSuccess: () => {
          setLastSaved(new Date());
        }
      });
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [form, id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === 'new-field') {
      const fieldType = active.data.current.fieldType;
      const newField = {
        id: `f_${Date.now()}`,
        type: fieldType,
        label: `New ${fieldType} field`,
        required: false,
        options: fieldType.includes("Select") ? ["Option 1", "Option 2"] : undefined
      };

      const overIndex = fields.findIndex(f => f.id === over.id);

      if (overIndex !== -1) {
        const newFields = [...fields];
        newFields.splice(overIndex, 0, newField);
        setFields(newFields);
      } else {
        setFields([...fields, newField]);
      }
      return;
    }

    if (active.id !== over.id) {
      const activeId = active.id.toString().replace('structure-', '');
      const overId = over.id.toString().replace('structure-', '');

      const oldIndex = fields.findIndex((f) => f.id === activeId);
      const newIndex = fields.findIndex((f) => f.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        setFields((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      id,
      title,
      description,
      visibility,
      isPublished,
      theme,
      schema: { fields, settings: logicSettings }
    }, {
      onSuccess: () => toast.success("Form saved successfully!")
    });
  };

  const addField = (type: string) => {
    let typeName = type.replace(/([A-Z])/g, ' $1').trim();
    typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    if (type === 'url') typeName = 'URL';

    setFields([...fields, {
      id: `f_${Date.now()}`,
      type,
      label: typeName,
      required: false,
      options: (type === 'singleSelect' || type === 'checkbox') ? ["Option 1", "Option 2"] : undefined
    }]);
  };

  const updateField = (idx: number, updates: any) => {
    const newFields = [...fields];
    newFields[idx] = { ...newFields[idx], ...updates };
    setFields(newFields);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const duplicateField = (idx: number) => {
    const fieldToDuplicate = fields[idx];
    const newField = {
      ...fieldToDuplicate,
      id: `f_${Date.now()}`,
      label: `${fieldToDuplicate.label} (Copy)`
    };
    const newFields = [...fields];
    newFields.splice(idx + 1, 0, newField);
    setFields(newFields);
  };

  const addLogicRule = () => {
    setLogicSettings({
      ...logicSettings,
      rules: [
        ...(logicSettings.rules || []),
        { id: `rule_${Date.now()}`, fieldId: "", operator: "equals", value: "", message: "" }
      ]
    });
  };

  const updateLogicRule = (idx: number, updates: any) => {
    const newRules = [...(logicSettings.rules || [])];
    newRules[idx] = { ...newRules[idx], ...updates };
    setLogicSettings({ ...logicSettings, rules: newRules });
  };

  const removeLogicRule = (idx: number) => {
    const newRules = [...(logicSettings.rules || [])];
    newRules.splice(idx, 1);
    setLogicSettings({ ...logicSettings, rules: newRules });
  };

  const handlePublishMenu = (type: "PUBLIC" | "UNLISTED" | "PRIVATE") => {
    setVisibility(type);
    setIsPublished(true);
    updateMutation.mutate({
      id, title, description, visibility: type, isPublished: true, theme, schema: { fields, settings: logicSettings }
    }, {
      onSuccess: () => toast.success(`Form published as ${type.toLowerCase()}!`)
    });
  };

  const handleShare = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    setShareDialogOpen(true);
  };
  if (isLoading) return <SkeletonBuilder />;

  if (!form) return <div className="p-8 text-center text-red-500">Form not found</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/dashboard" className="flex items-center justify-center mr-1">
              <img src="/logo.png" alt="AnnuForm Logo" className="h-6 w-6 hover:opacity-80 transition-opacity" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md outline-none">
                File <ChevronDown className="h-3 w-3 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => window.open('/dashboard', '_blank')} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>New Form</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Open Recent</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {recentForms?.slice(0, 5).map((f: any) => (
                        <DropdownMenuItem key={f.id} onClick={() => router.push(`/dashboard/forms/${f.id}`)} className="cursor-pointer">
                          <LayoutTemplate className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[150px]">{f.title}</span>
                        </DropdownMenuItem>
                      ))}
                      {recentForms?.length === 0 && (
                        <DropdownMenuItem disabled>No recent forms</DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-lg max-w-[200px] ml-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              placeholder="Form Title"
            />
            <div className="flex items-center gap-2 hidden sm:flex">
              <span className={`text-xs px-2 py-1 rounded-full ${isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Saved {format(lastSaved, "h:mm a")}
              </span>
            )}
            <div className="flex items-center gap-2">
              {isPublished && visibility !== "PRIVATE" && (
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 h-9 px-4"
                    >
                      <LayoutTemplate className="mr-2 h-4 w-4" /> Share
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share this form</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}`}
                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm dark:bg-gray-900 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/f/${id}`);
                          toast.success("Link copied!");
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href={`https://wa.me/?text=Check%20out%20this%20form%3A%20${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}`} target="_blank" rel="noreferrer" className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                        WhatsApp
                      </a>
                      <a href={`https://t.me/share/url?url=${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}&text=Check%20out%20this%20form`} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                        Telegram
                      </a>
                      <a href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}&text=Check%20out%20this%20form`} target="_blank" rel="noreferrer" className="p-3 bg-black text-white rounded-full hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                        X (Twitter)
                      </a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.origin : ''}/f/${id}`} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-800 rounded-full hover:bg-blue-100 transition-colors">
                        Facebook
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isPublished && (
                <Link
                  href={`/f/${id}`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border hover:bg-gray-100 h-9 px-4"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Live
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md transition-colors border border-gray-200 hover:bg-gray-100 h-9 px-3 gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline capitalize">{theme}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] p-3 max-h-[400px] overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Themes</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(themeColors).map(([t, colorClass]) => (
                      <DropdownMenuItem
                        asChild
                        key={t}
                      >
                        <div
                          onClick={() => setTheme(t)}
                          className={`cursor-pointer group flex flex-col gap-1.5 p-2 rounded-lg border-2 transition-all outline-none focus:bg-gray-50 dark:focus:bg-gray-800 ${theme === t ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <div className={`w-full h-12 rounded-md border shadow-sm ${colorClass}`}></div>
                          <span className="text-xs font-medium text-center capitalize w-full flex items-center justify-center gap-1">
                            {t}
                            {theme === t && <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 hover:bg-gray-100 h-9 px-4"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>

              {(!isPublished || visibility === "PRIVATE") ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4"
                    >
                      <Send className="mr-2 h-4 w-4" /> Publish
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePublishMenu("PUBLIC")} className="cursor-pointer">
                      <Globe className="mr-2 h-4 w-4 text-green-600" /> Publish to Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePublishMenu("UNLISTED")} className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4 text-yellow-600" /> Publish as Unlisted
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 h-9 px-4 gap-2 border border-transparent">
                      {visibility === 'PUBLIC' ? <Globe className="h-4 w-4 text-green-600" /> : <ExternalLink className="h-4 w-4 text-yellow-600" />}
                      <span className="capitalize">{visibility.toLowerCase()}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {visibility === 'UNLISTED' && (
                      <DropdownMenuItem onClick={() => handlePublishMenu("PUBLIC")} className="cursor-pointer">
                        <Globe className="mr-2 h-4 w-4 text-green-600" /> Publish to Public
                      </DropdownMenuItem>
                    )}
                    {visibility === 'PUBLIC' && (
                      <DropdownMenuItem onClick={() => handlePublishMenu("UNLISTED")} className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4 text-yellow-600" /> Publish as Unlisted
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handlePublishMenu("PRIVATE")} className="cursor-pointer">
                      <Lock className="mr-2 h-4 w-4 text-red-600" /> Make Private
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

          <div className="flex-1 flex overflow-hidden">

            {/* Structure Sidebar (Left) */}
            <div className="w-64 border-r bg-gray-50 dark:bg-gray-950 flex flex-col overflow-auto shrink-0 z-10 hidden lg:flex">

              <div className="p-4 border-b font-semibold flex items-center gap-2 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <FolderOpen className="h-4 w-4" /> Navigation
              </div>

              <div className="p-4 pb-2 border-b bg-gray-50 dark:bg-gray-950">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveView('builder')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md font-medium transition-colors ${activeView === 'builder' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  >
                    Builder
                  </button>
                  <button
                    onClick={() => setActiveView('logic')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md font-medium transition-colors ${activeView === 'logic' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  >
                    Submission Message
                  </button>
                </div>
              </div>

              <div className="p-4 border-b font-semibold flex items-center gap-2 bg-white dark:bg-gray-900 sticky top-0">
                <LayoutTemplate className="h-4 w-4" /> {activeView === 'builder' ? 'Structure' : 'Fields'}
              </div>
              <div className="p-4">
                <SortableContext
                  items={fields.map(f => `structure-${f.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.length === 0 && (
                      <div className="text-sm text-center text-gray-400 py-4">No fields yet</div>
                    )}
                    {fields.map((f, i) => (
                      <StructureFieldItem
                        key={`structure-${f.id}`}
                        field={f}
                        index={i}
                        removeField={removeField}
                        duplicateField={duplicateField}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>

            {activeView === 'builder' ? (
              <>
                {/* Builder Canvas (Middle) */}
                <CanvasDroppable>
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-3xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0 mb-2 placeholder:text-gray-300"
                        placeholder="Form Title"
                      />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-gray-500 w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder:text-gray-300"
                        placeholder="Add a description..."
                        rows={2}
                      />
                    </div>

                    <SortableContext
                      items={fields.map(f => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {fields.length === 0 && (
                          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center text-gray-400">
                            Drag and drop elements here, or click them in the sidebar to add.
                          </div>
                        )}
                        {fields.map((f, i) => (
                          <SortableFieldItem
                            key={f.id}
                            field={f}
                            index={i}
                            updateField={updateField}
                            removeField={removeField}
                            duplicateField={duplicateField}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                </CanvasDroppable>

                {/* Field Types Column (Right) */}
                <div className="w-64 border-l bg-gray-50 dark:bg-gray-950 flex flex-col overflow-auto shrink-0 z-10">
                  <div className="p-4 border-b font-semibold flex items-center gap-2 bg-white dark:bg-gray-900 sticky top-0">
                    <Plus className="h-4 w-4" /> Elements
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Basic Fields</p>
                    <div className="space-y-2">
                      {['shortText', 'longText', 'email', 'number', 'url', 'date'].map(type => (
                        <div key={type} onClick={() => addField(type)}>
                          <DraggableFieldButton type={type} />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 mt-6">Choices & Ratings</p>
                    <div className="space-y-2">
                      {['singleSelect', 'checkbox', 'rating'].map(type => (
                        <div key={type} onClick={() => addField(type)}>
                          <DraggableFieldButton type={type} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-950 pb-32">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Submission Logic</h2>
                    <p className="text-gray-500">Configure what message is shown to the user after they submit the form based on their answers.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg">Default Submission Message</h3>
                    <MentionTextarea
                      fields={fields}
                      value={logicSettings.defaultSubmitMessage || ""}
                      onChange={(val: string) => setLogicSettings({ ...logicSettings, defaultSubmitMessage: val })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-950"
                      rows={3}
                      placeholder="Thank you! Your response has been submitted successfully."
                    />
                    <p className="text-sm text-gray-400">This message is shown if no other logic rules match. Type {'{{'} to insert a dynamic field.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Conditional Rules</h3>
                      <button
                        onClick={addLogicRule}
                        className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add Rule
                      </button>
                    </div>

                    {(logicSettings.rules || []).length === 0 && (
                      <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-900/50">
                        No rules added yet. Add a rule to show custom messages based on user input.
                      </div>
                    )}

                    {(logicSettings.rules || []).map((rule: any, i: number) => (
                      <div key={rule.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border shadow-sm space-y-4 relative group hover:border-blue-200 transition-colors">
                        <button
                          onClick={() => removeLogicRule(i)}
                          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">Rule {i + 1}</span>
                          IF
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <select
                            value={rule.fieldId}
                            onChange={(e) => updateLogicRule(i, { fieldId: e.target.value })}
                            className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-950 focus:ring-1 focus:outline-none"
                          >
                            <option value="">-- Select Field --</option>
                            {fields.map(f => (
                              <option key={f.id} value={f.id}>{f.label || 'Untitled Field'}</option>
                            ))}
                          </select>

                          <select
                            value={rule.operator}
                            onChange={(e) => updateLogicRule(i, { operator: e.target.value })}
                            className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-950 focus:ring-1 focus:outline-none"
                          >
                            <option value="equals">Equals</option>
                            <option value="notEquals">Does Not Equal</option>
                            <option value="contains">Contains</option>
                            <option value="greaterThan">Greater Than</option>
                            <option value="lessThan">Less Than</option>
                          </select>

                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateLogicRule(i, { value: e.target.value })}
                            placeholder="Value..."
                            className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-950 focus:ring-1 focus:outline-none"
                          />
                        </div>

                        <div className="pt-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">THEN SHOW MESSAGE:</div>
                          <MentionTextarea
                            fields={fields}
                            value={rule.message}
                            onChange={(val: string) => updateLogicRule(i, { message: val })}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-950"
                            rows={2}
                            placeholder="Custom message for this rule..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </DndContext>
  );
}
