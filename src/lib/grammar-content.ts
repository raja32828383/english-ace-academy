import {
  Boxes,
  Clock3,
  Repeat,
  Scale,
  type LucideIcon,
} from "lucide-react";

/**
 * Grammar Learning System — authored curriculum (content-as-code).
 *
 * This module is the canonical, version-controlled source of grammar content.
 * Its shape maps 1:1 onto the `grammar_lessons` / `grammar_units` tables so a
 * future admin CMS can edit lessons in the database without any UI rewrite:
 *   GrammarLesson  -> grammar_lessons row (content -> content jsonb)
 *   GrammarUnit    -> grammar_units row
 * User state (progress, bookmarks, quiz attempts, AI checks) already lives in
 * the database. See src/lib/grammar.ts for queries and src/lib/grammar-actions.ts.
 */

export type GrammarLevel = "beginner" | "intermediate" | "advanced";

export type ExampleContext =
  | "simple"
  | "conversation"
  | "school"
  | "business"
  | "travel";

export interface GrammarExample {
  context: ExampleContext;
  english: string;
  indonesian: string;
  /** Plain-language grammar breakdown of the sentence. */
  breakdown: string;
  /** Highlighted grammar pattern, e.g. "Subject + is/am/are + Verb-ing". */
  pattern?: string;
}

export interface GrammarMistake {
  wrong: string;
  correct: string;
  /** What is wrong (English). */
  explanation: string;
  /** Why it happens / rule reminder (beginner friendly, some Indonesian). */
  reason: string;
}

export interface ExplanationCard {
  kind: "note" | "warning" | "tip";
  title: string;
  english: string;
  indonesian: string;
}

export interface GrammarFormula {
  label: string;
  /** Ordered tokens rendered as highlighted chips. */
  parts: string[];
  note?: string;
}

export type PracticeExercise =
  | {
      type: "multiple-choice";
      prompt: string;
      options: string[];
      answer: number;
      explanation: string;
    }
  | {
      type: "fill-blank";
      /** Use "___" to mark the blank. */
      prompt: string;
      answer: string;
      accept?: string[];
      hint?: string;
      explanation: string;
    }
  | {
      type: "arrange";
      prompt: string;
      words: string[];
      /** Correct ordering of `words`. */
      answer: string[];
      explanation: string;
    }
  | {
      type: "correction";
      prompt: string;
      answer: string;
      accept?: string[];
      explanation: string;
    }
  | {
      type: "translate";
      /** Indonesian sentence to translate to English. */
      prompt: string;
      answer: string;
      accept?: string[];
      explanation: string;
    };

export interface QuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface GrammarLessonContent {
  objectives: string[];
  formulas: GrammarFormula[];
  explanationEnglish: string;
  explanationIndonesian: string;
  explanationCards: ExplanationCard[];
  examples: GrammarExample[];
  mistakes: GrammarMistake[];
  tips: string[];
  summary: string[];
  practice: PracticeExercise[];
  quiz: QuizItem[];
}

export interface GrammarLesson {
  slug: string;
  unitSlug: string;
  title: string;
  summary: string;
  level: GrammarLevel;
  estimatedMinutes: number;
  xpReward: number;
  content: GrammarLessonContent;
}

export interface GrammarUnit {
  slug: string;
  title: string;
  description: string;
  level: GrammarLevel;
  icon: LucideIcon;
}

export const GRAMMAR_LEVELS: GrammarLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const LEVEL_META: Record<
  GrammarLevel,
  { label: string; tint: string; badge: string }
> = {
  beginner: {
    label: "Beginner",
    tint: "bg-success/15 text-success",
    badge: "bg-success/15 text-success border-success/20",
  },
  intermediate: {
    label: "Intermediate",
    tint: "bg-coral/10 text-coral",
    badge: "bg-coral/10 text-coral border-coral/20",
  },
  advanced: {
    label: "Advanced",
    tint: "bg-destructive/10 text-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const CONTEXT_META: Record<ExampleContext, { label: string; emoji: string }> = {
  simple: { label: "Simple", emoji: "✏️" },
  conversation: { label: "Daily Conversation", emoji: "💬" },
  school: { label: "School", emoji: "🎓" },
  business: { label: "Business", emoji: "💼" },
  travel: { label: "Travel", emoji: "✈️" },
};

export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    slug: "verb-tenses-basics",
    title: "Verb Tenses: The Basics",
    description:
      "Start with the building blocks — to be and the essential present and past tenses.",
    level: "beginner",
    icon: Clock3,
  },
  {
    slug: "nouns-and-articles",
    title: "Nouns & Articles",
    description: "Learn how to name things correctly with a, an, the, and plurals.",
    level: "beginner",
    icon: Boxes,
  },
  {
    slug: "comparison",
    title: "Comparing Things",
    description: "Describe differences with comparatives and superlatives.",
    level: "intermediate",
    icon: Scale,
  },
  {
    slug: "voice",
    title: "Voice & Structure",
    description: "Reshape sentences with the passive voice for advanced writing.",
    level: "advanced",
    icon: Repeat,
  },
];

// =====================================================================
// LESSONS
// =====================================================================

const toBe: GrammarLesson = {
  slug: "to-be",
  unitSlug: "verb-tenses-basics",
  title: "To Be: Am, Is, Are",
  summary: "The most important verb in English — how to say what something is.",
  level: "beginner",
  estimatedMinutes: 8,
  xpReward: 20,
  content: {
    objectives: [
      "Choose the correct form of to be: am, is, or are",
      "Build positive, negative, and question sentences",
      "Describe people, feelings, jobs, and locations",
    ],
    formulas: [
      { label: "Positive", parts: ["Subject", "am / is / are", "complement"], note: "I am · He/She/It is · You/We/They are" },
      { label: "Negative", parts: ["Subject", "am / is / are", "not", "complement"] },
      { label: "Question", parts: ["Am / Is / Are", "subject", "complement", "?"] },
    ],
    explanationEnglish:
      "The verb to be links a subject to a description, a job, a place, or a feeling. It has three present forms: am (with I), is (with he, she, it, and singular nouns), and are (with you, we, they, and plural nouns). It is not an action — it tells us what or how someone or something is.",
    explanationIndonesian:
      "Kata kerja to be (am/is/are) berarti 'adalah' atau 'sedang'. Gunakan am untuk I, is untuk he/she/it (tunggal), dan are untuk you/we/they (jamak). Dalam bahasa Indonesia sering tidak diterjemahkan, contohnya 'I am a student' = 'Saya (adalah) seorang pelajar'.",
    explanationCards: [
      {
        kind: "note",
        title: "Contractions are normal",
        english: "In speaking we shorten to be: I'm, you're, he's, she's, it's, we're, they're.",
        indonesian: "Saat berbicara, to be sering disingkat: I am → I'm, she is → she's.",
      },
      {
        kind: "tip",
        title: "One verb is enough",
        english: "Don't add another verb after to be for a simple description: 'She is happy' — not 'She is be happy'.",
        indonesian: "To be sudah menjadi kata kerjanya. Jangan tambah kata kerja lain untuk deskripsi sederhana.",
      },
    ],
    examples: [
      { context: "simple", english: "I am a student.", indonesian: "Saya seorang pelajar.", breakdown: "I → am (first person). 'a student' describes who I am.", pattern: "Subject + am + noun" },
      { context: "conversation", english: "She is very tired today.", indonesian: "Dia sangat lelah hari ini.", breakdown: "She → is. 'tired' is an adjective describing her feeling.", pattern: "Subject + is + adjective" },
      { context: "school", english: "We are in the same class.", indonesian: "Kami di kelas yang sama.", breakdown: "We → are. 'in the same class' shows location.", pattern: "Subject + are + place" },
      { context: "business", english: "Are you the new manager?", indonesian: "Apakah Anda manajer baru itu?", breakdown: "Question: Are moves to the front, then the subject 'you'.", pattern: "Are + subject + noun + ?" },
      { context: "travel", english: "The airport is not far from here.", indonesian: "Bandaranya tidak jauh dari sini.", breakdown: "The airport (singular) → is. 'not' makes it negative.", pattern: "Subject + is + not + ..." },
    ],
    mistakes: [
      { wrong: "I is a teacher.", correct: "I am a teacher.", explanation: "Use 'am' with I, never 'is'.", reason: "Setiap subjek punya bentuk to be sendiri: I selalu memakai am." },
      { wrong: "She are happy.", correct: "She is happy.", explanation: "'She' is singular, so use 'is'.", reason: "he/she/it (tunggal) memakai is, bukan are." },
      { wrong: "They is students.", correct: "They are students.", explanation: "'They' is plural, so use 'are'.", reason: "we/you/they (jamak) memakai are." },
    ],
    tips: [
      "Match the subject first, then pick am / is / are.",
      "For 'not', put it right after am / is / are.",
      "To ask a question, move am / is / are to the front.",
    ],
    summary: [
      "I → am, he/she/it → is, you/we/they → are.",
      "Add 'not' after to be for negatives.",
      "Move to be to the front to make questions.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "Choose the correct form: 'My brother ___ a doctor.'", options: ["am", "is", "are"], answer: 1, explanation: "'My brother' is singular (he), so use 'is'." },
      { type: "fill-blank", prompt: "We ___ ready for the trip.", answer: "are", explanation: "'We' takes 'are'." },
      { type: "correction", prompt: "Fix: 'I is very excited.'", answer: "I am very excited.", explanation: "Use 'am' with 'I'." },
      { type: "arrange", prompt: "Make a question:", words: ["Are", "you", "a", "teacher"], answer: ["Are", "you", "a", "teacher"], explanation: "Questions start with the to-be verb: Are you a teacher?" },
      { type: "translate", prompt: "Dia (perempuan) sedang sibuk.", answer: "She is busy.", accept: ["she's busy", "she is busy."], explanation: "She → is, 'busy' is the adjective." },
    ],
    quiz: [
      { question: "I ___ from Indonesia.", options: ["am", "is", "are"], answer: 0, explanation: "'I' always takes 'am'." },
      { question: "He ___ my best friend.", options: ["am", "is", "are"], answer: 1, explanation: "'He' is singular → 'is'." },
      { question: "You ___ very kind.", options: ["am", "is", "are"], answer: 2, explanation: "'You' takes 'are'." },
      { question: "The books ___ on the table.", options: ["is", "are", "am"], answer: 1, explanation: "'Books' is plural → 'are'." },
      { question: "Which sentence is correct?", options: ["She are a nurse.", "She is a nurse.", "She am a nurse."], answer: 1, explanation: "'She' → 'is'." },
      { question: "Make it negative: 'It is cold.'", options: ["It not is cold.", "It is not cold.", "It is cold not."], answer: 1, explanation: "'not' goes after the to-be verb." },
      { question: "Choose the question form:", options: ["You are tired?", "Are you tired?", "Tired you are?"], answer: 1, explanation: "Move 'are' to the front for questions." },
      { question: "We ___ not late.", options: ["am", "is", "are"], answer: 2, explanation: "'We' → 'are', then 'not'." },
      { question: "Complete: 'My parents ___ at home.'", options: ["is", "are", "am"], answer: 1, explanation: "'Parents' is plural → 'are'." },
      { question: "Which is the contraction of 'they are'?", options: ["they're", "their", "theyre's"], answer: 0, explanation: "they are → they're." },
    ],
  },
};

const presentSimple: GrammarLesson = {
  slug: "present-simple",
  unitSlug: "verb-tenses-basics",
  title: "Present Simple Tense",
  summary: "Talk about habits, routines, facts, and things that are always true.",
  level: "beginner",
  estimatedMinutes: 12,
  xpReward: 25,
  content: {
    objectives: [
      "Use the present simple for habits, routines, and facts",
      "Add -s / -es correctly for he, she, and it",
      "Form negatives and questions with do and does",
    ],
    formulas: [
      { label: "Positive", parts: ["Subject", "Verb-1", "(+ s/es for he/she/it)", "object"], note: "I/you/we/they work · he/she/it works" },
      { label: "Negative", parts: ["Subject", "do / does", "not", "Verb-1", "object"] },
      { label: "Question", parts: ["Do / Does", "subject", "Verb-1", "object", "?"] },
    ],
    explanationEnglish:
      "The present simple describes things that happen regularly (habits and routines), general truths, and facts. For he, she, and it we add -s or -es to the base verb. For negatives and questions we use the helper verbs do (I/you/we/they) and does (he/she/it), and the main verb goes back to its base form.",
    explanationIndonesian:
      "Present simple dipakai untuk kebiasaan, rutinitas, dan fakta umum. Untuk he/she/it, tambahkan -s/-es pada kata kerja (works, watches). Untuk kalimat negatif dan tanya, pakai do/does, dan kata kerja kembali ke bentuk dasar (does not work, bukan does not works).",
    explanationCards: [
      { kind: "note", title: "When to add -es", english: "Add -es to verbs ending in -o, -ss, -sh, -ch, -x: goes, watches, fixes.", indonesian: "Kata kerja berakhiran -o/-ss/-sh/-ch/-x memakai -es: go → goes, watch → watches." },
      { kind: "warning", title: "Only one -s", english: "After does, remove the -s: 'She does not work' — not 'does not works'.", indonesian: "Setelah does, kata kerja tanpa -s. Cukup satu penanda -s." },
      { kind: "tip", title: "Time signals", english: "Words like always, usually, often, every day, never signal the present simple.", indonesian: "Kata always, usually, every day sering menandai present simple." },
    ],
    examples: [
      { context: "simple", english: "I drink coffee every morning.", indonesian: "Saya minum kopi setiap pagi.", breakdown: "'I' + base verb 'drink'. 'every morning' shows a routine.", pattern: "Subject + Verb-1 + object" },
      { context: "conversation", english: "She watches movies on weekends.", indonesian: "Dia menonton film di akhir pekan.", breakdown: "'She' → add -es to 'watch' = watches.", pattern: "He/She/It + Verb-1+es" },
      { context: "school", english: "Our teacher explains grammar clearly.", indonesian: "Guru kami menjelaskan tata bahasa dengan jelas.", breakdown: "Singular subject 'teacher' → explains.", pattern: "Subject + Verb-1+s" },
      { context: "business", english: "Does the company deliver on Sundays?", indonesian: "Apakah perusahaan mengirim di hari Minggu?", breakdown: "Question with 'Does' + base verb 'deliver' (no -s).", pattern: "Does + subject + Verb-1 + ?" },
      { context: "travel", english: "The train does not stop at this station.", indonesian: "Keretanya tidak berhenti di stasiun ini.", breakdown: "Negative with 'does not' + base verb 'stop'.", pattern: "Subject + does not + Verb-1" },
    ],
    mistakes: [
      { wrong: "He go to school by bus.", correct: "He goes to school by bus.", explanation: "Add -es for 'he'.", reason: "Subjek tunggal he/she/it perlu -s/-es pada kata kerja." },
      { wrong: "She doesn't likes tea.", correct: "She doesn't like tea.", explanation: "After 'doesn't', use the base verb.", reason: "Penanda -s sudah ada di does, jadi kata kerja kembali dasar." },
      { wrong: "Do she work here?", correct: "Does she work here?", explanation: "Use 'does' for she.", reason: "he/she/it memakai does, bukan do." },
    ],
    tips: [
      "Ask: is the subject he, she, or it? If yes, add -s/-es.",
      "In negatives/questions the -s moves onto does — the main verb stays base.",
      "Look for signal words: every day, always, usually, never.",
    ],
    summary: [
      "Present simple = habits, routines, facts.",
      "Add -s/-es for he/she/it in positive sentences.",
      "Use do/does for negatives and questions with the base verb.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "'My sister ___ English every day.'", options: ["study", "studies", "studys"], answer: 1, explanation: "study → studies (consonant + y becomes -ies)." },
      { type: "fill-blank", prompt: "They ___ (not / eat) meat.", answer: "do not eat", accept: ["don't eat"], explanation: "Plural subject uses 'do not' + base verb." },
      { type: "correction", prompt: "Fix: 'He watch TV after dinner.'", answer: "He watches TV after dinner.", explanation: "Add -es: watch → watches." },
      { type: "arrange", prompt: "Make a question:", words: ["Does", "she", "like", "music"], answer: ["Does", "she", "like", "music"], explanation: "Does + subject + base verb: Does she like music?" },
      { type: "translate", prompt: "Kami bekerja setiap hari.", answer: "We work every day.", accept: ["we work everyday."], explanation: "Plural 'we' + base verb 'work'." },
    ],
    quiz: [
      { question: "'The sun ___ in the east.'", options: ["rise", "rises", "rising"], answer: 1, explanation: "A fact with singular 'sun' → rises." },
      { question: "'I ___ to work by train.'", options: ["go", "goes", "going"], answer: 0, explanation: "'I' uses the base verb 'go'." },
      { question: "Which is correct?", options: ["She don't like it.", "She doesn't like it.", "She doesn't likes it."], answer: 1, explanation: "she → doesn't + base verb." },
      { question: "'___ they live in Jakarta?'", options: ["Do", "Does", "Are"], answer: 0, explanation: "Plural 'they' → Do." },
      { question: "'He ___ his homework every night.'", options: ["do", "does", "doing"], answer: 1, explanation: "'He' → does (base verb 'do' + es)." },
      { question: "Add -es correctly:", options: ["fixs", "fixes", "fixies"], answer: 1, explanation: "Verbs ending in -x take -es." },
      { question: "'We ___ football on Fridays.'", options: ["plays", "play", "playing"], answer: 1, explanation: "'We' uses base verb 'play'." },
      { question: "Negative of 'It works.'", options: ["It don't work.", "It doesn't work.", "It doesn't works."], answer: 1, explanation: "it → doesn't + base verb." },
      { question: "Which time word fits the present simple?", options: ["now", "usually", "at the moment"], answer: 1, explanation: "'usually' signals a habit." },
      { question: "'My father ___ tea, not coffee.'", options: ["drink", "drinks", "drinking"], answer: 1, explanation: "Singular 'father' → drinks." },
    ],
  },
};

const presentContinuous: GrammarLesson = {
  slug: "present-continuous",
  unitSlug: "verb-tenses-basics",
  title: "Present Continuous Tense",
  summary: "Describe actions happening right now or around this time.",
  level: "beginner",
  estimatedMinutes: 10,
  xpReward: 25,
  content: {
    objectives: [
      "Form the present continuous with to be + verb-ing",
      "Spell -ing forms correctly",
      "Know when to use it instead of the present simple",
    ],
    formulas: [
      { label: "Positive", parts: ["Subject", "am / is / are", "Verb-ing", "object"] },
      { label: "Negative", parts: ["Subject", "am / is / are", "not", "Verb-ing"] },
      { label: "Question", parts: ["Am / Is / Are", "subject", "Verb-ing", "?"] },
    ],
    explanationEnglish:
      "The present continuous describes actions happening right now or around the present time. It is formed with the correct form of to be (am/is/are) plus the -ing form of the main verb. Use it for temporary actions and things in progress, unlike the present simple which is for habits.",
    explanationIndonesian:
      "Present continuous menggambarkan aksi yang sedang berlangsung sekarang. Rumusnya to be (am/is/are) + kata kerja-ing. Contoh: 'I am reading' = 'Saya sedang membaca'. Berbeda dengan present simple yang untuk kebiasaan.",
    explanationCards: [
      { kind: "note", title: "Spelling -ing", english: "run → running (double the last letter), write → writing (drop silent e).", indonesian: "run → running (huruf akhir digandakan), write → writing (huruf e dihilangkan)." },
      { kind: "warning", title: "Don't forget to be", english: "Never use -ing alone: 'She is cooking' — not 'She cooking'.", indonesian: "Selalu pakai am/is/are sebelum kata kerja-ing." },
      { kind: "tip", title: "Signal words", english: "now, right now, at the moment, currently signal the present continuous.", indonesian: "Kata now, right now, at the moment menandai present continuous." },
    ],
    examples: [
      { context: "simple", english: "I am reading a book.", indonesian: "Saya sedang membaca buku.", breakdown: "'I' + am + read + ing.", pattern: "Subject + am + Verb-ing" },
      { context: "conversation", english: "What are you doing right now?", indonesian: "Apa yang sedang kamu lakukan sekarang?", breakdown: "Question: Are + you + doing.", pattern: "Are + subject + Verb-ing + ?" },
      { context: "school", english: "The students are taking a test.", indonesian: "Para siswa sedang mengikuti ujian.", breakdown: "Plural 'students' → are + taking.", pattern: "Subject + are + Verb-ing" },
      { context: "business", english: "She is not answering her phone.", indonesian: "Dia tidak sedang mengangkat teleponnya.", breakdown: "Negative: is + not + answering.", pattern: "Subject + is + not + Verb-ing" },
      { context: "travel", english: "We are waiting for the next flight.", indonesian: "Kami sedang menunggu penerbangan berikutnya.", breakdown: "'We' → are + waiting.", pattern: "Subject + are + Verb-ing" },
    ],
    mistakes: [
      { wrong: "She cooking dinner.", correct: "She is cooking dinner.", explanation: "The verb 'to be' is missing.", reason: "Present continuous selalu butuh am/is/are." },
      { wrong: "They are play football.", correct: "They are playing football.", explanation: "Add -ing to the main verb.", reason: "Setelah to be, kata kerja harus berbentuk -ing." },
      { wrong: "He is runing.", correct: "He is running.", explanation: "Double the final consonant: run → running.", reason: "Kata kerja pendek CVC menggandakan huruf akhir sebelum -ing." },
    ],
    tips: [
      "Two parts every time: to be + verb-ing.",
      "Check -ing spelling for short verbs (running) and silent e (making).",
      "Use it for 'now', not for daily habits.",
    ],
    summary: [
      "Present continuous = happening now / temporary.",
      "Formula: am/is/are + verb-ing.",
      "Signal words: now, at the moment, currently.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "'Look! It ___ outside.'", options: ["rains", "is raining", "raining"], answer: 1, explanation: "'Look!' signals now → is raining." },
      { type: "fill-blank", prompt: "They ___ (watch) a movie now.", answer: "are watching", explanation: "Plural 'they' → are + watching." },
      { type: "correction", prompt: "Fix: 'I am study English.'", answer: "I am studying English.", explanation: "Add -ing: study → studying." },
      { type: "arrange", prompt: "Make a sentence:", words: ["She", "is", "writing", "a", "letter"], answer: ["She", "is", "writing", "a", "letter"], explanation: "Subject + is + verb-ing + object." },
      { type: "translate", prompt: "Kami sedang menunggu bus.", answer: "We are waiting for the bus.", accept: ["we're waiting for the bus."], explanation: "'We' + are + waiting." },
    ],
    quiz: [
      { question: "'He ___ TV at the moment.'", options: ["watch", "watches", "is watching"], answer: 2, explanation: "'at the moment' → present continuous." },
      { question: "Correct -ing form of 'make':", options: ["makeing", "making", "makking"], answer: 1, explanation: "Drop the silent e: make → making." },
      { question: "'We ___ dinner right now.'", options: ["are cooking", "cook", "cooks"], answer: 0, explanation: "'right now' → are cooking." },
      { question: "Which is correct?", options: ["She is sleep.", "She is sleeping.", "She sleeping."], answer: 1, explanation: "to be + verb-ing." },
      { question: "'___ they coming to the party?'", options: ["Is", "Are", "Do"], answer: 1, explanation: "Plural 'they' → Are." },
      { question: "-ing form of 'sit':", options: ["siting", "sitting", "siteing"], answer: 1, explanation: "Double the t: sit → sitting." },
      { question: "Negative: 'I am working.'", options: ["I not am working.", "I am not working.", "I am working not."], answer: 1, explanation: "'not' after to be." },
      { question: "'The baby ___ now.'", options: ["is crying", "cry", "cries"], answer: 0, explanation: "'now' → is crying." },
      { question: "Which signals present continuous?", options: ["every day", "right now", "usually"], answer: 1, explanation: "'right now' = happening now." },
      { question: "'You ___ too fast.'", options: ["are driving", "drive", "drives"], answer: 0, explanation: "Action in progress → are driving." },
    ],
  },
};

const pastSimple: GrammarLesson = {
  slug: "past-simple",
  unitSlug: "verb-tenses-basics",
  title: "Past Simple Tense",
  summary: "Talk about finished actions and events in the past.",
  level: "beginner",
  estimatedMinutes: 12,
  xpReward: 25,
  content: {
    objectives: [
      "Form regular past verbs with -ed",
      "Recognise common irregular past verbs",
      "Make negatives and questions with did",
    ],
    formulas: [
      { label: "Positive", parts: ["Subject", "Verb-2 (Verb+ed / irregular)", "object"], note: "worked · went · saw" },
      { label: "Negative", parts: ["Subject", "did", "not", "Verb-1", "object"] },
      { label: "Question", parts: ["Did", "subject", "Verb-1", "object", "?"] },
    ],
    explanationEnglish:
      "The past simple describes completed actions in the past. Regular verbs add -ed (worked, played). Many common verbs are irregular and must be memorised (go → went, see → saw, have → had). For negatives and questions use did, and the main verb returns to its base form.",
    explanationIndonesian:
      "Past simple untuk kejadian yang sudah selesai di masa lalu. Kata kerja beraturan tambah -ed (work → worked). Banyak kata kerja tak beraturan harus dihafal (go → went). Untuk negatif dan tanya pakai did, lalu kata kerja kembali ke bentuk dasar (did not go, bukan did not went).",
    explanationCards: [
      { kind: "note", title: "Irregular verbs", english: "go→went, see→saw, eat→ate, buy→bought, make→made, take→took.", indonesian: "Hafalkan kata kerja tak beraturan yang umum: go→went, eat→ate, buy→bought." },
      { kind: "warning", title: "After did, use the base verb", english: "'Did you go?' and 'I didn't go' — never 'didn't went'.", indonesian: "Setelah did, kata kerja bentuk dasar. Penanda masa lampau ada di did." },
      { kind: "tip", title: "Time markers", english: "yesterday, last week, in 2019, ago all point to the past simple.", indonesian: "Kata yesterday, last week, ago menandai past simple." },
    ],
    examples: [
      { context: "simple", english: "I visited my grandmother yesterday.", indonesian: "Saya mengunjungi nenek saya kemarin.", breakdown: "Regular verb visit → visited. 'yesterday' = past.", pattern: "Subject + Verb-ed + object" },
      { context: "conversation", english: "Did you enjoy the concert?", indonesian: "Apakah kamu menikmati konsernya?", breakdown: "Question with Did + base verb 'enjoy'.", pattern: "Did + subject + Verb-1 + ?" },
      { context: "school", english: "We learned about history last week.", indonesian: "Kami belajar tentang sejarah minggu lalu.", breakdown: "learn → learned (regular).", pattern: "Subject + Verb-ed" },
      { context: "business", english: "The meeting did not start on time.", indonesian: "Rapatnya tidak dimulai tepat waktu.", breakdown: "Negative: did not + base verb 'start'.", pattern: "Subject + did not + Verb-1" },
      { context: "travel", english: "They went to Bali two years ago.", indonesian: "Mereka pergi ke Bali dua tahun yang lalu.", breakdown: "Irregular go → went. 'ago' = past.", pattern: "Subject + irregular Verb-2" },
    ],
    mistakes: [
      { wrong: "I goed home early.", correct: "I went home early.", explanation: "'go' is irregular → went.", reason: "Tidak semua kata kerja pakai -ed; go→went harus dihafal." },
      { wrong: "Did you saw the movie?", correct: "Did you see the movie?", explanation: "After 'did', use the base verb.", reason: "Penanda lampau sudah ada di did, kata kerja kembali dasar." },
      { wrong: "She don't call me.", correct: "She didn't call me.", explanation: "Use 'didn't' for the past.", reason: "Untuk masa lampau pakai did not / didn't, bukan don't." },
    ],
    tips: [
      "Regular = base + ed; check the irregular list for the rest.",
      "In negatives/questions the tense sits on 'did' — main verb stays base.",
      "Spot past time markers: yesterday, ago, last...",
    ],
    summary: [
      "Past simple = finished past actions.",
      "Regular verbs add -ed; irregular verbs change form.",
      "Use did/didn't + base verb for questions and negatives.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "'She ___ a new phone last month.'", options: ["buy", "buyed", "bought"], answer: 2, explanation: "buy is irregular → bought." },
      { type: "fill-blank", prompt: "We ___ (play) tennis yesterday.", answer: "played", explanation: "Regular verb: play → played." },
      { type: "correction", prompt: "Fix: 'Did they went to school?'", answer: "Did they go to school?", explanation: "After 'did', use base verb 'go'." },
      { type: "arrange", prompt: "Make a sentence:", words: ["I", "watched", "a", "film", "last", "night"], answer: ["I", "watched", "a", "film", "last", "night"], explanation: "Subject + Verb-ed + object + time." },
      { type: "translate", prompt: "Dia (laki-laki) makan nasi tadi pagi.", answer: "He ate rice this morning.", accept: ["he ate rice this morning."], explanation: "eat is irregular → ate." },
    ],
    quiz: [
      { question: "Past of 'see':", options: ["seed", "saw", "seen"], answer: 1, explanation: "see → saw (irregular)." },
      { question: "'They ___ football yesterday.'", options: ["play", "played", "plays"], answer: 1, explanation: "Regular verb + ed." },
      { question: "Which is correct?", options: ["I didn't went.", "I didn't go.", "I not went."], answer: 1, explanation: "didn't + base verb." },
      { question: "'___ you finish your homework?'", options: ["Do", "Did", "Does"], answer: 1, explanation: "Past question → Did." },
      { question: "Past of 'have':", options: ["haved", "had", "haded"], answer: 1, explanation: "have → had." },
      { question: "'We ___ dinner at 8 pm.'", options: ["eat", "ate", "eaten"], answer: 1, explanation: "eat → ate." },
      { question: "Negative: 'She called me.'", options: ["She didn't called me.", "She didn't call me.", "She not call me."], answer: 1, explanation: "didn't + base verb." },
      { question: "Which time word fits the past simple?", options: ["tomorrow", "yesterday", "now"], answer: 1, explanation: "'yesterday' = past." },
      { question: "Past of 'study':", options: ["studyed", "studied", "studed"], answer: 1, explanation: "consonant + y → -ied." },
      { question: "'He ___ to the store an hour ago.'", options: ["go", "went", "goes"], answer: 1, explanation: "'ago' + irregular go → went." },
    ],
  },
};

const articles: GrammarLesson = {
  slug: "articles",
  unitSlug: "nouns-and-articles",
  title: "Articles: A, An, The",
  summary: "Know when to use a, an, the — or no article at all.",
  level: "beginner",
  estimatedMinutes: 10,
  xpReward: 20,
  content: {
    objectives: [
      "Choose between a and an by sound",
      "Use the for specific, known things",
      "Know when no article is needed",
    ],
    formulas: [
      { label: "a / an", parts: ["a / an", "singular countable noun"], note: "a book · an apple (by sound, not spelling)" },
      { label: "the", parts: ["the", "specific noun"], note: "the sun · the book you gave me" },
    ],
    explanationEnglish:
      "Use a/an for a single, non-specific countable noun the first time you mention it. Choose 'an' before a vowel sound (an hour, an apple) and 'a' before a consonant sound (a car, a university). Use 'the' when both speaker and listener know exactly which thing is meant, or for unique things (the moon). Use no article for general plurals and uncountable nouns (I like music).",
    explanationIndonesian:
      "Gunakan a/an untuk benda tunggal yang belum spesifik. Pilih 'an' sebelum bunyi vokal (an apple) dan 'a' sebelum bunyi konsonan (a book). Gunakan 'the' bila bendanya sudah jelas/spesifik atau unik (the sun). Untuk hal umum jamak atau tak terhitung, sering tanpa artikel (I like music).",
    explanationCards: [
      { kind: "note", title: "Sound, not spelling", english: "'an hour' (silent h) but 'a university' (sounds like 'you').", indonesian: "Yang menentukan bunyi, bukan huruf: an hour, a university." },
      { kind: "tip", title: "First a, then the", english: "'I saw a dog. The dog was friendly.' First mention = a, known after = the.", indonesian: "Penyebutan pertama pakai a/an, penyebutan berikutnya pakai the." },
      { kind: "warning", title: "No article for generals", english: "'Books are useful' — not 'The books are useful' when speaking generally.", indonesian: "Untuk pernyataan umum jamak, sering tanpa artikel." },
    ],
    examples: [
      { context: "simple", english: "I bought a book and an eraser.", indonesian: "Saya membeli sebuah buku dan sebuah penghapus.", breakdown: "'book' → a (consonant sound); 'eraser' → an (vowel sound).", pattern: "a/an + singular noun" },
      { context: "conversation", english: "Can you close the door, please?", indonesian: "Bisa tolong tutup pintunya?", breakdown: "'the door' — both people know which door.", pattern: "the + specific noun" },
      { context: "school", english: "She is an honest student.", indonesian: "Dia siswa yang jujur.", breakdown: "'honest' starts with a silent h (vowel sound) → an.", pattern: "an + vowel-sound word" },
      { context: "business", english: "The manager approved the budget.", indonesian: "Manajer itu menyetujui anggarannya.", breakdown: "Specific, known people/things → the.", pattern: "the + specific noun" },
      { context: "travel", english: "We stayed at a hotel near the beach.", indonesian: "Kami menginap di sebuah hotel dekat pantai.", breakdown: "'a hotel' (one, not specific) but 'the beach' (specific).", pattern: "a + noun / the + noun" },
    ],
    mistakes: [
      { wrong: "I have a umbrella.", correct: "I have an umbrella.", explanation: "'umbrella' begins with a vowel sound.", reason: "Sebelum bunyi vokal gunakan an." },
      { wrong: "She is a best singer.", correct: "She is the best singer.", explanation: "Superlatives take 'the'.", reason: "Kata sifat superlatif (best) selalu dengan the." },
      { wrong: "The water is important for the life.", correct: "Water is important for life.", explanation: "General uncountable nouns take no article.", reason: "Untuk konsep umum/tak terhitung, sering tanpa artikel." },
    ],
    tips: [
      "Say the word aloud — vowel sound = an.",
      "Use 'the' when you can point to the exact thing.",
      "Skip the article for general ideas and plurals.",
    ],
    summary: [
      "a/an = one, non-specific (by sound).",
      "the = specific or unique.",
      "no article = general plurals and uncountables.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "'She is ___ engineer.'", options: ["a", "an", "the"], answer: 1, explanation: "'engineer' starts with a vowel sound → an." },
      { type: "fill-blank", prompt: "___ sun rises in the east.", answer: "The", accept: ["the"], explanation: "Unique thing → the." },
      { type: "correction", prompt: "Fix: 'I need a hour to finish.'", answer: "I need an hour to finish.", explanation: "'hour' has a silent h → an." },
      { type: "multiple-choice", prompt: "'I like ___ music.' (in general)", options: ["a", "the", "(no article)"], answer: 2, explanation: "General uncountable → no article." },
      { type: "translate", prompt: "Dia membeli sebuah mobil.", answer: "He bought a car.", accept: ["she bought a car.", "he bought a car."], explanation: "One, non-specific → a car." },
    ],
    quiz: [
      { question: "'___ apple a day keeps the doctor away.'", options: ["A", "An", "The"], answer: 1, explanation: "vowel sound → An." },
      { question: "'Please pass ___ salt.'", options: ["a", "an", "the"], answer: 2, explanation: "Specific salt on the table → the." },
      { question: "'He is ___ university student.'", options: ["a", "an", "the"], answer: 0, explanation: "'university' sounds like 'you' → a." },
      { question: "'I saw ___ movie last night.'", options: ["a", "an", "the"], answer: 0, explanation: "First mention, non-specific → a." },
      { question: "'___ Mount Everest is the tallest mountain.'", options: ["A", "The", "(no article)"], answer: 2, explanation: "Names of single mountains take no article." },
      { question: "Which needs no article? 'I love ___.'", options: ["a music", "the music", "music"], answer: 2, explanation: "General uncountable → no article." },
      { question: "'She is ___ honest person.'", options: ["a", "an", "the"], answer: 1, explanation: "silent h → vowel sound → an." },
      { question: "'This is ___ best day ever.'", options: ["a", "an", "the"], answer: 2, explanation: "Superlative → the." },
      { question: "'We watched ___ moon.'", options: ["a", "an", "the"], answer: 2, explanation: "Unique object → the." },
      { question: "'They are ___ students.' (general)", options: ["a", "the", "(no article)"], answer: 2, explanation: "General plural → no article." },
    ],
  },
};

const pluralNouns: GrammarLesson = {
  slug: "plural-nouns",
  unitSlug: "nouns-and-articles",
  title: "Singular & Plural Nouns",
  summary: "Turn one into many with the right plural spelling.",
  level: "beginner",
  estimatedMinutes: 9,
  xpReward: 20,
  content: {
    objectives: [
      "Form regular plurals with -s and -es",
      "Change -y and -f endings correctly",
      "Recognise common irregular plurals",
    ],
    formulas: [
      { label: "Regular", parts: ["noun", "+ s / es"], note: "cat → cats · box → boxes" },
      { label: "-y ending", parts: ["consonant + y", "→ -ies"], note: "city → cities" },
      { label: "Irregular", parts: ["special form"], note: "child → children · man → men" },
    ],
    explanationEnglish:
      "Most nouns become plural by adding -s. Add -es to nouns ending in -s, -ss, -sh, -ch, -x (buses, boxes). If a noun ends in a consonant + y, change y to -ies (baby → babies). Some nouns are irregular and must be memorised (child → children, foot → feet), and a few stay the same (sheep → sheep).",
    explanationIndonesian:
      "Kebanyakan kata benda jadi jamak dengan tambah -s. Tambah -es untuk akhiran -s/-ss/-sh/-ch/-x (boxes). Konsonan + y berubah jadi -ies (city → cities). Beberapa tak beraturan harus dihafal (child → children, man → men), dan sebagian tetap sama (sheep → sheep).",
    explanationCards: [
      { kind: "note", title: "-f / -fe → -ves", english: "leaf → leaves, knife → knives.", indonesian: "Akhiran -f/-fe sering berubah jadi -ves: knife → knives." },
      { kind: "warning", title: "Irregular plurals", english: "person → people, tooth → teeth, mouse → mice.", indonesian: "Hafalkan jamak tak beraturan: person → people, tooth → teeth." },
      { kind: "tip", title: "Same singular & plural", english: "sheep, fish, deer, aircraft don't change.", indonesian: "Beberapa kata tidak berubah: sheep, fish, deer." },
    ],
    examples: [
      { context: "simple", english: "I have two cats and three dogs.", indonesian: "Saya punya dua kucing dan tiga anjing.", breakdown: "Regular plurals: cat → cats, dog → dogs.", pattern: "noun + s" },
      { context: "school", english: "There are twenty children in the class.", indonesian: "Ada dua puluh anak di kelas.", breakdown: "Irregular: child → children.", pattern: "irregular plural" },
      { context: "conversation", english: "Please wash the dishes.", indonesian: "Tolong cuci piringnya.", breakdown: "dish ends in -sh → dishes.", pattern: "noun + es" },
      { context: "business", english: "We opened three new branches.", indonesian: "Kami membuka tiga cabang baru.", breakdown: "branch ends in -ch → branches.", pattern: "noun + es" },
      { context: "travel", english: "The cities we visited were beautiful.", indonesian: "Kota-kota yang kami kunjungi indah.", breakdown: "consonant + y: city → cities.", pattern: "-y → -ies" },
    ],
    mistakes: [
      { wrong: "I saw three childs.", correct: "I saw three children.", explanation: "'child' is irregular → children.", reason: "Beberapa kata benda jamaknya tak beraturan." },
      { wrong: "There are many citys.", correct: "There are many cities.", explanation: "consonant + y becomes -ies.", reason: "city → cities, bukan citys." },
      { wrong: "He bought two knifes.", correct: "He bought two knives.", explanation: "-fe becomes -ves.", reason: "knife → knives." },
    ],
    tips: [
      "Default is +s; use +es after s, ss, sh, ch, x.",
      "Consonant + y → -ies; vowel + y just adds -s (boys).",
      "Memorise the common irregular plurals.",
    ],
    summary: [
      "Most plurals add -s; some add -es.",
      "consonant + y → -ies; -f/-fe → -ves.",
      "Irregulars (children, people, feet) must be learned.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "Plural of 'box':", options: ["boxs", "boxes", "boxies"], answer: 1, explanation: "ends in -x → -es." },
      { type: "fill-blank", prompt: "One baby, two ___.", answer: "babies", explanation: "consonant + y → -ies." },
      { type: "correction", prompt: "Fix: 'My foots hurt.'", answer: "My feet hurt.", explanation: "foot → feet (irregular)." },
      { type: "arrange", prompt: "Make a sentence:", words: ["The", "leaves", "are", "falling"], answer: ["The", "leaves", "are", "falling"], explanation: "leaf → leaves." },
      { type: "translate", prompt: "Ada banyak orang di sana.", answer: "There are many people there.", accept: ["there are many people there."], explanation: "person → people." },
    ],
    quiz: [
      { question: "Plural of 'bus':", options: ["buss", "buses", "busies"], answer: 1, explanation: "ends in -s → -es." },
      { question: "Plural of 'city':", options: ["citys", "cities", "cityes"], answer: 1, explanation: "consonant + y → -ies." },
      { question: "Plural of 'man':", options: ["mans", "men", "mens"], answer: 1, explanation: "irregular → men." },
      { question: "Plural of 'boy':", options: ["boies", "boys", "boyes"], answer: 1, explanation: "vowel + y → just add -s." },
      { question: "Plural of 'knife':", options: ["knifes", "knives", "knifs"], answer: 1, explanation: "-fe → -ves." },
      { question: "Plural of 'child':", options: ["childs", "childes", "children"], answer: 2, explanation: "irregular → children." },
      { question: "Plural of 'watch':", options: ["watchs", "watches", "watchies"], answer: 1, explanation: "ends in -ch → -es." },
      { question: "Plural of 'sheep':", options: ["sheeps", "sheep", "sheepes"], answer: 1, explanation: "unchanged → sheep." },
      { question: "Plural of 'tooth':", options: ["tooths", "teeth", "toothes"], answer: 1, explanation: "irregular → teeth." },
      { question: "Plural of 'party':", options: ["partys", "parties", "partyes"], answer: 1, explanation: "consonant + y → -ies." },
    ],
  },
};

const comparatives: GrammarLesson = {
  slug: "comparatives-superlatives",
  unitSlug: "comparison",
  title: "Comparatives & Superlatives",
  summary: "Compare two or more things: bigger, the biggest, more useful.",
  level: "intermediate",
  estimatedMinutes: 12,
  xpReward: 30,
  content: {
    objectives: [
      "Form comparatives with -er / more",
      "Form superlatives with -est / most",
      "Use 'than' and 'the' correctly",
    ],
    formulas: [
      { label: "Comparative", parts: ["Subject", "verb", "adjective-er / more + adjective", "than", "..."], note: "taller than · more useful than" },
      { label: "Superlative", parts: ["Subject", "verb", "the", "adjective-est / most + adjective"], note: "the tallest · the most useful" },
    ],
    explanationEnglish:
      "Comparatives compare two things and use -er (short adjectives) or 'more' (longer adjectives) followed by 'than'. Superlatives compare three or more and use the + -est or the most. One-syllable adjectives usually take -er/-est (fast → faster → fastest); adjectives with three or more syllables take more/most (expensive → more expensive → the most expensive). Some are irregular: good → better → best, bad → worse → worst.",
    explanationIndonesian:
      "Comparative membandingkan dua hal: pakai -er (kata sifat pendek) atau 'more' (kata sifat panjang) + than. Superlative membandingkan tiga atau lebih: pakai the + -est atau the most. Kata sifat satu suku kata biasanya -er/-est (fast → faster → fastest); yang panjang pakai more/most. Tak beraturan: good → better → best, bad → worse → worst.",
    explanationCards: [
      { kind: "note", title: "Two-syllable -y", english: "happy → happier → happiest; easy → easier → easiest.", indonesian: "Kata sifat dua suku kata berakhiran -y: happy → happier → happiest." },
      { kind: "warning", title: "Don't mix forms", english: "Not 'more taller' or 'most fastest' — use only one form.", indonesian: "Jangan gabungkan: cukup 'taller', bukan 'more taller'." },
      { kind: "tip", title: "Superlatives need 'the'", english: "'She is the smartest in the class.'", indonesian: "Superlative hampir selalu memakai the." },
    ],
    examples: [
      { context: "simple", english: "This box is heavier than that one.", indonesian: "Kotak ini lebih berat daripada yang itu.", breakdown: "heavy → heavier (consonant + y). 'than' compares two.", pattern: "adjective-er + than" },
      { context: "school", english: "Math is more difficult than art for me.", indonesian: "Matematika lebih sulit daripada seni bagiku.", breakdown: "'difficult' is long → more difficult.", pattern: "more + adjective + than" },
      { context: "conversation", english: "You are the funniest person I know.", indonesian: "Kamu orang paling lucu yang aku kenal.", breakdown: "Superlative: the funniest.", pattern: "the + adjective-est" },
      { context: "business", english: "This is the most reliable supplier we have.", indonesian: "Ini pemasok paling andal yang kami punya.", breakdown: "Long adjective superlative → the most reliable.", pattern: "the most + adjective" },
      { context: "travel", english: "The train is faster than the bus, but the plane is the fastest.", indonesian: "Keretanya lebih cepat daripada bus, tapi pesawatnya paling cepat.", breakdown: "faster (comparative) vs the fastest (superlative).", pattern: "-er than / the -est" },
    ],
    mistakes: [
      { wrong: "She is more taller than me.", correct: "She is taller than me.", explanation: "Don't use 'more' with -er.", reason: "Cukup satu penanda perbandingan: taller." },
      { wrong: "This is the most best option.", correct: "This is the best option.", explanation: "'best' is already superlative.", reason: "good → better → best; jangan tambah most." },
      { wrong: "He is the tallest of the two.", correct: "He is the taller of the two.", explanation: "Use comparative for two things.", reason: "Untuk dua hal pakai comparative, bukan superlative." },
    ],
    tips: [
      "Count syllables: 1 → -er/-est; 3+ → more/most.",
      "Use 'than' with comparatives, 'the' with superlatives.",
      "Learn irregulars: good/better/best, bad/worse/worst, far/farther/farthest.",
    ],
    summary: [
      "Comparative (two): -er / more + than.",
      "Superlative (3+): the + -est / the most.",
      "Never combine forms; watch the irregulars.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "'A car is ___ than a bicycle.'", options: ["fast", "faster", "fastest"], answer: 1, explanation: "Comparing two → faster + than." },
      { type: "fill-blank", prompt: "Mount Everest is the ___ (high) mountain.", answer: "highest", explanation: "Superlative: high → highest." },
      { type: "correction", prompt: "Fix: 'This test was more easier.'", answer: "This test was easier.", explanation: "Don't use 'more' with -er." },
      { type: "multiple-choice", prompt: "'Health is ___ than money.'", options: ["important", "more important", "most important"], answer: 1, explanation: "Long adjective comparative → more important." },
      { type: "translate", prompt: "Dia siswa paling pintar di kelas.", answer: "She is the smartest student in the class.", accept: ["he is the smartest student in the class."], explanation: "Superlative: smart → the smartest." },
    ],
    quiz: [
      { question: "Comparative of 'big':", options: ["biger", "bigger", "more big"], answer: 1, explanation: "Double the g: bigger." },
      { question: "Superlative of 'good':", options: ["goodest", "best", "most good"], answer: 1, explanation: "Irregular: good → best." },
      { question: "'This bag is ___ than mine.'", options: ["expensive", "more expensive", "most expensive"], answer: 1, explanation: "Comparative of a long adjective." },
      { question: "'She is the ___ runner on the team.'", options: ["fast", "faster", "fastest"], answer: 2, explanation: "Superlative → fastest." },
      { question: "Which is correct?", options: ["more happier", "happier", "happyer"], answer: 1, explanation: "happy → happier (one form only)." },
      { question: "Comparative of 'bad':", options: ["badder", "worse", "worst"], answer: 1, explanation: "Irregular: bad → worse." },
      { question: "'Today is ___ than yesterday.'", options: ["hot", "hotter", "hottest"], answer: 1, explanation: "Double t + er → hotter." },
      { question: "'It's the ___ movie I've seen.'", options: ["more boring", "most boring", "boringest"], answer: 1, explanation: "Long adjective superlative → most boring." },
      { question: "Comparative form uses which word?", options: ["the", "than", "most"], answer: 1, explanation: "Comparatives use 'than'." },
      { question: "'He is the ___ of the two brothers.'", options: ["tall", "taller", "tallest"], answer: 1, explanation: "Two things → comparative 'taller'." },
    ],
  },
};

const passiveVoice: GrammarLesson = {
  slug: "passive-voice",
  unitSlug: "voice",
  title: "Passive Voice",
  summary: "Shift the focus to the action or the result, not the doer.",
  level: "advanced",
  estimatedMinutes: 14,
  xpReward: 35,
  content: {
    objectives: [
      "Understand the difference between active and passive voice",
      "Form the passive with to be + past participle",
      "Know when the passive voice is the better choice",
    ],
    formulas: [
      { label: "Active", parts: ["Subject (doer)", "verb", "object"], note: "The chef cooks the meal." },
      { label: "Passive", parts: ["Subject (receiver)", "am/is/are/was/were", "past participle", "(by + doer)"], note: "The meal is cooked (by the chef)." },
    ],
    explanationEnglish:
      "In the active voice the subject does the action. In the passive voice the subject receives the action, and the focus moves to the action or result. Form the passive with the correct tense of 'to be' plus the past participle (verb-3). The doer is optional and, when included, follows 'by'. Use the passive when the doer is unknown, unimportant, or obvious, or to sound formal and objective.",
    explanationIndonesian:
      "Pada kalimat aktif, subjek melakukan aksi. Pada kalimat pasif, subjek menerima aksi dan fokus berpindah ke aksi/hasil. Rumus pasif: to be (sesuai tense) + past participle (verb-3). Pelaku bersifat opsional; jika ada, pakai 'by'. Gunakan pasif saat pelaku tidak diketahui, tidak penting, sudah jelas, atau untuk nada formal.",
    explanationCards: [
      { kind: "note", title: "Match the tense with 'to be'", english: "Present: is made · Past: was made · Present perfect: has been made.", indonesian: "Tense ditunjukkan oleh to be: is made (kini), was made (lampau), has been made (perfect)." },
      { kind: "warning", title: "Use the past participle (verb-3)", english: "'The letter was written' — not 'was wrote'.", indonesian: "Gunakan verb-3 (past participle): written, bukan wrote." },
      { kind: "tip", title: "'by' is optional", english: "Drop the doer when it's unknown or obvious: 'My car was stolen.'", indonesian: "Pelaku boleh dihilangkan bila tidak penting: 'My car was stolen.'" },
    ],
    examples: [
      { context: "simple", english: "The window was broken yesterday.", indonesian: "Jendelanya dipecahkan kemarin.", breakdown: "was (past of be) + broken (verb-3). Doer unknown.", pattern: "was + past participle" },
      { context: "school", english: "The homework is checked by the teacher.", indonesian: "PR-nya diperiksa oleh guru.", breakdown: "is + checked, doer added with 'by the teacher'.", pattern: "is + past participle + by" },
      { context: "business", english: "The report has been sent to all clients.", indonesian: "Laporannya telah dikirim ke semua klien.", breakdown: "Present perfect passive: has been + sent.", pattern: "has been + past participle" },
      { context: "conversation", english: "This song was written in 1999.", indonesian: "Lagu ini ditulis pada tahun 1999.", breakdown: "was + written (verb-3 of write).", pattern: "was + past participle" },
      { context: "travel", english: "Breakfast is served from 7 to 10 a.m.", indonesian: "Sarapan disajikan dari pukul 7 sampai 10 pagi.", breakdown: "is + served. Doer (staff) is obvious, so omitted.", pattern: "is + past participle" },
    ],
    mistakes: [
      { wrong: "The cake was eat by the kids.", correct: "The cake was eaten by the kids.", explanation: "Use the past participle 'eaten'.", reason: "Pasif butuh verb-3: eat → eaten." },
      { wrong: "The house built in 1990.", correct: "The house was built in 1990.", explanation: "The verb 'to be' is missing.", reason: "Pasif selalu butuh to be (was) + verb-3." },
      { wrong: "English is speak here.", correct: "English is spoken here.", explanation: "Use the past participle 'spoken'.", reason: "speak → spoken (verb-3) untuk pasif." },
    ],
    tips: [
      "Passive = to be (in the right tense) + past participle.",
      "Learn verb-3 forms (write→written, eat→eaten, break→broken).",
      "Only include 'by + doer' when it adds useful information.",
    ],
    summary: [
      "Passive focuses on the receiver of the action.",
      "Formula: to be + past participle (+ by doer).",
      "Use it when the doer is unknown, obvious, or unimportant.",
    ],
    practice: [
      { type: "multiple-choice", prompt: "Passive of 'They clean the office daily.'", options: ["The office is cleaned daily.", "The office cleans daily.", "The office is cleaning daily."], answer: 0, explanation: "is + cleaned (past participle)." },
      { type: "fill-blank", prompt: "The bridge ___ (build) last year.", answer: "was built", explanation: "Past passive: was + built." },
      { type: "correction", prompt: "Fix: 'The email was send this morning.'", answer: "The email was sent this morning.", explanation: "send → sent (past participle)." },
      { type: "arrange", prompt: "Make a passive sentence:", words: ["The", "song", "was", "written", "by", "her"], answer: ["The", "song", "was", "written", "by", "her"], explanation: "receiver + was + verb-3 + by + doer." },
      { type: "translate", prompt: "Bahasa Inggris digunakan di seluruh dunia.", answer: "English is used all over the world.", accept: ["english is used all over the world."], explanation: "is + used (present passive)." },
    ],
    quiz: [
      { question: "Choose the passive sentence.", options: ["The dog chased the cat.", "The cat was chased by the dog.", "The dog is chasing the cat."], answer: 1, explanation: "Receiver + was + past participle." },
      { question: "'The letters ___ every day.' (deliver)", options: ["deliver", "are delivered", "delivering"], answer: 1, explanation: "Present passive: are + delivered." },
      { question: "Past participle of 'write':", options: ["wrote", "written", "writed"], answer: 1, explanation: "write → written." },
      { question: "'The car ___ yesterday.' (repair)", options: ["repaired", "was repaired", "is repaired"], answer: 1, explanation: "Past passive → was repaired." },
      { question: "Which is correct?", options: ["It is make by hand.", "It is made by hand.", "It made by hand."], answer: 1, explanation: "is + made (verb-3)." },
      { question: "'The room ___ cleaned right now.' (be)", options: ["is being", "is", "was"], answer: 0, explanation: "Present continuous passive: is being cleaned." },
      { question: "When is the passive best?", options: ["The doer is unknown", "You want to name the doer", "It is a command"], answer: 0, explanation: "Passive suits an unknown/unimportant doer." },
      { question: "Passive of 'Someone stole my bike.'", options: ["My bike stole.", "My bike was stolen.", "My bike is steal."], answer: 1, explanation: "was + stolen (verb-3)." },
      { question: "'The results ___ tomorrow.' (announce)", options: ["will be announced", "announce", "announced"], answer: 0, explanation: "Future passive: will be + announced." },
      { question: "Past participle of 'break':", options: ["broke", "broken", "breaked"], answer: 1, explanation: "break → broken." },
    ],
  },
};

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  toBe,
  presentSimple,
  presentContinuous,
  pastSimple,
  articles,
  pluralNouns,
  comparatives,
  passiveVoice,
];

const LESSON_MAP = new Map(GRAMMAR_LESSONS.map((l) => [l.slug, l]));
const UNIT_MAP = new Map(GRAMMAR_UNITS.map((u) => [u.slug, u]));

export function getGrammarLesson(slug: string): GrammarLesson | undefined {
  return LESSON_MAP.get(slug);
}

export function getGrammarUnit(slug: string): GrammarUnit | undefined {
  return UNIT_MAP.get(slug);
}

export function lessonsForUnit(unitSlug: string): GrammarLesson[] {
  return GRAMMAR_LESSONS.filter((l) => l.unitSlug === unitSlug);
}

export function unitsForLevel(level: GrammarLevel): GrammarUnit[] {
  return GRAMMAR_UNITS.filter((u) => u.level === level);
}

/** Ordered flat list, used for "next lesson" navigation. */
export const GRAMMAR_LESSON_ORDER: string[] = GRAMMAR_UNITS.flatMap((u) =>
  lessonsForUnit(u.slug).map((l) => l.slug),
);

export function nextLessonSlug(slug: string): string | undefined {
  const i = GRAMMAR_LESSON_ORDER.indexOf(slug);
  if (i === -1 || i + 1 >= GRAMMAR_LESSON_ORDER.length) return undefined;
  return GRAMMAR_LESSON_ORDER[i + 1];
}
