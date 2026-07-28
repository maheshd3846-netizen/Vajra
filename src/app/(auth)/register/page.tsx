"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Mail, Lock, GraduationCap, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleType = "student" | "company" | "mentor";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<RoleType>("student");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: selectedRole,
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        let errorMsg = error.message || "Sign up failed. Please try again.";
        if (error.message.includes("User already exists") || error.status === 422) {
          errorMsg = "Email already registered. Please sign in or use a different email.";
        } else if (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("network")) {
          errorMsg = "Supabase service unavailable or database connection failed. Please check your network.";
        }
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        toast.success("Account created successfully!");
        
        if (selectedRole === "student") {
          // Student is redirected to the onboarding wizard
          router.push("/onboarding");
        } else {
          // Recruiters and mentors go to login page
          toast.info("Please sign in to complete your configuration.");
          router.push("/login");
        }
      }
    } catch {
      toast.error("An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div
            key="role-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight font-heading text-white">
                Choose Your Role
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                Select your account type to configure your workspace.
              </p>
            </div>

            <div className="space-y-3">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all focus:outline-none cursor-pointer ${
                  selectedRole === "student"
                    ? "bg-blue-500/10 border-blue-500 text-white"
                    : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Student / Job Seeker</h4>
                    <p className="text-[11px] text-muted-foreground">Map Career DNA & apply to verified roles.</p>
                  </div>
                </div>
                {selectedRole === "student" && <div className="h-2 w-2 rounded-full bg-blue-400" />}
              </button>

              {/* Company Role */}
              <button
                type="button"
                onClick={() => setSelectedRole("company")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all focus:outline-none cursor-pointer ${
                  selectedRole === "company"
                    ? "bg-purple-500/10 border-purple-500 text-white"
                    : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Company / Recruiter</h4>
                    <p className="text-[11px] text-muted-foreground">Source vetted engineers matching skills metrics.</p>
                  </div>
                </div>
                {selectedRole === "company" && <div className="h-2 w-2 rounded-full bg-purple-400" />}
              </button>

              {/* Mentor Role */}
              <button
                type="button"
                onClick={() => setSelectedRole("mentor")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all focus:outline-none cursor-pointer ${
                  selectedRole === "mentor"
                    ? "bg-emerald-500/10 border-emerald-500 text-white"
                    : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Mentor / Faculty</h4>
                    <p className="text-[11px] text-muted-foreground">Track cohort analytics & issue certificates.</p>
                  </div>
                </div>
                {selectedRole === "mentor" && <div className="h-2 w-2 rounded-full bg-emerald-400" />}
              </button>
            </div>

            <Button
              type="button"
              onClick={() => setStep("details")}
              className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep("role")}
                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Role
              </button>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                {selectedRole}
              </span>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight font-heading text-white">
                Create Account
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                Set up credentials for your new {selectedRole} profile.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-200">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    type="text"
                    className="pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    {...register("fullName")}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 font-sans">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-200">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    placeholder="name@university.edu"
                    type="email"
                    className="pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-sans">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    className="pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-sans">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-200">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    className="pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-sans">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Register */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redirect to Login */}
      <div className="text-center text-xs text-muted-foreground font-sans">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
}
