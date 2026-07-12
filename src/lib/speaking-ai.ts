import type { SpeakingCourse } from "@/lib/speaking-content";

/**
 * Speaking Lab — AI architecture (scaffold only).
 *
 * Defines the contract for future AI speaking features so the UI can be wired
 * against a stable API today. No AI is implemented yet: the default provider is
 * `notImplementedProvider`, surfacing a friendly "coming soon" message. A future
 * implementation (e.g. a `createServerFn` calling the Lovable AI Gateway) only
 * needs to satisfy `SpeakingAIProvider`.
 */

export interface SpeakingAITurn {
  role: "user" | "coach";
  text: string;
}

export interface SpeakingAIRequest {
  course?: SpeakingCourse;
  /** What the learner said (recognised transcript). */
  utterance?: string;
  /** Conversation so far, for multi-turn roleplay. */
  history?: SpeakingAITurn[];
}

export interface PronunciationFeedback {
  summary: string;
  tips: string[];
}

export interface SpeakingAIProvider {
  /** Free conversation with an AI partner. */
  talk(req: SpeakingAIRequest): Promise<string>;
  /** Detailed pronunciation correction for an utterance. */
  correctPronunciation(req: SpeakingAIRequest): Promise<PronunciationFeedback>;
  /** Explain the grammar of what the learner said. */
  explainGrammar(req: SpeakingAIRequest): Promise<string>;
  /** Suggest the next conversation line to keep talking. */
  giveConversation(req: SpeakingAIRequest): Promise<string>;
  /** Roleplay a scenario (waiter, interviewer, etc.). */
  roleplay(req: SpeakingAIRequest): Promise<string>;
  /** Simulated interview question + follow-ups. */
  interviewPractice(req: SpeakingAIRequest): Promise<string>;
  /** Personalised speaking-coach guidance. */
  coach(req: SpeakingAIRequest): Promise<string>;
}

export class SpeakingAINotAvailableError extends Error {
  constructor() {
    super("AI speaking features are coming soon. This is architecture-only for now.");
    this.name = "SpeakingAINotAvailableError";
  }
}

/** Placeholder provider — every method rejects with a friendly message. */
export const notImplementedProvider: SpeakingAIProvider = {
  talk: () => Promise.reject(new SpeakingAINotAvailableError()),
  correctPronunciation: () => Promise.reject(new SpeakingAINotAvailableError()),
  explainGrammar: () => Promise.reject(new SpeakingAINotAvailableError()),
  giveConversation: () => Promise.reject(new SpeakingAINotAvailableError()),
  roleplay: () => Promise.reject(new SpeakingAINotAvailableError()),
  interviewPractice: () => Promise.reject(new SpeakingAINotAvailableError()),
  coach: () => Promise.reject(new SpeakingAINotAvailableError()),
};

/** The active provider. Swap this out when AI is implemented. */
export const speakingAI: SpeakingAIProvider = notImplementedProvider;

/** Whether AI features should be shown as available. */
export const SPEAKING_AI_ENABLED = false;

/** The AI actions surfaced in the UI (labels + planned availability). */
export const SPEAKING_AI_ACTIONS = [
  { key: "talk", label: "Talk with an AI partner" },
  { key: "correct", label: "Correct my pronunciation" },
  { key: "grammar", label: "Explain my grammar" },
  { key: "roleplay", label: "Roleplay a scenario" },
  { key: "interview", label: "Interview practice" },
  { key: "coach", label: "Personal speaking coach" },
] as const;
