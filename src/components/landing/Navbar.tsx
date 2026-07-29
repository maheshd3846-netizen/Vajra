"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, isLoading } = useAuth();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Mentors", href: "#mentors" },
    { name: "Companies", href: "#companies" },
    { name: "FAQ", href: "#faq" },
  ];

  const role = profile?.role || user?.user_metadata?.role || "student";
  const dashboardHref =
    role === "company"
      ? "/company/dashboard"
      : role === "mentor"
      ? "/mentor/dashboard"
      : role === "admin" || role === "super_admin"
      ? "/admin/dashboard"
      : "/dashboard";

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-black shadow-xs">
              V
            </div>
            <span className="text-sm font-semibold tracking-wider text-foreground font-mono">
              VAJRA
            </span>
            <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 hidden sm:inline-flex">
              Enterprise
            </Badge>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground font-sans font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth State / CTA actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle className="h-8 w-8 rounded-lg" />
            {isLoading ? (
              <div className="h-8 w-20 rounded-lg border border-border bg-muted/60 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground shadow-xs">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary font-mono">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate font-medium">{displayName}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="h-8 w-8 rounded-lg" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 w-full bg-card border-b border-border z-40 p-4 md:hidden flex flex-col gap-3 shadow-lg"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-medium py-1.5"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-destructive/20 text-destructive py-2 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center rounded-lg border border-border py-2 text-xs font-semibold text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
