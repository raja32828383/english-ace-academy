import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Medal, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { leaderboardQuery } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { levelFromXp } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  component: LeaderboardPage,
});

const RANK_TINT = ["text-gold", "text-muted-foreground", "text-coral"];

function LeaderboardPage() {
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useQuery(leaderboardQuery());

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">Top learners by XP. Keep grinding to climb!</p>

        {isLoading ? (
          <div className="mt-6 space-y-2" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {rows.map((row, i) => {
              const name = row.profiles?.display_name ?? "Learner";
              const isMe = row.user_id === user?.id;
              return (
                <Card
                  key={row.user_id}
                  className={cn(
                    "flex items-center gap-3 p-3",
                    isMe && "border-2 border-primary bg-primary/5",
                  )}
                >
                  <span className="grid w-8 shrink-0 place-items-center font-display text-lg font-extrabold">
                    {i < 3 ? <Medal className={cn("h-6 w-6", RANK_TINT[i])} /> : i + 1}
                  </span>
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarFallback className="bg-primary/10 font-bold text-primary">
                      {name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{name} {isMe && <span className="text-primary">(you)</span>}</p>
                    <p className="text-xs text-muted-foreground">Level {levelFromXp(row.xp).level}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm font-bold">
                    <span className="flex items-center gap-1 text-coral"><Flame className="h-4 w-4" /> {row.current_streak}</span>
                    <span className="flex items-center gap-1 text-gold"><Star className="h-4 w-4" /> {row.xp}</span>
                  </div>
                </Card>
              );
            })}
            {rows.length === 0 && (
              <p className="mt-10 text-center text-muted-foreground">No learners yet. Be the first!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
