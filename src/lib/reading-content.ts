import {
  Coffee,
  GraduationCap,
  Users,
  UtensilsCrossed,
  Plane,
  ShoppingBag,
  Briefcase,
  Cpu,
  FlaskConical,
  HeartPulse,
  Clapperboard,
  Landmark,
  Leaf,
  ScrollText,
  Newspaper,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

/**
 * Reading & Listening Lab — authored curriculum (content-as-code).
 *
 * This module is the canonical, version-controlled source of Reading &
 * Listening content. Its shape maps 1:1 onto the `reading_lessons` table so a
 * future admin CMS can edit lessons in the database without a UI rewrite:
 *   ReadingLesson.content -> reading_lessons.content (jsonb)
 * Per-user state (progress, bookmarks, notes, quiz attempts) already lives in
 * the database. See src/lib/reading.ts and src/lib/reading-actions.ts.
 */

export type ReadingLevel = "beginner" | "intermediate" | "advanced";

export type ReadingCategory =
  | "daily-conversation"
  | "school"
  | "family"
  | "food"
  | "travel"
  | "shopping"
  | "business"
  | "technology"
  | "science"
  | "health"
  | "entertainment"
  | "culture"
  | "environment"
  | "history"
  | "news"
  | "education";

/** A single, audio-synced sentence of the passage / transcript. */
export interface TranscriptLine {
  /** Speaker label for conversations (optional). */
  speaker?: string;
  /** English sentence — also the reading text. */
  text: string;
  /** Indonesian translation shown in translation mode. */
  translation: string;
  /** Paragraph group index (lines with the same value render together). */
  para: number;
}

/** An important vocabulary word highlighted inside the passage. */
export interface VocabHighlight {
  word: string;
  phonetic?: string;
  pos?: string;
  /** Indonesian meaning. */
  meaning: string;
  /** English definition. */
  definition?: string;
  example: string;
  exampleTranslation: string;
}

/** A grammar pattern highlighted inside the passage. */
export interface GrammarHighlight {
  /** Exact phrase to highlight in the text (case-insensitive). */
  phrase: string;
  name: string;
  rule: string;
  formula: string;
  explanation: string;
  example: string;
  /** Related grammar lesson slugs (link into the Grammar module). */
  related?: string[];
}

export interface KeyExpression {
  expression: string;
  meaning: string;
  usage: string;
}

export type ReadingQuizItem =
  | {
      kind: "mcq";
      question: string;
      options: string[];
      answer: number;
      explanation: string;
      /** Optional label, e.g. "Inference", "Find information". */
      tag?: string;
    }
  | {
      kind: "true-false";
      question: string;
      answer: boolean;
      explanation: string;
      tag?: string;
    }
  | {
      kind: "fill-blank";
      /** Use "___" to mark the blank. */
      question: string;
      answer: string;
      accept?: string[];
      explanation: string;
      tag?: string;
    }
  | {
      kind: "short-answer";
      question: string;
      answer: string;
      accept?: string[];
      explanation: string;
      tag?: string;
    }
  | {
      kind: "order";
      question: string;
      /** Shuffled tokens presented to the learner. */
      items: string[];
      /** Correct order of `items`. */
      answer: string[];
      explanation: string;
      tag?: string;
    };

export interface ReadingLessonContent {
  objectives: string[];
  /** Ordered, audio-synced sentences (reading text + transcript). */
  transcript: TranscriptLine[];
  vocab: VocabHighlight[];
  grammar: GrammarHighlight[];
  keyExpressions: KeyExpression[];
  readingNotes: string[];
  listeningNotes: string[];
  summary: string[];
  readingQuiz: ReadingQuizItem[];
  listeningQuiz: ReadingQuizItem[];
}

export interface ReadingLesson {
  slug: string;
  title: string;
  level: ReadingLevel;
  category: ReadingCategory;
  topic: string;
  summary: string;
  estimatedMinutes: number;
  xpReward: number;
  /** Optional pre-recorded / future AI-generated narration URL. */
  audioUrl?: string;
  content: ReadingLessonContent;
}

export const READING_LEVELS: ReadingLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const LEVEL_META: Record<ReadingLevel, { label: string; tint: string }> = {
  beginner: { label: "Beginner", tint: "bg-primary/10 text-primary" },
  intermediate: { label: "Intermediate", tint: "bg-coral/10 text-coral" },
  advanced: { label: "Advanced", tint: "bg-gold/15 text-gold-foreground" },
};

export const CATEGORY_META: Record<
  ReadingCategory,
  { label: string; icon: LucideIcon }
> = {
  "daily-conversation": { label: "Daily Conversation", icon: Coffee },
  school: { label: "School", icon: GraduationCap },
  family: { label: "Family", icon: Users },
  food: { label: "Food", icon: UtensilsCrossed },
  travel: { label: "Travel", icon: Plane },
  shopping: { label: "Shopping", icon: ShoppingBag },
  business: { label: "Business", icon: Briefcase },
  technology: { label: "Technology", icon: Cpu },
  science: { label: "Science", icon: FlaskConical },
  health: { label: "Health", icon: HeartPulse },
  entertainment: { label: "Entertainment", icon: Clapperboard },
  culture: { label: "Culture", icon: Landmark },
  environment: { label: "Environment", icon: Leaf },
  history: { label: "History", icon: ScrollText },
  news: { label: "News", icon: Newspaper },
  education: { label: "Education", icon: BookOpen },
};

export const READING_CATEGORIES = Object.keys(CATEGORY_META) as ReadingCategory[];

// =====================================================================
// Curriculum
// =====================================================================

export const READING_LESSONS: ReadingLesson[] = [
  // ---------------- BEGINNER ----------------
  {
    slug: "meeting-a-new-friend",
    title: "Meeting a New Friend",
    level: "beginner",
    category: "daily-conversation",
    topic: "Introducing yourself",
    summary:
      "Learn friendly ways to introduce yourself and start a simple conversation.",
    estimatedMinutes: 4,
    xpReward: 20,
    content: {
      objectives: [
        "Introduce yourself with your name and where you are from",
        "Ask and answer simple questions politely",
        "Use greetings for different times of day",
      ],
      transcript: [
        {
          speaker: "Maya",
          text: "Hi! My name is Maya. What is your name?",
          translation: "Hai! Nama saya Maya. Siapa namamu?",
          para: 0,
        },
        {
          speaker: "Budi",
          text: "Hello, Maya. I am Budi. It is nice to meet you.",
          translation: "Halo, Maya. Saya Budi. Senang berkenalan denganmu.",
          para: 0,
        },
        {
          speaker: "Maya",
          text: "Nice to meet you too. Where are you from?",
          translation: "Senang berkenalan denganmu juga. Kamu dari mana?",
          para: 1,
        },
        {
          speaker: "Budi",
          text: "I am from Bandung. I am a student. How about you?",
          translation: "Saya dari Bandung. Saya seorang pelajar. Bagaimana denganmu?",
          para: 1,
        },
        {
          speaker: "Maya",
          text: "I am from Jakarta, and I am a teacher.",
          translation: "Saya dari Jakarta, dan saya seorang guru.",
          para: 2,
        },
        {
          speaker: "Budi",
          text: "That is wonderful. I hope we can be good friends.",
          translation: "Itu bagus sekali. Semoga kita bisa menjadi teman baik.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "name",
          phonetic: "/neɪm/",
          pos: "noun",
          meaning: "nama",
          definition: "the word people use to call you",
          example: "My name is Maya.",
          exampleTranslation: "Nama saya Maya.",
        },
        {
          word: "student",
          phonetic: "/ˈstuː.dənt/",
          pos: "noun",
          meaning: "pelajar / mahasiswa",
          definition: "a person who is learning at a school",
          example: "I am a student at a high school.",
          exampleTranslation: "Saya seorang pelajar di sebuah SMA.",
        },
        {
          word: "teacher",
          phonetic: "/ˈtiː.tʃər/",
          pos: "noun",
          meaning: "guru",
          definition: "a person whose job is to teach",
          example: "She is a teacher.",
          exampleTranslation: "Dia seorang guru.",
        },
        {
          word: "friends",
          phonetic: "/frendz/",
          pos: "noun",
          meaning: "teman-teman",
          definition: "people you know well and like",
          example: "We can be good friends.",
          exampleTranslation: "Kita bisa menjadi teman baik.",
        },
      ],
      grammar: [
        {
          phrase: "I am",
          name: "The verb 'to be' (am)",
          rule: "Use 'am' with the pronoun 'I'.",
          formula: "I + am + (noun / adjective)",
          explanation:
            "'To be' connects a subject to more information about it. With 'I', always use 'am'.",
          example: "I am a student.",
          related: ["to-be-present"],
        },
        {
          phrase: "Where are you from",
          name: "Wh- questions with 'to be'",
          rule: "Start with a Wh- word, then the verb 'to be', then the subject.",
          formula: "Wh- word + are/is + subject + …?",
          explanation:
            "'Where' asks about a place. We invert 'you are' to 'are you' to make a question.",
          example: "Where are you from?",
        },
      ],
      keyExpressions: [
        {
          expression: "Nice to meet you.",
          meaning: "Senang berkenalan denganmu.",
          usage: "Say this the first time you meet someone.",
        },
        {
          expression: "How about you?",
          meaning: "Bagaimana denganmu?",
          usage: "Use it to return the same question politely.",
        },
      ],
      readingNotes: [
        "Notice how each person greets before asking a question — greetings make conversations friendly.",
        "'I am' can be shortened to 'I'm' in casual speech and writing.",
      ],
      listeningNotes: [
        "Listen for the rising tone at the end of questions like 'What is your name?'.",
        "The two speakers take turns — this is called turn-taking.",
      ],
      summary: [
        "Introduce yourself with 'My name is …' or 'I am …'.",
        "Ask 'Where are you from?' to learn someone's hometown.",
        "Respond warmly with 'Nice to meet you too.'",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "Where is Budi from?",
          options: ["Jakarta", "Bandung", "Surabaya", "Bali"],
          answer: 1,
          explanation: "Budi says, 'I am from Bandung.'",
          tag: "Find information",
        },
        {
          kind: "true-false",
          question: "Maya is a student.",
          answer: false,
          explanation: "Maya says she is a teacher, not a student.",
          tag: "Inference",
        },
        {
          kind: "fill-blank",
          question: "Nice to ___ you.",
          answer: "meet",
          explanation: "The full expression is 'Nice to meet you.'",
          tag: "Key expression",
        },
        {
          kind: "mcq",
          question: "What does 'teacher' mean?",
          options: ["pelajar", "guru", "teman", "nama"],
          answer: 1,
          explanation: "'Teacher' means 'guru' in Indonesian.",
          tag: "Vocabulary",
        },
      ],
      listeningQuiz: [
        {
          kind: "mcq",
          question: "Who speaks first?",
          options: ["Budi", "Maya", "The teacher", "A narrator"],
          answer: 1,
          explanation: "Maya greets first with 'Hi! My name is Maya.'",
          tag: "Identify speaker",
        },
        {
          kind: "fill-blank",
          question: "Budi says: 'I am a ___.'",
          answer: "student",
          explanation: "Budi introduces himself as a student.",
          tag: "Complete missing word",
        },
        {
          kind: "order",
          question: "Put the conversation in the correct order.",
          items: [
            "I am from Bandung.",
            "What is your name?",
            "I am Budi.",
          ],
          answer: [
            "What is your name?",
            "I am Budi.",
            "I am from Bandung.",
          ],
          explanation: "The name question comes first, then the answer, then the origin.",
          tag: "Order conversation",
        },
      ],
    },
  },
  {
    slug: "at-the-food-market",
    title: "At the Food Market",
    level: "beginner",
    category: "food",
    topic: "Buying fresh food",
    summary: "Read a short story about buying fruit and vegetables at a market.",
    estimatedMinutes: 4,
    xpReward: 20,
    content: {
      objectives: [
        "Recognise common food and market words",
        "Understand simple prices and quantities",
        "Ask for items politely",
      ],
      transcript: [
        {
          text: "Every Saturday morning, Sari goes to the food market near her house.",
          translation: "Setiap Sabtu pagi, Sari pergi ke pasar dekat rumahnya.",
          para: 0,
        },
        {
          text: "The market is busy and full of fresh fruit and vegetables.",
          translation: "Pasar itu ramai dan penuh dengan buah dan sayuran segar.",
          para: 0,
        },
        {
          text: "She buys red apples, sweet bananas, and green spinach.",
          translation: "Dia membeli apel merah, pisang manis, dan bayam hijau.",
          para: 1,
        },
        {
          text: "'How much are the apples?' she asks the seller.",
          translation: "'Berapa harga apelnya?' tanyanya kepada penjual.",
          para: 1,
        },
        {
          text: "'They are twenty thousand rupiah per kilo,' the seller answers.",
          translation: "'Harganya dua puluh ribu rupiah per kilo,' jawab penjual.",
          para: 2,
        },
        {
          text: "Sari pays for the food and carries it home in a cloth bag.",
          translation: "Sari membayar makanan itu dan membawanya pulang dengan tas kain.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "market",
          phonetic: "/ˈmɑːr.kɪt/",
          pos: "noun",
          meaning: "pasar",
          definition: "a place where people buy and sell things",
          example: "The market is near her house.",
          exampleTranslation: "Pasar itu dekat rumahnya.",
        },
        {
          word: "fresh",
          phonetic: "/freʃ/",
          pos: "adjective",
          meaning: "segar",
          definition: "recently made or picked; not old",
          example: "The vegetables are fresh.",
          exampleTranslation: "Sayurannya segar.",
        },
        {
          word: "seller",
          phonetic: "/ˈsel.ər/",
          pos: "noun",
          meaning: "penjual",
          definition: "a person who sells something",
          example: "She asks the seller a question.",
          exampleTranslation: "Dia bertanya kepada penjual.",
        },
        {
          word: "spinach",
          phonetic: "/ˈspɪn.ɪtʃ/",
          pos: "noun",
          meaning: "bayam",
          definition: "a green leafy vegetable",
          example: "Spinach is good for you.",
          exampleTranslation: "Bayam baik untukmu.",
        },
      ],
      grammar: [
        {
          phrase: "How much are the apples",
          name: "'How much' for price",
          rule: "Use 'How much' to ask about price or uncountable amounts.",
          formula: "How much + is/are + noun?",
          explanation:
            "Use 'are' with a plural noun like 'apples' and 'is' with a singular or uncountable noun.",
          example: "How much are the apples?",
        },
        {
          phrase: "goes to the food market",
          name: "Present simple (habits)",
          rule: "Add -s to the verb with he / she / it for repeated actions.",
          formula: "Subject (he/she/it) + verb + -s",
          explanation:
            "We use the present simple for routines. 'Sari goes' shows a weekly habit.",
          example: "She goes to the market every Saturday.",
          related: ["present-simple"],
        },
      ],
      keyExpressions: [
        {
          expression: "How much is it?",
          meaning: "Berapa harganya?",
          usage: "Ask the price of one item.",
        },
        {
          expression: "per kilo",
          meaning: "per kilogram",
          usage: "Used to give a price for each kilogram.",
        },
      ],
      readingNotes: [
        "Colours (red, green) come before the noun in English: 'red apples'.",
        "'Every Saturday morning' tells us when the action repeats.",
      ],
      listeningNotes: [
        "Prices in English are said in full: 'twenty thousand rupiah'.",
        "Listen for the polite question tone when Sari asks the seller.",
      ],
      summary: [
        "Use 'How much…?' to ask about price.",
        "The present simple with -s describes habits.",
        "Colour words come before the noun.",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "When does Sari go to the market?",
          options: ["Every Sunday", "Every Saturday morning", "Every evening", "Every Monday"],
          answer: 1,
          explanation: "The text says 'Every Saturday morning'.",
          tag: "Find information",
        },
        {
          kind: "true-false",
          question: "Sari uses a plastic bag to carry her food.",
          answer: false,
          explanation: "She carries the food home in a cloth bag.",
          tag: "Inference",
        },
        {
          kind: "fill-blank",
          question: "The apples are twenty thousand rupiah per ___.",
          answer: "kilo",
          accept: ["kilogram", "kg"],
          explanation: "The seller says 'per kilo'.",
          tag: "Find information",
        },
        {
          kind: "mcq",
          question: "What does 'fresh' mean?",
          options: ["lama", "segar", "mahal", "manis"],
          answer: 1,
          explanation: "'Fresh' means 'segar'.",
          tag: "Vocabulary",
        },
      ],
      listeningQuiz: [
        {
          kind: "fill-blank",
          question: "Sari buys red apples, sweet bananas, and green ___.",
          answer: "spinach",
          explanation: "She buys green spinach.",
          tag: "Complete missing word",
        },
        {
          kind: "true-false",
          question: "The seller says the apples cost twenty thousand rupiah per kilo.",
          answer: true,
          explanation: "That is exactly what the seller says.",
          tag: "Listening comprehension",
        },
        {
          kind: "mcq",
          question: "Where does Sari go?",
          options: ["A restaurant", "A food market", "A supermarket", "A farm"],
          answer: 1,
          explanation: "She goes to the food market near her house.",
          tag: "Listening comprehension",
        },
      ],
    },
  },

  // ---------------- INTERMEDIATE ----------------
  {
    slug: "a-day-at-school",
    title: "A Busy Day at School",
    level: "intermediate",
    category: "school",
    topic: "School routines and study",
    summary:
      "Follow a student through a busy school day and learn study-related vocabulary.",
    estimatedMinutes: 6,
    xpReward: 30,
    content: {
      objectives: [
        "Understand a narrative about daily school life",
        "Learn vocabulary about subjects, assignments, and schedules",
        "Recognise the past simple for finished actions",
      ],
      transcript: [
        {
          text: "Yesterday, Rina had a very busy day at school.",
          translation: "Kemarin, Rina mengalami hari yang sangat sibuk di sekolah.",
          para: 0,
        },
        {
          text: "Her first class was mathematics, which she finds challenging but interesting.",
          translation:
            "Kelas pertamanya adalah matematika, yang menurutnya menantang tetapi menarik.",
          para: 0,
        },
        {
          text: "During the break, she discussed a science project with her classmates.",
          translation:
            "Saat istirahat, dia mendiskusikan proyek sains dengan teman-teman sekelasnya.",
          para: 1,
        },
        {
          text: "They decided to research renewable energy and prepare a short presentation.",
          translation:
            "Mereka memutuskan untuk meneliti energi terbarukan dan menyiapkan presentasi singkat.",
          para: 1,
        },
        {
          text: "After lunch, the English teacher returned their essays with helpful comments.",
          translation:
            "Setelah makan siang, guru bahasa Inggris mengembalikan esai mereka dengan komentar yang membantu.",
          para: 2,
        },
        {
          text: "By the end of the day, Rina felt tired but proud of her hard work.",
          translation:
            "Pada akhir hari, Rina merasa lelah tetapi bangga dengan kerja kerasnya.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "challenging",
          phonetic: "/ˈtʃæl.ɪn.dʒɪŋ/",
          pos: "adjective",
          meaning: "menantang",
          definition: "difficult in an interesting way",
          example: "Mathematics can be challenging.",
          exampleTranslation: "Matematika bisa menantang.",
        },
        {
          word: "discussed",
          phonetic: "/dɪˈskʌst/",
          pos: "verb",
          meaning: "mendiskusikan",
          definition: "talked about something with others",
          example: "They discussed the project together.",
          exampleTranslation: "Mereka mendiskusikan proyek itu bersama.",
        },
        {
          word: "research",
          phonetic: "/rɪˈsɜːrtʃ/",
          pos: "verb",
          meaning: "meneliti",
          definition: "study something carefully to find facts",
          example: "We research renewable energy.",
          exampleTranslation: "Kami meneliti energi terbarukan.",
        },
        {
          word: "presentation",
          phonetic: "/ˌprez.ənˈteɪ.ʃən/",
          pos: "noun",
          meaning: "presentasi",
          definition: "a talk that shows information to a group",
          example: "She gave a short presentation.",
          exampleTranslation: "Dia memberikan presentasi singkat.",
        },
        {
          word: "essays",
          phonetic: "/ˈes.eɪz/",
          pos: "noun",
          meaning: "esai / karangan",
          definition: "short pieces of writing about a topic",
          example: "The teacher returned their essays.",
          exampleTranslation: "Guru mengembalikan esai mereka.",
        },
      ],
      grammar: [
        {
          phrase: "had a very busy day",
          name: "Past simple (irregular)",
          rule: "Many common verbs have irregular past forms; 'have' becomes 'had'.",
          formula: "Subject + past-tense verb + …",
          explanation:
            "We use the past simple for finished actions. 'Had' is the past of 'have'.",
          example: "Yesterday she had a busy day.",
          related: ["past-simple"],
        },
        {
          phrase: "decided to research",
          name: "Verb + infinitive",
          rule: "Some verbs are followed by 'to' + base verb.",
          formula: "Verb + to + base verb",
          explanation:
            "'Decide', 'want', and 'plan' take an infinitive: 'decided to research'.",
          example: "They decided to research the topic.",
        },
      ],
      keyExpressions: [
        {
          expression: "By the end of the day",
          meaning: "Pada akhir hari",
          usage: "Introduce a result after a series of events.",
        },
        {
          expression: "hard work",
          meaning: "kerja keras",
          usage: "Refer to great effort put into a task.",
        },
      ],
      readingNotes: [
        "Time markers like 'Yesterday', 'During the break', and 'After lunch' guide the order of events.",
        "'which she finds challenging' is a relative clause adding extra detail.",
      ],
      listeningNotes: [
        "The narrator's voice stays steady — focus on the time markers to follow the sequence.",
        "Past-tense endings (-ed) may sound like /t/ or /d/: 'discussed' sounds like /dɪˈskʌst/.",
      ],
      summary: [
        "The past simple describes finished actions in the past.",
        "Some verbs are irregular: have → had.",
        "Verbs like 'decide' are followed by 'to' + base verb.",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "What was Rina's first class?",
          options: ["Science", "English", "Mathematics", "History"],
          answer: 2,
          explanation: "Her first class was mathematics.",
          tag: "Find information",
        },
        {
          kind: "mcq",
          question: "Why does the writer say Rina felt 'proud'?",
          options: [
            "She won a prize",
            "She worked hard all day",
            "She skipped class",
            "She went home early",
          ],
          answer: 1,
          explanation:
            "She felt proud 'of her hard work', so the pride comes from her effort.",
          tag: "Inference",
        },
        {
          kind: "fill-blank",
          question: "They decided to research ___ energy.",
          answer: "renewable",
          explanation: "The project was about renewable energy.",
          tag: "Find information",
        },
        {
          kind: "short-answer",
          question: "What did the English teacher return? (one word)",
          answer: "essays",
          accept: ["essay", "their essays"],
          explanation: "The teacher returned their essays with comments.",
          tag: "Find information",
        },
        {
          kind: "mcq",
          question: "'Challenging' is closest in meaning to…",
          options: ["boring", "easy", "difficult but interesting", "short"],
          answer: 2,
          explanation: "'Challenging' means difficult in an interesting way.",
          tag: "Vocabulary meaning",
        },
      ],
      listeningQuiz: [
        {
          kind: "true-false",
          question: "Rina discussed the science project during the break.",
          answer: true,
          explanation: "She discussed it with classmates during the break.",
          tag: "Listening comprehension",
        },
        {
          kind: "fill-blank",
          question: "After lunch, the teacher returned their essays with helpful ___.",
          answer: "comments",
          explanation: "The essays came back 'with helpful comments'.",
          tag: "Fill transcript",
        },
        {
          kind: "mcq",
          question: "How did Rina feel at the end of the day?",
          options: [
            "Bored and sleepy",
            "Tired but proud",
            "Angry and sad",
            "Excited and hungry",
          ],
          answer: 1,
          explanation: "She 'felt tired but proud of her hard work'.",
          tag: "Listening comprehension",
        },
      ],
    },
  },
  {
    slug: "planning-a-trip",
    title: "Planning a Trip to Yogyakarta",
    level: "intermediate",
    category: "travel",
    topic: "Travel plans and bookings",
    summary:
      "Read how two friends plan a weekend trip and learn travel vocabulary.",
    estimatedMinutes: 6,
    xpReward: 30,
    content: {
      objectives: [
        "Understand a dialogue about making travel plans",
        "Learn vocabulary for booking and transport",
        "Recognise 'be going to' for future plans",
      ],
      transcript: [
        {
          speaker: "Dewi",
          text: "We are going to visit Yogyakarta next weekend. Have you booked the train?",
          translation:
            "Kita akan mengunjungi Yogyakarta akhir pekan depan. Sudahkah kamu memesan kereta?",
          para: 0,
        },
        {
          speaker: "Arif",
          text: "Yes, I booked two tickets online this morning. They were quite affordable.",
          translation:
            "Ya, aku memesan dua tiket secara daring pagi ini. Harganya cukup terjangkau.",
          para: 0,
        },
        {
          speaker: "Dewi",
          text: "Wonderful. Where are we going to stay?",
          translation: "Bagus sekali. Di mana kita akan menginap?",
          para: 1,
        },
        {
          speaker: "Arif",
          text: "I reserved a small guesthouse close to the city centre.",
          translation: "Aku memesan wisma kecil dekat pusat kota.",
          para: 1,
        },
        {
          speaker: "Dewi",
          text: "Perfect. Let's create an itinerary so we don't miss the famous temples.",
          translation:
            "Sempurna. Ayo buat jadwal perjalanan agar kita tidak melewatkan candi-candi terkenal.",
          para: 2,
        },
        {
          speaker: "Arif",
          text: "Good idea. I can't wait to explore the old streets and try the local food.",
          translation:
            "Ide bagus. Aku tidak sabar menjelajahi jalan-jalan tua dan mencoba makanan lokal.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "booked",
          phonetic: "/bʊkt/",
          pos: "verb",
          meaning: "memesan",
          definition: "arranged to have something (a ticket, room) in advance",
          example: "I booked two tickets.",
          exampleTranslation: "Aku memesan dua tiket.",
        },
        {
          word: "affordable",
          phonetic: "/əˈfɔːr.də.bəl/",
          pos: "adjective",
          meaning: "terjangkau",
          definition: "not expensive; possible to pay for",
          example: "The tickets were affordable.",
          exampleTranslation: "Tiketnya terjangkau.",
        },
        {
          word: "guesthouse",
          phonetic: "/ˈɡest.haʊs/",
          pos: "noun",
          meaning: "wisma / penginapan",
          definition: "a small, cheap hotel",
          example: "We stayed in a guesthouse.",
          exampleTranslation: "Kami menginap di sebuah wisma.",
        },
        {
          word: "itinerary",
          phonetic: "/aɪˈtɪn.ər.er.i/",
          pos: "noun",
          meaning: "jadwal perjalanan",
          definition: "a plan of a journey with times and places",
          example: "Let's make an itinerary.",
          exampleTranslation: "Ayo buat jadwal perjalanan.",
        },
        {
          word: "explore",
          phonetic: "/ɪkˈsplɔːr/",
          pos: "verb",
          meaning: "menjelajahi",
          definition: "travel around a place to learn about it",
          example: "We will explore the old streets.",
          exampleTranslation: "Kita akan menjelajahi jalan-jalan tua.",
        },
      ],
      grammar: [
        {
          phrase: "are going to visit",
          name: "'be going to' (future plans)",
          rule: "Use 'be going to' + base verb for plans decided before now.",
          formula: "Subject + am/is/are + going to + base verb",
          explanation:
            "'Be going to' expresses intentions and plans. Here it shows a decided trip.",
          example: "We are going to visit Yogyakarta.",
          related: ["future-tenses"],
        },
        {
          phrase: "Have you booked",
          name: "Present perfect question",
          rule: "Use 'have/has' + past participle to ask about a recent action with present relevance.",
          formula: "Have/Has + subject + past participle …?",
          explanation:
            "'Have you booked…?' asks whether the action is done up to now.",
          example: "Have you booked the train?",
          related: ["present-perfect"],
        },
      ],
      keyExpressions: [
        {
          expression: "I can't wait to …",
          meaning: "Aku tidak sabar untuk …",
          usage: "Show excitement about something in the future.",
        },
        {
          expression: "Let's create an itinerary.",
          meaning: "Ayo buat jadwal perjalanan.",
          usage: "Suggest doing something together.",
        },
      ],
      readingNotes: [
        "'Let's' is short for 'let us' and makes a friendly suggestion.",
        "Notice the mix of tenses: plans use 'going to', completed bookings use past simple.",
      ],
      listeningNotes: [
        "Contractions like 'don't' and 'can't' are common in relaxed speech.",
        "Listen for the excitement in Arif's final line — tone shows feeling.",
      ],
      summary: [
        "'Be going to' + base verb describes future plans.",
        "The present perfect asks about actions up to now.",
        "'Let's …' suggests an activity together.",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "How did Arif buy the train tickets?",
          options: ["At the station", "Online", "By phone", "From a friend"],
          answer: 1,
          explanation: "He 'booked two tickets online this morning'.",
          tag: "Find information",
        },
        {
          kind: "true-false",
          question: "They are going to stay in an expensive hotel.",
          answer: false,
          explanation: "Arif reserved a small guesthouse, not an expensive hotel.",
          tag: "Inference",
        },
        {
          kind: "fill-blank",
          question: "Let's create an ___ so we don't miss the temples.",
          answer: "itinerary",
          explanation: "Dewi suggests making an itinerary.",
          tag: "Find information",
        },
        {
          kind: "mcq",
          question: "'Affordable' means…",
          options: ["mahal", "terjangkau", "jauh", "baru"],
          answer: 1,
          explanation: "'Affordable' means 'terjangkau'.",
          tag: "Vocabulary meaning",
        },
        {
          kind: "mcq",
          question: "Which sentence uses a future plan?",
          options: [
            "I booked two tickets.",
            "We are going to visit Yogyakarta.",
            "I reserved a guesthouse.",
            "The tickets were affordable.",
          ],
          answer: 1,
          explanation: "'Are going to visit' expresses a future plan.",
          tag: "Grammar identification",
        },
      ],
      listeningQuiz: [
        {
          kind: "mcq",
          question: "Who booked the tickets?",
          options: ["Dewi", "Arif", "Both of them", "A travel agent"],
          answer: 1,
          explanation: "Arif says, 'I booked two tickets online.'",
          tag: "Identify speaker",
        },
        {
          kind: "fill-blank",
          question: "Arif reserved a small guesthouse close to the city ___.",
          answer: "centre",
          accept: ["center"],
          explanation: "It is 'close to the city centre'.",
          tag: "Fill transcript",
        },
        {
          kind: "true-false",
          question: "Arif is excited to try the local food.",
          answer: true,
          explanation: "He says he 'can't wait to … try the local food'.",
          tag: "Listening comprehension",
        },
      ],
    },
  },

  // ---------------- ADVANCED ----------------
  {
    slug: "the-rise-of-ai",
    title: "The Rise of Artificial Intelligence",
    level: "advanced",
    category: "technology",
    topic: "Technology and society",
    summary:
      "An article on how AI is changing daily life, with academic vocabulary.",
    estimatedMinutes: 8,
    xpReward: 40,
    content: {
      objectives: [
        "Read and analyse an informative article",
        "Learn academic and technology vocabulary",
        "Recognise the passive voice in formal writing",
      ],
      transcript: [
        {
          text: "Artificial intelligence, once confined to science fiction, is now woven into everyday life.",
          translation:
            "Kecerdasan buatan, yang dulu hanya ada dalam fiksi ilmiah, kini menyatu dalam kehidupan sehari-hari.",
          para: 0,
        },
        {
          text: "From voice assistants to recommendation systems, algorithms quietly shape the choices we make.",
          translation:
            "Dari asisten suara hingga sistem rekomendasi, algoritma diam-diam membentuk pilihan yang kita buat.",
          para: 0,
        },
        {
          text: "Supporters argue that these tools boost productivity and expand access to knowledge.",
          translation:
            "Para pendukung berpendapat bahwa alat-alat ini meningkatkan produktivitas dan memperluas akses ke pengetahuan.",
          para: 1,
        },
        {
          text: "Critics, however, warn that jobs may be displaced and privacy may be compromised.",
          translation:
            "Namun, para pengkritik memperingatkan bahwa pekerjaan bisa tergeser dan privasi bisa terancam.",
          para: 1,
        },
        {
          text: "As the technology matures, thoughtful regulation will be required to balance innovation and safety.",
          translation:
            "Seiring teknologi ini matang, regulasi yang bijaksana akan diperlukan untuk menyeimbangkan inovasi dan keamanan.",
          para: 2,
        },
        {
          text: "Ultimately, the impact of AI will depend on how responsibly it is used.",
          translation:
            "Pada akhirnya, dampak AI akan bergantung pada seberapa bertanggung jawab teknologi itu digunakan.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "confined",
          phonetic: "/kənˈfaɪnd/",
          pos: "verb",
          meaning: "terbatas / terkurung",
          definition: "kept within limits",
          example: "It was once confined to science fiction.",
          exampleTranslation: "Dulu ia terbatas pada fiksi ilmiah.",
        },
        {
          word: "algorithms",
          phonetic: "/ˈæl.ɡə.rɪ.ðəmz/",
          pos: "noun",
          meaning: "algoritma",
          definition: "sets of rules a computer follows to solve problems",
          example: "Algorithms shape our choices.",
          exampleTranslation: "Algoritma membentuk pilihan kita.",
        },
        {
          word: "productivity",
          phonetic: "/ˌproʊ.dʌkˈtɪv.ə.ti/",
          pos: "noun",
          meaning: "produktivitas",
          definition: "how much useful work is done",
          example: "The tools boost productivity.",
          exampleTranslation: "Alat-alat itu meningkatkan produktivitas.",
        },
        {
          word: "displaced",
          phonetic: "/dɪˈspleɪst/",
          pos: "verb",
          meaning: "tergeser / tergantikan",
          definition: "forced out of a usual place or role",
          example: "Some jobs may be displaced.",
          exampleTranslation: "Beberapa pekerjaan bisa tergeser.",
        },
        {
          word: "regulation",
          phonetic: "/ˌreɡ.jəˈleɪ.ʃən/",
          pos: "noun",
          meaning: "regulasi / peraturan",
          definition: "official rules that control something",
          example: "Thoughtful regulation is required.",
          exampleTranslation: "Regulasi yang bijaksana diperlukan.",
        },
      ],
      grammar: [
        {
          phrase: "is now woven into",
          name: "Passive voice (present)",
          rule: "Form the passive with 'be' + past participle when the action matters more than the doer.",
          formula: "Subject + is/are + past participle (+ by …)",
          explanation:
            "'Is woven' focuses on AI being integrated, not on who integrated it.",
          example: "AI is woven into everyday life.",
          related: ["passive-voice"],
        },
        {
          phrase: "will be required",
          name: "Passive with modal verbs",
          rule: "Use modal + be + past participle for passive predictions or obligations.",
          formula: "Subject + modal + be + past participle",
          explanation:
            "'Will be required' predicts a future need without naming who requires it.",
          example: "Regulation will be required.",
        },
      ],
      keyExpressions: [
        {
          expression: "Supporters argue that …",
          meaning: "Para pendukung berpendapat bahwa …",
          usage: "Introduce one side of an argument in academic writing.",
        },
        {
          expression: "Ultimately, …",
          meaning: "Pada akhirnya, …",
          usage: "Signal a final, summarising point.",
        },
      ],
      readingNotes: [
        "The article is balanced: it presents supporters and critics before a conclusion.",
        "Formal writing often uses the passive voice to sound objective.",
      ],
      listeningNotes: [
        "Academic narration is slower and clearer; use pauses to process ideas.",
        "Signal words like 'however' and 'ultimately' mark shifts in the argument.",
      ],
      summary: [
        "The passive voice highlights the action, not the doer.",
        "Signal words organise arguments (Supporters…, Critics…, Ultimately…).",
        "Balanced articles present multiple viewpoints before concluding.",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "What is the writer's overall stance on AI?",
          options: [
            "Completely negative",
            "Completely positive",
            "Balanced, depending on responsible use",
            "Uninterested",
          ],
          answer: 2,
          explanation:
            "The conclusion says the impact 'will depend on how responsibly it is used'.",
          tag: "Inference",
        },
        {
          kind: "mcq",
          question: "According to critics, what is a risk of AI?",
          options: [
            "Higher productivity",
            "More access to knowledge",
            "Jobs being displaced",
            "Cheaper devices",
          ],
          answer: 2,
          explanation: "Critics warn that 'jobs may be displaced'.",
          tag: "Find information",
        },
        {
          kind: "true-false",
          question: "The article says AI has always been part of everyday life.",
          answer: false,
          explanation:
            "It says AI was 'once confined to science fiction', so it was not always present.",
          tag: "Inference",
        },
        {
          kind: "short-answer",
          question: "Which word means 'official rules that control something'? (one word)",
          answer: "regulation",
          explanation: "'Regulation' matches that definition.",
          tag: "Vocabulary meaning",
        },
        {
          kind: "mcq",
          question: "Which phrase is in the passive voice?",
          options: [
            "Supporters argue that…",
            "Algorithms shape our choices.",
            "Regulation will be required.",
            "AI matures.",
          ],
          answer: 2,
          explanation: "'Will be required' = modal + be + past participle (passive).",
          tag: "Grammar identification",
        },
      ],
      listeningQuiz: [
        {
          kind: "fill-blank",
          question: "From voice assistants to recommendation systems, ___ quietly shape our choices.",
          answer: "algorithms",
          explanation: "The transcript names 'algorithms'.",
          tag: "Fill transcript",
        },
        {
          kind: "mcq",
          question: "Which signal word introduces the critics' view?",
          options: ["Supporters", "However", "Ultimately", "From"],
          answer: 1,
          explanation: "'Critics, however, warn…' introduces the opposing view.",
          tag: "Listening comprehension",
        },
        {
          kind: "true-false",
          question: "The speaker concludes that responsible use matters.",
          answer: true,
          explanation:
            "The final line stresses responsible use as the deciding factor.",
          tag: "Listening comprehension",
        },
      ],
    },
  },
  {
    slug: "protecting-our-oceans",
    title: "Protecting Our Oceans",
    level: "advanced",
    category: "environment",
    topic: "Environment and conservation",
    summary:
      "A persuasive text about ocean pollution and what we can do about it.",
    estimatedMinutes: 8,
    xpReward: 40,
    content: {
      objectives: [
        "Understand a persuasive environmental text",
        "Learn conservation vocabulary",
        "Recognise conditional sentences (first conditional)",
      ],
      transcript: [
        {
          text: "Every year, millions of tonnes of plastic end up in our oceans, threatening marine life.",
          translation:
            "Setiap tahun, jutaan ton plastik berakhir di lautan kita, mengancam kehidupan laut.",
          para: 0,
        },
        {
          text: "Fish, turtles, and seabirds mistake tiny fragments for food, with devastating consequences.",
          translation:
            "Ikan, penyu, dan burung laut salah mengira serpihan kecil sebagai makanan, dengan konsekuensi yang menghancurkan.",
          para: 0,
        },
        {
          text: "If we continue to ignore the problem, entire ecosystems will collapse.",
          translation:
            "Jika kita terus mengabaikan masalah ini, seluruh ekosistem akan runtuh.",
          para: 1,
        },
        {
          text: "However, small changes in daily habits can make a remarkable difference.",
          translation:
            "Namun, perubahan kecil dalam kebiasaan sehari-hari dapat membuat perbedaan yang luar biasa.",
          para: 1,
        },
        {
          text: "By refusing single-use plastics and supporting clean-up efforts, communities protect their shores.",
          translation:
            "Dengan menolak plastik sekali pakai dan mendukung upaya pembersihan, masyarakat melindungi pantai mereka.",
          para: 2,
        },
        {
          text: "The ocean sustains us all; therefore, protecting it is a shared responsibility.",
          translation:
            "Lautan menopang kita semua; oleh karena itu, melindunginya adalah tanggung jawab bersama.",
          para: 2,
        },
      ],
      vocab: [
        {
          word: "threatening",
          phonetic: "/ˈθret.ən.ɪŋ/",
          pos: "verb",
          meaning: "mengancam",
          definition: "likely to cause harm or danger",
          example: "Plastic is threatening marine life.",
          exampleTranslation: "Plastik mengancam kehidupan laut.",
        },
        {
          word: "fragments",
          phonetic: "/ˈfræɡ.mənts/",
          pos: "noun",
          meaning: "serpihan / pecahan",
          definition: "small broken pieces of something",
          example: "Birds eat tiny fragments of plastic.",
          exampleTranslation: "Burung memakan serpihan plastik kecil.",
        },
        {
          word: "ecosystems",
          phonetic: "/ˈiː.koʊ.sɪs.təmz/",
          pos: "noun",
          meaning: "ekosistem",
          definition: "communities of living things and their environment",
          example: "Ecosystems can collapse.",
          exampleTranslation: "Ekosistem bisa runtuh.",
        },
        {
          word: "remarkable",
          phonetic: "/rɪˈmɑːr.kə.bəl/",
          pos: "adjective",
          meaning: "luar biasa",
          definition: "unusually good or noticeable",
          example: "It made a remarkable difference.",
          exampleTranslation: "Itu membuat perbedaan yang luar biasa.",
        },
        {
          word: "sustains",
          phonetic: "/səˈsteɪnz/",
          pos: "verb",
          meaning: "menopang / menghidupi",
          definition: "keeps something alive or going",
          example: "The ocean sustains us all.",
          exampleTranslation: "Lautan menopang kita semua.",
        },
      ],
      grammar: [
        {
          phrase: "If we continue to ignore the problem, entire ecosystems will collapse",
          name: "First conditional",
          rule: "Use 'if' + present simple, then 'will' + base verb for likely future results.",
          formula: "If + present simple, subject + will + base verb",
          explanation:
            "The first conditional links a possible condition with its probable result.",
          example: "If we ignore it, ecosystems will collapse.",
          related: ["conditionals"],
        },
        {
          phrase: "By refusing single-use plastics",
          name: "'By' + -ing (method)",
          rule: "Use 'by' + verb-ing to explain how something is done.",
          formula: "By + verb-ing …",
          explanation:
            "'By refusing…' tells us the method communities use to protect shores.",
          example: "By recycling, we reduce waste.",
        },
      ],
      keyExpressions: [
        {
          expression: "make a difference",
          meaning: "membuat perbedaan",
          usage: "Say that an action has a positive effect.",
        },
        {
          expression: "shared responsibility",
          meaning: "tanggung jawab bersama",
          usage: "Emphasise that everyone is responsible.",
        },
      ],
      readingNotes: [
        "Persuasive texts use strong words: 'devastating', 'remarkable', 'collapse'.",
        "'However' and 'therefore' connect problem, hope, and conclusion.",
      ],
      listeningNotes: [
        "Notice the emphasis on emotive words to persuade the listener.",
        "The final sentence uses a semicolon pause before 'therefore' — a slight break.",
      ],
      summary: [
        "The first conditional predicts likely future results of a condition.",
        "'By + -ing' explains the method of doing something.",
        "Persuasive writing combines facts, strong words, and a call to action.",
      ],
      readingQuiz: [
        {
          kind: "mcq",
          question: "What is the main purpose of this text?",
          options: [
            "To entertain with a story",
            "To persuade people to protect oceans",
            "To sell plastic products",
            "To describe a holiday",
          ],
          answer: 1,
          explanation: "It urges readers to act, so its purpose is persuasion.",
          tag: "Inference",
        },
        {
          kind: "true-false",
          question: "The text says individual habits cannot help the oceans.",
          answer: false,
          explanation:
            "It says 'small changes in daily habits can make a remarkable difference'.",
          tag: "Inference",
        },
        {
          kind: "fill-blank",
          question: "The ocean ___ us all; therefore, protecting it is a shared responsibility.",
          answer: "sustains",
          explanation: "The final sentence uses 'sustains'.",
          tag: "Find information",
        },
        {
          kind: "mcq",
          question: "Which sentence is a first conditional?",
          options: [
            "The ocean sustains us all.",
            "If we continue to ignore the problem, entire ecosystems will collapse.",
            "Plastic ends up in our oceans.",
            "Communities protect their shores.",
          ],
          answer: 1,
          explanation: "It follows 'If + present, … will + base verb'.",
          tag: "Grammar identification",
        },
        {
          kind: "short-answer",
          question: "Which word means 'small broken pieces'? (one word)",
          answer: "fragments",
          explanation: "'Fragments' matches that meaning.",
          tag: "Vocabulary meaning",
        },
      ],
      listeningQuiz: [
        {
          kind: "mcq",
          question: "What do fish and turtles mistake plastic for?",
          options: ["Rocks", "Food", "Sand", "Coral"],
          answer: 1,
          explanation: "They 'mistake tiny fragments for food'.",
          tag: "Listening comprehension",
        },
        {
          kind: "fill-blank",
          question: "By refusing single-use plastics and supporting clean-up efforts, communities protect their ___.",
          answer: "shores",
          explanation: "The transcript says 'protect their shores'.",
          tag: "Fill transcript",
        },
        {
          kind: "true-false",
          question: "The speaker calls ocean protection a shared responsibility.",
          answer: true,
          explanation: "The final line states it is 'a shared responsibility'.",
          tag: "Listening comprehension",
        },
      ],
    },
  },
];

// =====================================================================
// Derived helpers
// =====================================================================

export const READING_LESSON_ORDER: string[] = READING_LESSONS.map((l) => l.slug);

const LESSON_MAP = new Map(READING_LESSONS.map((l) => [l.slug, l]));

export function getReadingLesson(slug: string): ReadingLesson | undefined {
  return LESSON_MAP.get(slug);
}

export function lessonsForLevel(level: ReadingLevel): ReadingLesson[] {
  return READING_LESSONS.filter((l) => l.level === level);
}

export function usedCategories(): ReadingCategory[] {
  const set = new Set(READING_LESSONS.map((l) => l.category));
  return READING_CATEGORIES.filter((c) => set.has(c));
}

export function nextReadingSlug(slug: string): string | undefined {
  const idx = READING_LESSON_ORDER.indexOf(slug);
  if (idx === -1 || idx === READING_LESSON_ORDER.length - 1) return undefined;
  return READING_LESSON_ORDER[idx + 1];
}

/** Total spoken words in a lesson — used for reading-time estimates. */
export function lessonWordCount(lesson: ReadingLesson): number {
  return lesson.content.transcript.reduce(
    (sum, line) => sum + line.text.trim().split(/\s+/).length,
    0,
  );
}
