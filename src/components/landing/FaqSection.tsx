"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How does the AI Career DNA calculation work?",
      answer:
        "The DNA engine performs automated parsing of connected repositories, credentials, and work history. It evaluates code structure, system designs, and documentation quality, matching these against real-world job requirements to establish an objective score.",
    },
    {
      question: "Are the internships listed on VAJRA fully vetted?",
      answer:
        "Yes, 100%. All companies posting internships must complete a validation sequence and provide documentation. We reject blind job postings and ensure every opportunity is mapped to real mentor checkpoints.",
    },
    {
      question: "What is the AI Readiness score?",
      answer:
        "The AI Readiness score measures your alignment with industry standards. It compiles scores across technical (coding patterns, architecture), communication (mock interviews, comments), and portfolio index metrics to verify job readiness.",
    },
    {
      question: "Can faculty members and advisors review my profile?",
      answer:
        "Absolutely. Faculty and industry mentors are granted dedicated portal access to review your AI analysis dashboards, check certifications, and sign off on verified portfolio endorsements.",
    },
  ];

  return (
    <section id="faq" className="relative py-24">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight font-heading text-foreground md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground font-sans">
            Have questions about the platform, grading, or verified matches? Here are the answers.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="glass-card overflow-hidden rounded-2xl border-border/70 transition-all duration-300 hover:border-border"
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-foreground sm:text-base font-sans">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 text-primary" />
                    {faq.question}
                  </span>
                  <span className="rounded-lg border border-border/70 bg-background/70 p-1 text-muted-foreground">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="border-t border-border/70 px-6 pb-6 pt-2 text-sm leading-relaxed text-muted-foreground font-sans">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
