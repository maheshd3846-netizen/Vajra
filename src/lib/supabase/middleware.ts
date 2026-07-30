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

  // Unauthenticated user trying to access protected route -> Redirect to /login
  if (isProtected && !user) {
    console.log("[Middleware] Unauthenticated access to protected route. Redirecting to /login", { path });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return redirectWithCookies(url);
  }

  // Authenticated user role check & RBAC route protection
  if (user) {
    const userRole = user.user_metadata?.role || "student";

    // 1. RBAC Route Guards
    if (path.startsWith("/admin") && userRole !== "admin" && userRole !== "super_admin") {
      console.warn(`[Middleware RBAC] Unauthorized role '${userRole}' attempted access to '/admin'`);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === "mentor" ? "/mentor/dashboard" : userRole === "company" ? "/company/dashboard" : "/dashboard";
      return redirectWithCookies(redirectUrl);
    }

    if (path.startsWith("/mentor") && userRole !== "mentor" && userRole !== "admin" && userRole !== "super_admin") {
      console.warn(`[Middleware RBAC] Unauthorized role '${userRole}' attempted access to '/mentor'`);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === "company" ? "/company/dashboard" : "/dashboard";
      return redirectWithCookies(redirectUrl);
    }

    if (path.startsWith("/company") && userRole !== "company" && userRole !== "admin" && userRole !== "super_admin") {
      console.warn(`[Middleware RBAC] Unauthorized role '${userRole}' attempted access to '/company'`);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === "mentor" ? "/mentor/dashboard" : "/dashboard";
      return redirectWithCookies(redirectUrl);
    }

    // Redirect auth pages to corresponding role dashboard
    if (
      path === "/login" || path.startsWith("/login/") ||
      path === "/register" || path.startsWith("/register/") ||
      path === "/forgot-password" || path.startsWith("/forgot-password/")
    ) {
      console.log("[Middleware] Authenticated user on auth route. Redirecting to role dashboard", { userRole });
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname =
        userRole === "company"
          ? "/company/dashboard"
          : userRole === "mentor"
          ? "/mentor/dashboard"
          : userRole === "admin" || userRole === "super_admin"
          ? "/admin/dashboard"
          : "/dashboard";
      return redirectWithCookies(targetUrl);
    }
  }

  return supabaseResponse;
}
