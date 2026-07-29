"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold font-heading tracking-wider bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
              VAJRA
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth State / CTA actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isLoading ? (
              <div className="h-10 w-24 rounded-xl border border-border/70 bg-muted/60 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/15"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-md">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-medium">{displayName}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-destructive cursor-pointer shadow-sm backdrop-blur-md"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground font-sans transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-violet-500 p-0.5 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span className="relative flex items-center gap-1 rounded-[10px] bg-background/90 px-5 py-2.5 transition-all duration-150 ease-out group-hover:bg-transparent">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur-md hover:text-foreground focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 w-full z-40 border-b border-border/70 bg-background/95 md:hidden overflow-hidden backdrop-blur-xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="my-2 h-px bg-border/70" />
              
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 p-3">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-foreground">{displayName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setIsOpen(false)}
                      className="w-full rounded-xl bg-primary px-4 py-3 text-center font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-center font-medium text-destructive transition-all hover:-translate-y-0.5 hover:bg-destructive/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full rounded-xl border border-border/70 px-4 py-3 text-center font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-violet-500 px-4 py-3 text-center font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-95"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
