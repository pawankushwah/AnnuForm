"use client";

import { trpc } from "~/trpc/client";
import Link from "next/link";
import { LayoutTemplate, Search, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ExplorePage() {
  const { data: forms, isLoading, error } = trpc.public.exploreForms.useQuery();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center px-6 shrink-0 sticky top-0 z-10">
        <h1 className="font-bold text-lg flex items-center gap-2">
          Public Forms
        </h1>
      </div>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <p className="max-w-[700px] text-gray-500 md:text-lg dark:text-gray-400">
            Discover templates and public forms created by the community.
          </p>
          <div className="w-full max-w-md relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              className="w-full h-12 pl-10 pr-4 rounded-full border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {error ? (
          <div className="text-center py-20 border rounded-2xl bg-white/50 dark:bg-gray-900/50 shadow-sm flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-red-500">Error getting Forms</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error.message || "An unexpected error occurred while fetching public forms."}</p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                  <div className="pt-4 mt-auto border-t flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : forms?.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-white/50 dark:bg-gray-900/50 shadow-sm">
            <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No forms found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">There are currently no public forms available in the gallery.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
            >
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {forms?.map((form: any) => (
              <div key={form.id} className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-24 ${form.theme === 'tech' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    form.theme === 'anime' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                      form.theme === 'minimal' ? 'bg-gray-200 dark:bg-gray-800' :
                        'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
                  }`} />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{form.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {form.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t text-sm">
                    <span className="text-gray-400 text-xs">{format(new Date(form.createdAt), "MMM d, yyyy")}</span>
                    <Link
                      href={`/f/${form.id}`}
                      className="inline-flex items-center text-blue-600 font-medium hover:underline"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View Form
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

