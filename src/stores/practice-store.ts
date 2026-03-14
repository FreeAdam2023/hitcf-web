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
  previousAnswers: Map<string, AnswerResponse>;

  init: (attemptId: string, questions: QuestionBrief[], testSetName?: string | null, testSetType?: string | null, startedAt?: string | null, existingAnswers?: AnswerResponse[], previousAnswers?: AnswerResponse[]) => void;
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
  previousAnswers: new Map(),

  init: (attemptId, questions, testSetName, testSetType, startedAt, existingAnswers, previousAnswers) => {
    const answers = new Map<string, AnswerResponse>();
    if (existingAnswers?.length) {
      for (const a of existingAnswers) {
        answers.set(a.question_id, a);
      }
    }
    const prevMap = new Map<string, AnswerResponse>();
    if (previousAnswers?.length) {
      for (const a of previousAnswers) {
        // Only store if not already answered in this attempt
        if (!answers.has(a.question_id)) {
          prevMap.set(a.question_id, a);
        }
      }
    }
    // Jump to first unanswered question (skip both current and previous answers)
    let currentIndex = 0;
    const allAnsweredIds = new Set([...Array.from(answers.keys()), ...Array.from(prevMap.keys())]);
    if (allAnsweredIds.size > 0) {
      const firstUnanswered = questions.findIndex((q) => !allAnsweredIds.has(q.id));
      currentIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
    }
    set({
      attemptId,
      questions,
      testSetName: testSetName ?? null,
      testSetType: testSetType ?? null,
      startedAt: startedAt ?? null,
      currentIndex,
      answers,
      previousAnswers: prevMap,
    });
  },

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
    set({ attemptId: null, testSetName: null, testSetType: null, startedAt: null, questions: [], currentIndex: 0, answers: new Map(), previousAnswers: new Map() }),
}));
