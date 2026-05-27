"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Save, Eye, Settings, Plus, LayoutTemplate, Send, ChevronDown, PlusCircle, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { StructureFieldItem } from "~/components/StructureFieldItem";

function CanvasDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable' });
  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 p-6 overflow-auto pb-32 transition-all ${
        isOver ? 'bg-blue-50/50 dark:bg-blue-900/10 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.5)]' : 'bg-gray-50 dark:bg-gray-950'
      }`}
    >
      {children}
    </div>
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: form, isLoading } = trpc.forms.get.useQuery({ id });
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

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setVisibility(form.visibility);
      setIsPublished(form.isPublished);
      setTheme(form.theme);
      setFields(form.schema?.fields || []);
    }
  }, [form]);

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
      schema: { fields }
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
      label: `New ${typeName} field`, 
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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <LayoutTemplate className="w-12 h-12 text-blue-500 animate-pulse" />
      <div className="text-gray-500 font-medium animate-pulse">Loading Builder Canvas...</div>
    </div>
  );
  
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
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>Open Recent</span>
                </DropdownMenuItem>
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
          <div className="flex items-center gap-2">
            {isPublished && (
              <Link 
                href={`/f/${id}`} 
                target="_blank"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border hover:bg-gray-100 h-9 px-4"
              >
                <Eye className="mr-2 h-4 w-4" /> View Live
              </Link>
            )}
            <button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 hover:bg-gray-100 h-9 px-4"
            >
              <Save className="mr-2 h-4 w-4" /> 
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4">
                  <Send className="mr-2 h-4 w-4" /> Publish
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Form Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-950">
                      <span className="text-sm font-medium">Published</span>
                      <input 
                        type="checkbox" 
                        className="toggle" 
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Visibility</label>
                    <select 
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-1"
                    >
                      <option value="PUBLIC">Public (Explore)</option>
                      <option value="UNLISTED">Unlisted (Link)</option>
                      <option value="PRIVATE">Private (You only)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Theme Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['default', 'tech', 'anime', 'minimal'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`p-2 border rounded-lg text-sm text-center capitalize transition-colors ${theme === t ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Structure Sidebar (Left) */}
          <div className="w-64 border-r bg-gray-50 dark:bg-gray-950 flex flex-col overflow-auto shrink-0 z-10 hidden lg:flex">
            <div className="p-4 border-b font-semibold flex items-center gap-2 bg-white dark:bg-gray-900 sticky top-0">
              <LayoutTemplate className="h-4 w-4" /> Structure
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

        </div>
      </div>
    </DndContext>
  );
}
