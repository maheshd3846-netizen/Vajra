"use server";

import { createClient } from "@/lib/supabase/server";

interface PublishPortfolioResponse {
  success: boolean;
  error?: string;
}

interface PublicPortfolioData {
  title: string;
  description: string | null;
  slug: string;
  student: {
    fullName: string;
    major: string | null;
    university: string | null;
    gpa: number | null;
    gradYear: number | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  };
  skills: { skill_name: string; proficiency: string; verified: boolean }[];
  projects: { title: string; description: string | null; demo_url?: string | null; github_url?: string | null }[];
}

export async function publishPortfolioAction(
  slug: string,
  title: string,
  description: string
): Promise<PublishPortfolioResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    if (!cleanSlug) {
      return { success: false, error: "Invalid URL slug context." };
    }

    // Check if the slug is already taken by another user
    const { data: existingSlug } = await supabase
      .from("portfolios")
      .select("student_id")
      .eq("asset_url", cleanSlug)
      .single();

    if (existingSlug && existingSlug.student_id !== user.id) {
      return { success: false, error: "Subdomain slug already taken by another student." };
    }

    // Check if user already published a portfolio
    const { data: existingPortfolio } = await supabase
      .from("portfolios")
      .select("id")
      .eq("student_id", user.id)
      .single();

    if (existingPortfolio) {
      // Update
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({
          title,
          description,
          asset_url: cleanSlug,
        })
        .eq("student_id", user.id);

      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase.from("portfolios").insert({
        student_id: user.id,
        title,
        description,
        asset_url: cleanSlug,
      });

      if (insertError) throw insertError;
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to publish developer portfolio.";
    console.error("publishPortfolioAction failed:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getPublicPortfolioAction(
  username: string
): Promise<{ success: boolean; data?: PublicPortfolioData; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch portfolio by custom URL slug
    const { data: portfolio, error: portError } = await supabase
      .from("portfolios")
      .select("id, student_id, title, description, asset_url")
      .eq("asset_url", username.toLowerCase())
      .single();

    if (portError || !portfolio) {
      return { success: false, error: "Developer portfolio not found." };
    }

    const studentId = portfolio.student_id;

    // 2. Fetch student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from("student_profiles")
      .select("id, major, university, gpa, graduation_year, github_url, linkedin_url")
      .eq("id", studentId)
      .single();

    if (profileError || !studentProfile) {
      return { success: false, error: "Associated student profile not found." };
    }

    // 3. Fetch user info
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", studentId)
      .single();

    if (userError || !userProfile) {
      return { success: false, error: "Associated user credentials missing." };
    }

    // 4. Fetch student skills
    const { data: skills } = await supabase
      .from("student_skills")
      .select("skill_name, proficiency, verified")
      .eq("student_id", studentId);

    // 5. Fetch student projects
    const { data: projects } = await supabase
      .from("projects")
      .select("title, description")
      .eq("student_id", studentId);

    const activeSkills = skills || [];
    const activeProjects = projects || [];

    return {
      success: true,
      data: {
        title: portfolio.title,
        description: portfolio.description,
        slug: portfolio.asset_url,
        student: {
          fullName: userProfile.full_name || "Vajra Engineer",
          major: studentProfile.major,
          university: studentProfile.university,
          gpa: studentProfile.gpa,
          gradYear: studentProfile.graduation_year,
          githubUrl: studentProfile.github_url,
          linkedinUrl: studentProfile.linkedin_url,
        },
        skills: activeSkills,
        projects: activeProjects,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to retrieve public developer portfolio.";
    console.error("getPublicPortfolioAction failed:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
