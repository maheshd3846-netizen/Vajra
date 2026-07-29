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
              <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase">
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
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-mono tracking-widest text-muted-foreground font-semibold">
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
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border border-sidebar-border shadow-xs"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
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
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/30">
            <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                {profile?.full_name || "Vajra User"}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-[11px] uppercase font-semibold text-foreground/70">
                {role}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="font-semibold text-foreground">
                {currentItem?.name || "Overview"}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Command Trigger */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-input/40 text-muted-foreground text-xs cursor-pointer hover:border-foreground/20">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px]">Search platform...</span>
              <kbd className="ml-2 font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle className="h-8 w-8 rounded-lg" />

            {/* Notification Bell */}
            <button className="relative rounded-lg border border-border p-2 text-muted-foreground transition-all hover:text-foreground hover:bg-secondary cursor-pointer">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            {/* User Initials Avatar (Mobile) */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-primary/10 text-xs font-mono font-bold text-primary sm:hidden">
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
              className="fixed inset-0 z-30 bg-background/80 backdrop-blur-xs lg:hidden"
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
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
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
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border border-sidebar-border"
                          : "text-muted-foreground hover:text-sidebar-foreground"
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
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/30">
                  <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                      {profile?.full_name || "Vajra User"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
