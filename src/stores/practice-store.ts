import { create } from "zustand";
import { updateAttemptProgress } from "@/lib/api/attempts";
import type { QuestionBrief, AnswerResponse } from "@/lib/api/types";

export const NAV_PAGE_SIZE = 50;

interface PracticeState {
  attemptId: string | null;
  testSetId: string | null;
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
  drillQuestionIds: string[];               // sparse array — populated page-by-page
  drillAnsweredIds: Set<string>;            // accumulated across nav pages
  drillNavLoadedPages: Set<number>;         // 1-based backend page numbers loaded
  loadedQuestions: Map<string, QuestionBrief>; // cache: id → full question

  setTestSetId: (id: string) => void;
  init: (attemptId: string, questions: QuestionBrief[], testSetName?: string | null, testSetType?: string | null, startedAt?: string | null, existingAnswers?: AnswerResponse[], previousAnswers?: AnswerResponse[], serverIndex?: number | null) => void;
  initDrill: (attemptId: string, total: number, navPage: number, questionIds: string[], answeredIds: string[], firstQuestion: QuestionBrief, serverIndex?: number | null) => void;
  setDrillNavPage: (page: number, questionIds: string[], answeredIds: string[]) => void;
  setDrillQuestion: (question: QuestionBrief) => void;
  setAnswer: (questionId: string, answer: AnswerResponse) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
}

// ── localStorage helpers (instant cache) ──

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

// ── Server sync (debounced, fire-and-forget) ──

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function syncIndexToServer(attemptId: string, index: number) {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    updateAttemptProgress(attemptId, { current_index: index }).catch(() => {});
  }, 1000);
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  attemptId: null,
  testSetId: null,
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
  drillNavLoadedPages: new Set(),
  loadedQuestions: new Map(),

  setTestSetId: (id) => set({ testSetId: id }),

  init: (attemptId, questions, testSetName, testSetType, startedAt, existingAnswers, previousAnswers, serverIndex) => {
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
    // Priority: localStorage (same device) > server (cross-device) > first unanswered
    const localIndex = loadIndex(attemptId);
    let currentIndex: number;
    if (localIndex !== null && localIndex >= 0 && localIndex < questions.length) {
      currentIndex = localIndex;
    } else if (serverIndex != null && serverIndex >= 0 && serverIndex < questions.length) {
      currentIndex = serverIndex;
    } else {
      currentIndex = 0;
      const allAnsweredIds = new Set([...Array.from(answers.keys()), ...Array.from(prevMap.keys())]);
      if (allAnsweredIds.size > 0) {
        const firstUnanswered = questions.findIndex((q) => !allAnsweredIds.has(q.id));
        currentIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
      }
    }
    saveIndex(attemptId, currentIndex);
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
      drillNavLoadedPages: new Set(),
      loadedQuestions: new Map(),
    });
  },

  initDrill: (attemptId, total, navPage, questionIds, answeredIds, firstQuestion, serverIndex) => {
    const cache = new Map<string, QuestionBrief>();
    cache.set(firstQuestion.id, firstQuestion);

    // Sparse arrays: only populate the fetched page
    const allIds: string[] = new Array(total);
    const questions: QuestionBrief[] = new Array(total);
    const offset = (navPage - 1) * NAV_PAGE_SIZE;
    for (let i = 0; i < questionIds.length; i++) {
      allIds[offset + i] = questionIds[i];
    }
    const firstIdx = offset + questionIds.indexOf(firstQuestion.id);
    questions[firstIdx >= 0 ? firstIdx : 0] = firstQuestion;

    const answeredSet = new Set(answeredIds);

    // Priority: localStorage > server > first unanswered
    const localIndex = loadIndex(attemptId);
    let currentIndex: number;
    if (localIndex !== null && localIndex >= 0 && localIndex < total) {
      currentIndex = localIndex;
    } else if (serverIndex != null && serverIndex >= 0 && serverIndex < total) {
      currentIndex = serverIndex;
    } else {
      currentIndex = offset;
      if (answeredSet.size > 0) {
        const firstUnanswered = questionIds.findIndex((id) => !answeredSet.has(id));
        currentIndex = firstUnanswered === -1 ? offset : offset + firstUnanswered;
      }
    }
    saveIndex(attemptId, currentIndex);

    set({
      attemptId, questions,
      testSetId: null, testSetName: null, testSetType: null, startedAt: null,
      currentIndex, answers: new Map(), previousAnswers: new Map(),
      drillMode: true, drillTotal: total, drillQuestionIds: allIds,
      drillAnsweredIds: answeredSet, loadedQuestions: cache,
      drillNavLoadedPages: new Set([navPage]),
    });
  },

  setDrillNavPage: (page, questionIds, answeredIds) => {
    set((state) => {
      const nextIds = [...state.drillQuestionIds];
      const offset = (page - 1) * NAV_PAGE_SIZE;
      for (let i = 0; i < questionIds.length; i++) {
        nextIds[offset + i] = questionIds[i];
      }
      const nextLoaded = new Set(state.drillNavLoadedPages);
      nextLoaded.add(page);
      const nextAnswered = new Set(state.drillAnsweredIds);
      for (const id of answeredIds) nextAnswered.add(id);
      return {
        drillQuestionIds: nextIds,
        drillNavLoadedPages: nextLoaded,
        drillAnsweredIds: nextAnswered,
      };
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
      if (attemptId) { saveIndex(attemptId, index); syncIndexToServer(attemptId, index); }
    }
  },

  goNext: () => {
    const { currentIndex, questions, attemptId, drillMode, drillTotal } = get();
    const max = drillMode ? drillTotal : questions.length;
    if (currentIndex < max - 1) {
      const next = currentIndex + 1;
      set({ currentIndex: next });
      if (attemptId) { saveIndex(attemptId, next); syncIndexToServer(attemptId, next); }
    }
  },

  goPrev: () => {
    const { currentIndex, attemptId } = get();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      set({ currentIndex: prev });
      if (attemptId) { saveIndex(attemptId, prev); syncIndexToServer(attemptId, prev); }
    }
  },

  reset: () => {
    const { attemptId } = get();
    if (attemptId) clearIndex(attemptId);
    set({
      attemptId: null, testSetId: null, testSetName: null, testSetType: null, startedAt: null,
      questions: [], currentIndex: 0, answers: new Map(), previousAnswers: new Map(),
      drillMode: false, drillTotal: 0, drillQuestionIds: [], drillAnsweredIds: new Set(),
      drillNavLoadedPages: new Set(), loadedQuestions: new Map(),
    });
  },
}));
