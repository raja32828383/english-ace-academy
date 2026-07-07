import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface UserStats {
  user_id: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  hearts: number;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  stats: UserStats | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureUserRecords(user: User) {
  // Create profile + stats rows on first sign-in (no auth trigger needed).
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Learner";

  await supabase.from("profiles").upsert(
    { id: user.id, display_name: displayName },
    { onConflict: "id", ignoreDuplicates: true },
  );
  await supabase.from("user_stats").upsert(
    { user_id: user.id },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const loadUserData = useCallback(async (u: User) => {
    await ensureUserRecords(u);
    const [{ data: p }, { data: s }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
      supabase.from("user_stats").select("*").eq("user_id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id),
    ]);
    setProfile(p as Profile | null);
    setStats(s as UserStats | null);
    setIsAdmin(Boolean(roles?.some((r) => r.role === "admin")));
  }, []);

  const refresh = useCallback(async () => {
    if (user) await loadUserData(user);
  }, [user, loadUserData]);

  useEffect(() => {
    // Set up listener first, then read the existing session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (newSession?.user) {
          // Defer Supabase calls out of the callback to avoid deadlocks.
          setTimeout(() => void loadUserData(newSession.user), 0);
        }
        router.invalidate();
        queryClient.invalidateQueries();
      }
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setStats(null);
        setIsAdmin(false);
        router.invalidate();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void loadUserData(data.session.user);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadUserData, router, queryClient]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }, [queryClient, router]);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, stats, isAdmin, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
