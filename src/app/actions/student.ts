"use server";

import { createClient } from "@/lib/supabase/server";

export interface UpdateStudentProfilePayload {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  university?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  cgpa?: number;
  target_role?: string;
  skills?: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  phone?: string;
  location?: string;
}

/**
 * Update Student Profile Details, User Name/Avatar, and Skills
 */
export async function updateStudentProfileAction(
  payload: UpdateStudentProfilePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Update public.users table if full_name or avatar_url changed
    if (payload.full_name !== undefined || payload.avatar_url !== undefined) {
      const userUpdates: { full_name?: string; avatar_url?: string } = {};
      if (payload.full_name !== undefined) userUpdates.full_name = payload.full_name;
      if (payload.avatar_url !== undefined) userUpdates.avatar_url = payload.avatar_url;

      const { error: userErr } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

      if (userErr) {
        console.error("Error updating users record:", userErr);
        return { success: false, error: userErr.message };
      }
    }

    // 2. Update public.student_profiles table
    const profileUpdates = {
      bio: payload.bio,
      university: payload.university,
      degree: payload.degree,
      branch: payload.branch,
      major: payload.branch || payload.degree, // maintain backward compatibility with major
      graduation_year: payload.graduation_year,
      gpa: payload.cgpa ? Math.min(4.0, (payload.cgpa / 10) * 4) : undefined, // maintain gpa fallback
      cgpa: payload.cgpa,
      target_role: payload.target_role,
      linkedin_url: payload.linkedin_url,
      github_url: payload.github_url,
      portfolio_url: payload.portfolio_url,
      phone: payload.phone,
      location: payload.location,
    };

    // Filter undefined values
    const cleanProfileUpdates = Object.fromEntries(
      Object.entries(profileUpdates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(cleanProfileUpdates).length > 0) {
      const { error: profileErr } = await supabase
        .from("student_profiles")
        .update(cleanProfileUpdates)
        .eq("id", user.id);

      if (profileErr) {
        console.error("Error updating student_profiles record:", profileErr);
        return { success: false, error: profileErr.message };
      }
    }

    // 3. Update public.student_skills if skills provided
    if (payload.skills) {
      // Delete existing skills and re-insert
      await supabase.from("student_skills").delete().eq("student_id", user.id);

      if (payload.skills.length > 0) {
        const skillsRows = payload.skills.map((skillName) => ({
          student_id: user.id,
          skill_name: skillName.trim(),
          proficiency: "intermediate" as const,
        }));

        const { error: skillsErr } = await supabase.from("student_skills").insert(skillsRows);
        if (skillsErr) {
          console.error("Error updating student_skills:", skillsErr);
        }
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update profile.";
    console.error("updateStudentProfileAction error:", err);
    return { success: false, error: errorMessage };
  }
}
