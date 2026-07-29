"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use useState lazy initializer so Supabase client reference remains 100% stable across re-renders
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  console.log("[AuthProvider Render Debug]", {
    renderCount: renderCountRef.current,
    userId: user?.id || null,
    userEmail: user?.email || null,
    isLoading,
  });

  const fetchProfile = useCallback(
    async (userId: string, email: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, role, full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (data) {
          setProfile(data);
        } else {
          if (error) {
            console.warn("[AuthProvider] Profile fetch notice:", error.message);
          }
          // Fallback profile object if user table entry is still processing
          setProfile({
            id: userId,
            email,
            role: "student",
            full_name: email.split("@")[0],
            avatar_url: null,
          });
        }
      } catch (err) {
        console.error("[AuthProvider] Profile fetch error:", err);
      }
    },
    [supabase]
  );

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("[AuthProvider] Session refresh error:", error.message);
      }

      console.log("[AuthProvider] Session refresh executed:", {
        sessionExists: !!currentSession,
        userEmail: currentSession?.user?.email,
      });

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user.email || "");
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("[AuthProvider] Failed to refresh session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        console.log("[AuthProvider] Initializing Session on Mount:", {
          sessionExists: !!currentSession,
          userEmail: currentSession?.user?.email,
        });

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.email || "");
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("[AuthProvider] initAuth error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("[AuthProvider] Auth State Changed:", event, {
        userEmail: currentSession?.user?.email,
        userId: currentSession?.user?.id,
      });

      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user.email || "");
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    setIsLoading(true);
    console.log("[AuthProvider] Signing out user globally:", user?.email);
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.warn("[AuthProvider] Global signOut notice:", err);
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
