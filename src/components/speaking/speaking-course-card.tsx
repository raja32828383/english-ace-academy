import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Star, ArrowRight, Mic } from "lucide-react";
import {
  CATEGORY_META,
  LEVEL_META,
  MODE_META,
  type SpeakingCourse,
} from "@/lib/speaking-content";
import type { SpeakingProgressRow } from "@/lib/speaking";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SpeakingCourseCard({
  course,
  progress,
}: {
  course: SpeakingCourse;
  progress?: SpeakingProgressRow;
}) {
  const completed = progress?.status === "completed";
  const level = LEVEL_META[course.level];
  const cat = CATEGORY_META[course.category];
  const CatIcon = cat.icon;

  return (
    <Card className="group relative flex h-full flex-col p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold", level.tint)}>
          {level.label}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
          <CatIcon className="h-3.5 w-3.5" /> {cat.label}
        </span>
        {completed && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        )}
        {!completed && progress?.status === "in_progress" && (
          <span className="text-[11px] font-bold text-coral">In progress</span>
        )}
      </div>

      <Link
        to="/speaking/course/$courseId"
        params={{ courseId: course.slug }}
        className="mt-2 flex-1 focus-visible:outline-none"
      >
        <h3 className="font-display text-lg font-extrabold leading-tight group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{course.summary}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Star className="h-3.5 w-3.5 fill-gold" /> {course.xpReward}
          </span>
        </span>
        <span className="flex items-center gap-1 text-primary">
          <Mic className="h-3.5 w-3.5" /> {MODE_META[course.mode].label}
        </span>
      </div>

      {completed && progress?.pronunciation_avg != null && (
        <p className="mt-1 text-xs font-bold text-success">
          Best pronunciation: {progress.pronunciation_avg}%
        </p>
      )}

      <Link
        to="/speaking/course/$courseId"
        params={{ courseId: course.slug }}
        className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15"
      >
        {completed ? "Practise again" : progress ? "Continue" : "Start course"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
