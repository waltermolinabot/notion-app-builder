export const dynamic = 'force-dynamic';

import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { LayoutDashboard, AppWindow, Settings, CreditCard, Database, History } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const userId = user?.id;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Notion App Builder</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/apps"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <AppWindow className="w-5 h-5" />
            Apps
          </Link>
          <Link
            href="/dashboard/data-sources"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Database className="w-5 h-5" />
            Data Sources
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Billing
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-slate-400">Account</span>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header with notifications */}
        <div className="flex justify-end mb-6">
          {userId && <NotificationBell userId={userId} />}
        </div>
        {children}
      </main>
    </div>
  );
}
