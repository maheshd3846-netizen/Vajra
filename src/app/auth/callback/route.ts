import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const roleParam = requestUrl.searchParams.get("role");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  console.log("=================================================");
  console.log("[Auth Callback] GET request received");
  console.log("[Auth Callback] Request URL:", request.url);
  console.log("[Auth Callback] Query Params:", {
    code: code ? `${code.slice(0, 8)}...` : null,
    next,
    roleParam,
    error,
    errorDescription,
  });

  // 1. Handle OAuth Provider Error
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || "OAuth authorization failed";
    console.error("[Auth Callback Error] OAuth Provider Error:", errorMsg);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    );
  }

  // 2. Handle missing authorization code
  if (!code) {
    console.error("[Auth Callback Error] Authorization code is missing.");
    return NextResponse.redirect(
      new URL("/login?error=Missing+authorization+code", requestUrl.origin)
    );
  }

  try {
    const supabase = await createClient();

    // 3. Exchange code for session
    console.log("[Auth Callback] Exchanging code for session...");
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !sessionData?.user) {
      console.error("[Auth Callback Error] exchangeCodeForSession failed:", {
        name: exchangeError?.name,
        code: exchangeError?.code,
        status: exchangeError?.status,
        message: exchangeError?.message,
      });
      const msg = exchangeError?.message || "Failed to exchange authorization code for session";
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(msg)}`, requestUrl.origin)
      );
    }

    const user = sessionData.user;
    console.log("[Auth Callback] Authenticated User:", {
      id: user.id,
      email: user.email,
      metadataRole: user.user_metadata?.role,
    });

    // 4. Profile Lookup on public.users
    console.log("[Auth Callback] Looking up public.users record for:", user.id);
    const { data: existingUser, error: userLookupError } = await supabase
      .from("users")
      .select("id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (userLookupError) {
      console.warn("[Auth Callback Warning] User lookup query issue:", userLookupError.message);
    }

    let userRole =
      existingUser?.role ||
      (roleParam === "company" || roleParam === "mentor" || roleParam === "admin" ? roleParam : null) ||
      user.user_metadata?.role ||
      "student";

    // 5. Ensure public.users row exists
    if (!existingUser) {
      console.log("[Auth Callback] User record missing in public.users. Creating record...");
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "User";
      const avatarUrl = meta.avatar_url || meta.picture || null;

      const { data: newUser, error: userInsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email!,
            role: userRole,
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          { onConflict: "id" }
        )
        .select("role")
        .single();

      if (userInsertError) {
        console.error("[Auth Callback Error] Failed to create public.users record:", {
          code: userInsertError.code,
          message: userInsertError.message,
          details: userInsertError.details,
          hint: userInsertError.hint,
        });
      } else if (newUser?.role) {
        userRole = newUser.role;
      }
    }

    // 6. Ensure profile sub-entries exist & check setup status
    let isStudentProfileComplete = false;
    if (userRole === "student") {
      console.log("[Auth Callback] Checking student profile status...");
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("university, major")
        .eq("id", user.id)
        .maybeSingle();

      if (!studentProfile) {
        console.log("[Auth Callback] Creating missing student_profiles record...");
        const { error: studentProfileErr } = await supabase
          .from("student_profiles")
          .upsert({ id: user.id }, { onConflict: "id" });

        if (studentProfileErr) {
          console.error("[Auth Callback Error] Failed to upsert student_profiles record:", {
            code: studentProfileErr.code,
            message: studentProfileErr.message,
            details: studentProfileErr.details,
            hint: studentProfileErr.hint,
          });
        }
      } else if (studentProfile.university && studentProfile.major) {
        isStudentProfileComplete = true;
      }
    } else if (userRole === "company") {
      console.log("[Auth Callback] Ensuring company profile record...");
      const meta = user.user_metadata || {};
      const { error: compProfileErr } = await supabase
        .from("companies")
        .upsert({ id: user.id, name: meta.company_name || meta.full_name || "My Company" }, { onConflict: "id" });

      if (compProfileErr) {
        console.error("[Auth Callback Error] Failed to upsert companies record:", {
          code: compProfileErr.code,
          message: compProfileErr.message,
          details: compProfileErr.details,
          hint: compProfileErr.hint,
        });
      }
    } else if (userRole === "mentor") {
      console.log("[Auth Callback] Ensuring mentor profile record...");
      const { error: mentorProfileErr } = await supabase
        .from("mentors")
        .upsert({ id: user.id }, { onConflict: "id" });

      if (mentorProfileErr) {
        console.error("[Auth Callback Error] Failed to upsert mentors record:", {
          code: mentorProfileErr.code,
          message: mentorProfileErr.message,
          details: mentorProfileErr.details,
          hint: mentorProfileErr.hint,
        });
      }
    }

    // 7. Determine Redirect Destination
    let destination = "/dashboard";
    if (userRole === "student") {
      destination = isStudentProfileComplete ? "/dashboard" : "/onboarding";
    } else if (userRole === "company") {
      destination = "/company/dashboard";
    } else if (userRole === "mentor") {
      destination = "/mentor/dashboard";
    } else if (userRole === "admin" || userRole === "super_admin") {
      destination = "/admin/dashboard";
    }

    // Never redirect directly to "/" unless explicitly requested via valid next param
    const finalRedirectPath =
      next && next.startsWith("/") && !next.startsWith("//") && next !== "/"
        ? next
        : destination;

    console.log("[Auth Callback Decision] Redirecting user to:", finalRedirectPath);
    console.log("=================================================");

    return NextResponse.redirect(new URL(finalRedirectPath, requestUrl.origin));
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error("[Auth Callback Exception] Stack Trace:", errorObj.stack || errorObj.message);

    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Callback Error: ${errorObj.message}`
        : "Unexpected authentication error";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
}
