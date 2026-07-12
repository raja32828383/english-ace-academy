/**
 * Speaking Lab — pronunciation & accuracy scoring (pure functions).
 *
 * Browser speech recognition returns text + a confidence value, not phoneme
 * data, so scoring is derived from a word-level alignment between the expected
 * sentence and what was recognized, blended with the recogniser's confidence.
 * This is deterministic and fast, and the module is intentionally framework-free
 * so it can be unit-tested and later swapped for an AI provider.
 */

export type WordStatus = "correct" | "incorrect" | "missing" | "extra";

export interface WordResult {
  /** The word as shown to the learner (expected), or the extra recognized word. */
  word: string;
  status: WordStatus;
  /** For 'incorrect' words: what the learner actually said. */
  heard?: string;
}

export interface PronunciationScore {
  /** % of expected words matched exactly (word accuracy). */
  wordAccuracy: number;
  /** Sentence accuracy: matches minus penalty for extra words. */
  sentenceAccuracy: number;
  /** How smooth/steady the delivery was (confidence + length ratio). */
  fluency: number;
  /** % of the expected sentence attempted. */
  completeness: number;
  /** Speaking confidence (from the recogniser + coverage). */
  confidence: number;
  /** Pronunciation estimate (accuracy blended with confidence). */
  pronunciation: number;
  /** Weighted overall score. */
  overall: number;
  wordResults: WordResult[];
  correctWords: string[];
  incorrectWords: string[];
  missingWords: string[];
  extraWords: string[];
}

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalizeText(text);
  return n ? n.split(" ") : [];
}

/** Levenshtein distance between two short strings (word similarity). */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diag = tmp;
    }
  }
  return prev[n];
}

/** 0..1 similarity between two words. */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const dist = editDistance(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return 1 - dist / maxLen;
}

type Op = "match" | "sub" | "del" | "ins";

/**
 * Needleman–Wunsch alignment over word arrays. Returns an ordered list of
 * operations mapping expected -> recognized, so we can classify every word.
 */
function alignWords(expected: string[], recognized: string[]) {
  const m = expected.length;
  const n = recognized.length;
  const cost: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) cost[i][0] = i;
  for (let j = 1; j <= n; j++) cost[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sim = wordSimilarity(expected[i - 1], recognized[j - 1]);
      const subCost = sim >= 0.8 ? 0 : 1;
      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + subCost,
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
      );
    }
  }

  const ops: { op: Op; exp?: string; rec?: string }[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = wordSimilarity(expected[i - 1], recognized[j - 1]);
      const subCost = sim >= 0.8 ? 0 : 1;
      if (cost[i][j] === cost[i - 1][j - 1] + subCost) {
        ops.push({
          op: sim >= 0.8 ? "match" : "sub",
          exp: expected[i - 1],
          rec: recognized[j - 1],
        });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      ops.push({ op: "del", exp: expected[i - 1] });
      i--;
      continue;
    }
    ops.push({ op: "ins", rec: recognized[j - 1] });
    j--;
  }
  ops.reverse();
  return ops;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Score a spoken attempt against the expected sentence.
 * @param expected  The target sentence.
 * @param recognized  The recogniser transcript (may be empty).
 * @param confidence  Recogniser confidence 0..1 (optional).
 */
export function scoreSpeech(
  expected: string,
  recognized: string,
  confidence = 0,
): PronunciationScore {
  const exp = tokenize(expected);
  const rec = tokenize(recognized);
  const ops = alignWords(exp, rec);

  const wordResults: WordResult[] = [];
  let correct = 0;
  const incorrect: string[] = [];
  const missing: string[] = [];
  const extra: string[] = [];
  const correctWords: string[] = [];

  for (const o of ops) {
    if (o.op === "match") {
      correct++;
      correctWords.push(o.exp!);
      wordResults.push({ word: o.exp!, status: "correct" });
    } else if (o.op === "sub") {
      incorrect.push(o.exp!);
      wordResults.push({ word: o.exp!, status: "incorrect", heard: o.rec });
    } else if (o.op === "del") {
      missing.push(o.exp!);
      wordResults.push({ word: o.exp!, status: "missing" });
    } else {
      extra.push(o.rec!);
      wordResults.push({ word: o.rec!, status: "extra" });
    }
  }

  const total = exp.length || 1;
  const attempted = correct + incorrect.length; // expected words the learner reached
  const wordAccuracy = clampPct((correct / total) * 100);
  const completeness = clampPct(((attempted + missing.length > 0 ? attempted : 0) / total) * 100);
  const coverage = clampPct(((total - missing.length) / total) * 100);
  // Penalise extra words for sentence accuracy.
  const extraPenalty = Math.min(extra.length, total) / total;
  const sentenceAccuracy = clampPct(wordAccuracy - extraPenalty * 20);

  const recConfidencePct = confidence > 0 ? clampPct(confidence * 100) : coverage;
  const lengthRatio = rec.length ? Math.min(rec.length, total) / total : 0;
  const fluency = clampPct(recConfidencePct * 0.5 + lengthRatio * 100 * 0.5);
  const confidenceScore = clampPct(recConfidencePct * 0.6 + coverage * 0.4);
  const pronunciation = clampPct(wordAccuracy * 0.7 + recConfidencePct * 0.3);
  const overall = clampPct(
    pronunciation * 0.35 +
      sentenceAccuracy * 0.3 +
      fluency * 0.2 +
      completeness * 0.15,
  );

  return {
    wordAccuracy,
    sentenceAccuracy,
    fluency,
    completeness: coverage,
    confidence: confidenceScore,
    pronunciation,
    overall,
    wordResults,
    correctWords,
    incorrectWords: incorrect,
    missingWords: missing,
    extraWords: extra,
  };
}

/** A short, encouraging message tuned to the overall score. */
export function encouragementFor(overall: number): string {
  if (overall >= 90) return "Outstanding! You sound like a natural. 🌟";
  if (overall >= 75) return "Great job! Your pronunciation is really clear. 👏";
  if (overall >= 60) return "Good work! A little more practice and you've got it. 💪";
  if (overall >= 40) return "Nice try! Slow down and focus on each word. 🙂";
  return "Keep going! Listen again and repeat slowly. You can do it. 🚀";
}

/** Aggregate the six sub-scores from many sentence attempts. */
export function averageScores(scores: PronunciationScore[]) {
  if (scores.length === 0) {
    return {
      overall: 0,
      pronunciation: 0,
      accuracy: 0,
      fluency: 0,
      completeness: 0,
      confidence: 0,
    };
  }
  const sum = (pick: (s: PronunciationScore) => number) =>
    Math.round(scores.reduce((a, s) => a + pick(s), 0) / scores.length);
  return {
    overall: sum((s) => s.overall),
    pronunciation: sum((s) => s.pronunciation),
    accuracy: sum((s) => s.sentenceAccuracy),
    fluency: sum((s) => s.fluency),
    completeness: sum((s) => s.completeness),
    confidence: sum((s) => s.confidence),
  };
}
