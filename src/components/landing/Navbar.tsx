"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

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
        className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-md"
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
            {isLoading ? (
              <div className="h-9 w-24 bg-slate-800/50 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold font-mono transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs font-sans">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-medium">{displayName}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
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
                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-xl group bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-600 text-white focus:ring-2 focus:outline-none focus:ring-blue-800"
                >
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-950 rounded-[10px] group-hover:bg-opacity-0 flex items-center gap-1">
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
            className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none"
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
            className="fixed top-20 left-0 w-full z-40 bg-slate-950/95 border-b border-white/10 md:hidden overflow-hidden backdrop-blur-lg"
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
              <div className="h-[1px] bg-white/10 my-2" />
              
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-white/10">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-blue-400" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-white">{displayName}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="w-full text-center py-3 rounded-xl bg-slate-900 border border-white/10 text-red-400 font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                      className="w-full text-center py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
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
