import { supabase } from "@/integrations/supabase/client";

/**
 * ============================================================================
 * Grammar Checker — reusable architecture (AI-ready)
 * ============================================================================
 * This module defines a pluggable `GrammarAnalyzer` interface. Today it ships a
 * fast, deterministic rule-based analyzer that catches common mistakes made by
 * Indonesian learners. A future AI analyzer (Lovable AI Gateway) can implement
 * the same interface and be dropped in without changing any UI code:
 *
 *   const analyzer: GrammarAnalyzer = USE_AI ? aiAnalyzer : ruleBasedAnalyzer;
 *
 * Results can be persisted to `grammar_ai_checks` for history and future model
 * fine-tuning via `saveGrammarCheck`.
 */

export interface GrammarCorrection {
  /** The problematic fragment. */
  original: string;
  /** The suggested replacement. */
  suggestion: string;
  /** Beginner-friendly explanation of the fix. */
  explanation: string;
  /** The grammar rule / category this belongs to. */
  rule: string;
  severity: "error" | "warning" | "style";
}

export interface GrammarCheckResult {
  input: string;
  corrections: GrammarCorrection[];
  /** A short, encouraging overall assessment. */
  overallFeedback: string;
  /** 0-100 rough quality score. */
  score: number;
  /** Which engine produced the result. */
  engine: "rule-based" | "ai";
}

export interface GrammarAnalyzer {
  readonly engine: GrammarCheckResult["engine"];
  analyze(text: string): Promise<GrammarCheckResult>;
}

// ---------------------------------------------------------------------------
// Rule-based analyzer (functional baseline, no external calls)
// ---------------------------------------------------------------------------

const VOWEL_SOUND = /^(a|e|i|o|u|hour|honest|honor)/i;
const A_AN = /\b(a|an)\s+([a-z]+)/gi;
const CONTRACTIONS: Record<string, string> = {
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  cant: "can't",
  wont: "won't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  im: "I'm",
  ive: "I've",
  youre: "you're",
  theyre: "they're",
  its: "it's",
};

function ruleBasedAnalyze(text: string): GrammarCheckResult {
  const corrections: GrammarCorrection[] = [];
  const trimmed = text.trim();

  // 1. Sentence should start with a capital letter.
  if (trimmed && /^[a-z]/.test(trimmed)) {
    const first = trimmed[0];
    corrections.push({
      original: first,
      suggestion: first.toUpperCase(),
      explanation: "A sentence must begin with a capital letter.",
      rule: "Capitalization",
      severity: "error",
    });
  }

  // 2. The pronoun "i" must be uppercase.
  const lowerI = trimmed.match(/(^|[^a-zA-Z])i([^a-zA-Z]|$)/);
  if (lowerI) {
    corrections.push({
      original: "i",
      suggestion: "I",
      explanation: 'The pronoun "I" is always capitalized in English.',
      rule: "Pronoun",
      severity: "error",
    });
  }

  // 3. a / an agreement by sound.
  let m: RegExpExecArray | null;
  A_AN.lastIndex = 0;
  while ((m = A_AN.exec(trimmed)) !== null) {
    const article = m[1].toLowerCase();
    const word = m[2];
    const needsAn = VOWEL_SOUND.test(word);
    if (needsAn && article === "a") {
      corrections.push({
        original: `a ${word}`,
        suggestion: `an ${word}`,
        explanation: `Use "an" before a vowel sound: an ${word}.`,
        rule: "Articles",
        severity: "error",
      });
    } else if (!needsAn && article === "an") {
      corrections.push({
        original: `an ${word}`,
        suggestion: `a ${word}`,
        explanation: `Use "a" before a consonant sound: a ${word}.`,
        rule: "Articles",
        severity: "error",
      });
    }
  }

  // 4. Missing apostrophes in common contractions.
  for (const word of trimmed.split(/\s+/)) {
    const clean = word.replace(/[.,!?;:]/g, "").toLowerCase();
    if (CONTRACTIONS[clean] && clean !== "its") {
      corrections.push({
        original: clean,
        suggestion: CONTRACTIONS[clean],
        explanation: `"${clean}" needs an apostrophe: ${CONTRACTIONS[clean]}.`,
        rule: "Contractions",
        severity: "warning",
      });
    }
  }

  // 5. Doubled words ("the the").
  const dup = trimmed.match(/\b(\w+)\s+\1\b/i);
  if (dup) {
    corrections.push({
      original: dup[0],
      suggestion: dup[1],
      explanation: `The word "${dup[1]}" is repeated.`,
      rule: "Repetition",
      severity: "warning",
    });
  }

  // 6. Double spaces / trailing spaces.
  if (/ {2,}/.test(text)) {
    corrections.push({
      original: "  ",
      suggestion: " ",
      explanation: "Use a single space between words.",
      rule: "Spacing",
      severity: "style",
    });
  }

  // 7. Missing end punctuation.
  if (trimmed && !/[.!?]$/.test(trimmed)) {
    corrections.push({
      original: trimmed.slice(-12),
      suggestion: `${trimmed.slice(-12)}.`,
      explanation: "End your sentence with a period, question mark, or exclamation mark.",
      rule: "Punctuation",
      severity: "style",
    });
  }

  const errorCount = corrections.filter((c) => c.severity === "error").length;
  const warnCount = corrections.filter((c) => c.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 20 - warnCount * 10 - (corrections.length - errorCount - warnCount) * 4);

  const overallFeedback =
    corrections.length === 0
      ? "Great job! No common mistakes found. Keep practicing to build fluency."
      : errorCount > 0
        ? `Found ${corrections.length} thing${corrections.length === 1 ? "" : "s"} to improve, including ${errorCount} clear error${errorCount === 1 ? "" : "s"}. Review the suggestions below.`
        : `Almost perfect — just ${corrections.length} small suggestion${corrections.length === 1 ? "" : "s"} to polish your sentence.`;

  return { input: text, corrections, overallFeedback, score, engine: "rule-based" };
}

export const ruleBasedAnalyzer: GrammarAnalyzer = {
  engine: "rule-based",
  analyze: (text) => Promise.resolve(ruleBasedAnalyze(text)),
};

/**
 * The active analyzer. Swap to an AI-backed analyzer here when the AI Grammar
 * Checker is enabled — the rest of the app depends only on the interface.
 */
export const activeAnalyzer: GrammarAnalyzer = ruleBasedAnalyzer;

export async function checkGrammar(text: string): Promise<GrammarCheckResult> {
  return activeAnalyzer.analyze(text);
}

/** Persist a check to grammar_ai_checks (history + future training data). */
export async function saveGrammarCheck(userId: string, result: GrammarCheckResult) {
  const { error } = await supabase.from("grammar_ai_checks").insert({
    user_id: userId,
    input_text: result.input,
    status: "completed",
    corrections: result.corrections as unknown as never,
    overall_feedback: result.overallFeedback,
  });
  if (error) throw error;
}
