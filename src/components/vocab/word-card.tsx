import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/vocab/audio-button";
import { cn } from "@/lib/utils";
import type { Vocabulary } from "@/lib/data";
import { categoryInfo, DIFFICULTY_META, STATUS_META, type UserVocabState } from "@/lib/vocab";

interface WordCardProps {
  word: Vocabulary;
  state?: UserVocabState;
  onToggleFavorite?: (word: Vocabulary, next: boolean) => void;
}

export function WordCard({ word, state, onToggleFavorite }: WordCardProps) {
  const cat = categoryInfo(word.category);
  const CatIcon = cat.icon;
  const status = state?.status ?? "new";
  const isFav = state?.is_favorite ?? false;
  const mastery = state?.mastery_score ?? 0;

  return (
    <Card className="group relative flex flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite?.(word, !isFav);
        }}
        aria-label={isFav ? `Remove ${word.word} from favorites` : `Add ${word.word} to favorites`}
        aria-pressed={isFav}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground transition-colors hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Heart className={cn("h-5 w-5 transition-transform active:scale-90", isFav && "fill-coral text-coral")} />
      </button>

      <Link
        to="/vocabulary/$wordId"
        params={{ wordId: word.id }}
        className="flex flex-col gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2 pr-8">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", cat.tint)}>
            <CatIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-extrabold leading-tight">{word.word}</h3>
            {word.pronunciation && (
              <p className="truncate text-xs text-muted-foreground">/{word.pronunciation}/</p>
            )}
          </div>
        </div>
        <p className="line-clamp-1 font-bold text-primary">{word.translation}</p>
        {word.part_of_speech && (
          <p className="text-xs italic text-muted-foreground">{word.part_of_speech}</p>
        )}
      </Link>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className={cn("border-0 text-[11px]", DIFFICULTY_META[word.level].tint)}>
          {DIFFICULTY_META[word.level].label}
        </Badge>
        {status !== "new" && (
          <Badge variant="secondary" className={cn("border-0 text-[11px]", STATUS_META[status].tint)}>
            {STATUS_META[status].label}
          </Badge>
        )}
        <AudioButton text={word.word} src={word.audio_url} size={"icon" as never} className="ml-auto h-8 w-8" />
      </div>

      {mastery > 0 && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Mastery</span>
            <span>{mastery}%</span>
          </div>
          <Progress value={mastery} className="mt-1 h-1.5" />
        </div>
      )}
    </Card>
  );
}
