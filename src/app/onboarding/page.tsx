"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, Sparkles, Cpu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SetupStep = 1 | 2 | 3 | 4 | 5;
type ProficiencyType = "beginner" | "intermediate" | "advanced";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);

  // Check auth user session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication session missing. Please log in.");
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };
    checkSession();
  }, [router, supabase]);

  // Step 1 State: Target Role
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");

  const rolesList = [
    "Software Engineer",
    "AI/ML Engineer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "UI/UX Designer",
    "Custom",
  ];

  // Step 2 State: Skills & Proficiency
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [proficiency, setProficiency] = useState<ProficiencyType>("intermediate");

  const skillOptions = ["React", "Next.js", "Python", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Go", "AWS", "Git"];

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Step 3 State: Academics
  const [academic, setAcademic] = useState({
    university: "",
    gradYear: "",
    gpa: "",
    priorInternship: "No",
  });

  // Step 4 State: Socials & Links
  const [socials, setSocials] = useState({
    github: "",
    linkedin: "",
    portfolio: "",
  });

  // Step 5 State: AI Engine Status Simulation
  const [engineStatus, setEngineStatus] = useState("Initializing DNA builder...");
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  // Step 5 simulation triggering DB update
  useEffect(() => {
    if (currentStep === 5 && userId) {
      const runOnboardingSubmit = async () => {
        try {
          // Status 1
          setEngineStatus("Analyzing technical skill matrix...");
          await new Promise((res) => setTimeout(res, 1200));

          // Status 2
          setEngineStatus("Mapping industry market demand...");
          await new Promise((res) => setTimeout(res, 1200));

          // Status 3
          setEngineStatus("Calculating baseline Career DNA...");
          await new Promise((res) => setTimeout(res, 1200));

          // Submit profile changes to database
          const majorField = targetRole === "Custom" ? customRole : targetRole;
          const { error: profileError } = await supabase
            .from("student_profiles")
            .update({
              university: academic.university,
              major: majorField,
              graduation_year: academic.gradYear ? parseInt(academic.gradYear) : null,
              gpa: academic.gpa ? parseFloat(academic.gpa) : null,
              github_url: socials.github || null,
              linkedin_url: socials.linkedin || null,
            })
            .eq("id", userId);

          if (profileError) {
            toast.error("Failed to save student profile information.");
            setCurrentStep(3); // Route back to fix details
            return;
          }

          // Submit student skills if any selected
          if (selectedSkills.length > 0) {
            const skillRecords = selectedSkills.map((skill) => ({
              student_id: userId,
              skill_name: skill,
              proficiency: proficiency,
            }));

            const { error: skillsError } = await supabase
              .from("student_skills")
              .insert(skillRecords);

            if (skillsError) {
              // Ignore unique conflicts and continue
              if (skillsError.code !== "23505") {
                toast.warning("Some skills could not be attached.");
              }
            }
          }

          // Complete simulation
          setEngineStatus("DNA Calculated successfully!");
          setIsOnboardingCompleted(true);
          toast.success("Career DNA baseline generated!");
        } catch {
          toast.error("Onboarding submission failed.");
          setCurrentStep(3);
        }
      };

      runOnboardingSubmit();
    }
  }, [currentStep, userId, academic, socials, targetRole, customRole, selectedSkills, proficiency, supabase]);

  const handleNext = () => {
    if (currentStep === 1 && targetRole === "Custom" && !customRole) {
      toast.error("Please enter your custom target role.");
      return;
    }
    if (currentStep === 2 && selectedSkills.length === 0) {
      toast.error("Please select at least one skill.");
      return;
    }
    if (currentStep === 3 && (!academic.university || !academic.gradYear || !academic.gpa)) {
      toast.error("Please complete all academic details.");
      return;
    }
    setCurrentStep((prev) => (prev + 1) as SetupStep);
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as SetupStep);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main wizard card container */}
      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Progress Bar (Hidden on step 5) */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold text-blue-400 font-sans">Setup Progress</span>
              <span className="font-mono">Step {currentStep} of 4</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 border border-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Target Role */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  What role do you dream of?
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Select your primary career aspiration target.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {rolesList.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`p-3.5 rounded-xl border text-center text-xs font-medium font-sans cursor-pointer transition-all ${
                      targetRole === role
                        ? "bg-blue-500/10 border-blue-500 text-white"
                        : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Custom Role Trigger */}
              <button
                type="button"
                onClick={() => setTargetRole("Custom")}
                className={`w-full p-4 rounded-xl border text-center text-xs font-semibold font-sans cursor-pointer transition-all ${
                  targetRole === "Custom"
                    ? "bg-blue-500/10 border-blue-500 text-white"
                    : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                Custom Role
              </button>

              {targetRole === "Custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customRoleInput" className="text-xs text-slate-200">
                    Specify Target Engineering Role
                  </Label>
                  <Input
                    id="customRoleInput"
                    placeholder="e.g. Systems Engineer, DevRel Manager"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                  />
                </div>
              )}

              <Button
                onClick={handleNext}
                className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Skills & Proficiency */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  Select Skills & Experience
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Select core languages/libraries you are familiar with.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-4 py-2 rounded-xl text-xs border font-sans cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500 text-white"
                          : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Experience Proficiencies */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-slate-200">
                  Estimated Average Proficiency Level
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["beginner", "intermediate", "advanced"] as ProficiencyType[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setProficiency(level)}
                      className={`py-3 rounded-xl border text-xs font-medium uppercase font-sans cursor-pointer transition-all ${
                        proficiency === level
                          ? "bg-blue-500/10 border-blue-500 text-white"
                          : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 text-xs font-semibold text-muted-foreground hover:text-white border border-white/5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Academic Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  Academic Credentials
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Let recruiters check your educational background.
                </p>
              </div>

              <div className="space-y-4">
                {/* University Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="univ" className="text-xs font-semibold text-slate-200">
                    College / University Name
                  </Label>
                  <Input
                    id="univ"
                    placeholder="e.g. Stanford University"
                    type="text"
                    value={academic.university}
                    onChange={(e) => setAcademic((prev) => ({ ...prev, university: e.target.value }))}
                    className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Grad Year */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gradYear" className="text-xs font-semibold text-slate-200">
                      Graduation Year
                    </Label>
                    <Input
                      id="gradYear"
                      placeholder="e.g. 2027"
                      type="number"
                      value={academic.gradYear}
                      onChange={(e) => setAcademic((prev) => ({ ...prev, gradYear: e.target.value }))}
                      className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* GPA */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gpa" className="text-xs font-semibold text-slate-200">
                      GPA / Score
                    </Label>
                    <Input
                      id="gpa"
                      placeholder="e.g. 3.85"
                      type="number"
                      step="0.01"
                      value={academic.gpa}
                      onChange={(e) => setAcademic((prev) => ({ ...prev, gpa: e.target.value }))}
                      className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Prior Internship */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-slate-200">
                    Prior Internship Experience?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setAcademic((prev) => ({ ...prev, priorInternship: choice }))}
                        className={`py-3 rounded-xl border text-xs font-semibold font-sans cursor-pointer transition-all ${
                          academic.priorInternship === choice
                            ? "bg-blue-500/10 border-blue-500 text-white"
                            : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 text-xs font-semibold text-muted-foreground hover:text-white border border-white/5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Portfolio & Social Links */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  Digital Footprints
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Supply URLs for GitHub analysis and portfolio assets indexing.
                </p>
              </div>

              <div className="space-y-4">
                {/* GitHub Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="github" className="text-xs font-semibold text-slate-200">
                    GitHub Username
                  </Label>
                  <Input
                    id="github"
                    placeholder="e.g. githubprofile"
                    type="text"
                    value={socials.github}
                    onChange={(e) => setSocials((prev) => ({ ...prev, github: e.target.value }))}
                    className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                  />
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="linkedin" className="text-xs font-semibold text-slate-200">
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="e.g. https://linkedin.com/in/username"
                    type="url"
                    value={socials.linkedin}
                    onChange={(e) => setSocials((prev) => ({ ...prev, linkedin: e.target.value }))}
                    className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                  />
                </div>

                {/* Custom Portfolio (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio" className="text-xs font-semibold text-slate-200">
                    Personal Portfolio URL (Optional)
                  </Label>
                  <Input
                    id="portfolio"
                    placeholder="e.g. https://myprofile.dev"
                    type="url"
                    value={socials.portfolio}
                    onChange={(e) => setSocials((prev) => ({ ...prev, portfolio: e.target.value }))}
                    className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 text-xs font-semibold text-muted-foreground hover:text-white border border-white/5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Generate DNA
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI DNA Generation Animation & Final Reveal */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-6 py-6"
            >
              {!isOnboardingCompleted ? (
                <>
                  {/* AI Pulse Core Animation */}
                  <div className="relative flex items-center justify-center h-24 w-24">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                    />
                    <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white font-heading">
                      AI Career Engine Active
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono transition-colors">
                      {engineStatus}
                    </p>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 w-full"
                >
                  <div className="relative flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-success/15 border border-success/30 text-success">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white font-heading">
                      Career DNA Generated!
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans">
                      Your baseline profiles have been successfully verified.
                    </p>
                  </div>

                  {/* DNA Reveal Card */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-semibold text-slate-300">Level Level</span>
                      <span className="text-xs font-bold text-blue-400">Explorer 🚀</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-semibold text-slate-300">Initial Readiness Index</span>
                      <span className="text-xs font-bold text-indigo-400">68%</span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-300 block mb-1">Recommended Next Action</span>
                        <span className="text-[10px] text-muted-foreground block leading-relaxed font-sans">
                          Complete a Skill Verification Quiz or link a Github repository to increase your readiness score.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Enter My Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
