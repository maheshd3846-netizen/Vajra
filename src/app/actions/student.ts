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

export interface SaveStudentOnboardingPayload {
  university: string;
  major?: string;
  branch?: string;
  degree?: string;
  graduation_year?: number | null;
  gpa?: number | null;
  cgpa?: number | null;
  target_role?: string;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  skills?: string[];
  proficiency?: "beginner" | "intermediate" | "advanced";
}

/**
 * Save Student Onboarding Data with Detailed Server Logs & Schema Resilience
 */
export async function saveStudentOnboardingAction(
  payload: SaveStudentOnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  console.log("===== ONBOARDING SUBMIT START =====");
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[saveStudentOnboardingAction] Authentication Failure:", authError);
      return { success: false, error: "Authentication missing. Please sign in." };
    }

    console.log("[saveStudentOnboardingAction] Authenticated User:", {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || "student",
    });

    // 1. Ensure public.users row exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingUser) {
      console.log("[saveStudentOnboardingAction] Creating missing public.users record for:", user.id);
      const { error: userInsertErr } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email!,
          role: "student",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Student User",
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        { onConflict: "id" }
      );

      if (userInsertErr) {
        console.error("[saveStudentOnboardingAction] Failed to upsert public.users:", {
          code: userInsertErr.code,
          message: userInsertErr.message,
          details: userInsertErr.details,
          hint: userInsertErr.hint,
        });
      }
    }

    // 2. Prepare student_profiles payload
    const targetRoleVal = payload.target_role || "Software Engineer";
    const majorVal = payload.branch || payload.major || payload.degree || targetRoleVal;
    const gpaVal = payload.gpa ?? (payload.cgpa ? Math.min(4.0, Number(((payload.cgpa / 10) * 4).toFixed(2))) : null);
    const cgpaVal = payload.cgpa ?? (payload.gpa ? Number(Math.min(10.0, payload.gpa * 2.5).toFixed(2)) : null);

    const profileData = {
      id: user.id,
      university: payload.university,
      major: majorVal,
      branch: payload.branch || majorVal,
      degree: payload.degree || null,
      graduation_year: payload.graduation_year || null,
      gpa: gpaVal,
      cgpa: cgpaVal,
      target_role: targetRoleVal,
      github_url: payload.github_url || null,
      linkedin_url: payload.linkedin_url || null,
      portfolio_url: payload.portfolio_url || null,
      updated_at: new Date().toISOString(),
    };

    console.log("[saveStudentOnboardingAction] Saving Payload:", profileData);
    console.log("[saveStudentOnboardingAction] Executing SQL Operation: UPSERT into public.student_profiles");

    // Attempt UPSERT into student_profiles (updates if exists, inserts if new)
    const { error: profileError } = await supabase
      .from("student_profiles")
      .upsert(profileData, { onConflict: "id" });

    if (profileError) {
      console.error("[saveStudentOnboardingAction] Supabase Profile Upsert Error:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      // Fallback for missing 00006 columns in schema cache
      if (
        profileError.message.includes("Could not find") ||
        profileError.message.includes("column") ||
        profileError.code === "PGRST204"
      ) {
        console.warn("[saveStudentOnboardingAction] Column not found in schema cache. Fallback to base columns.");
        const baseProfileData = {
          id: user.id,
          university: payload.university,
          major: majorVal,
          graduation_year: payload.graduation_year || null,
          gpa: gpaVal,
          github_url: payload.github_url || null,
          linkedin_url: payload.linkedin_url || null,
        };

        const { error: fallbackError } = await supabase
          .from("student_profiles")
          .upsert(baseProfileData, { onConflict: "id" });

        if (fallbackError) {
          console.error("[saveStudentOnboardingAction] Base Columns Fallback Error:", fallbackError);
          return {
            success: false,
            error: `Database Error (${fallbackError.code || "PGRST"}): ${fallbackError.message}${fallbackError.hint ? ` - ${fallbackError.hint}` : ""}`,
          };
        }
      } else {
        return {
          success: false,
          error: `Database Error (${profileError.code || "PGRST"}): ${profileError.message}${profileError.hint ? ` - ${profileError.hint}` : ""}`,
        };
      }
    }

    console.log("[saveStudentOnboardingAction] Profile saved successfully for user:", user.id);

    // 3. Save student skills if provided
    if (payload.skills && payload.skills.length > 0) {
      console.log("[saveStudentOnboardingAction] Saving Skills:", payload.skills);
      await supabase.from("student_skills").delete().eq("student_id", user.id);

      const skillRows = payload.skills.map((s) => ({
        student_id: user.id,
        skill_name: s.trim(),
        proficiency: payload.proficiency || "intermediate",
      }));

      const { error: skillsError } = await supabase.from("student_skills").insert(skillRows);
      if (skillsError) {
        console.warn("[saveStudentOnboardingAction] Skills Insert Warning:", skillsError.message);
      }
    }

    console.log("===== ONBOARDING SUBMIT SUCCESS =====");
    return { success: true };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error("[saveStudentOnboardingAction] Critical Exception:", errorObj);
    return { success: false, error: `Server Exception: ${errorObj.message}` };
  }
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
    const fullProfileUpdates = {
      bio: payload.bio,
      university: payload.university,
      degree: payload.degree,
      branch: payload.branch,
      major: payload.branch || payload.degree, // maintain backward compatibility with major
      graduation_year: payload.graduation_year,
      gpa: payload.cgpa ? Math.min(4.0, Number(((payload.cgpa / 10) * 4).toFixed(2))) : undefined,
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
      Object.entries(fullProfileUpdates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(cleanProfileUpdates).length > 0) {
      const { error: profileErr } = await supabase
        .from("student_profiles")
        .update(cleanProfileUpdates)
        .eq("id", user.id);

      if (profileErr) {
        console.error("Error updating student_profiles record:", profileErr);

        // Fallback update if extended columns (e.g. branch, degree, cgpa) do not exist in database yet
        if (
          profileErr.message.includes("Could not find") ||
          profileErr.message.includes("column") ||
          profileErr.code === "PGRST204"
        ) {
          console.warn("[updateStudentProfileAction] Attempting base columns fallback update...");
          const baseProfileUpdates = {
            bio: payload.bio,
            university: payload.university,
            major: payload.branch || payload.degree,
            graduation_year: payload.graduation_year,
            gpa: payload.cgpa ? Math.min(4.0, Number(((payload.cgpa / 10) * 4).toFixed(2))) : undefined,
            linkedin_url: payload.linkedin_url,
            github_url: payload.github_url,
          };
          const cleanBaseUpdates = Object.fromEntries(
            Object.entries(baseProfileUpdates).filter(([, v]) => v !== undefined)
          );

          const { error: fallbackErr } = await supabase
            .from("student_profiles")
            .update(cleanBaseUpdates)
            .eq("id", user.id);

          if (fallbackErr) {
            return { success: false, error: fallbackErr.message };
          }
        } else {
          return { success: false, error: profileErr.message };
        }
      }
    }

    // 3. Update public.student_skills if skills provided
    if (payload.skills) {
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
