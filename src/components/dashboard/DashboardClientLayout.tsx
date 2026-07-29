"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  Sun,
  Moon,
  BrainCircuit,
} from "lucide-react";

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
  const [isDark, setIsDark] = useState(true);

  React.useEffect(() => {
    const isDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(isDarkClass);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      setIsDark(true);
    }
  };

  const role = profile?.role || "student";

  const MENU_ITEMS = {
    student: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Career DNA", href: "/career", icon: FileText },
      { name: "Internships", href: "/internships", icon: Target },
      { name: "Mock Interview", href: "/interview", icon: BrainCircuit },
      { name: "Mentorship", href: "/mentorship", icon: Users },
      { name: "Portfolio", href: "/portfolio", icon: Globe },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
    company: [
      { name: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
      { name: "Internships", href: "/company/internships", icon: Briefcase },
      { name: "Applicants", href: "/company/applicants", icon: Users },
      { name: "Settings", href: "/company/settings", icon: Settings },
    ],
    mentor: [
      { name: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
      { name: "Students", href: "/mentor/students", icon: GraduationCap },
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

  const menuItems = MENU_ITEMS[role as keyof typeof MENU_ITEMS] || MENU_ITEMS.student;

  const dashboardLink = role === "student"
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
    : email?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-x-hidden text-foreground">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border shrink-0 sticky top-0 h-screen z-20">
        {/* Brand Logo */}
        <div className="h-20 border-b border-border flex items-center px-6">
          <Link href={dashboardLink} className="text-xl font-bold font-heading tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            VAJRA
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-primary/10 border border-primary/20 text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile card */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-foreground truncate">
                {profile?.full_name || "Vajra User"}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* 2. Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-sans hidden sm:block">
              {menuItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Status Pill */}
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              {role} 🚀
            </span>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-950 dark:bg-slate-950 border border-white/5 dark:border-white/5 text-slate-400 hover:text-white hover:border-white/10 dark:hover:border-white/10 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>

            {/* Notification Bell */}
            <button className="p-2 rounded-xl bg-slate-950 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            </button>

            {/* Profile Avatar */}
            <div className="h-10 w-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-300 sm:hidden">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Children Page content */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>

      {/* 3. Mobile Navigation Overlay Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-white/10 z-40 lg:hidden flex flex-col"
            >
              <div className="h-20 border-b border-white/10 flex items-center justify-between px-6">
                <span className="text-xl font-bold font-heading tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  VAJRA
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? "bg-blue-500/10 border border-blue-500/20 text-white"
                          : "text-slate-400 hover:text-white border border-transparent hover:bg-slate-950/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-400">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {profile?.full_name || "Vajra User"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate">{email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
