import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Flame,
  Headphones,
  Mic,
  Sparkles,
  Star,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  { icon: Brain, title: "Smart flashcards", desc: "Spaced-repetition vocabulary that adapts to what you forget." },
  { icon: BookOpen, title: "Grammar lessons", desc: "Clear, bite-sized grammar explained for Indonesian speakers." },
  { icon: Headphones, title: "Listening practice", desc: "Train your ears with real, everyday English audio." },
  { icon: Mic, title: "Speaking practice", desc: "Speak aloud and get instant feedback with speech recognition." },
  { icon: Zap, title: "Quizzes", desc: "Instant feedback keeps every mistake a learning moment." },
  { icon: Sparkles, title: "AI-ready", desc: "Pronunciation coaching and an AI tutor are on the way." },
];

const LEVELS = [
  { name: "Beginner", color: "bg-primary/10 text-primary", desc: "Greetings, present tense, everyday words.", items: ["Greetings & introductions", "Present simple", "Core vocabulary"] },
  { name: "Intermediate", color: "bg-coral/10 text-coral", desc: "Real conversations and richer grammar.", items: ["Future tense", "Reading comprehension", "Ordering food"] },
  { name: "Advanced", color: "bg-gold/15 text-gold-foreground", desc: "Idioms, debate, and fluent expression.", items: ["Advanced idioms", "Persuasion", "Nuanced vocabulary"] },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-secondary-foreground">
              <Flame className="h-4 w-4 text-coral" /> Made for Indonesian learners
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Learn English the <span className="text-primary">fun</span> way.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Belajar bahasa Inggris with a structured path, playful lessons, daily
              streaks, and XP. Free to start — pelajari kapan saja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start learning free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/learn">Explore lessons</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-5 text-sm font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-gold" /> Earn XP</span>
              <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-coral" /> Daily streaks</span>
              <span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-primary" /> Leaderboards</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-hero opacity-20 blur-2xl" />
            <img
              src={heroImg}
              alt="Indonesian student learning English on a phone with XP and streak rewards"
              width={1536}
              height={1152}
              className="relative rounded-3xl border-2 border-border shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Everything you need to get fluent</h2>
          <p className="mt-3 text-muted-foreground">
            A complete toolkit that keeps you motivated every single day.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 transition-transform hover:-translate-y-1">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section className="bg-muted/40 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">A path from zero to fluent</h2>
            <p className="mt-3 text-muted-foreground">Progress through three carefully structured levels.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {LEVELS.map((lvl) => (
              <Card key={lvl.name} className="flex flex-col p-6">
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-extrabold ${lvl.color}`}>
                  {lvl.name}
                </span>
                <p className="mt-3 text-sm text-muted-foreground">{lvl.desc}</p>
                <ul className="mt-4 space-y-2">
                  {lvl.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Card className="bg-gradient-hero p-10 text-primary-foreground">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Ready to speak English with confidence?</h2>
          <p className="mx-auto mt-3 max-w-lg opacity-90">
            Join thousands of Indonesian students building a daily habit. It's free to start.
          </p>
          <Button asChild variant="gold" size="xl" className="mt-6">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create your free account
            </Link>
          </Button>
        </Card>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TwoMoon Academy. Belajar bahasa Inggris, made joyful.</p>
          <div className="flex gap-4 font-semibold">
            <Link to="/learn" className="hover:text-foreground">Lessons</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
