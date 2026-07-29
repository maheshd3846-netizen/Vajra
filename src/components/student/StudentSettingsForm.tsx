"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Link2, Loader2, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudentSettingsAction } from "@/app/actions/student";

type StudentSettingsFormProps = {
  initialFullName: string;
  email: string;
  initialProfile: {
    bio: string;
    university: string;
    major: string;
    graduationYear: string;
    gpa: string;
    githubUrl: string;
    linkedinUrl: string;
  };
};

export function StudentSettingsForm({ initialFullName, email, initialProfile }: StudentSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialFullName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [university, setUniversity] = useState(initialProfile.university);
  const [major, setMajor] = useState(initialProfile.major);
  const [graduationYear, setGraduationYear] = useState(initialProfile.graduationYear);
  const [gpa, setGpa] = useState(initialProfile.gpa);
  const [githubUrl, setGithubUrl] = useState(initialProfile.githubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedinUrl);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateStudentSettingsAction({
        fullName,
        bio,
        university,
        major,
        graduationYear,
        gpa,
        githubUrl,
        linkedinUrl,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to save profile changes.");
        return;
      }

      toast.success("Profile saved successfully.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-8 rounded-2xl border-border/70 p-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Profile
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold text-muted-foreground">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              {email || "N/A"}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border/70" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-violet-400" />
          Academics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="university" className="text-xs font-semibold text-muted-foreground">University</Label>
            <Input id="university" value={university} onChange={(event) => setUniversity(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="major" className="text-xs font-semibold text-muted-foreground">Major / Target Role</Label>
            <Input id="major" value={major} onChange={(event) => setMajor(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gpa" className="text-xs font-semibold text-muted-foreground">GPA</Label>
            <Input id="gpa" type="number" step="0.01" min="0" max="10" value={gpa} onChange={(event) => setGpa(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear" className="text-xs font-semibold text-muted-foreground">Graduation Year</Label>
            <Input id="graduationYear" type="number" min="1900" max="2100" value={graduationYear} onChange={(event) => setGraduationYear(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-emerald-400" />
          Online Profiles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="githubUrl" className="text-xs font-semibold text-muted-foreground">GitHub Link</Label>
            <Input id="githubUrl" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-muted-foreground">LinkedIn Link</Label>
            <Input id="linkedinUrl" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} className="rounded-xl border-border/70 bg-background/70 text-foreground" />
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-xs font-semibold text-muted-foreground">Bio</Label>
        <textarea
          id="bio"
          rows={5}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          placeholder="Write a short summary about your background"
        />
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button type="submit" disabled={isPending} className="gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}