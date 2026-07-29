"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const redirectToUrl = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectToUrl,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link.");
        setIsLoading(false);
        return;
      }

      toast.success("Password reset link sent to your email!");
      setIsSubmitted(true);
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight font-heading text-foreground">
          Reset Password
        </h2>
        <p className="text-xs text-muted-foreground font-sans">
          {isSubmitted
            ? "Check your inbox for a recovery email."
            : "Enter your email address to receive a password reset link."}
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-center text-xs text-primary font-sans">
            We have sent a password reset link to your registered email address. Click the link in the email to configure a new password.
          </div>
          <Link href="/login" className="w-full">
            <Button className="w-full rounded-xl border-border/70 bg-background/70 py-6 text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/70">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@university.edu"
                type="email"
                className="pl-10 rounded-xl border-border/70 bg-background/70 text-foreground placeholder:text-muted-foreground/70"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-sans">{errors.email.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-violet-500 py-6 font-medium text-white transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
