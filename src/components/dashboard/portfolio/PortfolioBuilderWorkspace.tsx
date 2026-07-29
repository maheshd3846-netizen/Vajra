"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Eye,
  Download,
  Copy,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Palette,
  Globe,
  Clock,
  ChevronRight,
  ExternalLink,
  FileJson,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generatePortfolioAction,
  publishPortfolioAction,
  getPortfolioStatusAction,
} from "@/app/actions/portfolio";
import {
  PORTFOLIO_THEMES,
  type PortfolioTheme,
  type GeneratedPortfolioContent,
} from "@/lib/ai-portfolio-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioStudioProps {
  profileName: string;
  userId: string;
  existingPortfolio: {
    asset_url: string;
    description: string | null;
    title: string;
  } | null;
}

type GenerationStep =
  | "idle"
  | "aggregating"
  | "generating"
  | "saving"
  | "done"
  | "error";

const GENERATION_STEPS: Record<GenerationStep, string> = {
  idle: "",
  aggregating: "Aggregating your Career DNA profile...",
  generating: "Gemini AI is crafting your portfolio content...",
  saving: "Saving and publishing...",
  done: "Portfolio generated successfully!",
  error: "Generation failed. Please try again.",
};

// ─── Version history helpers ──────────────────────────────────────────────────

interface VersionEntry {
  timestamp: string;
  theme: PortfolioTheme;
  slug: string;
  headline: string;
}

function saveVersion(content: GeneratedPortfolioContent) {
  try {
    const history: VersionEntry[] = JSON.parse(
      localStorage.getItem("vajra_portfolio_versions") || "[]"
    );
    const entry: VersionEntry = {
      timestamp: content.generatedAt,
      theme: content.theme,
      slug: content.slug,
      headline: content.content.headline,
    };
    history.unshift(entry);
    localStorage.setItem(
      "vajra_portfolio_versions",
      JSON.stringify(history.slice(0, 10))
    );
  } catch {
    // ignore
  }
}

function getVersionHistory(): VersionEntry[] {
  try {
    return JSON.parse(localStorage.getItem("vajra_portfolio_versions") || "[]");
  } catch {
    return [];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioStudio({
  profileName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: _userId,
  existingPortfolio,
}: PortfolioStudioProps) {
  // Parse existing generated content
  const parseExisting = (): GeneratedPortfolioContent | null => {
    if (!existingPortfolio?.description) return null;
    try {
      const parsed = JSON.parse(existingPortfolio.description);
      if (parsed && "content" in parsed && "theme" in parsed) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const existingContent = parseExisting();

  // State
  const [slug, setSlug] = useState(
    existingPortfolio?.asset_url ||
      profileName.toLowerCase().replace(/\s+/g, "-")
  );
  const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme>(
    existingContent?.theme || "aurora"
  );
  const [generationStep, setGenerationStep] = useState<GenerationStep>("idle");
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedPortfolioContent | null>(existingContent);
  const [isOutdated, setIsOutdated] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "export" | "history">(
    "generate"
  );
  const [shareUrlCopied, setShareUrlCopied] = useState(false);

  // Check for outdated portfolio on mount
  useEffect(() => {
    if (existingPortfolio) {
      getPortfolioStatusAction().then((status) => {
        setIsOutdated(status.isOutdated);
      });
    }
    setVersionHistory(getVersionHistory());
  }, [existingPortfolio]);

  const handleGenerate = useCallback(async () => {
    if (!slug.trim()) {
      toast.error("Please enter a portfolio URL slug first.");
      return;
    }

    setGenerationStep("aggregating");
    const toastId = toast.loading(GENERATION_STEPS.aggregating);

    // Step 1: Aggregate
    await new Promise((r) => setTimeout(r, 800));
    setGenerationStep("generating");
    toast.loading(GENERATION_STEPS.generating, { id: toastId });

    // Step 2: Generate via Gemini
    const result = await generatePortfolioAction(slug, selectedTheme);

    if (!result.success || !result.content) {
      setGenerationStep("error");
      toast.error(result.error || "Failed to generate portfolio.", { id: toastId });
      setTimeout(() => setGenerationStep("idle"), 3000);
      return;
    }

    setGenerationStep("saving");
    toast.loading(GENERATION_STEPS.saving, { id: toastId });
    await new Promise((r) => setTimeout(r, 400));

    setGeneratedContent(result.content);
    saveVersion(result.content);
    setVersionHistory(getVersionHistory());
    setIsOutdated(false);
    setGenerationStep("done");
    toast.success("Portfolio generated & published!", { id: toastId });
    setTimeout(() => setGenerationStep("idle"), 2000);
  }, [slug, selectedTheme]);

  const handleThemeSwitch = useCallback(
    async (theme: PortfolioTheme) => {
      setSelectedTheme(theme);
      if (!generatedContent) return;

      // Update theme in stored content
      const updated: GeneratedPortfolioContent = { ...generatedContent, theme };
      const res = await publishPortfolioAction(
        slug,
        `${profileName}'s Portfolio`,
        JSON.stringify(updated)
      );
      if (res.success) {
        setGeneratedContent(updated);
        toast.success(`Theme switched to ${theme}.`);
      }
    },
    [generatedContent, slug, profileName]
  );

  const handlePreview = () => {
    window.open(`/p/${slug}`, "_blank");
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    setShareUrlCopied(true);
    toast.success("Portfolio link copied!");
    setTimeout(() => setShareUrlCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!generatedContent) return;
    const blob = new Blob([JSON.stringify(generatedContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-portfolio.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio JSON exported.");
  };

  const handleCopyContent = async () => {
    if (!generatedContent) return;
    const text = `
${generatedContent.content.headline}

${generatedContent.content.aboutMe}

Skills Summary:
${generatedContent.content.technicalSkillsSummary}

Career Objective:
${generatedContent.content.careerObjective}
    `.trim();
    await navigator.clipboard.writeText(text);
    toast.success("Portfolio content copied to clipboard.");
  };

  const handlePrint = () => {
    window.open(`/p/${slug}?print=true`, "_blank");
  };

  const isGenerating = ["aggregating", "generating", "saving"].includes(
    generationStep
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ─── LEFT PANEL ─── */}
      <div className="lg:col-span-5 space-y-4">

        {/* Update available banner */}
        <AnimatePresence>
          {isOutdated && generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">
                  Your profile changed. Regenerate to sync.
                </span>
              </div>
              <button
                onClick={handleGenerate}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" /> Update
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Studio Card */}
        <div className="glass-card overflow-hidden rounded-[28px] border-[#BFDFFF] bg-white/90 backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex border-b border-[#BFDFFF] bg-white/70">
            {(["generate", "export", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${activeTab === tab ? "-mb-px border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab === "generate" && "✨ Generate"}
                {tab === "export" && "📤 Export"}
                {tab === "history" && "🕐 History"}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* GENERATE TAB */}
            {activeTab === "generate" && (
              <>
                {/* Slug input */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-primary" /> Portfolio URL
                  </Label>
                  <div className="flex items-center">
                    <span className="select-none rounded-l-[18px] border border-r-0 border-[#BFDFFF] bg-white px-3 py-3 font-mono text-[10px] text-slate-500">
                      /p/
                    </span>
                    <Input
                      placeholder="your-name"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
                        )
                      }
                      className="rounded-r-[18px] rounded-l-none border-[#BFDFFF] bg-white/80 py-5 text-xs text-foreground"
                    />
                  </div>
                  {slug && (
                    <p className="pl-1 font-mono text-[9px] text-slate-500">
                      {typeof window !== "undefined" ? window.location.origin : ""}/p/{slug}
                    </p>
                  )}
                </div>

                {/* Theme selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Palette className="w-3.5 h-3.5 text-primary" /> Portfolio Theme
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {PORTFOLIO_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() =>
                          generatedContent
                            ? handleThemeSwitch(theme.id)
                            : setSelectedTheme(theme.id)
                        }
                        className={`flex items-center gap-3 rounded-[18px] border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(59,130,246,0.10)] ${selectedTheme === theme.id ? "border-primary bg-primary/10" : "border-[#BFDFFF] bg-white/80 hover:border-primary/40"}`}
                      >
                        <span className="text-xl">{theme.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">{theme.name}</p>
                          <p className="text-[10px] truncate text-slate-500">{theme.description}</p>
                        </div>
                        {selectedTheme === theme.id && (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generation progress */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 rounded-[18px] border border-primary/20 bg-primary/10 p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-xs text-primary">
                            {GENERATION_STEPS[generationStep]}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 overflow-hidden rounded-full bg-muted/60">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-indigo-600"
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                generationStep === "aggregating"
                                  ? "30%"
                                  : generationStep === "generating"
                                  ? "75%"
                                  : "100%",
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success state */}
                <AnimatePresence>
                  {generationStep === "done" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 p-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-600">Portfolio live at /p/{slug}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : generatedContent ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Portfolio
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      ✨ Generate AI Portfolio
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <button
                    onClick={handlePreview}
                    className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border border-[#BFDFFF] bg-white py-3 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)]"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Live Portfolio
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </>
            )}

            {/* EXPORT TAB */}
            {activeTab === "export" && (
              <div className="space-y-3">
                {!generatedContent ? (
                  <div className="text-center py-8 space-y-2">
                    <Sparkles className="mx-auto h-8 w-8 text-slate-500" />
                    <p className="text-xs text-slate-500">Generate a portfolio first to access export options.</p>
                  </div>
                ) : (
                  <>
                    <p className="pb-1 text-xs text-slate-500">
                      Share or export your AI-generated portfolio content.
                    </p>
                    {[
                      {
                        icon: <Share2 className="w-4 h-4 text-blue-400" />,
                        label: shareUrlCopied ? "Link Copied!" : "Copy Share Link",
                        desc: "Copy the public portfolio URL",
                        action: handleCopyLink,
                        highlight: shareUrlCopied,
                      },
                      {
                        icon: <Copy className="w-4 h-4 text-purple-400" />,
                        label: "Copy Portfolio Content",
                        desc: "Copy all text content to clipboard",
                        action: handleCopyContent,
                      },
                      {
                        icon: <FileJson className="w-4 h-4 text-emerald-400" />,
                        label: "Export as JSON",
                        desc: "Download the full portfolio data",
                        action: handleExportJSON,
                      },
                      {
                        icon: <Printer className="w-4 h-4 text-amber-400" />,
                        label: "Print Portfolio",
                        desc: "Open print-friendly view",
                        action: handlePrint,
                      },
                      {
                        icon: <Eye className="w-4 h-4 text-slate-400" />,
                        label: "Open Live Preview",
                        desc: `vajra.ai/p/${slug}`,
                        action: handlePreview,
                      },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className={`flex w-full items-center gap-3 rounded-[18px] border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(59,130,246,0.10)] ${item.highlight ? "border-emerald-500/40 bg-emerald-500/10" : "border-[#BFDFFF] bg-white/80 hover:border-primary/40"}`}
                      >
                        <div className="shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{item.label}</p>
                          <p className="truncate text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div className="space-y-3">
                {versionHistory.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500">No version history yet. Generate your first portfolio.</p>
                  </div>
                ) : (
                  <>
                    <p className="pb-1 text-[10px] text-slate-500">Last {versionHistory.length} versions stored locally.</p>
                    {versionHistory.map((v, i) => (
                      <div key={i} className="space-y-1 rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(v.timestamp).toLocaleString()}
                          </span>
                          <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-medium capitalize text-primary">
                            {v.theme}
                          </span>
                        </div>
                        <p className="truncate text-xs leading-tight text-slate-700">{v.headline}</p>
                        <p className="font-mono text-[9px] text-slate-500">/p/{v.slug}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: LIVE PREVIEW ─── */}
      <div className="lg:col-span-7">
        <div className="glass-card overflow-hidden rounded-[28px] border-[#BFDFFF] bg-white/90">
          {/* Browser chrome */}
          <div className="flex items-center justify-between border-b border-[#BFDFFF] bg-white/80 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {generatedContent ? `/p/${slug}` : "Not yet generated"}
            </span>
            {generatedContent && (
              <button onClick={handlePreview} className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80">
                Open <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Preview area */}
          <div className="min-h-[520px] relative">
            {!generatedContent ? (
              <div className="flex flex-col items-center justify-center h-[520px] space-y-4 px-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-sky-400/20 blur-xl" />
                  <Wand2 className="relative z-10 h-12 w-12 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">Your AI Portfolio Awaits</h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Click <strong className="text-foreground">Generate AI Portfolio</strong> and Gemini will craft a premium, personalized portfolio website from your VAJRA profile in seconds.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-500">
                  {["Hero", "About", "Career DNA", "Projects", "Skills", "Certs", "Timeline", "Contact"].map(s => (
                    <span key={s} className="rounded border border-[#BFDFFF] bg-white px-2 py-1">{s}</span>
                  ))}
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[520px] space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-500/20 blur-xl" />
                  <Sparkles className="relative z-10 h-10 w-10 animate-spin text-primary" style={{ animationDuration: "3s" }} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-foreground">{GENERATION_STEPS[generationStep]}</p>
                  <p className="text-[11px] text-slate-500">
                    {generationStep === "generating" ? "This usually takes 10-20 seconds..." : "Almost there..."}
                  </p>
                </div>
              </div>
            ) : (
              /* Generated content preview */
              <div className="max-h-[600px] space-y-6 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                {/* Theme badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {PORTFOLIO_THEMES.find((t) => t.id === generatedContent.theme)?.icon}
                    </span>
                    <span className="text-xs font-bold text-foreground capitalize">
                      {generatedContent.theme} Theme
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-medium">
                      LIVE
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">
                    v{generatedContent.version} · {new Date(generatedContent.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content preview cards */}
                <div className="space-y-4">
                  {/* Headline */}
                  <div className="rounded-[18px] border border-primary/20 bg-gradient-to-r from-primary/10 to-sky-500/5 p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-primary">Headline</p>
                    <p className="text-sm font-bold leading-tight text-foreground">{generatedContent.content.headline}</p>
                  </div>
                  {/* Tagline */}
                  <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Tagline</p>
                    <p className="text-xs italic text-slate-700">{generatedContent.content.tagline}</p>
                  </div>
                  {/* Bio */}
                  <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Short Bio</p>
                    <p className="text-xs leading-relaxed text-slate-700">{generatedContent.content.shortBio}</p>
                  </div>
                  {/* Strengths */}
                  {generatedContent.content.strengths?.length > 0 && (
                    <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Key Strengths</p>
                      <div className="space-y-1">
                        {generatedContent.content.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <span className="shrink-0 text-emerald-500">✓</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* SEO */}
                  <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">SEO Title</p>
                    <p className="text-[11px] font-medium text-primary">{generatedContent.content.seoTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{generatedContent.content.seoDescription}</p>
                  </div>
                  {/* Project impacts */}
                  {generatedContent.content.projectImpacts?.length > 0 && (
                    <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Project Impact Summaries</p>
                      {generatedContent.content.projectImpacts.slice(0, 2).map((p, i) => (
                        <div key={i} className="mb-2 border-b border-[#BFDFFF] pb-2 text-[11px] leading-relaxed text-slate-700 last:mb-0 last:border-0 last:pb-0">
                          {p.impactSummary}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button onClick={handlePreview} className="flex-1 rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-2.5 text-[11px] font-semibold text-white transition-all hover:-translate-y-0.5">
                    <Eye className="w-3.5 h-3.5" /> View Live
                  </button>
                  <button onClick={handleCopyLink} className="flex-1 rounded-[18px] border border-[#BFDFFF] bg-white py-2.5 text-[11px] font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={handleExportJSON} className="flex-1 rounded-[18px] border border-[#BFDFFF] bg-white py-2.5 text-[11px] font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
