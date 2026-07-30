"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Target,
  Globe,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Users,
  MessageSquare,
  Building,
  GraduationCap,
  BarChart3,
  Briefcase,
  BrainCircuit,
  UserCheck,
  Search,
  ChevronRight,
  TrendingUp,
  Activity,
  CalendarCheck,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
  email: string | undefined;
}

export default function DashboardClientLayout({
  children,
  profile,
  email,
}: DashboardClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const role = profile?.role || "student";

  const MENU_ITEMS: Record<string, MenuItem[]> = {
    student: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Career DNA", href: "/career", icon: FileText, badge: "AI" },
      { name: "Internships", href: "/internships", icon: Target },
      { name: "Progress Tracker", href: "/internships/progress", icon: TrendingUp, badge: "NEW" },
      { name: "Mock Interview", href: "/interview", icon: BrainCircuit },
      { name: "Mentorship", href: "/mentorship", icon: Users },
      { name: "Portfolio", href: "/portfolio", icon: Globe },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
    company: [
      { name: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
      { name: "Internships", href: "/company/internships", icon: Briefcase },
      { name: "Applicants", href: "/company/applicants", icon: Users },
      { name: "Intern Tracker", href: "/company/interns", icon: UserCheck },
      { name: "Progress Tracker", href: "/company/progress", icon: Activity, badge: "LIVE" },
      { name: "Settings", href: "/company/settings", icon: Settings },
    ],
    mentor: [
      { name: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
      { name: "Companies", href: "/mentor/dashboard/companies", icon: Building },
      { name: "Students", href: "/mentor/students", icon: GraduationCap },
      { name: "Progress Reviews", href: "/mentor/progress", icon: CalendarCheck, badge: "REVIEW" },
      { name: "Feedback", href: "/mentor/feedback", icon: MessageSquare },
      { name: "Settings", href: "/mentor/settings", icon: Settings },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Companies", href: "/admin/companies", icon: Building },
      { name: "Internships", href: "/admin/internships", icon: Briefcase },
      { name: "Students", href: "/admin/students", icon: GraduationCap },
      { name: "Mentors", href: "/admin/mentors", icon: Users },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    super_admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Companies", href: "/admin/companies", icon: Building },
      { name: "Internships", href: "/admin/internships", icon: Briefcase },
      { name: "Students", href: "/admin/students", icon: GraduationCap },
      { name: "Mentors", href: "/admin/mentors", icon: Users },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  };

  const menuItems = MENU_ITEMS[role] || MENU_ITEMS.student;

  const dashboardLink =
    role === "student"
      ? "/dashboard"
      : role === "company"
      ? "/company/dashboard"
      : role === "mentor"
      ? "/mentor/dashboard"
      : role === "admin" || role === "super_admin"
      ? "/admin/dashboard"
      : "/";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed.");
        return;
      }
      toast.success("Successfully logged out.");
      router.push("/login");
    } catch {
      toast.error("An unexpected error occurred during logout.");
    }
  };

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.substring(0, 2).toUpperCase() || "US";

  const currentItem = menuItems.find((item) => item.href === pathname);

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground antialiased selection:bg-primary/20">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0 sticky top-0 h-screen z-20">
        {/* Brand Header */}
        <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-4">
          <Link href={dashboardLink} className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-black shadow-xs group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wider text-sidebar-foreground font-mono leading-none">
                VAJRA
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase mt-0.5">
                Intelligence
              </span>
            </div>
          </Link>
          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
            v2.4
          </Badge>
        </div>

        {/* Workspace Nav Header */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
            <span>Navigation</span>
            <span className="text-primary font-bold uppercase">{role}</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant="ai" className="text-[9px] px-1.5 py-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile Box */}
        <div className="p-3 border-t border-sidebar-border flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div className="h-7 w-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-none">
                {profile?.full_name || "Vajra User"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden rounded-lg border border-border p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-[11px] uppercase font-semibold text-slate-700 dark:text-slate-300">
                {role}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {currentItem?.name || "Overview"}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Command Trigger */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Search platform...</span>
              <kbd className="ml-2 font-mono text-[9px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                ⌘K
              </kbd>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800" />

            {/* Notification Bell */}
            <button className="relative rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 dark:text-slate-400 transition-all hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            {/* User Initials Avatar (Mobile) */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-xs font-mono font-bold text-indigo-700 sm:hidden">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Children Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* 3. Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-40 lg:hidden flex flex-col"
            >
              <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold">
                    V
                  </div>
                  <span className="text-sm font-semibold tracking-wider text-sidebar-foreground font-mono">
                    VAJRA
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="ai" className="text-[9px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-sidebar-border flex flex-col gap-2">
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="h-7 w-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-none">
                      {profile?.full_name || "Vajra User"}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">{email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
