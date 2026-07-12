import {
  Hand,
  UserRound,
  Coffee,
  GraduationCap,
  Briefcase,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
  PlaneTakeoff,
  BedDouble,
  ClipboardList,
  Presentation,
  Megaphone,
  Scale,
  BookOpenText,
  type LucideIcon,
} from "lucide-react";

/**
 * Speaking Lab — authored curriculum (content-as-code).
 *
 * This module is the canonical, version-controlled source of Speaking content.
 * Its shape maps 1:1 onto the `speaking_courses` table so a future admin CMS can
 * edit courses in the database without a UI rewrite:
 *   SpeakingCourse.content -> speaking_courses.content (jsonb)
 * Per-user state (progress, sessions, per-sentence records, daily challenges)
 * lives in the database. See src/lib/speaking.ts and speaking-actions.ts.
 */

export type SpeakingLevel = "beginner" | "intermediate" | "advanced";

export type SpeakingCategory =
  | "greetings"
  | "introducing-yourself"
  | "daily-conversation"
  | "school"
  | "business"
  | "travel"
  | "shopping"
  | "restaurant"
  | "airport"
  | "hotel"
  | "job-interview"
  | "presentation"
  | "public-speaking"
  | "debate"
  | "storytelling";

/**
 * Speaking modes. `repeat` and `read-aloud` are fully interactive today.
 * `conversation`, `picture`, and `storytelling` are architecture-ready: the
 * session still runs the authored practice sentences, and an AI partner will
 * be layered on later (see src/lib/speaking-ai.ts).
 */
export type SpeakingMode =
  | "repeat"
  | "read-aloud"
  | "conversation"
  | "picture"
  | "storytelling";

export interface SpeakingLine {
  speaker?: string;
  /** English sentence the learner will say. */
  text: string;
  /** Indonesian translation. */
  translation: string;
  phonetic?: string;
}

export interface SpeakingVocab {
  word: string;
  phonetic?: string;
  meaning: string;
  example: string;
}

export interface GrammarFocus {
  name: string;
  formula: string;
  explanation: string;
  example: string;
}

export interface PronunciationTip {
  sound: string;
  tip: string;
  example: string;
}

export interface SpeakingQuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface SpeakingCourseContent {
  objectives: string[];
  conversation: SpeakingLine[];
  vocab: SpeakingVocab[];
  grammarFocus: GrammarFocus[];
  pronunciationTips: PronunciationTip[];
  /** Sentences the speaking session iterates over. */
  practice: SpeakingLine[];
  /** A harder sentence / prompt for the "Speaking Challenge" step. */
  challenge: string;
  quiz: SpeakingQuizItem[];
}

export interface SpeakingCourse {
  slug: string;
  title: string;
  level: SpeakingLevel;
  category: SpeakingCategory;
  topic: string;
  summary: string;
  estimatedMinutes: number;
  xpReward: number;
  mode: SpeakingMode;
  audioUrl?: string;
  content: SpeakingCourseContent;
}

export const SPEAKING_LEVELS: SpeakingLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const LEVEL_META: Record<
  SpeakingLevel,
  { label: string; tint: string }
> = {
  beginner: { label: "Beginner", tint: "bg-primary/10 text-primary" },
  intermediate: { label: "Intermediate", tint: "bg-coral/10 text-coral" },
  advanced: { label: "Advanced", tint: "bg-gold/15 text-gold-foreground" },
};

export const CATEGORY_META: Record<
  SpeakingCategory,
  { label: string; icon: LucideIcon }
> = {
  greetings: { label: "Greetings", icon: Hand },
  "introducing-yourself": { label: "Introducing Yourself", icon: UserRound },
  "daily-conversation": { label: "Daily Conversation", icon: Coffee },
  school: { label: "School", icon: GraduationCap },
  business: { label: "Business", icon: Briefcase },
  travel: { label: "Travel", icon: Plane },
  shopping: { label: "Shopping", icon: ShoppingBag },
  restaurant: { label: "Restaurant", icon: UtensilsCrossed },
  airport: { label: "Airport", icon: PlaneTakeoff },
  hotel: { label: "Hotel", icon: BedDouble },
  "job-interview": { label: "Job Interview", icon: ClipboardList },
  presentation: { label: "Presentation", icon: Presentation },
  "public-speaking": { label: "Public Speaking", icon: Megaphone },
  debate: { label: "Debate", icon: Scale },
  storytelling: { label: "Storytelling", icon: BookOpenText },
};

export const SPEAKING_CATEGORIES = Object.keys(
  CATEGORY_META,
) as SpeakingCategory[];

export const MODE_META: Record<
  SpeakingMode,
  { label: string; description: string; available: boolean }
> = {
  repeat: {
    label: "Repeat After Me",
    description: "Listen to the native model, then say the sentence back.",
    available: true,
  },
  "read-aloud": {
    label: "Read Aloud",
    description: "Read each line clearly and fluently at your own pace.",
    available: true,
  },
  conversation: {
    label: "Conversation Practice",
    description: "Practise your lines now — an AI partner is coming soon.",
    available: false,
  },
  picture: {
    label: "Picture Description",
    description: "Describe scenes out loud — AI scenes coming soon.",
    available: false,
  },
  storytelling: {
    label: "Storytelling",
    description: "Tell a story in your own words — AI coaching coming soon.",
    available: false,
  },
};

// =====================================================================
// Curriculum
// =====================================================================

export const SPEAKING_COURSES: SpeakingCourse[] = [
  // ------------------------------ BEGINNER ------------------------------
  {
    slug: "everyday-greetings",
    title: "Everyday Greetings",
    level: "beginner",
    category: "greetings",
    topic: "Saying hello and goodbye",
    summary: "Greet people warmly and confidently at any time of day.",
    estimatedMinutes: 4,
    xpReward: 20,
    mode: "repeat",
    content: {
      objectives: [
        "Greet people at different times of day",
        "Respond to 'How are you?' naturally",
        "Say goodbye politely",
      ],
      conversation: [
        { speaker: "Sari", text: "Good morning! How are you today?", translation: "Selamat pagi! Apa kabar hari ini?" },
        { speaker: "Andi", text: "I am fine, thank you. And you?", translation: "Saya baik, terima kasih. Kamu?" },
        { speaker: "Sari", text: "I am great. Have a nice day!", translation: "Saya sangat baik. Semoga harimu menyenangkan!" },
        { speaker: "Andi", text: "Thank you. See you later!", translation: "Terima kasih. Sampai jumpa nanti!" },
      ],
      vocab: [
        { word: "morning", phonetic: "/ˈmɔːr.nɪŋ/", meaning: "pagi", example: "Good morning, everyone." },
        { word: "fine", phonetic: "/faɪn/", meaning: "baik", example: "I am fine, thank you." },
        { word: "goodbye", phonetic: "/ɡʊdˈbaɪ/", meaning: "selamat tinggal", example: "Goodbye, see you tomorrow." },
      ],
      grammarFocus: [
        { name: "Simple present with 'to be'", formula: "I + am + adjective", explanation: "Use 'am' with 'I' to describe how you feel.", example: "I am fine." },
      ],
      pronunciationTips: [
        { sound: "/ɔː/", tip: "Round your lips for the long 'or' sound in 'morning'.", example: "morning" },
        { sound: "th /ð/", tip: "Put your tongue between your teeth for 'thank you'.", example: "thank you" },
        { sound: "linking", tip: "Link 'see you' smoothly: 'see-yuh'.", example: "See you later" },
      ],
      practice: [
        { text: "Good morning! How are you today?", translation: "Selamat pagi! Apa kabar hari ini?" },
        { text: "I am fine, thank you.", translation: "Saya baik, terima kasih." },
        { text: "Have a nice day!", translation: "Semoga harimu menyenangkan!" },
        { text: "See you later!", translation: "Sampai jumpa nanti!" },
      ],
      challenge: "Good afternoon! It is really nice to see you again today.",
      quiz: [
        { question: "Which greeting is best in the early day?", options: ["Good night", "Good morning", "Goodbye"], answer: 1, explanation: "'Good morning' is used early in the day." },
        { question: "How do you reply to 'How are you?'", options: ["I am fine, thank you.", "Good night.", "You're welcome."], answer: 0, explanation: "A natural reply is 'I am fine, thank you.'" },
        { question: "Which one means 'selamat tinggal'?", options: ["Hello", "Goodbye", "Please"], answer: 1, explanation: "'Goodbye' means 'selamat tinggal'." },
      ],
    },
  },
  {
    slug: "introduce-yourself",
    title: "Introduce Yourself",
    level: "beginner",
    category: "introducing-yourself",
    topic: "Talking about who you are",
    summary: "Share your name, origin, and what you do with confidence.",
    estimatedMinutes: 5,
    xpReward: 20,
    mode: "repeat",
    content: {
      objectives: [
        "Say your name and where you are from",
        "Talk about your job or studies",
        "Ask someone about themselves",
      ],
      conversation: [
        { speaker: "Maya", text: "Hello, my name is Maya. What is your name?", translation: "Halo, nama saya Maya. Siapa namamu?" },
        { speaker: "Budi", text: "Hi Maya, I am Budi. I am from Bandung.", translation: "Hai Maya, saya Budi. Saya dari Bandung." },
        { speaker: "Maya", text: "Nice to meet you. What do you do?", translation: "Senang berkenalan. Apa pekerjaanmu?" },
        { speaker: "Budi", text: "I am a student. I study English.", translation: "Saya seorang pelajar. Saya belajar bahasa Inggris." },
      ],
      vocab: [
        { word: "name", phonetic: "/neɪm/", meaning: "nama", example: "My name is Maya." },
        { word: "from", phonetic: "/frɒm/", meaning: "dari", example: "I am from Jakarta." },
        { word: "student", phonetic: "/ˈstuː.dənt/", meaning: "pelajar", example: "I am a student." },
      ],
      grammarFocus: [
        { name: "Possessive 'my'", formula: "My + noun", explanation: "Use 'my' to show something belongs to you.", example: "My name is Maya." },
        { name: "'to be' for identity", formula: "I + am + a + job", explanation: "Use 'am a' to name your role.", example: "I am a student." },
      ],
      pronunciationTips: [
        { sound: "/eɪ/", tip: "Say 'name' with a clear 'ay' glide.", example: "name" },
        { sound: "/ə/", tip: "The 'a' in 'a student' is a soft 'uh'.", example: "a student" },
        { sound: "stress", tip: "Stress the first syllable of 'student'.", example: "STU-dent" },
      ],
      practice: [
        { text: "Hello, my name is Maya.", translation: "Halo, nama saya Maya." },
        { text: "I am from Bandung.", translation: "Saya dari Bandung." },
        { text: "Nice to meet you.", translation: "Senang berkenalan." },
        { text: "I am a student and I study English.", translation: "Saya pelajar dan saya belajar bahasa Inggris." },
      ],
      challenge: "Hello everyone, my name is Maya and I am learning to speak English every day.",
      quiz: [
        { question: "How do you tell your name?", options: ["My name is…", "I from…", "You are…"], answer: 0, explanation: "Use 'My name is…' to introduce yourself." },
        { question: "Which shows where you live?", options: ["I am a student", "I am from Bandung", "Nice to meet you"], answer: 1, explanation: "'I am from …' tells your origin." },
        { question: "Complete: 'I am ___ student.'", options: ["a", "the", "an"], answer: 0, explanation: "Use 'a' before 'student'." },
      ],
    },
  },
  {
    slug: "small-talk-daily",
    title: "Daily Small Talk",
    level: "beginner",
    category: "daily-conversation",
    topic: "Casual everyday chat",
    summary: "Make easy small talk about the day, weather, and plans.",
    estimatedMinutes: 5,
    xpReward: 25,
    mode: "repeat",
    content: {
      objectives: [
        "Start a friendly conversation",
        "Talk about the weather and your day",
        "React politely to what others say",
      ],
      conversation: [
        { speaker: "Rina", text: "Hi! How was your day?", translation: "Hai! Bagaimana harimu?" },
        { speaker: "Tom", text: "It was busy but good. How about yours?", translation: "Sibuk tapi menyenangkan. Bagaimana denganmu?" },
        { speaker: "Rina", text: "Pretty relaxing. The weather is lovely today.", translation: "Cukup santai. Cuacanya bagus hari ini." },
        { speaker: "Tom", text: "Yes, it is. Do you have plans this weekend?", translation: "Ya, benar. Apakah kamu ada rencana akhir pekan ini?" },
      ],
      vocab: [
        { word: "busy", phonetic: "/ˈbɪz.i/", meaning: "sibuk", example: "My day was busy." },
        { word: "weather", phonetic: "/ˈweð.ər/", meaning: "cuaca", example: "The weather is nice." },
        { word: "weekend", phonetic: "/ˈwiːk.end/", meaning: "akhir pekan", example: "Plans this weekend?" },
      ],
      grammarFocus: [
        { name: "Past 'to be'", formula: "It + was + adjective", explanation: "Use 'was' to talk about the past.", example: "It was busy." },
      ],
      pronunciationTips: [
        { sound: "/ð/", tip: "Soft 'th' with a buzz in 'weather'.", example: "weather" },
        { sound: "/z/", tip: "'busy' ends with a 'z' sound.", example: "busy" },
        { sound: "intonation", tip: "Raise your pitch at the end of a yes/no question.", example: "Do you have plans?" },
      ],
      practice: [
        { text: "How was your day?", translation: "Bagaimana harimu?" },
        { text: "It was busy but good.", translation: "Sibuk tapi menyenangkan." },
        { text: "The weather is lovely today.", translation: "Cuacanya bagus hari ini." },
        { text: "Do you have plans this weekend?", translation: "Apakah kamu ada rencana akhir pekan ini?" },
      ],
      challenge: "It was a really long day, but the weather made my evening walk wonderful.",
      quiz: [
        { question: "Which asks about the past?", options: ["How is your day?", "How was your day?", "How are you?"], answer: 1, explanation: "'was' makes it past tense." },
        { question: "'cuaca' in English is…", options: ["weekend", "weather", "busy"], answer: 1, explanation: "'weather' means 'cuaca'." },
        { question: "A good reply to 'How about yours?'", options: ["Pretty relaxing.", "You're welcome.", "Goodbye."], answer: 0, explanation: "Answer with how your day was." },
      ],
    },
  },
  {
    slug: "school-conversation",
    title: "At School",
    level: "beginner",
    category: "school",
    topic: "Talking in class",
    summary: "Ask questions and talk about lessons and homework at school.",
    estimatedMinutes: 5,
    xpReward: 25,
    mode: "repeat",
    content: {
      objectives: [
        "Ask a teacher for help",
        "Talk about subjects and homework",
        "Use polite classroom phrases",
      ],
      conversation: [
        { speaker: "Student", text: "Excuse me, could you repeat that, please?", translation: "Permisi, bisakah Anda mengulanginya?" },
        { speaker: "Teacher", text: "Of course. Today we study grammar.", translation: "Tentu. Hari ini kita belajar tata bahasa." },
        { speaker: "Student", text: "Do we have homework tonight?", translation: "Apakah kita ada PR malam ini?" },
        { speaker: "Teacher", text: "Yes, please finish page ten.", translation: "Ya, tolong selesaikan halaman sepuluh." },
      ],
      vocab: [
        { word: "homework", phonetic: "/ˈhoʊm.wɝːk/", meaning: "pekerjaan rumah", example: "I do my homework." },
        { word: "grammar", phonetic: "/ˈɡræm.ər/", meaning: "tata bahasa", example: "We study grammar." },
        { word: "repeat", phonetic: "/rɪˈpiːt/", meaning: "mengulangi", example: "Please repeat that." },
      ],
      grammarFocus: [
        { name: "Polite requests with 'could'", formula: "Could you + verb + please?", explanation: "'Could you…' is a polite way to ask.", example: "Could you repeat that, please?" },
      ],
      pronunciationTips: [
        { sound: "/juː/", tip: "'you' is a clear 'yoo'.", example: "could you" },
        { sound: "/r/", tip: "Curl your tongue slightly for 'repeat'.", example: "repeat" },
        { sound: "stress", tip: "Stress the second syllable of 'repeat'.", example: "re-PEAT" },
      ],
      practice: [
        { text: "Excuse me, could you repeat that, please?", translation: "Permisi, bisakah Anda mengulanginya?" },
        { text: "Do we have homework tonight?", translation: "Apakah kita ada PR malam ini?" },
        { text: "I do not understand this question.", translation: "Saya tidak mengerti pertanyaan ini." },
        { text: "Thank you for your help.", translation: "Terima kasih atas bantuannya." },
      ],
      challenge: "Excuse me, could you please explain this grammar rule one more time?",
      quiz: [
        { question: "Polite way to ask for a repeat?", options: ["Repeat!", "Could you repeat that, please?", "Say again now."], answer: 1, explanation: "'Could you… please?' is polite." },
        { question: "'pekerjaan rumah' is…", options: ["grammar", "homework", "repeat"], answer: 1, explanation: "'homework' means 'pekerjaan rumah'." },
        { question: "Which is polite?", options: ["Give me the book.", "Could you pass the book, please?", "Book now."], answer: 1, explanation: "Requests with 'could…please' are polite." },
      ],
    },
  },
  // ---------------------------- INTERMEDIATE ----------------------------
  {
    slug: "shopping-for-clothes",
    title: "Shopping for Clothes",
    level: "intermediate",
    category: "shopping",
    topic: "Buying items in a store",
    summary: "Ask about sizes, prices, and pay confidently while shopping.",
    estimatedMinutes: 6,
    xpReward: 30,
    mode: "repeat",
    content: {
      objectives: [
        "Ask about sizes and colours",
        "Ask for the price and discounts",
        "Complete a purchase politely",
      ],
      conversation: [
        { speaker: "Clerk", text: "Hi, can I help you find anything?", translation: "Hai, ada yang bisa saya bantu?" },
        { speaker: "You", text: "Yes, do you have this shirt in a larger size?", translation: "Ya, apakah ada kemeja ini ukuran lebih besar?" },
        { speaker: "Clerk", text: "Let me check. Here is a large one.", translation: "Saya periksa dulu. Ini yang ukuran besar." },
        { speaker: "You", text: "Great. How much does it cost?", translation: "Bagus. Berapa harganya?" },
      ],
      vocab: [
        { word: "size", phonetic: "/saɪz/", meaning: "ukuran", example: "What size do you need?" },
        { word: "discount", phonetic: "/ˈdɪs.kaʊnt/", meaning: "diskon", example: "Is there a discount?" },
        { word: "receipt", phonetic: "/rɪˈsiːt/", meaning: "struk", example: "Can I have the receipt?" },
      ],
      grammarFocus: [
        { name: "Questions with 'do'", formula: "Do + you + have + noun?", explanation: "Use 'do you have' to ask about availability.", example: "Do you have this in blue?" },
      ],
      pronunciationTips: [
        { sound: "silent p", tip: "The 'p' in 'receipt' is silent.", example: "receipt" },
        { sound: "/aɪ/", tip: "'size' has a clear 'eye' sound.", example: "size" },
        { sound: "linking", tip: "Link 'how much': 'how-much'.", example: "How much is it?" },
      ],
      practice: [
        { text: "Do you have this shirt in a larger size?", translation: "Apakah ada kemeja ini ukuran lebih besar?" },
        { text: "How much does it cost?", translation: "Berapa harganya?" },
        { text: "Is there a discount today?", translation: "Apakah ada diskon hari ini?" },
        { text: "Can I pay by card?", translation: "Bisakah saya bayar dengan kartu?" },
      ],
      challenge: "Excuse me, do you have this jacket in a medium size and a different colour?",
      quiz: [
        { question: "Ask about the price:", options: ["How much does it cost?", "What is your name?", "Where are you from?"], answer: 0, explanation: "'How much does it cost?' asks the price." },
        { question: "'diskon' in English:", options: ["receipt", "discount", "size"], answer: 1, explanation: "'discount' means 'diskon'." },
        { question: "Which letter is silent in 'receipt'?", options: ["r", "p", "t"], answer: 1, explanation: "The 'p' is silent." },
      ],
    },
  },
  {
    slug: "ordering-at-a-restaurant",
    title: "Ordering at a Restaurant",
    level: "intermediate",
    category: "restaurant",
    topic: "Eating out",
    summary: "Order food, ask about the menu, and handle the bill smoothly.",
    estimatedMinutes: 6,
    xpReward: 30,
    mode: "repeat",
    content: {
      objectives: [
        "Order food and drinks politely",
        "Ask about ingredients",
        "Ask for the bill",
      ],
      conversation: [
        { speaker: "Waiter", text: "Good evening. Are you ready to order?", translation: "Selamat malam. Sudah siap memesan?" },
        { speaker: "You", text: "Yes, I would like the grilled chicken, please.", translation: "Ya, saya mau ayam bakar." },
        { speaker: "Waiter", text: "Excellent choice. Anything to drink?", translation: "Pilihan bagus. Ada minuman?" },
        { speaker: "You", text: "Just water, thank you. Could I see the dessert menu?", translation: "Air putih saja. Bisa lihat menu pencuci mulut?" },
      ],
      vocab: [
        { word: "order", phonetic: "/ˈɔːr.dər/", meaning: "memesan", example: "I want to order now." },
        { word: "menu", phonetic: "/ˈmen.juː/", meaning: "daftar menu", example: "Can I see the menu?" },
        { word: "bill", phonetic: "/bɪl/", meaning: "tagihan", example: "Could I have the bill?" },
      ],
      grammarFocus: [
        { name: "Polite 'would like'", formula: "I would like + noun", explanation: "'I would like' is more polite than 'I want'.", example: "I would like the soup." },
      ],
      pronunciationTips: [
        { sound: "/wʊd/", tip: "'would' has a soft 'oo' and silent 'l'.", example: "I would like" },
        { sound: "/dʒ/", tip: "'menu' can sound like 'men-yoo'.", example: "menu" },
        { sound: "linking", tip: "Link 'could I': 'could-eye'.", example: "Could I see it?" },
      ],
      practice: [
        { text: "I would like the grilled chicken, please.", translation: "Saya mau ayam bakar." },
        { text: "Could I see the dessert menu?", translation: "Bisa lihat menu pencuci mulut?" },
        { text: "Does this dish contain nuts?", translation: "Apakah hidangan ini mengandung kacang?" },
        { text: "Could I have the bill, please?", translation: "Bisa minta tagihannya?" },
      ],
      challenge: "Excuse me, I would like the seafood pasta, but could you make it less spicy, please?",
      quiz: [
        { question: "Most polite way to order:", options: ["Give me chicken.", "I would like the chicken, please.", "Chicken now."], answer: 1, explanation: "'I would like… please' is polite." },
        { question: "'tagihan' is…", options: ["menu", "order", "bill"], answer: 2, explanation: "'bill' means 'tagihan'." },
        { question: "Ask about ingredients:", options: ["Does this contain nuts?", "How are you?", "Where is the exit?"], answer: 0, explanation: "This asks what's in the dish." },
      ],
    },
  },
  {
    slug: "asking-for-directions",
    title: "Travel: Asking for Directions",
    level: "intermediate",
    category: "travel",
    topic: "Finding your way",
    summary: "Ask for and understand directions while travelling.",
    estimatedMinutes: 6,
    xpReward: 30,
    mode: "repeat",
    content: {
      objectives: [
        "Ask where a place is",
        "Understand common directions",
        "Confirm you understood",
      ],
      conversation: [
        { speaker: "You", text: "Excuse me, how do I get to the train station?", translation: "Permisi, bagaimana cara ke stasiun kereta?" },
        { speaker: "Local", text: "Go straight, then turn left at the bank.", translation: "Jalan lurus, lalu belok kiri di bank." },
        { speaker: "You", text: "Is it far from here?", translation: "Apakah jauh dari sini?" },
        { speaker: "Local", text: "No, it is about a five-minute walk.", translation: "Tidak, sekitar lima menit jalan kaki." },
      ],
      vocab: [
        { word: "straight", phonetic: "/streɪt/", meaning: "lurus", example: "Go straight ahead." },
        { word: "left", phonetic: "/left/", meaning: "kiri", example: "Turn left." },
        { word: "far", phonetic: "/fɑːr/", meaning: "jauh", example: "Is it far?" },
      ],
      grammarFocus: [
        { name: "Imperatives for directions", formula: "Verb + place", explanation: "Directions use base verbs: go, turn, take.", example: "Turn left at the corner." },
      ],
      pronunciationTips: [
        { sound: "/str/", tip: "Blend 's-t-r' smoothly in 'straight'.", example: "straight" },
        { sound: "/ɑːr/", tip: "Open your mouth for 'far'.", example: "far" },
        { sound: "linking", tip: "Link 'how do I': 'how-doo-eye'.", example: "How do I get there?" },
      ],
      practice: [
        { text: "Excuse me, how do I get to the train station?", translation: "Permisi, bagaimana cara ke stasiun kereta?" },
        { text: "Is it far from here?", translation: "Apakah jauh dari sini?" },
        { text: "Could you say that again, please?", translation: "Bisa ulangi lagi?" },
        { text: "Thank you so much for your help.", translation: "Terima kasih banyak atas bantuannya." },
      ],
      challenge: "Excuse me, could you tell me the fastest way to the airport from here?",
      quiz: [
        { question: "Ask for directions:", options: ["How do I get to…?", "How much is it?", "What time is it?"], answer: 0, explanation: "'How do I get to…?' asks the way." },
        { question: "'kiri' means…", options: ["right", "left", "straight"], answer: 1, explanation: "'left' means 'kiri'." },
        { question: "Confirm you understood:", options: ["Could you say that again?", "Goodbye.", "I am fine."], answer: 0, explanation: "Ask them to repeat to confirm." },
      ],
    },
  },
  {
    slug: "at-the-airport",
    title: "At the Airport",
    level: "intermediate",
    category: "airport",
    topic: "Check-in and boarding",
    summary: "Check in, pass security, and find your gate in English.",
    estimatedMinutes: 6,
    xpReward: 30,
    mode: "repeat",
    content: {
      objectives: [
        "Check in for a flight",
        "Answer security questions",
        "Ask about your gate and boarding time",
      ],
      conversation: [
        { speaker: "Agent", text: "May I see your passport and ticket, please?", translation: "Boleh lihat paspor dan tiket Anda?" },
        { speaker: "You", text: "Here you are. I have one bag to check in.", translation: "Ini dia. Saya punya satu tas untuk dititipkan." },
        { speaker: "Agent", text: "Thank you. Your gate is B12.", translation: "Terima kasih. Gerbang Anda B12." },
        { speaker: "You", text: "What time does boarding start?", translation: "Jam berapa boarding dimulai?" },
      ],
      vocab: [
        { word: "passport", phonetic: "/ˈpæs.pɔːrt/", meaning: "paspor", example: "Show your passport." },
        { word: "gate", phonetic: "/ɡeɪt/", meaning: "gerbang", example: "The gate is B12." },
        { word: "boarding", phonetic: "/ˈbɔːr.dɪŋ/", meaning: "naik pesawat", example: "Boarding starts soon." },
      ],
      grammarFocus: [
        { name: "Present simple questions", formula: "What time + does + subject + verb?", explanation: "Use 'does' for he/she/it in questions.", example: "What time does boarding start?" },
      ],
      pronunciationTips: [
        { sound: "/æ/", tip: "'passport' starts with a short flat 'a'.", example: "passport" },
        { sound: "/eɪ/", tip: "'gate' has the 'ay' glide.", example: "gate" },
        { sound: "linking", tip: "Link 'here you are': 'here-yuh-are'.", example: "Here you are." },
      ],
      practice: [
        { text: "Here is my passport and ticket.", translation: "Ini paspor dan tiket saya." },
        { text: "I have one bag to check in.", translation: "Saya punya satu tas untuk dititipkan." },
        { text: "What time does boarding start?", translation: "Jam berapa boarding dimulai?" },
        { text: "Where is the departure gate?", translation: "Di mana gerbang keberangkatan?" },
      ],
      challenge: "Excuse me, I think I am at the wrong gate — where does flight GA204 board?",
      quiz: [
        { question: "What do you show at check-in?", options: ["passport and ticket", "menu", "receipt"], answer: 0, explanation: "You show your passport and ticket." },
        { question: "'gerbang' is…", options: ["boarding", "gate", "passport"], answer: 1, explanation: "'gate' means 'gerbang'." },
        { question: "Ask about boarding time:", options: ["What time does boarding start?", "How much is it?", "Where are you from?"], answer: 0, explanation: "This asks when boarding begins." },
      ],
    },
  },
  {
    slug: "hotel-check-in",
    title: "Hotel Check-in",
    level: "intermediate",
    category: "hotel",
    topic: "Staying at a hotel",
    summary: "Check in, ask about facilities, and request help at a hotel.",
    estimatedMinutes: 6,
    xpReward: 30,
    mode: "repeat",
    content: {
      objectives: [
        "Check in with a reservation",
        "Ask about hotel facilities",
        "Make a polite request",
      ],
      conversation: [
        { speaker: "You", text: "Hi, I have a reservation under the name Putra.", translation: "Hai, saya punya reservasi atas nama Putra." },
        { speaker: "Staff", text: "Welcome. Here is your key card for room 402.", translation: "Selamat datang. Ini kartu kunci kamar 402." },
        { speaker: "You", text: "Thank you. What time is breakfast served?", translation: "Terima kasih. Jam berapa sarapan disajikan?" },
        { speaker: "Staff", text: "From seven to ten in the morning.", translation: "Dari jam tujuh sampai sepuluh pagi." },
      ],
      vocab: [
        { word: "reservation", phonetic: "/ˌrez.ərˈveɪ.ʃən/", meaning: "reservasi", example: "I have a reservation." },
        { word: "breakfast", phonetic: "/ˈbrek.fəst/", meaning: "sarapan", example: "Breakfast is free." },
        { word: "towel", phonetic: "/ˈtaʊ.əl/", meaning: "handuk", example: "Can I get more towels?" },
      ],
      grammarFocus: [
        { name: "Present passive (basic)", formula: "is + past participle", explanation: "Use 'is served' when the doer is not important.", example: "Breakfast is served at seven." },
      ],
      pronunciationTips: [
        { sound: "/ʃ/", tip: "'reservation' has a 'sh' sound: -va-shun.", example: "reservation" },
        { sound: "/aʊ/", tip: "'towel' glides 'ow-uhl'.", example: "towel" },
        { sound: "stress", tip: "Stress 'BREAK-fast' on the first syllable.", example: "breakfast" },
      ],
      practice: [
        { text: "I have a reservation under the name Putra.", translation: "Saya punya reservasi atas nama Putra." },
        { text: "What time is breakfast served?", translation: "Jam berapa sarapan disajikan?" },
        { text: "Could I have more towels, please?", translation: "Bisa minta handuk tambahan?" },
        { text: "Is there free wifi in the room?", translation: "Apakah ada wifi gratis di kamar?" },
      ],
      challenge: "Excuse me, could I have a late check-out and a quiet room away from the elevator?",
      quiz: [
        { question: "'reservasi' is…", options: ["breakfast", "reservation", "towel"], answer: 1, explanation: "'reservation' means 'reservasi'." },
        { question: "Ask about breakfast time:", options: ["What time is breakfast served?", "Where is the gate?", "How much is it?"], answer: 0, explanation: "This asks the breakfast time." },
        { question: "Polite request for towels:", options: ["Give towels.", "Could I have more towels, please?", "Towels now."], answer: 1, explanation: "'Could I have… please?' is polite." },
      ],
    },
  },
  // ------------------------------ ADVANCED ------------------------------
  {
    slug: "business-meeting",
    title: "Business Meeting",
    level: "advanced",
    category: "business",
    topic: "Speaking in meetings",
    summary: "Share ideas, agree, and disagree professionally in meetings.",
    estimatedMinutes: 7,
    xpReward: 40,
    mode: "repeat",
    content: {
      objectives: [
        "Open and lead a discussion point",
        "Agree and disagree politely",
        "Summarise action items",
      ],
      conversation: [
        { speaker: "Lead", text: "Let's begin. I'd like to review last quarter's results.", translation: "Mari mulai. Saya ingin meninjau hasil kuartal lalu." },
        { speaker: "You", text: "That sounds good. I have prepared a short summary.", translation: "Bagus. Saya sudah menyiapkan ringkasan singkat." },
        { speaker: "Lead", text: "Great. What are your recommendations?", translation: "Bagus. Apa rekomendasi Anda?" },
        { speaker: "You", text: "I suggest we focus on customer retention next quarter.", translation: "Saya sarankan kita fokus pada retensi pelanggan kuartal depan." },
      ],
      vocab: [
        { word: "quarter", phonetic: "/ˈkwɔːr.tər/", meaning: "kuartal", example: "Last quarter was strong." },
        { word: "recommend", phonetic: "/ˌrek.əˈmend/", meaning: "merekomendasikan", example: "I recommend this plan." },
        { word: "retention", phonetic: "/rɪˈten.ʃən/", meaning: "retensi", example: "Customer retention is key." },
      ],
      grammarFocus: [
        { name: "Suggestions with 'suggest'", formula: "I suggest (that) we + verb", explanation: "Use 'I suggest we…' to propose an idea professionally.", example: "I suggest we meet on Friday." },
      ],
      pronunciationTips: [
        { sound: "/kw/", tip: "'quarter' begins with 'kw'.", example: "quarter" },
        { sound: "/ʃ/", tip: "'retention' ends with 'shun'.", example: "retention" },
        { sound: "stress", tip: "Stress 'recomMEND' on the last syllable.", example: "recommend" },
      ],
      practice: [
        { text: "I have prepared a short summary.", translation: "Saya sudah menyiapkan ringkasan singkat." },
        { text: "I suggest we focus on customer retention.", translation: "Saya sarankan kita fokus pada retensi pelanggan." },
        { text: "I see your point, but I respectfully disagree.", translation: "Saya paham maksud Anda, tapi saya kurang setuju." },
        { text: "Let me summarise our action items.", translation: "Izinkan saya merangkum poin tindakan kita." },
      ],
      challenge: "Thank you all for your input; I suggest we finalise the budget and reconvene next Monday.",
      quiz: [
        { question: "Professional way to propose an idea:", options: ["I suggest we…", "Do this.", "Whatever."], answer: 0, explanation: "'I suggest we…' is professional." },
        { question: "'kuartal' is…", options: ["retention", "quarter", "summary"], answer: 1, explanation: "'quarter' means 'kuartal'." },
        { question: "Polite disagreement:", options: ["You're wrong.", "I respectfully disagree.", "No way."], answer: 1, explanation: "'I respectfully disagree' is polite." },
      ],
    },
  },
  {
    slug: "job-interview-answers",
    title: "Job Interview Answers",
    level: "advanced",
    category: "job-interview",
    topic: "Answering interview questions",
    summary: "Answer common interview questions with clarity and confidence.",
    estimatedMinutes: 7,
    xpReward: 40,
    mode: "repeat",
    content: {
      objectives: [
        "Introduce your background briefly",
        "Describe strengths with examples",
        "Ask a thoughtful question",
      ],
      conversation: [
        { speaker: "Interviewer", text: "Tell me a little about yourself.", translation: "Ceritakan sedikit tentang diri Anda." },
        { speaker: "You", text: "I am a marketing graduate with two years of experience.", translation: "Saya lulusan pemasaran dengan pengalaman dua tahun." },
        { speaker: "Interviewer", text: "What is your greatest strength?", translation: "Apa kelebihan terbesar Anda?" },
        { speaker: "You", text: "I am highly organised and I meet deadlines reliably.", translation: "Saya sangat terorganisir dan memenuhi tenggat dengan andal." },
      ],
      vocab: [
        { word: "experience", phonetic: "/ɪkˈspɪr.i.əns/", meaning: "pengalaman", example: "I have work experience." },
        { word: "strength", phonetic: "/streŋθ/", meaning: "kelebihan", example: "My strength is teamwork." },
        { word: "deadline", phonetic: "/ˈded.laɪn/", meaning: "tenggat", example: "I meet deadlines." },
      ],
      grammarFocus: [
        { name: "Present perfect for experience", formula: "have + past participle", explanation: "Use present perfect to describe experience up to now.", example: "I have worked in sales for three years." },
      ],
      pronunciationTips: [
        { sound: "/ŋθ/", tip: "'strength' ends with 'ng-th' — say it slowly.", example: "strength" },
        { sound: "/ɪk/", tip: "'experience' starts 'ik-SPEER'.", example: "experience" },
        { sound: "pace", tip: "Speak a little slower to sound confident.", example: "I am highly organised." },
      ],
      practice: [
        { text: "I am a marketing graduate with two years of experience.", translation: "Saya lulusan pemasaran dengan pengalaman dua tahun." },
        { text: "My greatest strength is staying organised under pressure.", translation: "Kelebihan terbesar saya adalah tetap terorganisir di bawah tekanan." },
        { text: "I am confident I can add value to your team.", translation: "Saya yakin bisa memberi nilai tambah bagi tim Anda." },
        { text: "Could you tell me more about the team I would join?", translation: "Bisa ceritakan lebih tentang tim yang akan saya masuki?" },
      ],
      challenge: "In my previous role, I led a small team and improved our delivery time by thirty percent.",
      quiz: [
        { question: "Describe experience with:", options: ["I have worked…", "I am work…", "I working…"], answer: 0, explanation: "Present perfect 'have worked' fits experience." },
        { question: "'tenggat' is…", options: ["strength", "deadline", "experience"], answer: 1, explanation: "'deadline' means 'tenggat'." },
        { question: "Good closing question:", options: ["When do I get paid?", "Could you tell me about the team?", "Are we done?"], answer: 1, explanation: "A thoughtful question shows interest." },
      ],
    },
  },
  {
    slug: "giving-a-presentation",
    title: "Giving a Presentation",
    level: "advanced",
    category: "presentation",
    topic: "Presenting clearly",
    summary: "Open, structure, and close a clear, confident presentation.",
    estimatedMinutes: 7,
    xpReward: 40,
    mode: "read-aloud",
    content: {
      objectives: [
        "Open a presentation and state your goal",
        "Guide the audience through sections",
        "Close with a strong summary",
      ],
      conversation: [
        { speaker: "Presenter", text: "Good morning. Thank you all for being here today.", translation: "Selamat pagi. Terima kasih semua sudah hadir." },
        { speaker: "Presenter", text: "Today I will show you three ways to save time.", translation: "Hari ini saya akan tunjukkan tiga cara menghemat waktu." },
        { speaker: "Presenter", text: "First, let's look at the data.", translation: "Pertama, mari lihat datanya." },
        { speaker: "Presenter", text: "To sum up, small changes make a big difference.", translation: "Kesimpulannya, perubahan kecil membuat perbedaan besar." },
      ],
      vocab: [
        { word: "audience", phonetic: "/ˈɔː.di.əns/", meaning: "hadirin", example: "The audience listened." },
        { word: "overview", phonetic: "/ˈoʊ.vɚ.vjuː/", meaning: "gambaran umum", example: "Here is an overview." },
        { word: "summary", phonetic: "/ˈsʌm.ər.i/", meaning: "ringkasan", example: "In summary, we grew." },
      ],
      grammarFocus: [
        { name: "Signposting language", formula: "First, … Next, … Finally, …", explanation: "Use sequence words to guide your audience.", example: "First, let's look at the results." },
      ],
      pronunciationTips: [
        { sound: "/ɔː/", tip: "'audience' begins with a long 'aw'.", example: "audience" },
        { sound: "pausing", tip: "Pause briefly after each main point.", example: "First, … the data." },
        { sound: "projection", tip: "Speak clearly and a bit louder to a room.", example: "Thank you for being here." },
      ],
      practice: [
        { text: "Good morning. Thank you all for being here today.", translation: "Selamat pagi. Terima kasih semua sudah hadir." },
        { text: "Today I will show you three ways to save time.", translation: "Hari ini saya akan tunjukkan tiga cara menghemat waktu." },
        { text: "First, let's look at the data together.", translation: "Pertama, mari lihat datanya bersama." },
        { text: "To sum up, small changes make a big difference.", translation: "Kesimpulannya, perubahan kecil membuat perbedaan besar." },
      ],
      challenge: "Thank you for your attention; I'm happy to take any questions you may have now.",
      quiz: [
        { question: "Which word signposts a first point?", options: ["Finally", "First", "In summary"], answer: 1, explanation: "'First' introduces the first point." },
        { question: "'hadirin' is…", options: ["overview", "audience", "summary"], answer: 1, explanation: "'audience' means 'hadirin'." },
        { question: "A good closing line:", options: ["To sum up, …", "First, …", "By the way, …"], answer: 0, explanation: "'To sum up' signals a conclusion." },
      ],
    },
  },
  {
    slug: "public-speaking-confidence",
    title: "Public Speaking Confidence",
    level: "advanced",
    category: "public-speaking",
    topic: "Speaking to a crowd",
    summary: "Deliver a short, powerful speech with confident delivery.",
    estimatedMinutes: 7,
    xpReward: 45,
    mode: "read-aloud",
    content: {
      objectives: [
        "Hook the audience in the first line",
        "Use pauses for emphasis",
        "End with a memorable call to action",
      ],
      conversation: [
        { speaker: "Speaker", text: "Imagine a world where everyone speaks English with confidence.", translation: "Bayangkan dunia di mana semua orang berbahasa Inggris dengan percaya diri." },
        { speaker: "Speaker", text: "That world begins with a single brave sentence.", translation: "Dunia itu dimulai dari satu kalimat berani." },
        { speaker: "Speaker", text: "Every expert was once a beginner who kept going.", translation: "Setiap ahli dulunya pemula yang terus melangkah." },
        { speaker: "Speaker", text: "So today, let your voice be heard.", translation: "Jadi hari ini, biarkan suaramu didengar." },
      ],
      vocab: [
        { word: "imagine", phonetic: "/ɪˈmædʒ.ɪn/", meaning: "membayangkan", example: "Imagine the future." },
        { word: "confidence", phonetic: "/ˈkɑːn.fɪ.dəns/", meaning: "percaya diri", example: "Speak with confidence." },
        { word: "voice", phonetic: "/vɔɪs/", meaning: "suara", example: "Use your voice." },
      ],
      grammarFocus: [
        { name: "Imperative for impact", formula: "Base verb + …", explanation: "Commands like 'Imagine…' pull listeners in.", example: "Imagine a better world." },
      ],
      pronunciationTips: [
        { sound: "/dʒ/", tip: "'imagine' has a soft 'j' in the middle.", example: "imagine" },
        { sound: "emphasis", tip: "Stress key words: BRAVE, HEARD.", example: "let your voice be HEARD" },
        { sound: "pause", tip: "Pause before your final line for impact.", example: "…let your voice be heard." },
      ],
      practice: [
        { text: "Imagine a world where everyone speaks with confidence.", translation: "Bayangkan dunia di mana semua orang berbicara dengan percaya diri." },
        { text: "That world begins with a single brave sentence.", translation: "Dunia itu dimulai dari satu kalimat berani." },
        { text: "Every expert was once a beginner who kept going.", translation: "Setiap ahli dulunya pemula yang terus melangkah." },
        { text: "So today, let your voice be heard.", translation: "Jadi hari ini, biarkan suaramu didengar." },
      ],
      challenge: "Your words have power, so speak clearly, speak boldly, and never stop practising.",
      quiz: [
        { question: "A strong opening often uses:", options: ["a hook like 'Imagine…'", "a goodbye", "an apology"], answer: 0, explanation: "A hook grabs attention." },
        { question: "'percaya diri' is…", options: ["voice", "confidence", "imagine"], answer: 1, explanation: "'confidence' means 'percaya diri'." },
        { question: "Pauses are used to…", options: ["fill time", "add emphasis", "hide mistakes"], answer: 1, explanation: "Pauses emphasise key ideas." },
      ],
    },
  },
  {
    slug: "debate-basics",
    title: "Debate Basics",
    level: "advanced",
    category: "debate",
    topic: "Arguing a point",
    summary: "State an opinion, give reasons, and respond to counterarguments.",
    estimatedMinutes: 7,
    xpReward: 45,
    mode: "repeat",
    content: {
      objectives: [
        "State a clear position",
        "Support it with reasons and examples",
        "Politely rebut an opposing view",
      ],
      conversation: [
        { speaker: "You", text: "In my opinion, online learning benefits most students.", translation: "Menurut saya, belajar daring menguntungkan sebagian besar siswa." },
        { speaker: "Opponent", text: "However, some students lack self-discipline.", translation: "Namun, sebagian siswa kurang disiplin diri." },
        { speaker: "You", text: "That is a fair point, but flexibility helps them balance work.", translation: "Itu poin yang adil, tapi fleksibilitas membantu mereka menyeimbangkan pekerjaan." },
        { speaker: "You", text: "For these reasons, I firmly support online learning.", translation: "Karena alasan itu, saya sangat mendukung belajar daring." },
      ],
      vocab: [
        { word: "opinion", phonetic: "/əˈpɪn.jən/", meaning: "pendapat", example: "In my opinion, …" },
        { word: "reason", phonetic: "/ˈriː.zən/", meaning: "alasan", example: "For this reason, …" },
        { word: "argument", phonetic: "/ˈɑːr.ɡjə.mənt/", meaning: "argumen", example: "A strong argument." },
      ],
      grammarFocus: [
        { name: "Concession with 'although / however'", formula: "However, + clause", explanation: "Use 'however' to acknowledge the other side.", example: "However, there are risks." },
      ],
      pronunciationTips: [
        { sound: "/jən/", tip: "'opinion' ends 'pin-yun'.", example: "opinion" },
        { sound: "/z/", tip: "'reason' has a 'z' in the middle.", example: "reason" },
        { sound: "emphasis", tip: "Stress 'FIRMLY support' to sound sure.", example: "I firmly support…" },
      ],
      practice: [
        { text: "In my opinion, online learning benefits most students.", translation: "Menurut saya, belajar daring menguntungkan sebagian besar siswa." },
        { text: "That is a fair point, but I see it differently.", translation: "Itu poin yang adil, tapi saya melihatnya berbeda." },
        { text: "There are three strong reasons for my view.", translation: "Ada tiga alasan kuat untuk pendapat saya." },
        { text: "For these reasons, I firmly support this idea.", translation: "Karena alasan itu, saya sangat mendukung ide ini." },
      ],
      challenge: "While I understand the concerns, the evidence clearly shows the benefits outweigh the risks.",
      quiz: [
        { question: "State an opinion:", options: ["In my opinion, …", "Goodbye.", "How are you?"], answer: 0, explanation: "'In my opinion' states a view." },
        { question: "'alasan' is…", options: ["opinion", "reason", "argument"], answer: 1, explanation: "'reason' means 'alasan'." },
        { question: "Acknowledge the other side with:", options: ["However", "Please", "Thanks"], answer: 0, explanation: "'However' signals a counterpoint." },
      ],
    },
  },
  {
    slug: "tell-a-short-story",
    title: "Tell a Short Story",
    level: "advanced",
    category: "storytelling",
    topic: "Narrating events",
    summary: "Tell an engaging short story with clear order and feeling.",
    estimatedMinutes: 7,
    xpReward: 45,
    mode: "storytelling",
    content: {
      objectives: [
        "Set the scene clearly",
        "Use past tenses to narrate",
        "End with a satisfying conclusion",
      ],
      conversation: [
        { speaker: "Narrator", text: "Last summer, I traveled to a small village by the sea.", translation: "Musim panas lalu, saya pergi ke desa kecil di tepi laut." },
        { speaker: "Narrator", text: "One morning, I met an old fisherman who was singing.", translation: "Suatu pagi, saya bertemu nelayan tua yang sedang bernyanyi." },
        { speaker: "Narrator", text: "He told me a story I will never forget.", translation: "Ia menceritakan kisah yang tak akan saya lupakan." },
        { speaker: "Narrator", text: "In the end, I learned that patience brings peace.", translation: "Pada akhirnya, saya belajar bahwa kesabaran membawa kedamaian." },
      ],
      vocab: [
        { word: "village", phonetic: "/ˈvɪl.ɪdʒ/", meaning: "desa", example: "A quiet village." },
        { word: "suddenly", phonetic: "/ˈsʌd.ən.li/", meaning: "tiba-tiba", example: "Suddenly, it rained." },
        { word: "finally", phonetic: "/ˈfaɪ.nəl.i/", meaning: "akhirnya", example: "Finally, we arrived." },
      ],
      grammarFocus: [
        { name: "Past simple vs past continuous", formula: "was/were + verb-ing + when + past simple", explanation: "Use continuous for background, simple for events.", example: "He was singing when I arrived." },
      ],
      pronunciationTips: [
        { sound: "/dʒ/", tip: "'village' ends with a soft 'j'.", example: "village" },
        { sound: "rhythm", tip: "Slow down at emotional moments.", example: "I will never forget…" },
        { sound: "/li/", tip: "'suddenly' and 'finally' end in a light 'lee'.", example: "finally" },
      ],
      practice: [
        { text: "Last summer, I traveled to a small village by the sea.", translation: "Musim panas lalu, saya pergi ke desa kecil di tepi laut." },
        { text: "One morning, I met an old fisherman who was singing.", translation: "Suatu pagi, saya bertemu nelayan tua yang sedang bernyanyi." },
        { text: "He told me a story I will never forget.", translation: "Ia menceritakan kisah yang tak akan saya lupakan." },
        { text: "In the end, I learned that patience brings peace.", translation: "Pada akhirnya, saya belajar bahwa kesabaran membawa kedamaian." },
      ],
      challenge: "As the sun set over the water, I finally understood what the old fisherman had meant.",
      quiz: [
        { question: "Which tense narrates finished past events?", options: ["past simple", "present simple", "future"], answer: 0, explanation: "Past simple narrates completed events." },
        { question: "'tiba-tiba' is…", options: ["finally", "suddenly", "village"], answer: 1, explanation: "'suddenly' means 'tiba-tiba'." },
        { question: "A good story ending starts with:", options: ["First, …", "In the end, …", "By the way, …"], answer: 1, explanation: "'In the end' signals a conclusion." },
      ],
    },
  },
];

// =====================================================================
// Derived helpers
// =====================================================================

export const SPEAKING_COURSE_ORDER: string[] = SPEAKING_COURSES.map(
  (c) => c.slug,
);

const COURSE_MAP = new Map(SPEAKING_COURSES.map((c) => [c.slug, c]));

export function getSpeakingCourse(slug: string): SpeakingCourse | undefined {
  return COURSE_MAP.get(slug);
}

export function coursesForLevel(level: SpeakingLevel): SpeakingCourse[] {
  return SPEAKING_COURSES.filter((c) => c.level === level);
}

export function usedSpeakingCategories(): SpeakingCategory[] {
  const set = new Set(SPEAKING_COURSES.map((c) => c.category));
  return SPEAKING_CATEGORIES.filter((c) => set.has(c));
}

export function nextSpeakingSlug(slug: string): string | undefined {
  const idx = SPEAKING_COURSE_ORDER.indexOf(slug);
  if (idx === -1 || idx === SPEAKING_COURSE_ORDER.length - 1) return undefined;
  return SPEAKING_COURSE_ORDER[idx + 1];
}

/** Total words a learner will speak across the practice sentences. */
export function courseWordCount(course: SpeakingCourse): number {
  return course.content.practice.reduce(
    (sum, line) => sum + line.text.trim().split(/\s+/).length,
    0,
  );
}
