"use client";

import { LayoutTemplate, LogOut, Settings, BarChart, Globe, Inbox } from "lucide-react";
import { SkeletonFormCard } from "~/components/SkeletonLoading";

export default function LoadingDashboard() {
  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r bg-white/50 dark:bg-gray-900/50 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="ml-2 h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center px-3 py-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mr-3" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4 h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="ml-3 space-y-2">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-auto">
        <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="p-6 pb-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4 border-t pt-6" />
        </div>

        <div className="p-6 pt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonFormCard key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
