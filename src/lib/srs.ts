// SM-2 spaced repetition algorithm.
// Quality grades: 0-5. We expose 3 buttons -> Again (2), Good (4), Easy (5).

export interface ReviewState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

export interface ReviewResult extends ReviewState {
  due_date: string; // YYYY-MM-DD
}

export function computeNextReview(state: ReviewState, quality: number): ReviewResult {
  let { ease_factor, interval_days, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  const due = new Date();
  due.setDate(due.getDate() + interval_days);

  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    due_date: due.toISOString().slice(0, 10),
  };
}

export const REVIEW_GRADES = [
  { label: "Again", quality: 2, variant: "destructive" as const },
  { label: "Good", quality: 4, variant: "default" as const },
  { label: "Easy", quality: 5, variant: "secondary" as const },
];
