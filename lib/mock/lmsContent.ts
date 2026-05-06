import type {
  LmsModule,
  LmsTopic,
  LmsQuiz,
  LmsQuizQuestion,
  LmsQuizAttempt,
} from "@/lib/types";

/**
 * Chess PP is the fully-authored "showcase" Planet/Level for the LMS portal.
 * Other levels have stub modules so the LMS authoring screen has something
 * to render.
 */

export const LMS_MODULES: LmsModule[] = [
  // Chess PP — fully authored
  { id: "mod_chess_pp_1", levelId: "lvl_chess_pp", title: "Board & Pieces", sortOrder: 1 },
  { id: "mod_chess_pp_2", levelId: "lvl_chess_pp", title: "Opening Principles", sortOrder: 2 },
  { id: "mod_chess_pp_3", levelId: "lvl_chess_pp", title: "Tactics: Forks & Pins", sortOrder: 3 },
  { id: "mod_chess_pp_4", levelId: "lvl_chess_pp", title: "Endgame Basics", sortOrder: 4 },

  // Chess RR — partially authored
  { id: "mod_chess_rr_1", levelId: "lvl_chess_rr", title: "Positional Ideas", sortOrder: 1 },
  { id: "mod_chess_rr_2", levelId: "lvl_chess_rr", title: "Tactical Combinations", sortOrder: 2 },

  // Math G5 stub
  { id: "mod_math_g5_1", levelId: "lvl_math_g5", title: "Fractions", sortOrder: 1 },
  { id: "mod_math_g5_2", levelId: "lvl_math_g5", title: "Decimals", sortOrder: 2 },

  // Math G7 stub
  { id: "mod_math_g7_1", levelId: "lvl_math_g7", title: "Linear Equations", sortOrder: 1 },

  // English G5 stub
  { id: "mod_eng_g5_1", levelId: "lvl_eng_g5", title: "Reading Comprehension", sortOrder: 1 },

  // Finance basics stub
  { id: "mod_fin_basics_1", levelId: "lvl_fin_basics", title: "Budgeting Basics", sortOrder: 1 },
];

export const LMS_TOPICS: LmsTopic[] = [
  // Chess PP — Module 1
  {
    id: "top_chess_pp_1_1",
    moduleId: "mod_chess_pp_1",
    title: "How the Pieces Move",
    contentType: "text",
    contentBody:
      "Each piece moves in a unique pattern. The rook moves in straight lines along ranks and files. The bishop moves diagonally. The queen combines both. Knights jump in an L-shape and are the only piece that can hop over others.",
    sortOrder: 1,
  },
  {
    id: "top_chess_pp_1_2",
    moduleId: "mod_chess_pp_1",
    title: "Setting Up the Board",
    contentType: "text",
    contentBody:
      'Remember: "white on right" — the bottom-right square should be a light square. Place rooks on the corners, knights next to them, then bishops, queen on her own colour, and king on the remaining square.',
    sortOrder: 2,
  },
  {
    id: "top_chess_pp_1_3",
    moduleId: "mod_chess_pp_1",
    title: "Watch: Beginner Setup Walkthrough",
    contentType: "youtube",
    contentUrl: "https://www.youtube.com/watch?v=fKxG8KjH1Qg",
    sortOrder: 3,
  },

  // Chess PP — Module 2
  {
    id: "top_chess_pp_2_1",
    moduleId: "mod_chess_pp_2",
    title: "Control the Centre",
    contentType: "text",
    contentBody:
      "The four central squares (d4, d5, e4, e5) are the most important. Pieces in the centre control more squares and have more options.",
    sortOrder: 1,
  },
  {
    id: "top_chess_pp_2_2",
    moduleId: "mod_chess_pp_2",
    title: "Develop Your Pieces",
    contentType: "text",
    contentBody:
      "In the opening, bring out knights and bishops before moving the same pawn twice. Castle early to keep your king safe.",
    sortOrder: 2,
  },

  // Chess PP — Module 3
  {
    id: "top_chess_pp_3_1",
    moduleId: "mod_chess_pp_3",
    title: "Forks",
    contentType: "text",
    contentBody:
      "A fork attacks two pieces at once. Knight forks are especially powerful because the knight is the only piece that can attack a queen without the queen attacking back.",
    sortOrder: 1,
  },
  {
    id: "top_chess_pp_3_2",
    moduleId: "mod_chess_pp_3",
    title: "Pins",
    contentType: "text",
    contentBody:
      "A pin freezes a piece in place because moving it would expose a more valuable piece behind it. Absolute pins (against the king) are illegal to break.",
    sortOrder: 2,
  },

  // Chess PP — Module 4
  {
    id: "top_chess_pp_4_1",
    moduleId: "mod_chess_pp_4",
    title: "King and Queen vs King",
    contentType: "text",
    contentBody:
      "Walk the enemy king to the edge using your queen, then bring your own king to support the mate. Watch out for stalemate!",
    sortOrder: 1,
  },

  // Stubs for other planets
  {
    id: "top_chess_rr_1_1",
    moduleId: "mod_chess_rr_1",
    title: "Pawn Structure",
    contentType: "text",
    contentBody: "Strong pawn chains shape the entire game…",
    sortOrder: 1,
  },
  {
    id: "top_math_g5_1_1",
    moduleId: "mod_math_g5_1",
    title: "Equivalent Fractions",
    contentType: "text",
    contentBody: "Multiply numerator and denominator by the same number…",
    sortOrder: 1,
  },
];

export const LMS_QUIZZES: LmsQuiz[] = [
  {
    id: "quiz_chess_pp_1",
    referenceType: "module",
    referenceId: "mod_chess_pp_1",
    title: "Board & Pieces — Module Quiz",
    passingScorePct: 70,
  },
  {
    id: "quiz_chess_pp_3",
    referenceType: "module",
    referenceId: "mod_chess_pp_3",
    title: "Tactics — Module Quiz",
    passingScorePct: 70,
  },
];

export const LMS_QUIZ_QUESTIONS: LmsQuizQuestion[] = [
  {
    id: "q_chess_pp_1_1",
    quizId: "quiz_chess_pp_1",
    questionText: "Which piece moves only diagonally?",
    options: ["Rook", "Bishop", "Knight", "Queen"],
    correctAnswer: "Bishop",
    sortOrder: 1,
  },
  {
    id: "q_chess_pp_1_2",
    quizId: "quiz_chess_pp_1",
    questionText: "Which piece can jump over other pieces?",
    options: ["Bishop", "Rook", "Knight", "Queen"],
    correctAnswer: "Knight",
    sortOrder: 2,
  },
  {
    id: "q_chess_pp_1_3",
    quizId: "quiz_chess_pp_1",
    questionText: 'When setting up the board, the bottom-right square should be…',
    options: ["A light square", "A dark square", "Either", "Marked"],
    correctAnswer: "A light square",
    sortOrder: 3,
  },
  {
    id: "q_chess_pp_3_1",
    quizId: "quiz_chess_pp_3",
    questionText: "A fork is when one piece…",
    options: [
      "Defends two pieces at once",
      "Attacks two pieces at once",
      "Blocks an enemy attack",
      "Captures a pawn",
    ],
    correctAnswer: "Attacks two pieces at once",
    sortOrder: 1,
  },
  {
    id: "q_chess_pp_3_2",
    quizId: "quiz_chess_pp_3",
    questionText: "A pin against the king is called…",
    options: ["Relative pin", "Absolute pin", "Reverse pin", "Skewer"],
    correctAnswer: "Absolute pin",
    sortOrder: 2,
  },
];

export const LMS_QUIZ_ATTEMPTS: LmsQuizAttempt[] = [
  {
    id: "att_aarav_chess1",
    quizId: "quiz_chess_pp_1",
    memberId: "mem_aarav",
    score: 100,
    attemptedAt: "2026-04-12T16:30:00Z",
  },
  {
    id: "att_anaya_chess1",
    quizId: "quiz_chess_pp_1",
    memberId: "mem_anaya",
    score: 100,
    attemptedAt: "2026-04-15T17:30:00Z",
  },
];

export const TOPICS_BY_MODULE: Record<string, LmsTopic[]> = LMS_TOPICS.reduce(
  (acc, t) => {
    (acc[t.moduleId] ??= []).push(t);
    return acc;
  },
  {} as Record<string, LmsTopic[]>,
);

export const MODULES_BY_LEVEL: Record<string, LmsModule[]> = LMS_MODULES.reduce(
  (acc, m) => {
    (acc[m.levelId] ??= []).push(m);
    return acc;
  },
  {} as Record<string, LmsModule[]>,
);
