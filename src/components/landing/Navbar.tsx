"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Mentors", href: "#mentors" },
    { name: "Companies", href: "#companies" },
    { name: "FAQ", href: "#faq" },
  ];

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

          {/* Desktop CTA actions */}
          <div className="hidden md:flex items-center gap-4">
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
