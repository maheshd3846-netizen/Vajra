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
    <div className="theme-transition min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#F8FAFF,#EAF8FF)] p-6 text-foreground">
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Main wizard card container */}
      <div className="glass-card relative z-10 w-full max-w-xl rounded-[28px] border-[#BFDFFF] bg-white/88 p-8 shadow-[0_12px_40px_rgba(59,130,246,0.10)] backdrop-blur-xl">
        
        {/* Progress Bar (Hidden on step 5) */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-primary font-sans">Setup Progress</span>
              <span className="font-mono">Step {currentStep} of 4</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full border border-border/70 bg-muted/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-sky-400 via-primary to-indigo-600"
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
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
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
                      className={`p-3.5 rounded-[20px] border text-center text-xs font-medium font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(59,130,246,0.10)] ${
                      targetRole === role
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
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
                className={`w-full rounded-[20px] border p-4 text-center text-xs font-semibold font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(59,130,246,0.10)] ${
                  targetRole === "Custom"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
                }`}
              >
                Custom Role
              </button>

              {targetRole === "Custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customRoleInput" className="text-xs text-slate-600">
                    Specify Target Engineering Role
                  </Label>
                  <Input
                    id="customRoleInput"
                    placeholder="e.g. Systems Engineer, DevRel Manager"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-slate-400 focus-visible:ring-primary/40"
                  />
                </div>
              )}

              <Button
                onClick={handleNext}
                className="w-full rounded-[20px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-white transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
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
                      className={`px-4 py-2 rounded-[18px] text-xs border font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Experience Proficiencies */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Estimated Average Proficiency Level
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["beginner", "intermediate", "advanced"] as ProficiencyType[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setProficiency(level)}
                      className={`py-3 rounded-[18px] border text-xs font-medium uppercase font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                        proficiency === level
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
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
                  className="flex-1 cursor-pointer rounded-[18px] border border-[#BFDFFF] bg-white py-3 text-xs font-semibold text-muted-foreground transition-all flex items-center justify-center gap-1 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 cursor-pointer rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-white transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Academic Credentials
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Let recruiters check your educational background.
                </p>
              </div>

              <div className="space-y-4">
                {/* University Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="univ" className="text-xs font-semibold text-muted-foreground">
                    College / University Name
                  </Label>
                  <Input
                    id="univ"
                    placeholder="e.g. Stanford University"
                    type="text"
                    value={academic.university}
                    onChange={(e) => setAcademic((prev) => ({ ...prev, university: e.target.value }))}
                    className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Grad Year */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gradYear" className="text-xs font-semibold text-muted-foreground">
                      Graduation Year
                    </Label>
                    <Input
                      id="gradYear"
                      placeholder="e.g. 2027"
                      type="number"
                      value={academic.gradYear}
                      onChange={(e) => setAcademic((prev) => ({ ...prev, gradYear: e.target.value }))}
                      className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                    />
                  </div>

                  {/* GPA */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gpa" className="text-xs font-semibold text-muted-foreground">
                      GPA / Score
                    </Label>
                    <Input
                      id="gpa"
                      placeholder="e.g. 3.85"
                      type="number"
                      step="0.01"
                      value={academic.gpa}
                      onChange={(e) => setAcademic((prev) => ({ ...prev, gpa: e.target.value }))}
                      className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                    />
                  </div>
                </div>

                {/* Prior Internship */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Prior Internship Experience?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setAcademic((prev) => ({ ...prev, priorInternship: choice }))}
                        className={`py-3 rounded-[18px] border text-xs font-semibold font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                          academic.priorInternship === choice
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40 dark:bg-secondary dark:border-border"
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
                  className="flex-1 cursor-pointer rounded-[18px] border border-[#BFDFFF] bg-white py-3 text-xs font-semibold text-muted-foreground transition-all flex items-center justify-center gap-1 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)] dark:bg-secondary dark:border-border"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 cursor-pointer rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-primary-foreground transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Digital Footprints
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Supply URLs for GitHub analysis and portfolio assets indexing.
                </p>
              </div>

              <div className="space-y-4">
                {/* GitHub Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="github" className="text-xs font-semibold text-muted-foreground">
                    GitHub Username
                  </Label>
                  <Input
                    id="github"
                    placeholder="e.g. githubprofile"
                    type="text"
                    value={socials.github}
                    onChange={(e) => setSocials((prev) => ({ ...prev, github: e.target.value }))}
                    className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                  />
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="linkedin" className="text-xs font-semibold text-muted-foreground">
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="e.g. https://linkedin.com/in/username"
                    type="url"
                    value={socials.linkedin}
                    onChange={(e) => setSocials((prev) => ({ ...prev, linkedin: e.target.value }))}
                    className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                  />
                </div>

                {/* Custom Portfolio (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio" className="text-xs font-semibold text-muted-foreground">
                    Personal Portfolio URL (Optional)
                  </Label>
                  <Input
                    id="portfolio"
                    placeholder="e.g. https://myprofile.dev"
                    type="url"
                    value={socials.portfolio}
                    onChange={(e) => setSocials((prev) => ({ ...prev, portfolio: e.target.value }))}
                    className="rounded-[20px] border-[#BFDFFF] bg-white/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 dark:bg-muted/40 dark:border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 cursor-pointer rounded-[18px] border border-[#BFDFFF] bg-white py-3 text-xs font-semibold text-muted-foreground transition-all flex items-center justify-center gap-1 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)] dark:bg-secondary dark:border-border"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <Button
                  onClick={handleNext}
                  className="flex-1 cursor-pointer rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-primary-foreground transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
                      className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    />
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground font-heading">
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
                    <h3 className="text-xl font-bold text-foreground font-heading">
                      Career DNA Generated!
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans">
                      Your baseline profiles have been successfully verified.
                    </p>
                  </div>

                  {/* DNA Reveal Card — uses section-card utility for themed styling */}
                  <div className="section-card p-5 text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-[#BFDFFF] dark:border-border/50 pb-3">
                      <span className="text-xs font-semibold text-muted-foreground">Career Level</span>
                      <span className="text-xs font-bold text-primary">Explorer 🚀</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#BFDFFF] dark:border-border/50 pb-3">
                      <span className="text-xs font-semibold text-muted-foreground">Initial Readiness Index</span>
                      <span className="text-xs font-bold text-primary">68%</span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-foreground block mb-1">Recommended Next Action</span>
                        <span className="text-[10px] text-muted-foreground block leading-relaxed font-sans">
                          Complete a Skill Verification Quiz or link a Github repository to increase your readiness score.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full cursor-pointer rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-primary-foreground transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
