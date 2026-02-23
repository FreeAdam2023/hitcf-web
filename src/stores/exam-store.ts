import { create } from "zustand";
import type { QuestionBrief } from "@/lib/api/types";

interface ExamAnswer {
  question_id: string;
  question_number: number;
  selected: string;
}

interface ExamState {
  attemptId: string | null;
  questions: QuestionBrief[];
  currentIndex: number;
  answers: Map<string, ExamAnswer>;
  flaggedQuestions: Set<number>;
  timeLimitSeconds: number;
  startedAt: string | null;

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
    const flaggedQuestions = new Set<number>(existingFlags || []);
    set({
      attemptId,
      questions,
      currentIndex: 0,
      answers,
      flaggedQuestions,
      timeLimitSeconds,
      startedAt,
    });
  },

  setAnswer: (questionId, answer) =>
    set((state) => {
      const next = new Map(state.answers);
      next.set(questionId, answer);
      return { answers: next };
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

  reset: () =>
    set({
      attemptId: null,
      questions: [],
      currentIndex: 0,
      answers: new Map(),
      flaggedQuestions: new Set(),
      timeLimitSeconds: 0,
      startedAt: null,
    }),
}));
