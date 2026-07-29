"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Target,
  Clock,
  Shield,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Info,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  runPredictiveEngine,
  SIMULATION_ACTIONS,
  type PredictiveInputs,
  type PredictiveEngineResult,
  type SimulationResult,
  type CompanyProbability,
  type TimelineMilestone,
} from "@/lib/predictive-career-engine";

// ─── Props ───────────────────────────────────────────────────────────────────

interface PredictiveCareerPanelProps {
  inputs: PredictiveInputs;
  completedPhaseCount: number;
  lastKnownHash?: string;
  onRecalibrate?: () => void;
}

// ─── Helper: animated number ─────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = display;
    startTimeRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const animate = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(startRef.current + (value - startRef.current) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

// ─── Circular Confidence Ring ─────────────────────────────────────────────────

function ConfidenceRing({
  score,
  size = 96,
  strokeWidth = 8,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold text-foreground leading-none">
          <AnimatedNumber value={score} />%
        </span>
        {label && <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

// ─── Score Delta Card ─────────────────────────────────────────────────────────

function ScoreDeltaCard({ result, isSelected }: { result: SimulationResult; isSelected: boolean }) {
  const hasGain = result.scoreDelta > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20"
          : "border-border/50 bg-muted/20 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{result.action.icon}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate">{result.action.label}</p>
            <p className="text-[9px] text-muted-foreground capitalize">{result.action.category}</p>
          </div>
        </div>
        {hasGain ? (
          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0 font-mono">
            +{result.scoreDelta}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-lg shrink-0 font-mono">
            +0
          </span>
        )}
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/40 border border-border/40 rounded-xl p-1.5">
          <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider">Current</p>
          <p className="text-sm font-extrabold text-foreground font-mono">{result.currentScore}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className={`text-[10px] font-bold ${hasGain ? "text-emerald-400" : "text-muted-foreground"}`}>
            →
          </div>
        </div>
        <div className={`border rounded-xl p-1.5 ${hasGain ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/40 border-border/40"}`}>
          <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider">After</p>
          <p className={`text-sm font-extrabold font-mono ${hasGain ? "text-emerald-400" : "text-foreground"}`}>
            {result.futureScore}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-mono">
        <span className="text-muted-foreground">Confidence: {result.confidence}%</span>
        {hasGain && (
          <span className="text-emerald-400 font-bold">+{result.readinessDelta}% Readiness</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Company Probability Bar ──────────────────────────────────────────────────

function CompanyProbBar({ company, expanded }: { company: CompanyProbability; expanded: boolean }) {
  const tierColor =
    company.tier === "Tier 1"
      ? "from-primary to-blue-400"
      : company.tier === "Tier 2"
      ? "from-emerald-500 to-teal-400"
      : "from-amber-500 to-yellow-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{company.logo}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate">{company.company}</p>
            <p className="text-[8px] text-muted-foreground font-mono">{company.tier}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-extrabold text-foreground font-mono">
            <AnimatedNumber value={company.probability} />%
          </span>
          {company.futureProb > company.probability && (
            <span className="text-[9px] text-emerald-400 font-bold font-mono">
              → {company.futureProb}%
            </span>
          )}
        </div>
      </div>

      {/* Dual progress bars */}
      <div className="h-2 w-full bg-muted border border-border/30 rounded-full overflow-hidden relative">
        {/* Future bar (ghost) */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, company.futureProb)}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        />
        {/* Current bar */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tierColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, company.probability)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              <p className="text-[9px] text-muted-foreground leading-relaxed">{company.reason}</p>
              <div className="flex items-start gap-1.5">
                <Zap className="w-2.5 h-2.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-primary font-medium leading-relaxed">{company.nextImprovement}</p>
              </div>
              <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground">
                <span>Model confidence: {company.confidence}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Career Timeline Widget ───────────────────────────────────────────────────

function CareerTimelineWidget({ milestones }: { milestones: TimelineMilestone[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-border/50 to-transparent" />

      <div className="space-y-4 pl-10">
        {milestones.map((m, i) => {
          const isCompleted = m.status === "completed";
          const isInProgress = m.status === "in_progress";
          const isTarget = m.status === "target";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              {/* Node */}
              <div
                className={`absolute -left-[38px] top-1 h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                  isCompleted
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : isInProgress
                    ? "bg-primary/20 border-primary/50 text-primary animate-pulse"
                    : isTarget
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-muted border-border/50 text-muted-foreground"
                }`}
              >
                {m.icon}
              </div>

              {/* Content */}
              <div className={`p-3 rounded-xl border ${isCompleted ? "border-emerald-500/20 bg-emerald-500/5" : isInProgress ? "border-primary/20 bg-primary/5" : isTarget ? "border-amber-500/20 bg-amber-500/5" : "border-border/40 bg-muted/20"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-foreground">{m.label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-primary font-mono">{m.projectedDnaScore}</p>
                    <p className="text-[8px] text-muted-foreground font-mono">DNA</p>
                  </div>
                </div>
                {m.week > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 text-[8px] text-muted-foreground font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {m.week === 0 ? "Now" : `+${m.week} week${m.week > 1 ? "s" : ""}`}
                    <span className="ml-2">Readiness: {m.projectedReadiness}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Growth Curve SVG ─────────────────────────────────────────────────────────

function CareerGrowthCurve({
  milestones,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentScore: _currentScore,
}: {
  milestones: TimelineMilestone[];
  currentScore: number;
}) {
  const width = 380;
  const height = 120;
  const padding = { left: 32, right: 16, top: 16, bottom: 28 };

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const scores = milestones.map((m) => m.projectedDnaScore);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 5);

  const points = milestones.map((m, i) => {
    const x = padding.left + (i / (milestones.length - 1)) * innerW;
    const y = padding.top + innerH - ((m.projectedDnaScore - minScore) / (maxScore - minScore)) * innerH;
    return { x, y, m };
  });

  // Smooth bezier path
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [milestones]);

  return (
    <div className="w-full overflow-hidden">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = padding.top + innerH - ((pct - minScore) / (maxScore - minScore)) * innerH;
          if (y < padding.top || y > padding.top + innerH) return null;
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={padding.left + innerW} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,4" />
              <text x={padding.left - 4} y={y + 3} fontSize="7" fill="hsl(var(--muted-foreground))" textAnchor="end" fontFamily="monospace">
                {pct}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="url(#growthGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />

        {/* Curve line */}
        <motion.path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ strokeDashoffset: pathLength || 1000, strokeDasharray: pathLength || 1000 }}
          animate={{ strokeDashoffset: 0, strokeDasharray: pathLength || 1000 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <motion.circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill={pt.m.status === "completed" ? "hsl(var(--primary))" : "hsl(var(--card))"}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
            {/* Score label */}
            <motion.text
              x={pt.x}
              y={pt.y - 8}
              fontSize="7"
              fill="hsl(var(--foreground))"
              textAnchor="middle"
              fontWeight="bold"
              fontFamily="monospace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {pt.m.projectedDnaScore}
            </motion.text>
            {/* Week label */}
            <motion.text
              x={pt.x}
              y={padding.top + innerH + 14}
              fontSize="6"
              fill="hsl(var(--muted-foreground))"
              textAnchor="middle"
              fontFamily="monospace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              {pt.m.week === 0 ? "Now" : `W${pt.m.week}`}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function PredictiveCareerPanel({
  inputs,
  completedPhaseCount,
  lastKnownHash,
  onRecalibrate,
}: PredictiveCareerPanelProps) {
  const [selectedActionId, setSelectedActionId] = useState<string>(SIMULATION_ACTIONS[0].id);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"simulator" | "probability" | "timeline" | "confidence">("simulator");

  // Run the full predictive engine (pure client-side computation)
  const engine = useMemo<PredictiveEngineResult>(
    () => runPredictiveEngine(inputs, completedPhaseCount, lastKnownHash),
    [inputs, completedPhaseCount, lastKnownHash]
  );

  const selectedSim = useMemo(
    () => engine.simulations.find((s) => s.action.id === selectedActionId) || engine.simulations[0],
    [engine.simulations, selectedActionId]
  );

  const tabs = [
    { id: "simulator" as const, label: "🎯 Simulator", icon: Play },
    { id: "probability" as const, label: "📊 Probability", icon: BarChart3 },
    { id: "timeline" as const, label: "📅 Timeline", icon: Clock },
    { id: "confidence" as const, label: "🛡 Confidence", icon: Shield },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-border/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Predictive Career Intelligence Engine
              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary font-mono uppercase tracking-wider">
                AI POWERED
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Forecast your Career DNA after completing specific actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {engine.isOutdated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400"
            >
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[9px] font-bold">Profile updated — Recalibrate DNA</span>
            </motion.div>
          )}
          {onRecalibrate && (
            <Button
              onClick={onRecalibrate}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-xl h-8 px-3 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Recalibrate
            </Button>
          )}
        </div>
      </div>

      {/* Top metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 relative z-10">
        {[
          {
            label: "Current DNA",
            value: `${inputs.currentDnaScore}`,
            sub: "Calibrated score",
            color: "text-primary",
            bg: "bg-primary/5",
            border: "border-primary/20",
          },
          {
            label: "Peak Potential",
            value: `${engine.projectedPeakScore}`,
            sub: "After all actions",
            color: "text-emerald-400",
            bg: "bg-emerald-500/5",
            border: "border-emerald-500/20",
          },
          {
            label: "Top Gain",
            value: engine.topRecommendedAction ? `+${engine.topRecommendedAction.scoreDelta}` : "+0",
            sub: engine.topRecommendedAction?.action.label || "—",
            color: "text-amber-400",
            bg: "bg-amber-500/5",
            border: "border-amber-500/20",
          },
          {
            label: "AI Confidence",
            value: `${engine.overallConfidence}%`,
            sub: "Prediction accuracy",
            color: "text-purple-400",
            bg: "bg-purple-500/5",
            border: "border-purple-500/20",
          },
        ].map((m, i) => (
          <div key={i} className={`p-3 ${m.bg} border ${m.border} rounded-2xl`}>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{m.label}</p>
            <p className={`text-xl font-extrabold ${m.color} font-mono mt-0.5`}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-muted/40 border border-border/50 rounded-2xl mb-6 relative z-10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* ═══ SIMULATOR TAB ═══ */}
          {activeTab === "simulator" && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Action grid */}
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Select an action to simulate its Career DNA impact:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {engine.simulations.map((result) => (
                      <div
                        key={result.action.id}
                        onClick={() => setSelectedActionId(result.action.id)}
                      >
                        <ScoreDeltaCard
                          result={result}
                          isSelected={selectedActionId === result.action.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-5 space-y-4">
                  {selectedSim && (
                    <>
                      {/* Main score visualization */}
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-primary/10">
                          <span className="text-xl">{selectedSim.action.icon}</span>
                          <div>
                            <p className="text-xs font-extrabold text-foreground">{selectedSim.action.label}</p>
                            <p className="text-[9px] text-muted-foreground">{selectedSim.action.description}</p>
                          </div>
                        </div>

                        {/* Big score transition */}
                        <div className="flex items-center justify-center gap-6 py-3">
                          <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Current</p>
                            <p className="text-3xl font-extrabold text-foreground font-mono">{selectedSim.currentScore}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <ChevronRight className="w-5 h-5 text-primary" />
                            {selectedSim.scoreDelta > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono"
                              >
                                +{selectedSim.scoreDelta}
                              </motion.span>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Future</p>
                            <motion.p
                              key={selectedSim.futureScore}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`text-3xl font-extrabold font-mono ${selectedSim.scoreDelta > 0 ? "text-emerald-400" : "text-foreground"}`}
                            >
                              {selectedSim.futureScore}
                            </motion.p>
                          </div>
                        </div>

                        {/* Progress bar visualization */}
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-muted/50 border border-border/30 rounded-full overflow-hidden relative">
                            <div
                              className="absolute inset-y-0 left-0 bg-muted rounded-full"
                              style={{ width: `${selectedSim.currentScore}%` }}
                            />
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-emerald-500/40 rounded-full"
                              initial={{ width: `${selectedSim.currentScore}%` }}
                              animate={{ width: `${selectedSim.futureScore}%` }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                            />
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                              initial={{ width: `${selectedSim.currentScore}%` }}
                              animate={{ width: `${selectedSim.currentScore}%` }}
                              style={{ width: `${selectedSim.currentScore}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                            <span>0</span>
                            <span>Current: {selectedSim.currentScore}</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Explanation */}
                      <div className="bg-muted/20 border border-border/50 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                          <Info className="w-3.5 h-3.5 text-primary" />
                          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">AI Explanation</p>
                          <span className="text-[8px] font-mono text-muted-foreground ml-auto">Confidence: {selectedSim.confidence}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {selectedSim.action.explanation}
                        </p>
                      </div>

                      {/* Impact breakdown */}
                      {selectedSim.impactBreakdown.length > 0 && (
                        <div className="bg-muted/20 border border-border/50 rounded-2xl p-4 space-y-2">
                          <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/40">
                            Score Dimension Impact
                          </p>
                          {selectedSim.impactBreakdown.map((dim, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{dim.dimension}</span>
                              <span className={`font-bold font-mono ${dim.delta > 0 ? "text-emerald-400" : dim.delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {dim.delta > 0 ? "+" : ""}{dim.delta}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Growth curve */}
              <div className="bg-muted/10 border border-border/40 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Career Growth Curve — Projected DNA Trajectory
                </p>
                <CareerGrowthCurve milestones={engine.timeline} currentScore={inputs.currentDnaScore} />
              </div>
            </motion.div>
          )}

          {/* ═══ PROBABILITY TAB ═══ */}
          {activeTab === "probability" && (
            <motion.div
              key="probability"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Internship Match Probability — Based on Current + Projected Readiness
                </p>
                <div className="flex items-center gap-3 text-[8px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-primary inline-block" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500/30 inline-block" /> After Best Action</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engine.companyProbabilities.map((company) => (
                  <div
                    key={company.company}
                    onClick={() => setExpandedCompany(expandedCompany === company.company ? null : company.company)}
                    className="p-4 bg-muted/20 border border-border/50 rounded-2xl cursor-pointer hover:border-primary/20 transition-colors space-y-2"
                  >
                    <CompanyProbBar
                      company={company}
                      expanded={expandedCompany === company.company}
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/20 border border-border/40 rounded-xl flex items-start gap-2 text-[9px] text-muted-foreground">
                <Info className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                <span>
                  Probabilities are computed from your readiness score, skill match ratio, and project count using the weighted DNA scoring engine. Click any company to see the full AI reasoning.
                </span>
              </div>
            </motion.div>
          )}

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Projected Career Timeline — DNA Score Evolution
                  </p>
                  <CareerTimelineWidget milestones={engine.timeline} />
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-muted/10 border border-border/40 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/40 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-primary" />Growth Curve
                    </p>
                    <CareerGrowthCurve milestones={engine.timeline} currentScore={inputs.currentDnaScore} />
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">Placement Readiness Forecast</p>
                    <p className="text-2xl font-extrabold text-foreground font-mono">
                      {engine.projectedPeakWeeks} weeks
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                      Estimated weeks to reach full placement readiness, assuming consistent weekly progress on priority roadmap milestones.
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Peak DNA: {engine.projectedPeakScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ CONFIDENCE TAB ═══ */}
          {activeTab === "confidence" && (
            <motion.div
              key="confidence"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Confidence ring */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4 p-6 bg-muted/10 border border-border/40 rounded-2xl">
                  <ConfidenceRing score={engine.overallConfidence} size={120} strokeWidth={10} label="Confidence" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-foreground">Prediction Confidence</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Based on quality and completeness of your career profile inputs
                    </p>
                  </div>
                  <div className="w-full p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                    <p className="text-[8px] text-primary uppercase font-bold tracking-wider">Model Status</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {engine.overallConfidence >= 80 ? "High Accuracy" : engine.overallConfidence >= 65 ? "Medium Accuracy" : "Low — Add more data"}
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Confidence Breakdown — Input Signal Quality
                  </p>
                  {engine.confidenceBreakdown.map((dim, i) => (
                    <div key={i} className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{dim.label}</span>
                          <span className="text-[8px] font-mono text-muted-foreground">({Math.round(dim.weight * 100)}% weight)</span>
                        </div>
                        <span className={`font-extrabold font-mono ${dim.score >= 80 ? "text-emerald-400" : dim.score >= 50 ? "text-amber-400" : "text-destructive"}`}>
                          {dim.score}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${dim.score >= 80 ? "bg-emerald-500" : dim.score >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${dim.score}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-muted/10 border border-border/40 rounded-xl flex items-start gap-2 text-[9px] text-muted-foreground">
                    <Shield className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <span>
                      To increase prediction confidence: add more skills, link GitHub projects, upload a resume, earn at least one certificate, and complete a mentor session with feedback.
                    </span>
                  </div>
                </div>
              </div>

              {/* Live update indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Skills Indexed", count: inputs.skills.length, target: 5, icon: "⚡" },
                  { label: "Projects Linked", count: inputs.projects.length, target: 2, icon: "🛠️" },
                  { label: "Resume Uploaded", count: inputs.resumes.length, target: 1, icon: "📄" },
                  { label: "Certificates", count: inputs.certificates.length, target: 2, icon: "🏆" },
                ].map((item, i) => {
                  const ok = item.count >= item.target;
                  return (
                    <div key={i} className={`p-3 border rounded-2xl ${ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/20 border-border/50"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{item.icon}</span>
                        {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      </div>
                      <p className="text-[10px] font-bold text-foreground">{item.count}/{item.target}</p>
                      <p className="text-[8px] text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
