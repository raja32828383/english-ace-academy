import type { ReadingLesson } from "@/lib/reading-content";

/**
 * Reading & Listening Lab — AI architecture (scaffold only).
 *
 * These interfaces define the contract for future AI features so the UI can be
 * wired against a stable API today. No AI is implemented yet: the default
 * provider is `notImplementedProvider`, which surfaces a friendly "coming soon"
 * message. A future implementation (e.g. a `createServerFn` calling the Lovable
 * AI Gateway) simply needs to satisfy `ReadingAIProvider`.
 */

export interface ReadingAIRequest {
  lesson: ReadingLesson;
  /** Optional paragraph/selection the learner asked about. */
  selection?: string;
  /** Free-form question for the "Ask AI about passage" feature. */
  question?: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface ReadingAIProvider {
  /** Short, learner-friendly summary of the passage. */
  summarize(req: ReadingAIRequest): Promise<string>;
  /** Explain a difficult paragraph in simpler English. */
  explainParagraph(req: ReadingAIRequest): Promise<string>;
  /** Translate a paragraph to Indonesian. */
  translateParagraph(req: ReadingAIRequest): Promise<string>;
  /** Answer a learner's question grounded in the passage. */
  askAboutPassage(req: ReadingAIRequest): Promise<string>;
  /** Generate extra practice questions from the passage. */
  generateQuestions(req: ReadingAIRequest): Promise<GeneratedQuestion[]>;
  /** Recommend the next lesson slug for this learner. */
  recommendNext(completedSlugs: string[]): Promise<string | null>;
}

export class ReadingAINotAvailableError extends Error {
  constructor() {
    super(
      "AI tutor features are coming soon. This is architecture-only for now.",
    );
    this.name = "ReadingAINotAvailableError";
  }
}

/** Placeholder provider — every method rejects with a friendly message. */
export const notImplementedProvider: ReadingAIProvider = {
  summarize: () => Promise.reject(new ReadingAINotAvailableError()),
  explainParagraph: () => Promise.reject(new ReadingAINotAvailableError()),
  translateParagraph: () => Promise.reject(new ReadingAINotAvailableError()),
  askAboutPassage: () => Promise.reject(new ReadingAINotAvailableError()),
  generateQuestions: () => Promise.reject(new ReadingAINotAvailableError()),
  recommendNext: () => Promise.resolve(null),
};

/** The active provider. Swap this out when AI is implemented. */
export const readingAI: ReadingAIProvider = notImplementedProvider;

/** Whether AI features should be shown as available. */
export const READING_AI_ENABLED = false;

/** The AI actions surfaced in the UI (labels + planned availability). */
export const READING_AI_ACTIONS = [
  { key: "summarize", label: "Summarize passage" },
  { key: "explain", label: "Explain difficult paragraph" },
  { key: "translate", label: "Translate paragraph" },
  { key: "ask", label: "Ask AI about passage" },
  { key: "generate", label: "Generate practice questions" },
  { key: "recommend", label: "Recommend next lesson" },
] as const;
