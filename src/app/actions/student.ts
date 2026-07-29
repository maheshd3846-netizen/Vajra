"use server";

import { createClient } from "@/lib/supabase/server";
import { updateStudentProfile, updateUserProfile } from "@/lib/supabase/db-helpers";

export interface StudentSettingsPayload {
  fullName: string;
  bio: string;
  university: string;
  major: string;
  graduationYear: string;
  gpa: string;
  githubUrl: string;
  linkedinUrl: string;
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = trimmed.includes(".") ? Number.parseFloat(trimmed) : Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateStudentSettingsAction(payload: StudentSettingsPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in again." };
    }

    const fullName = payload.fullName.trim();
    const university = payload.university.trim();
    const major = payload.major.trim();
    const bio = payload.bio.trim();
    const githubUrl = payload.githubUrl.trim();
    const linkedinUrl = payload.linkedinUrl.trim();

    if (!fullName || !university || !major) {
      return { success: false, error: "Full name, university, and major are required." };
    }

    const studentUpdate = await updateStudentProfile(supabase, user.id, {
      bio: bio || null,
      university,
      major,
      graduation_year: parseNumber(payload.graduationYear),
      gpa: parseNumber(payload.gpa),
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
    });

    if (studentUpdate.error) {
      throw studentUpdate.error;
    }

    const userUpdate = await updateUserProfile(supabase, user.id, {
      full_name: fullName,
    });

    if (userUpdate.error) {
      throw userUpdate.error;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save student profile.";
    console.error("updateStudentSettingsAction error:", err);
    return { success: false, error: errorMessage };
  }
}