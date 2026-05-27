"use client";

import { trpc } from "~/trpc/client";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Settings, Eye, Globe, Lock, ExternalLink, MoreVertical, Copy, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: forms, isLoading } = trpc.forms.list.useQuery();
  const { data: publicForms, isLoading: isPublicLoading } = trpc.public.exploreForms.useQuery();

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.forms.list.invalidate();
    }
  });

  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated");
      utils.forms.list.invalidate();
    }
  });

  const createFormMutation = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push(`/dashboard/forms/${data.id}`);
    }
  });

  const handleCreate = () => {
    createFormMutation.mutate({ title: "Untitled Form", description: "" });
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

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading your forms...</div>
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
                              if (confirm('Are you sure you want to delete this form?')) {
                                deleteMutation.mutate({ id: form.id });
                              }
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-14 border-t border-b bg-gray-50/50 dark:bg-gray-900/20 flex items-center px-6 mt-8">
        <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Explore Public Forms</h2>
      </div>

      <div className="p-6">
        {isPublicLoading ? (
          <div className="text-center py-12 text-gray-500">Loading public forms...</div>
        ) : publicForms?.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
            No public forms available yet. Be the first to publish one!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publicForms?.map((form: any) => (
              <div key={form.id} className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-24 ${form.theme === 'tech' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    form.theme === 'anime' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                      form.theme === 'minimal' ? 'bg-gray-100 dark:bg-gray-800' :
                        'bg-gradient-to-r from-indigo-500 to-blue-500'
                  }`} />
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 truncate">{form.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                    {form.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-400">By {JSON.stringify(form.creator)}</span>
                    <Link
                      href={`/f/${form.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 h-8 px-3"
                    >
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
