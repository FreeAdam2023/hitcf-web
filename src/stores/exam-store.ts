import { create } from "zustand";
import type { QuestionBrief } from "@/lib/api/types";

interface ExamAnswer {
  question_id: string;
  question_number: number;
  selected: string;
}

const SESSION_KEY = "hitcf_exam_answers";

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

function clearAnswersFromSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
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
    const flaggedQuestions = new Set<number>(existingFlags || []);
    const firstType = questions[0]?.type;
    const testType: "listening" | "reading" | null =
      firstType === "listening" ? "listening" : firstType === "reading" ? "reading" : null;
    set({
      attemptId,
      questions,
      currentIndex: 0,
      answers,
      flaggedQuestions,
      timeLimitSeconds,
      startedAt,
      testType,
      playedAudioQuestionIds: new Set(),
    });
    saveAnswersToSession(attemptId, answers);
  },

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
      return { flaggedQuestions: next };
    }),

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
    }
  },

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
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
      playedAudioQuestionIds: new Set(),
    });
  },
}));
