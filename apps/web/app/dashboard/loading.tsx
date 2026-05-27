"use client";

import { LayoutTemplate } from "lucide-react";
import { AnimatedBackground } from "~/components/AnimatedBackground";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent w-full">
      <AnimatedBackground />
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 w-24 h-24 animate-spin opacity-70"></div>
        
        {/* Inner glass icon container */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-800/50 animate-pulse">
          <LayoutTemplate className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center space-y-2">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse">
          Loading AnnuForm...
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Preparing your workspace</p>
      </div>
    </div>
  );
}
