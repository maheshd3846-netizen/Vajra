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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
          router.push("/onboarding");
        } else {
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

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    toast.loading("Redirecting to Google Sign-Up...");

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            role: selectedRole,
          },
        },
      });

      if (error) {
        toast.dismiss();
        toast.error(error.message || "Failed to initialize Google authentication.");
        setIsGoogleLoading(false);
      }
    } catch {
      toast.dismiss();
      toast.error("An unexpected error occurred during Google sign up.");
      setIsGoogleLoading(false);
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
                disabled={isLoading || isGoogleLoading}
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

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <span className="relative bg-[#0b0f19] px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Or sign up with
              </span>
            </div>

            {/* Google Provider Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleRegister}
              className="w-full py-6 rounded-xl bg-slate-950/40 hover:bg-slate-900 border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>
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
