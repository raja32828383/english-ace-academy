import type { ReadingLesson } from "@/lib/reading-content";

/**
 * Reading & Listening Lab — offline/download architecture (scaffold only).
 *
 * Defines a stable shape for future offline support (reading text, audio, and
 * transcript). Nothing is downloaded yet; the UI can present "Download for
 * offline" affordances and check availability against this module. A future
 * implementation can back `OfflineStore` with the Cache Storage API or
 * IndexedDB without changing callers.
 */

export interface OfflineLessonPackage {
  slug: string;
  title: string;
  /** Passage text (joined transcript) for offline reading. */
  text: string;
  /** Transcript sentences + translations for offline transcript. */
  transcript: { text: string; translation: string }[];
  /** Pre-recorded/generated audio URL to cache (future). */
  audioUrl?: string;
  savedAt: string;
}

export interface OfflineStore {
  isAvailable(): boolean;
  isSaved(slug: string): Promise<boolean>;
  save(pkg: OfflineLessonPackage): Promise<void>;
  remove(slug: string): Promise<void>;
  list(): Promise<string[]>;
}

/** Build the offline package payload for a lesson. */
export function buildOfflinePackage(lesson: ReadingLesson): OfflineLessonPackage {
  return {
    slug: lesson.slug,
    title: lesson.title,
    text: lesson.content.transcript.map((l) => l.text).join(" "),
    transcript: lesson.content.transcript.map((l) => ({
      text: l.text,
      translation: l.translation,
    })),
    audioUrl: lesson.audioUrl,
    savedAt: new Date().toISOString(),
  };
}

/** Default store — reports unavailable until offline support ships. */
export const offlineStore: OfflineStore = {
  isAvailable: () => false,
  isSaved: () => Promise.resolve(false),
  save: () => Promise.reject(new Error("Offline downloads are coming soon.")),
  remove: () => Promise.resolve(),
  list: () => Promise.resolve([]),
};

export const OFFLINE_ENABLED = false;
