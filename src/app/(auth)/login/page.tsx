"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        let errorMsg = authError.message || "Failed to sign in. Please try again.";
        if (authError.message.includes("Invalid login credentials") || authError.status === 400) {
          errorMsg = "Invalid credentials. Please check your email and password.";
        } else if (authError.message.includes("Email not confirmed")) {
          errorMsg = "Email address not verified. Please check your inbox for the confirmation email.";
        } else if (authError.message.toLowerCase().includes("failed to fetch") || authError.message.toLowerCase().includes("network")) {
          errorMsg = "Supabase service unavailable or database connection failed. Please check your network.";
        }
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!authData?.user) {
        toast.error("User account not found.");
        setIsLoading(false);
        return;
      }

      // Fetch user profile to determine role and redirection
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !userProfile) {
        toast.error("Profile creation failed or could not fetch user profile details.");
        setIsLoading(false);
        return;
      }

      toast.success("Successfully logged in!");

      // Role-based routing
      if (userProfile.role === "student") {
        const { data: studentProfile } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (!studentProfile || !studentProfile.university || !studentProfile.major) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else if (userProfile.role === "company") {
        router.push("/company/dashboard");
      } else if (userProfile.role === "mentor") {
        router.push("/mentor/dashboard");
      } else if (userProfile.role === "admin" || userProfile.role === "super_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      toast.error("An unexpected error occurred during login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    toast.loading("Redirecting to Google Sign-In...");

    try {
      const redirectToParam = searchParams.get("redirectTo");
      const callbackUrl = `${window.location.origin}/auth/callback${
        redirectToParam ? `?next=${encodeURIComponent(redirectToParam)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        toast.dismiss();
        toast.error(error.message || "Failed to initialize Google authentication.");
        setIsGoogleLoading(false);
      }
    } catch {
      toast.dismiss();
      toast.error("An unexpected error occurred during Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight font-heading text-white">
          Welcome Back
        </h2>
        <p className="text-xs text-muted-foreground font-sans">
          Enter your email and password to log in to VAJRA.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-200">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-sans">{errors.password.message}</p>
          )}
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5" />
        </div>
        <span className="relative bg-[#0b0f19] px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
          Or continue with
        </span>
      </div>

      {/* Google Provider Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleLogin}
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
            Sign in with Google
          </>
        )}
      </Button>

      {/* Switch to Register */}
      <div className="text-center text-xs text-muted-foreground font-sans">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-xs text-slate-400">Loading auth...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
