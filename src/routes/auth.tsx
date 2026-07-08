import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? "signup" : "login",
  }),
  component: AuthPage,
});

type View = "login" | "signup" | "forgot";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password is too long");
const nameSchema = z.string().trim().min(1, "Please enter your name").max(80);

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>(mode === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setView(mode === "signup" ? "signup" : "login"), [mode]);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  if (loading || user) return <PageLoader label="Loading your account…" />;

  const validate = () => {
    const next: typeof errors = {};
    if (view === "signup") {
      const n = nameSchema.safeParse(name);
      if (!n.success) next.name = n.error.issues[0].message;
    }
    const em = emailSchema.safeParse(email);
    if (!em.success) next.email = em.error.issues[0].message;
    if (view !== "forgot") {
      const pw = passwordSchema.safeParse(password);
      if (!pw.success) next.password = pw.error.issues[0].message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a password reset link.");
        setView("login");
      } else if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to TwoMoon Academy! You're signed in.");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  const isSignup = view === "signup";
  const isForgot = view === "forgot";

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-hero p-10 text-primary-foreground md:flex">
        <Logo className="text-primary-foreground" />
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Your English journey starts here.
          </h2>
          <p className="mt-4 max-w-sm opacity-90">
            Build a daily habit, earn XP, keep your streak alive, and climb the leaderboard.
          </p>
        </div>
        <p className="text-sm opacity-80">Belajar bahasa Inggris, made joyful.</p>
      </div>

      <main id="main-content" className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8">
          <div className="md:hidden">
            <Logo />
          </div>

          {isForgot && (
            <button
              type="button"
              onClick={() => setView("login")}
              className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-bold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </button>
          )}

          <h1 className="mt-4 font-display text-2xl font-extrabold">
            {isForgot ? "Reset your password" : isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isForgot
              ? "We'll email you a link to set a new password."
              : isSignup
                ? "Free forever to get started."
                : "Log in to continue learning."}
          </p>

          {!isForgot && (
            <>
              <Button variant="outline" className="mt-6 w-full" onClick={handleGoogle}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
                </svg>
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {isSignup && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs font-semibold text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs font-semibold text-destructive">
                  {errors.email}
                </p>
              )}
            </div>
            {!isForgot && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setView("forgot");
                      }}
                      className="rounded-sm text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1 text-xs font-semibold text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isForgot ? "Send reset link" : isSignup ? "Create account" : "Log in"}
            </Button>
          </form>

          {!isForgot && (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account? " : "New to TwoMoon Academy? "}
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setView(isSignup ? "login" : "signup");
                }}
                className="rounded-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to="/" className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Back to home
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
