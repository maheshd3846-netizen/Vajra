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
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {(["generate", "export", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? "text-white border-b-2 border-blue-500 -mb-px" : "text-slate-500 hover:text-slate-300"}`}
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
                  <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" /> Portfolio URL
                  </Label>
                  <div className="flex items-center">
                    <span className="bg-slate-950 border border-r-0 border-white/10 text-[10px] text-slate-500 px-3 py-3 rounded-l-xl select-none font-mono">
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
                      className="rounded-l-none bg-slate-950/50 border-white/10 text-white rounded-r-xl text-xs py-5"
                    />
                  </div>
                  {slug && (
                    <p className="text-[9px] text-slate-500 font-mono pl-1">
                      {typeof window !== "undefined" ? window.location.origin : ""}/p/{slug}
                    </p>
                  )}
                </div>

                {/* Theme selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-400" /> Portfolio Theme
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
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedTheme === theme.id ? "border-blue-500/60 bg-blue-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}
                      >
                        <span className="text-xl">{theme.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white">{theme.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{theme.description}</p>
                        </div>
                        {selectedTheme === theme.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
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
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-xs text-blue-300">
                            {GENERATION_STEPS[generationStep]}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
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
                      className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-300">Portfolio live at /p/{slug}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all"
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
                    className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
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
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500">Generate a portfolio first to access export options.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-400 pb-1">
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
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${item.highlight ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}
                      >
                        <div className="shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
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
                    <p className="text-[10px] text-slate-500 pb-1">Last {versionHistory.length} versions stored locally.</p>
                    {versionHistory.map((v, i) => (
                      <div key={i} className="p-3 border border-white/5 bg-slate-950/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(v.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 font-medium capitalize">
                            {v.theme}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-tight truncate">{v.headline}</p>
                        <p className="text-[9px] text-slate-600 font-mono">/p/{v.slug}</p>
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
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-950/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {generatedContent ? `/p/${slug}` : "Not yet generated"}
            </span>
            {generatedContent && (
              <button onClick={handlePreview} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                Open <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Preview area */}
          <div className="min-h-[520px] relative">
            {!generatedContent ? (
              <div className="flex flex-col items-center justify-center h-[520px] space-y-4 px-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <Wand2 className="w-12 h-12 text-blue-400 relative z-10" />
                </div>
                <h3 className="text-base font-bold text-white">Your AI Portfolio Awaits</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Click <strong className="text-white">Generate AI Portfolio</strong> and Gemini will craft a premium, personalized portfolio website from your VAJRA profile in seconds.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-500">
                  {["Hero", "About", "Career DNA", "Projects", "Skills", "Certs", "Timeline", "Contact"].map(s => (
                    <span key={s} className="px-2 py-1 border border-white/5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[520px] space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                  <Sparkles className="w-10 h-10 text-indigo-400 animate-spin relative z-10" style={{ animationDuration: "3s" }} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-white">{GENERATION_STEPS[generationStep]}</p>
                  <p className="text-[11px] text-slate-500">
                    {generationStep === "generating" ? "This usually takes 10-20 seconds..." : "Almost there..."}
                  </p>
                </div>
              </div>
            ) : (
              /* Generated content preview */
              <div className="p-6 space-y-6 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
                {/* Theme badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {PORTFOLIO_THEMES.find((t) => t.id === generatedContent.theme)?.icon}
                    </span>
                    <span className="text-xs font-bold text-white capitalize">
                      {generatedContent.theme} Theme
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-medium">
                      LIVE
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    v{generatedContent.version} · {new Date(generatedContent.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content preview cards */}
                <div className="space-y-4">
                  {/* Headline */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-[9px] text-blue-400 uppercase font-bold tracking-wider mb-1">Headline</p>
                    <p className="text-sm font-bold text-white leading-tight">{generatedContent.content.headline}</p>
                  </div>
                  {/* Tagline */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Tagline</p>
                    <p className="text-xs text-white/60 italic">{generatedContent.content.tagline}</p>
                  </div>
                  {/* Bio */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Short Bio</p>
                    <p className="text-xs text-white/60 leading-relaxed">{generatedContent.content.shortBio}</p>
                  </div>
                  {/* Strengths */}
                  {generatedContent.content.strengths?.length > 0 && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Key Strengths</p>
                      <div className="space-y-1">
                        {generatedContent.content.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-white/50">
                            <span className="text-emerald-400 shrink-0">✓</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* SEO */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">SEO Title</p>
                    <p className="text-[11px] text-blue-400 font-medium">{generatedContent.content.seoTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{generatedContent.content.seoDescription}</p>
                  </div>
                  {/* Project impacts */}
                  {generatedContent.content.projectImpacts?.length > 0 && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Project Impact Summaries</p>
                      {generatedContent.content.projectImpacts.slice(0, 2).map((p, i) => (
                        <div key={i} className="text-[11px] text-white/40 leading-relaxed mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                          {p.impactSummary}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button onClick={handlePreview} className="flex-1 py-2.5 text-[11px] font-semibold text-white bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-xl flex items-center justify-center gap-1.5 hover:from-blue-600 hover:to-indigo-600 transition-all">
                    <Eye className="w-3.5 h-3.5" /> View Live
                  </button>
                  <button onClick={handleCopyLink} className="flex-1 py-2.5 text-[11px] font-semibold text-slate-300 border border-white/10 rounded-xl flex items-center justify-center gap-1.5 hover:border-white/20 transition-all">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={handleExportJSON} className="flex-1 py-2.5 text-[11px] font-semibold text-slate-300 border border-white/10 rounded-xl flex items-center justify-center gap-1.5 hover:border-white/20 transition-all">
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
