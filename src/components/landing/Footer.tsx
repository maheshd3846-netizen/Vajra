"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "How It Works", href: "#how-it-works" },
      { name: "Verifications", href: "#" },
    ],
    Resources: [
      { name: "Documentation", href: "#" },
      { name: "Faculty Access", href: "#" },
      { name: "Support Forum", href: "#" },
    ],
    Legal: [
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Cookie Policies", href: "#" },
    ],
  };

  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-background py-16">
      {/* Footer background radial glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Logo & Pitch */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold font-heading tracking-wider bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                VAJRA
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-sans">
              VAJRA builds AI-powered software that is fast, secure, and engineered for the future of developer matching and talent verification.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="rounded-lg border border-border/70 bg-background/70 p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="rounded-lg border border-border/70 bg-background/70 p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="rounded-lg border border-border/70 bg-background/70 p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/80 font-sans">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground font-sans"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Line */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row">
          <p className="text-[10px] text-muted-foreground font-mono">
            &copy; {currentYear} VAJRA Labs Inc. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            Designed for next-gen careers.
          </p>
        </div>
      </div>
    </footer>
  );
}
