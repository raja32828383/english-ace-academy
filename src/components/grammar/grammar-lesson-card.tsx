import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, Clock, Star, ArrowRight } from "lucide-react";
import type { GrammarLesson } from "@/lib/grammar-content";
import { LEVEL_META } from "@/lib/grammar-content";
import type { GrammarProgressRow } from "@/lib/grammar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  lesson: GrammarLesson;
  progress?: GrammarProgressRow;
  bookmarked: boolean;
  onToggleBookmark: (lesson: GrammarLesson, next: boolean) => void;
}

export function GrammarLessonCard({ lesson, progress, bookmarked, onToggleBookmark }: Props) {
  const completed = progress?.status === "completed";
  const level = LEVEL_META[lesson.level];

  return (
    <Card className="group relative flex h-full flex-col p-4 transition-transform hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => onToggleBookmark(lesson, !bookmarked)}
        aria-label={bookmarked ? `Remove ${lesson.title} from bookmarks` : `Bookmark ${lesson.title}`}
        aria-pressed={bookmarked}
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bookmark className={cn("h-5 w-5", bookmarked && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-wrap items-center gap-2 pr-8">
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold", level.tint)}>
          {level.label}
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
        to="/grammar/$lessonId"
        params={{ lessonId: lesson.slug }}
        className="mt-2 flex-1 focus-visible:outline-none"
      >
        <h3 className="font-display text-lg font-extrabold leading-tight group-hover:text-primary">
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{lesson.summary}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Star className="h-3.5 w-3.5 fill-gold" /> {lesson.xpReward}
          </span>
        </span>
        {completed && progress?.best_score != null && (
          <span className="text-success">{progress.best_score}%</span>
        )}
      </div>

      <Link
        to="/grammar/$lessonId"
        params={{ lessonId: lesson.slug }}
        className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15"
      >
        {completed ? "Review" : progress ? "Continue" : "Start lesson"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
