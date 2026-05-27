"use client";

import { trpc } from "~/trpc/client";
import Link from "next/link";
import { LayoutTemplate, Search, Eye } from "lucide-react";
import { format } from "date-fns";

export default function ExplorePage() {
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  const { data: forms, isLoading } = trpc.public.exploreForms.useQuery();
  console.log(forms, " forms")

  return (
    <div className="min-h-screen bg-transparent">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 dark:bg-gray-950/50 backdrop-blur-md justify-center">
        <div className="container mx-auto flex items-center justify-between w-full">
          <Link className="flex items-center justify-center" href="/">
            <img src="/logo.png" alt="AnnuForm Logo" className="h-6 w-6" />
            <span className="ml-2 font-bold text-xl tracking-tight text-blue-600">AnnuForm</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            {user ? (
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                  Login
                </Link>
                <Link className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors" href="/login">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore Public Forms</h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Discover templates and public forms created by the community.
          </p>
          <div className="w-full max-w-md relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              className="w-full h-12 pl-10 pr-4 rounded-full border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {isLoading ? (
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
          <div className="text-center py-20 border rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
            <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No forms found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">There are currently no public forms available in the gallery.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
            >
              Be the first one to create a form!
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
