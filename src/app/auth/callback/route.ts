import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth provider error
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || "OAuth authentication failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    );
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing+authorization+code", requestUrl.origin)
    );
  }

  try {
    const supabase = await createClient();
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !sessionData?.user) {
      const msg = exchangeError?.message || "Failed to exchange authorization code for session";
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(msg)}`, requestUrl.origin)
      );
    }

    const user = sessionData.user;
    const roleParam = requestUrl.searchParams.get("role");

    // Ensure public.users row exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    let userRole =
      existingUser?.role ||
      (roleParam === "company" || roleParam === "mentor" || roleParam === "admin" ? roleParam : null) ||
      user.user_metadata?.role ||
      "student";

    if (!existingUser) {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "User";
      const avatarUrl = meta.avatar_url || meta.picture || null;

      // Upsert public.users
      const { data: newUser } = await supabase
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

      if (newUser?.role) {
        userRole = newUser.role;
      }

      // Ensure profile sub-entries exist
      if (userRole === "student") {
        await supabase.from("student_profiles").upsert({ id: user.id }, { onConflict: "id" });
      } else if (userRole === "company") {
        await supabase
          .from("companies")
          .upsert({ id: user.id, name: meta.company_name || "My Company" }, { onConflict: "id" });
      } else if (userRole === "mentor") {
        await supabase.from("mentors").upsert({ id: user.id }, { onConflict: "id" });
      }
    }

    // Role-based default dashboards
    let destination = "/dashboard";
    if (userRole === "company") {
      destination = "/company/dashboard";
    } else if (userRole === "mentor") {
      destination = "/mentor/dashboard";
    } else if (userRole === "admin" || userRole === "super_admin") {
      destination = "/admin/dashboard";
    }

    const redirectPath = (next && next.startsWith("/") && !next.startsWith("//")) ? next : destination;

    console.log("[AuthCallback Audit]", {
      codeReceived: !!code,
      userEmail: user.email,
      userId: user.id,
      userRole,
      redirectPath,
    });

    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unexpected authentication error";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    );
  }
}
