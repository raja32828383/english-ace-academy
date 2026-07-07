import {
  BookOpen,
  Headphones,
  Mic,
  PencilRuler,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Category, Level } from "@/lib/data";

export const categoryMeta: Record<Category, { label: string; icon: LucideIcon; tint: string }> = {
  vocabulary: { label: "Vocabulary", icon: BookOpen, tint: "bg-primary/10 text-primary" },
  grammar: { label: "Grammar", icon: PencilRuler, tint: "bg-chart-4/15 text-chart-4" },
  listening: { label: "Listening", icon: Headphones, tint: "bg-coral/10 text-coral" },
  speaking: { label: "Speaking", icon: Mic, tint: "bg-chart-5/15 text-chart-5" },
  reading: { label: "Reading", icon: ScrollText, tint: "bg-gold/15 text-gold-foreground" },
  quiz: { label: "Quiz", icon: Sparkles, tint: "bg-secondary text-secondary-foreground" },
};

export const levelMeta: Record<Level, { label: string; tint: string }> = {
  beginner: { label: "Beginner", tint: "bg-primary/10 text-primary" },
  intermediate: { label: "Intermediate", tint: "bg-coral/10 text-coral" },
  advanced: { label: "Advanced", tint: "bg-gold/15 text-gold-foreground" },
};
