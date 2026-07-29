"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
      <aside className="hidden lg:flex flex-col w-72 bg-card/80 backdrop-blur-xl border-r border-border/70 shrink-0 sticky top-0 h-screen z-20 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
        {/* Brand Logo */}
        <div className="h-20 border-b border-border/70 flex items-center px-6">
          <Link href={dashboardLink} className="flex items-center gap-3 text-xl font-bold font-heading tracking-widest">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-sm text-primary shadow-inner shadow-primary/10">V</span>
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              VAJRA
            </span>
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
                    ? "bg-primary/10 border border-primary/20 text-foreground font-bold shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile card */}
        <div className="p-4 border-t border-border/70 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
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
        <header className="h-20 border-b border-border/70 bg-background/75 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur-md hover:text-foreground focus:outline-none"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="hidden text-sm font-bold uppercase tracking-wider text-foreground/80 font-sans sm:block">
              {menuItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Status Pill */}
            <span className="text-[10px] uppercase font-mono tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              {role} 🚀
            </span>

            {/* Theme Toggle */}
            <ThemeToggle className="hidden sm:block" />

            {/* Notification Bell */}
            <button className="relative rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground shadow-sm backdrop-blur-md">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            </button>

            {/* Profile Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-xs font-bold text-foreground shadow-sm backdrop-blur-md sm:hidden">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Children Page content */}
        <main className="flex-1 p-4 sm:p-6 relative">
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
              className="fixed inset-0 z-30 bg-foreground/60 lg:hidden backdrop-blur-[2px]"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-background/95 border-r border-border/70 z-40 lg:hidden flex flex-col backdrop-blur-xl"
            >
              <div className="h-20 border-b border-border/70 flex items-center justify-between px-6">
                <span className="text-xl font-bold font-heading tracking-widest bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  VAJRA
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg border border-border/70 p-1 text-muted-foreground hover:text-foreground"
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
                          ? "bg-primary/10 border border-primary/20 text-foreground"
                          : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/70 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
