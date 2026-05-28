import React from "react";

export function SkeletonFormCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm animate-pulse">
      <div className="h-24 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-6" />
        <div className="flex items-center justify-between mt-auto">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBuilder() {
  return (
    <div className="flex-1 flex flex-col h-full animate-pulse">
      {/* Topbar Skeleton */}
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
      
      {/* Main Skeleton Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-gray-50 dark:bg-gray-950 p-4 hidden lg:block">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            ))}
          </div>
        </div>
        
        {/* Center Canvas */}
        <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-32 bg-white dark:bg-gray-900 border rounded-xl" />
            <div className="h-40 bg-white dark:bg-gray-900 border rounded-xl" />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l bg-gray-50 dark:bg-gray-950 p-4 hidden xl:block">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
