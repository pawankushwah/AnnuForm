"use client";

import { trpc } from "~/trpc/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, LogOut, Settings, BarChart, Plus } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && (error || !user)) {
      router.push("/login");
    }
  }, [mounted, isLoading, error, user, router]);

  if (!mounted || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isFormBuilder = pathname.includes('/dashboard/forms/');

  return (
    <div className="flex h-screen bg-transparent">
      {!isFormBuilder && (
        <aside className="w-64 border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <img src="/logo.png" alt="AnnuForm Logo" className="h-6 w-6" />
          <span className="ml-2 font-bold text-lg text-blue-600">AnnuForm</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <BarChart className="mr-3 h-5 w-5 text-gray-500" />
            My Forms
          </Link>
          <Link href="/explore" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <LayoutTemplate className="mr-3 h-5 w-5 text-gray-500" />
            Explore Templates
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium truncate w-40">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate w-40">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
