"use client";

import { trpc } from "~/trpc/client";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Settings, Eye, Globe, Lock, ExternalLink, MoreVertical, Copy, Trash, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  useEffect(() => {
    utils.forms.list.invalidate();
  }, []);

  const { data: forms, isLoading } = trpc.forms.list.useQuery();

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.forms.list.invalidate();
      setFormToDelete(null);
    }
  });

  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated");
      utils.forms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate form");
    }
  });

  const createFormMutation = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push(`/dashboard/forms/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    }
  });

  const handleCreate = () => {
    createFormMutation.mutate({ title: "Untitled Form", description: "" });
  };

  const handleCreateTemplate = (templateId: string) => {
    let schema: any = { fields: [], settings: {} };
    let title = "New Form";
    
    if (templateId === 'contact') {
      title = "Contact Us";
      schema = {
        fields: [
          { id: "f1", type: "shortText", label: "Full Name", required: true },
          { id: "f2", type: "email", label: "Email Address", required: true },
          { id: "f3", type: "longText", label: "Message", required: true }
        ],
        settings: { defaultSubmitMessage: "Thanks for reaching out! We will get back to you shortly." }
      };
    } else if (templateId === 'event') {
      title = "Event Registration";
      schema = {
        fields: [
          { id: "f1", type: "shortText", label: "First Name", required: true },
          { id: "f2", type: "shortText", label: "Last Name", required: true },
          { id: "f3", type: "email", label: "Email Address", required: true },
          { id: "f4", type: "singleSelect", label: "T-Shirt Size", required: true, options: ["S", "M", "L", "XL"] }
        ],
        settings: { defaultSubmitMessage: "You are registered! See you at the event." }
      };
    } else if (templateId === 'feedback') {
      title = "Customer Feedback";
      schema = {
        fields: [
          { id: "f1", type: "singleSelect", label: "How satisfied are you with our service?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] },
          { id: "f2", type: "longText", label: "What could we improve?", required: false }
        ],
        settings: { defaultSubmitMessage: "Thank you for your valuable feedback." }
      };
    }

    createFormMutation.mutate({ title, description: "Created from template", schema, theme: "default" } as any);
  };
  return (
    <div className="flex-1 overflow-auto">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
        <h1 className="font-semibold text-lg">My Forms</h1>
        <button
          onClick={handleCreate}
          disabled={createFormMutation.isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          {createFormMutation.isPending ? "Creating..." : "Create Form"}
        </button>
      </div>
      <div className="p-6 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Start from Template</h2>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div 
            onClick={handleCreate}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800 p-6 cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm"
          >
            <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-950 flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Blank Form</span>
          </div>

          <div 
            onClick={() => handleCreateTemplate('contact')}
            className="group flex flex-col rounded-2xl border bg-white dark:bg-gray-950 p-6 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 relative z-10">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 relative z-10">Contact Us</span>
            <span className="text-xs text-gray-500 mt-1 relative z-10">Capture leads</span>
          </div>

          <div 
            onClick={() => handleCreateTemplate('event')}
            className="group flex flex-col rounded-2xl border bg-white dark:bg-gray-950 p-6 cursor-pointer transition-all hover:shadow-lg hover:border-orange-300 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mb-4 relative z-10">
              <span className="text-orange-600 font-bold text-xl">E</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 relative z-10">Event RSVP</span>
            <span className="text-xs text-gray-500 mt-1 relative z-10">Collect attendees</span>
          </div>

          <div 
            onClick={() => handleCreateTemplate('feedback')}
            className="group flex flex-col rounded-2xl border bg-white dark:bg-gray-950 p-6 cursor-pointer transition-all hover:shadow-lg hover:border-green-300 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4 relative z-10">
              <span className="text-green-600 font-bold text-xl">F</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 relative z-10">Feedback</span>
            <span className="text-xs text-gray-500 mt-1 relative z-10">Gather insights</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 border-t pt-6">Recent Forms</h2>
      </div>

      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 p-5 shadow-sm animate-pulse h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : forms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">No forms yet</h3>
            <p className="text-gray-500 max-w-sm mb-4">Create your first form to start collecting responses.</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white border shadow-sm hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900 h-9 px-4"
            >
              Create Form
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms?.map((form: any) => (
              <div
                key={form.id}
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                className="group relative flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate pr-4">{form.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
                        {form.isPublished ? (
                          form.visibility === "PUBLIC" ? <><Globe className="h-3 w-3 mr-1 text-green-600" /> Public</> :
                            form.visibility === "UNLISTED" ? <><ExternalLink className="h-3 w-3 mr-1 text-yellow-600" /> Unlisted</> :
                              <><Lock className="h-3 w-3 mr-1 text-red-600" /> Private</>
                        ) : (
                          <span className="text-gray-500">Draft</span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 -mr-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/forms/${form.id}`); }} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {form.isPublished && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/f/${form.id}`, '_blank'); }} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Live
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate({ id: form.id }); }} className="cursor-pointer">
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormToDelete(form.id);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {form.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                  <span>Created {format(new Date(form.createdAt), "MMM d, yyyy")}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/analytics/${form.id}`); }}
                    className="flex items-center font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <BarChart className="h-4 w-4 mr-1.5" /> Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!formToDelete} onOpenChange={(open) => !open && setFormToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone and will permanently delete all associated responses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button 
              onClick={() => setFormToDelete(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => formToDelete && deleteMutation.mutate({ id: formToDelete })}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Form"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
