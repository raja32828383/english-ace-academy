import { supabase } from "@/integrations/supabase/client";
import type { UserStats } from "@/lib/auth";

const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    toNext: XP_PER_LEVEL - intoLevel,
    progress: (intoLevel / XP_PER_LEVEL) * 100,
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
}

/**
 * Award XP and update the daily streak. Returns the updated stats row.
 */
export async function recordActivity(current: UserStats, xpGain: number): Promise<UserStats> {
  const today = todayStr();
  let { current_streak, longest_streak } = current;

  if (current.last_active_date == null) {
    current_streak = 1;
  } else {
    const diff = daysBetween(current.last_active_date, today);
    if (diff === 0) {
      // already active today, streak unchanged
    } else if (diff === 1) {
      current_streak += 1;
    } else {
      current_streak = 1;
    }
  }
  longest_streak = Math.max(longest_streak, current_streak);

  const update = {
    xp: current.xp + xpGain,
    current_streak,
    longest_streak,
    last_active_date: today,
  };

  const { data, error } = await supabase
    .from("user_stats")
    .update(update)
    .eq("user_id", current.user_id)
    .select()
    .single();

  if (error) throw error;
  return data as UserStats;
}

export async function grantAchievement(userId: string, achievementId: string) {
  await supabase
    .from("user_achievements")
    .upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true },
    );
}
