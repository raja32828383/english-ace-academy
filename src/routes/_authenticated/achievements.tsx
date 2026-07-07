import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Flame,
  Footprints,
  Star,
  Target,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/achievements")({
  component: AchievementsPage,
});

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  star: Star,
  "book-open": BookOpen,
  target: Target,
  award: Award,
};

function AchievementsPage() {
  const { user } = useAuth();
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("achievements").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const { data: earned = [] } = useQuery({
    queryKey: ["user-achievements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const earnedIds = new Set(earned.map((e) => e.achievement_id));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Achievements</h1>
        <p className="mt-1 text-muted-foreground">
          {earnedIds.size} of {achievements.length} badges unlocked.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => {
            const Icon = ICONS[a.icon] ?? Award;
            const unlocked = earnedIds.has(a.id);
            return (
              <Card
                key={a.id}
                className={cn(
                  "flex items-center gap-4 p-5",
                  unlocked ? "border-2 border-gold/40 bg-gold/5" : "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                    unlocked ? "bg-gold/20 text-gold-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {unlocked ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  {a.xp_reward > 0 && <p className="mt-1 text-xs font-bold text-gold">+{a.xp_reward} XP</p>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
