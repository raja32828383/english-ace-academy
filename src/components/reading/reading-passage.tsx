import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookmarkPlus,
  Check,
  Heart,
  Highlighter,
  Star,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/vocab/audio-button";
import type {
  GrammarHighlight,
  TranscriptLine,
  VocabHighlight,
} from "@/lib/reading-content";
import { cn } from "@/lib/utils";

type Mark =
  | { type: "vocab"; key: string; data: VocabHighlight }
  | { type: "grammar"; key: string; data: GrammarHighlight };

interface Segment {
  text: string;
  mark?: Mark;
}

const isWordChar = (c: string | undefined) => !!c && /[A-Za-z]/.test(c);

/** Split a sentence into plain + highlighted segments (grammar first, longest). */
function annotate(text: string, marks: Mark[]): Segment[] {
  const out: Segment[] = [];
  const lower = text.toLowerCase();
  let i = 0;
  while (i < text.length) {
    let hit: Mark | null = null;
    for (const m of marks) {
      const key = m.key.toLowerCase();
      if (!lower.startsWith(key, i)) continue;
      // Word-boundary check so "am" doesn't match inside "name".
      const before = text[i - 1];
      const after = text[i + m.key.length];
      if (isWordChar(before) || isWordChar(after)) continue;
      hit = m;
      break;
    }
    if (hit) {
      out.push({ text: text.slice(i, i + hit.key.length), mark: hit });
      i += hit.key.length;
    } else {
      const last = out[out.length - 1];
      if (last && !last.mark) last.text += text[i];
      else out.push({ text: text[i] });
      i += 1;
    }
  }
  return out;
}

interface ReadingPassageProps {
  lines: TranscriptLine[];
  vocab: VocabHighlight[];
  grammar: GrammarHighlight[];
  /** Base font size in rem for the passage. */
  fontScale: number;
  /** Highlight the sentence currently being narrated. */
  activeIndex?: number;
  onSaveWord?: (word: VocabHighlight) => void;
  onFavoriteWord?: (word: VocabHighlight) => void;
  onLearnWord?: (word: VocabHighlight) => void;
  onQuote?: (quote: string) => void;
}

export function ReadingPassage({
  lines,
  vocab,
  grammar,
  fontScale,
  activeIndex,
  onSaveWord,
  onFavoriteWord,
  onLearnWord,
  onQuote,
}: ReadingPassageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const marks = useMemo<Mark[]>(() => {
    const all: Mark[] = [
      ...grammar.map((g) => ({ type: "grammar" as const, key: g.phrase, data: g })),
      ...vocab.map((v) => ({ type: "vocab" as const, key: v.word, data: v })),
    ];
    // Longest first so multi-word grammar phrases win over single words.
    return all.sort((a, b) => b.key.length - a.key.length);
  }, [vocab, grammar]);

  // Group sentences into paragraphs.
  const paragraphs = useMemo(() => {
    const groups: { para: number; items: { line: TranscriptLine; idx: number }[] }[] = [];
    lines.forEach((line, idx) => {
      const last = groups[groups.length - 1];
      if (last && last.para === line.para) last.items.push({ line, idx });
      else groups.push({ para: line.para, items: [{ line, idx }] });
    });
    return groups;
  }, [lines]);

  const handleSelect = () => {
    if (!onQuote) return;
    const sel = window.getSelection?.();
    const text = sel?.toString().trim();
    if (text && text.length > 1) onQuote(text);
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleSelect}
      onTouchEnd={handleSelect}
      className="space-y-4 leading-relaxed"
      style={{ fontSize: `${fontScale}rem` }}
    >
      {paragraphs.map((group, gi) => (
        <p key={gi} className="text-foreground/90">
          {group.items.map(({ line, idx }) => {
            const segments = annotate(line.text, marks);
            return (
              <span
                key={idx}
                className={cn(
                  "rounded transition-colors",
                  activeIndex === idx && "bg-primary/10",
                )}
              >
                {segments.map((seg, si) =>
                  seg.mark ? (
                    <HighlightMark
                      key={si}
                      segment={seg}
                      onSaveWord={onSaveWord}
                      onFavoriteWord={onFavoriteWord}
                      onLearnWord={onLearnWord}
                    />
                  ) : (
                    <span key={si}>{seg.text}</span>
                  ),
                )}{" "}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

function HighlightMark({
  segment,
  onSaveWord,
  onFavoriteWord,
  onLearnWord,
}: {
  segment: Segment;
  onSaveWord?: (word: VocabHighlight) => void;
  onFavoriteWord?: (word: VocabHighlight) => void;
  onLearnWord?: (word: VocabHighlight) => void;
}) {
  const mark = segment.mark!;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded px-0.5 font-bold underline decoration-2 underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            mark.type === "vocab"
              ? "text-primary decoration-primary/40 hover:bg-primary/10"
              : "text-coral decoration-coral/40 hover:bg-coral/10",
          )}
        >
          {segment.text}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95"
      >
        {mark.type === "vocab" ? (
          <VocabCard
            v={mark.data}
            onSave={onSaveWord}
            onFavorite={onFavoriteWord}
            onLearn={onLearnWord}
          />
        ) : (
          <GrammarCard g={mark.data} />
        )}
      </PopoverContent>
    </Popover>
  );
}

function VocabCard({
  v,
  onSave,
  onFavorite,
  onLearn,
}: {
  v: VocabHighlight;
  onSave?: (w: VocabHighlight) => void;
  onFavorite?: (w: VocabHighlight) => void;
  onLearn?: (w: VocabHighlight) => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-display text-lg font-extrabold">{v.word}</h4>
          <p className="text-xs text-muted-foreground">
            {v.phonetic} {v.pos && <span className="italic">· {v.pos}</span>}
          </p>
        </div>
        <AudioButton text={v.word} size="sm" />
      </div>
      <p className="mt-2 text-sm">
        <span className="font-bold text-primary">{v.meaning}</span>
        {v.definition && (
          <span className="block text-muted-foreground">{v.definition}</span>
        )}
      </p>
      <div className="mt-2 rounded-lg bg-muted/60 p-2 text-sm">
        <p>“{v.example}”</p>
        <p className="mt-0.5 text-xs italic text-muted-foreground">
          {v.exampleTranslation}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Button variant="outline" size="sm" className="flex-col gap-0.5 h-auto py-1.5 text-[11px]" onClick={() => onSave?.(v)}>
          <BookmarkPlus className="h-4 w-4" /> Save
        </Button>
        <Button variant="outline" size="sm" className="flex-col gap-0.5 h-auto py-1.5 text-[11px]" onClick={() => onFavorite?.(v)}>
          <Heart className="h-4 w-4" /> Favorite
        </Button>
        <Button variant="outline" size="sm" className="flex-col gap-0.5 h-auto py-1.5 text-[11px]" onClick={() => onLearn?.(v)}>
          <Check className="h-4 w-4" /> Learned
        </Button>
      </div>
    </div>
  );
}

function GrammarCard({ g }: { g: GrammarHighlight }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Highlighter className="h-4 w-4 text-coral" />
        <h4 className="font-display text-base font-extrabold">{g.name}</h4>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{g.rule}</p>
      <div className="mt-2 rounded-lg border border-coral/30 bg-coral/5 px-3 py-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-coral">
          Formula
        </p>
        <p className="mt-0.5 font-mono text-sm">{g.formula}</p>
      </div>
      <p className="mt-2 text-sm">{g.explanation}</p>
      <p className="mt-2 rounded-lg bg-muted/60 px-2 py-1.5 text-sm italic">
        “{g.example}”
      </p>
      {g.related && g.related.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-muted-foreground">Related lessons</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {g.related.map((slug) => (
              <Link
                key={slug}
                to="/grammar/$lessonId"
                params={{ lessonId: slug }}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground hover:bg-primary/10 hover:text-primary"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
