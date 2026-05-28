"use client";

import { trpc } from "~/trpc/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, LogOut, Settings, BarChart, Plus, Globe, Inbox, Zap, LifeBuoy, MessageSquare } from "lucide-react";
import LoadingDashboard from "./loading";
import PricingCards from "~/components/PricingCards";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Check } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false
  });

  const { data: forms } = trpc.forms.list.useQuery(undefined, {
    enabled: !!user,
  });

  const formsCount = forms?.length || 0;
  const formsLimit = 3;
  const formsLeft = Math.max(0, formsLimit - formsCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && (error || !user)) {
      router.push("/login");
    }
  }, [mounted, isLoading, error, user, router]);

  if (!mounted || isLoading) {
    return <LoadingDashboard />;
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
            <Link href="/dashboard/explore" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <Globe className="mr-3 h-5 w-5 text-gray-500" />
              Public Forms
            </Link>
            <Link href="/dashboard/submissions" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <Inbox className="mr-3 h-5 w-5 text-gray-500" />
              Your Submissions
            </Link>
            
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support</p>
              <Link href="/dashboard/support" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <LifeBuoy className="mr-3 h-5 w-5 text-gray-500" />
                Help & Support
              </Link>
              <Link href="/dashboard/feedback" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                Feedback
              </Link>
            </div>
          </nav>
          <div className="p-4 border-t">
            <div className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-100/50 dark:border-blue-900/50 p-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider bg-blue-100/50 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">Starter Plan</span>
                </div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {formsLeft} forms left
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">{formsCount} / {formsLimit}</span>
                </div>
                <div className="w-full bg-blue-200/50 dark:bg-blue-900/50 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${formsCount >= formsLimit ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, (formsCount / formsLimit) * 100)}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="w-full py-1.5 px-2 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center gap-1.5">
                  <Zap className="h-3 w-3" /> Upgrade
                </button>
              </div>
            </div>

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
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </main>
      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="sm:max-w-6xl p-0 overflow-hidden bg-white dark:bg-gray-950 border-0 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold text-center">Simple, transparent pricing</DialogTitle>
              <DialogDescription className="text-center text-lg mt-2">
                Everything you need to build powerful forms.
              </DialogDescription>
            </DialogHeader>

            <PricingCards isDashboard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
