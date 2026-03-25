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

  /* ── Drill-mode lazy loading fields ── */
  drillMode: boolean;
  drillTotal: number;
  drillQuestionIds: string[];          // all known IDs (in order)
  drillAnsweredIds: Set<string>;       // IDs answered (from nav)
  loadedQuestions: Map<string, QuestionBrief>; // cache: id → full question

  init: (attemptId: string, questions: QuestionBrief[], testSetName?: string | null, testSetType?: string | null, startedAt?: string | null, existingAnswers?: AnswerResponse[], previousAnswers?: AnswerResponse[]) => void;
  initDrill: (attemptId: string, total: number, questionIds: string[], answeredIds: string[], firstQuestion: QuestionBrief) => void;
  setDrillQuestion: (question: QuestionBrief) => void;
  setDrillAnsweredIds: (ids: string[]) => void;
  setAnswer: (questionId: string, answer: AnswerResponse) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
}

function saveIndex(attemptId: string, index: number) {
  try {
    localStorage.setItem(`practiceIndex:${attemptId}`, String(index));
  } catch {
    // localStorage unavailable (SSR or quota exceeded)
  }
}

function loadIndex(attemptId: string): number | null {
  try {
    const val = localStorage.getItem(`practiceIndex:${attemptId}`);
    if (val !== null) {
      const n = parseInt(val, 10);
      return Number.isNaN(n) ? null : n;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

function clearIndex(attemptId: string) {
  try {
    localStorage.removeItem(`practiceIndex:${attemptId}`);
  } catch {
    // localStorage unavailable
  }
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

  /* ── Drill-mode defaults ── */
  drillMode: false,
  drillTotal: 0,
  drillQuestionIds: [],
  drillAnsweredIds: new Set(),
  loadedQuestions: new Map(),

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
    // Restore last-viewed question index from localStorage, or fall back to first unanswered
    const savedIndex = loadIndex(attemptId);
    let currentIndex: number;
    if (savedIndex !== null && savedIndex >= 0 && savedIndex < questions.length) {
      currentIndex = savedIndex;
    } else {
      currentIndex = 0;
      const allAnsweredIds = new Set([...Array.from(answers.keys()), ...Array.from(prevMap.keys())]);
      if (allAnsweredIds.size > 0) {
        const firstUnanswered = questions.findIndex((q) => !allAnsweredIds.has(q.id));
        currentIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
      }
      saveIndex(attemptId, currentIndex);
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
      drillMode: false,
      drillTotal: 0,
      drillQuestionIds: [],
      drillAnsweredIds: new Set(),
      loadedQuestions: new Map(),
    });
  },

  initDrill: (attemptId, total, questionIds, answeredIds, firstQuestion) => {
    const cache = new Map<string, QuestionBrief>();
    cache.set(firstQuestion.id, firstQuestion);

    // Build sparse questions array: first question populated, rest are placeholders
    const questions: QuestionBrief[] = new Array(total);
    const firstIdx = questionIds.indexOf(firstQuestion.id);
    if (firstIdx >= 0) {
      questions[firstIdx] = firstQuestion;
    } else {
      questions[0] = firstQuestion;
    }

    const answeredSet = new Set(answeredIds);

    // Restore saved index or start at first unanswered
    const savedIndex = loadIndex(attemptId);
    let currentIndex: number;
    if (savedIndex !== null && savedIndex >= 0 && savedIndex < total) {
      currentIndex = savedIndex;
    } else {
      // Find first unanswered
      currentIndex = 0;
      if (answeredSet.size > 0) {
        const firstUnanswered = questionIds.findIndex((id) => !answeredSet.has(id));
        currentIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
      }
      saveIndex(attemptId, currentIndex);
    }

    set({
      attemptId,
      questions,
      testSetName: null,
      testSetType: null,
      startedAt: null,
      currentIndex,
      answers: new Map(),
      previousAnswers: new Map(),
      drillMode: true,
      drillTotal: total,
      drillQuestionIds: questionIds,
      drillAnsweredIds: answeredSet,
      loadedQuestions: cache,
    });
  },

  setDrillQuestion: (question) => {
    const { drillQuestionIds, loadedQuestions } = get();
    const idx = drillQuestionIds.indexOf(question.id);
    if (idx === -1) return;

    const nextCache = new Map(loadedQuestions);
    nextCache.set(question.id, question);

    set((state) => {
      const nextQuestions = [...state.questions];
      nextQuestions[idx] = question;
      return { questions: nextQuestions, loadedQuestions: nextCache };
    });
  },

  setDrillAnsweredIds: (ids) => {
    set({ drillAnsweredIds: new Set(ids) });
  },

  setAnswer: (questionId, answer) =>
    set((state) => {
      const next = new Map(state.answers);
      next.set(questionId, answer);
      // Also add to drillAnsweredIds in drill mode
      if (state.drillMode) {
        const nextAnswered = new Set(state.drillAnsweredIds);
        nextAnswered.add(questionId);
        return { answers: next, drillAnsweredIds: nextAnswered };
      }
      return { answers: next };
    }),

  goToQuestion: (index) => {
    const { questions, attemptId, drillMode, drillTotal } = get();
    const max = drillMode ? drillTotal : questions.length;
    if (index >= 0 && index < max) {
      set({ currentIndex: index });
      if (attemptId) saveIndex(attemptId, index);
    }
  },

  goNext: () => {
    const { currentIndex, questions, attemptId, drillMode, drillTotal } = get();
    const max = drillMode ? drillTotal : questions.length;
    if (currentIndex < max - 1) {
      const next = currentIndex + 1;
      set({ currentIndex: next });
      if (attemptId) saveIndex(attemptId, next);
    }
  },

  goPrev: () => {
    const { currentIndex, attemptId } = get();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      set({ currentIndex: prev });
      if (attemptId) saveIndex(attemptId, prev);
    }
  },

  reset: () => {
    const { attemptId } = get();
    if (attemptId) clearIndex(attemptId);
    set({
      attemptId: null, testSetName: null, testSetType: null, startedAt: null,
      questions: [], currentIndex: 0, answers: new Map(), previousAnswers: new Map(),
      drillMode: false, drillTotal: 0, drillQuestionIds: [], drillAnsweredIds: new Set(), loadedQuestions: new Map(),
    });
  },
}));
