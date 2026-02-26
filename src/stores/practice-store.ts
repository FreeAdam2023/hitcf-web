import { create } from "zustand";
import type { QuestionBrief, AnswerResponse } from "@/lib/api/types";

interface PracticeState {
  attemptId: string | null;
  testSetName: string | null;
  testSetType: string | null;
  startedAt: string | null;
  questions: QuestionBrief[];
  currentIndex: number;
  answers: Map<string, AnswerResponse>;

  init: (attemptId: string, questions: QuestionBrief[], testSetName?: string | null, testSetType?: string | null, startedAt?: string | null) => void;
  setAnswer: (questionId: string, answer: AnswerResponse) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  attemptId: null,
  testSetName: null,
  testSetType: null,
  startedAt: null,
  questions: [],
  currentIndex: 0,
  answers: new Map(),

  init: (attemptId, questions, testSetName, testSetType, startedAt) =>
    set({ attemptId, questions, testSetName: testSetName ?? null, testSetType: testSetType ?? null, startedAt: startedAt ?? null, currentIndex: 0, answers: new Map() }),

  setAnswer: (questionId, answer) =>
    set((state) => {
      const next = new Map(state.answers);
      next.set(questionId, answer);
      return { answers: next };
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
    set({ attemptId: null, testSetName: null, testSetType: null, startedAt: null, questions: [], currentIndex: 0, answers: new Map() }),
}));
