import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Bypass auth check completely for /auth/* routes BEFORE calling getUser() or instantiating auth client.
  // This ensures OAuth state/PKCE verifier cookies reach /auth/callback uncorrupted.
  if (path.startsWith("/auth/")) {
    return NextResponse.next({ request });
  }

  // 2. Intercept OAuth code parameter on root path if provider falls back to SITE_URL
  if (path === "/" && request.nextUrl.searchParams.has("code")) {
    console.log("[Middleware] Intercepted OAuth code on root path. Forwarding to /auth/callback...");
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // 3. Official @supabase/ssr middleware client (with request.cookies and response cookie syncing)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Helper function to return redirect response while preserving all session cookies
  const redirectWithCookies = (destinationUrl: URL) => {
    const redirectResponse = NextResponse.redirect(destinationUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Session Audit Log
  console.log("[Middleware Audit]", {
    path,
    authenticated: !!user,
    userEmail: user?.email || null,
    cookiesCount: request.cookies.getAll().length,
  });

  // 4. Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/career",
    "/internships",
    "/interview",
    "/mentorship",
    "/portfolio",
    "/settings",
    "/company",
    "/mentor",
    "/admin",
    "/onboarding",
  ];
  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  if (isProtected && !user) {
    console.log("[Middleware] Unauthenticated access to protected route. Redirecting to /login", { path });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return redirectWithCookies(url);
  }

  if (user) {
    // Align role with database source of truth if user_metadata role is absent
    let userRole = user.user_metadata?.role;
    if (!userRole) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      userRole = dbUser?.role || "student";
    }

    if (
      path === "/login" || path.startsWith("/login/") ||
      path === "/register" || path.startsWith("/register/") ||
      path === "/forgot-password" || path.startsWith("/forgot-password/")
    ) {
      console.log("[Middleware] Authenticated user on auth route. Redirecting to role dashboard", { userRole });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = getRoleDashboardPath(userRole);
      return redirectWithCookies(targetUrl);
    }

    const studentRoutes = ["/dashboard", "/career", "/internships", "/interview", "/mentorship", "/portfolio", "/settings"];
    const isStudentRoute = studentRoutes.some((route) => path === route || path.startsWith(route + "/"));

    if (isStudentRoute && userRole !== "student" && userRole !== "admin" && userRole !== "super_admin") {
      console.log("[Middleware] Role mismatch for student route. Redirecting.", { userRole, path });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = getRoleDashboardPath(userRole);
      return redirectWithCookies(targetUrl);
    }
    if (path.startsWith("/company") && userRole !== "company" && userRole !== "admin" && userRole !== "super_admin") {
      console.log("[Middleware] Role mismatch for company route. Redirecting.", { userRole, path });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = getRoleDashboardPath(userRole);
      return redirectWithCookies(targetUrl);
    }
    if (path.startsWith("/mentor") && userRole !== "mentor" && userRole !== "admin" && userRole !== "super_admin") {
      console.log("[Middleware] Role mismatch for mentor route. Redirecting.", { userRole, path });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = getRoleDashboardPath(userRole);
      return redirectWithCookies(targetUrl);
    }
    if (path.startsWith("/admin") && userRole !== "admin" && userRole !== "super_admin") {
      console.log("[Middleware] Role mismatch for admin route. Redirecting.", { userRole, path });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = getRoleDashboardPath(userRole);
      return redirectWithCookies(targetUrl);
    }
  }

  return supabaseResponse;
}

function getRoleDashboardPath(role: string | undefined): string {
  if (role === "company") {
    return "/company/dashboard";
  } else if (role === "mentor") {
    return "/mentor/dashboard";
  } else if (role === "admin" || role === "super_admin") {
    return "/admin/dashboard";
  }
  return "/dashboard";
}
