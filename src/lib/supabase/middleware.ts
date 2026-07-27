import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Define protected route groups
  const protectedRoutes = ["/student", "/company", "/mentor", "/admin"];
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtected && !user) {
    // User is not authenticated; redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const userRole = user.user_metadata?.role; // expected: 'student', 'company', 'mentor', 'admin'

    // If an authenticated user attempts to access login/signup pages, redirect to dashboard
    if (path.startsWith("/login") || path.startsWith("/signup")) {
      return redirectToRoleDashboard(request, userRole);
    }

    // Route restriction based on roles
    if (path.startsWith("/student") && userRole !== "student" && userRole !== "admin") {
      return redirectToRoleDashboard(request, userRole);
    }
    if (path.startsWith("/company") && userRole !== "company" && userRole !== "admin") {
      return redirectToRoleDashboard(request, userRole);
    }
    if (path.startsWith("/mentor") && userRole !== "mentor" && userRole !== "admin") {
      return redirectToRoleDashboard(request, userRole);
    }
    if (path.startsWith("/admin") && userRole !== "admin") {
      return redirectToRoleDashboard(request, userRole);
    }
  }

  return supabaseResponse;
}

function redirectToRoleDashboard(request: NextRequest, role: string | undefined) {
  const url = request.nextUrl.clone();
  if (role === "student") {
    url.pathname = "/student";
  } else if (role === "company") {
    url.pathname = "/company";
  } else if (role === "mentor") {
    url.pathname = "/mentor";
  } else if (role === "admin") {
    url.pathname = "/admin";
  } else {
    url.pathname = "/";
  }
  return NextResponse.redirect(url);
}
