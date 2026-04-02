import { create } from "zustand";
import type { QuestionBrief } from "@/lib/api/types";

interface ExamAnswer {
  question_id: string;
  question_number: number;
  selected: string;
}

const SESSION_KEY = "hitcf_exam_answers";
const INDEX_KEY = "hitcf_exam_index";
const FLAGS_KEY = "hitcf_exam_flags";

function isValidAnswerEntry(entry: unknown): entry is [string, ExamAnswer] {
  if (!Array.isArray(entry) || entry.length !== 2) return false;
  const [key, val] = entry;
  return (
    typeof key === "string" &&
    val != null &&
    typeof val === "object" &&
    typeof (val as ExamAnswer).question_id === "string" &&
    typeof (val as ExamAnswer).question_number === "number" &&
    typeof (val as ExamAnswer).selected === "string"
  );
}

function saveAnswersToSession(attemptId: string, answers: Map<string, ExamAnswer>) {
  try {
    const data = { attemptId, answers: Array.from(answers.entries()) };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
}

function loadAnswersFromSession(attemptId: string): Map<string, ExamAnswer> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Map();
    const data = JSON.parse(raw);
    if (data.attemptId !== attemptId || !Array.isArray(data.answers)) return new Map();
    const validEntries = data.answers.filter(isValidAnswerEntry);
    return new Map(validEntries);
  } catch {
    return new Map();
  }
}

function saveIndexToSession(attemptId: string, index: number) {
  try {
    sessionStorage.setItem(INDEX_KEY, JSON.stringify({ attemptId, index }));
  } catch { /* ignore */ }
}

function loadIndexFromSession(attemptId: string): number {
  try {
    const raw = sessionStorage.getItem(INDEX_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data.attemptId !== attemptId || typeof data.index !== "number") return 0;
    return data.index;
  } catch {
    return 0;
  }
}

function saveFlagsToSession(attemptId: string, flags: Set<number>) {
  try {
    sessionStorage.setItem(FLAGS_KEY, JSON.stringify({ attemptId, flags: Array.from(flags) }));
  } catch { /* ignore */ }
}

function loadFlagsFromSession(attemptId: string): Set<number> {
  try {
    const raw = sessionStorage.getItem(FLAGS_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    if (data.attemptId !== attemptId || !Array.isArray(data.flags)) return new Set();
    return new Set(data.flags.filter((n: unknown) => typeof n === "number"));
  } catch {
    return new Set();
  }
}

function clearAnswersFromSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(INDEX_KEY);
    sessionStorage.removeItem(FLAGS_KEY);
  } catch { /* ignore */ }
}

interface ExamState {
  attemptId: string | null;
  questions: QuestionBrief[];
  currentIndex: number;
  answers: Map<string, ExamAnswer>;
  flaggedQuestions: Set<number>;
  timeLimitSeconds: number;
  startedAt: string | null;
  testType: "listening" | "reading" | null;
  examStarted: boolean;
  playedAudioQuestionIds: Set<string>;

  init: (
    attemptId: string,
    questions: QuestionBrief[],
    timeLimitSeconds: number,
    startedAt: string,
    existingAnswers?: Array<{ question_id: string; question_number: number; selected: string }>,
    existingFlags?: number[],
  ) => void;
  setAnswer: (questionId: string, answer: ExamAnswer) => void;
  toggleFlag: (questionNumber: number) => void;
  setExamStarted: () => void;
  markAudioPlayed: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  attemptId: null,
  questions: [],
  currentIndex: 0,
  answers: new Map(),
  flaggedQuestions: new Set(),
  timeLimitSeconds: 0,
  startedAt: null,
  testType: null,
  examStarted: false,
  playedAudioQuestionIds: new Set(),

  init: (attemptId, questions, timeLimitSeconds, startedAt, existingAnswers, existingFlags) => {
    const answers = new Map<string, ExamAnswer>();
    if (existingAnswers) {
      for (const a of existingAnswers) {
        if (a.selected) {
          answers.set(a.question_id, {
            question_id: a.question_id,
            question_number: a.question_number,
            selected: a.selected,
          });
        }
      }
    }
    // Merge with sessionStorage cached answers
    const cached = loadAnswersFromSession(attemptId);
    cached.forEach((v, k) => {
      if (!answers.has(k)) answers.set(k, v);
    });
    // Merge server flags with sessionStorage cached flags
    const flaggedQuestions = new Set<number>(existingFlags || []);
    const cachedFlags = loadFlagsFromSession(attemptId);
    cachedFlags.forEach((n) => flaggedQuestions.add(n));
    const firstType = questions[0]?.type;
    const testType: "listening" | "reading" | null =
      firstType === "listening" ? "listening" : firstType === "reading" ? "reading" : null;
    const savedIndex = loadIndexFromSession(attemptId);
    const currentIndex = savedIndex >= 0 && savedIndex < questions.length ? savedIndex : 0;
    set({
      attemptId,
      questions,
      currentIndex,
      answers,
      flaggedQuestions,
      timeLimitSeconds,
      startedAt,
      testType,
      examStarted: answers.size > 0 || currentIndex > 0,
      playedAudioQuestionIds: new Set(),
    });
    saveAnswersToSession(attemptId, answers);
    saveFlagsToSession(attemptId, flaggedQuestions);
  },

  setExamStarted: () => set({ examStarted: true }),

  setAnswer: (questionId, answer) =>
    set((state) => {
      const next = new Map(state.answers);
      next.set(questionId, answer);
      if (state.attemptId) saveAnswersToSession(state.attemptId, next);
      return { answers: next };
    }),

  markAudioPlayed: (questionId) =>
    set((state) => {
      const next = new Set(state.playedAudioQuestionIds);
      next.add(questionId);
      return { playedAudioQuestionIds: next };
    }),

  toggleFlag: (questionNumber) =>
    set((state) => {
      const next = new Set(state.flaggedQuestions);
      if (next.has(questionNumber)) {
        next.delete(questionNumber);
      } else {
        next.add(questionNumber);
      }
      if (state.attemptId) saveFlagsToSession(state.attemptId, next);
      return { flaggedQuestions: next };
    }),

  goToQuestion: (index) => {
    const { questions, attemptId } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
      if (attemptId) saveIndexToSession(attemptId, index);
    }
  },

  goNext: () => {
    const { currentIndex, questions, attemptId } = get();
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      set({ currentIndex: next });
      if (attemptId) saveIndexToSession(attemptId, next);
    }
  },

  goPrev: () => {
    const { currentIndex, attemptId } = get();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      set({ currentIndex: prev });
      if (attemptId) saveIndexToSession(attemptId, prev);
    }
  },

  reset: () => {
    clearAnswersFromSession();
    set({
      attemptId: null,
      questions: [],
      currentIndex: 0,
      answers: new Map(),
      flaggedQuestions: new Set(),
      timeLimitSeconds: 0,
      startedAt: null,
      testType: null,
      examStarted: false,
      playedAudioQuestionIds: new Set(),
    });
  },
}));
