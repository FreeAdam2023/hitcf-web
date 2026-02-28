import { create } from "zustand";
import type { QuestionBrief } from "@/lib/api/types";

const SESSION_KEY = "hitcf_writing_essays";

interface WritingExamState {
  attemptId: string | null;
  testSetId: string | null;
  mode: "practice" | "exam" | null;
  tasks: QuestionBrief[];
  currentTaskIndex: number;
  essays: Record<string, string>;  // task_number ("1","2","3") → essay text
  timeLimitSeconds: number;
  startedAt: string | null;
  status: "in_progress" | "grading" | "completed";
  dirty: boolean;

  init: (
    attemptId: string,
    testSetId: string,
    tasks: QuestionBrief[],
    mode: "practice" | "exam",
    timeLimitSeconds: number,
    startedAt: string,
    existingEssays?: Record<string, { text: string; word_count: number }>,
  ) => void;
  setEssay: (taskNumber: string, text: string) => void;
  goToTask: (index: number) => void;
  markSaved: () => void;
  setStatus: (status: "in_progress" | "grading" | "completed") => void;
  reset: () => void;
}

function saveEssaysToSession(attemptId: string, essays: Record<string, string>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ attemptId, essays }));
  } catch { /* ignore quota errors */ }
}

function loadEssaysFromSession(attemptId: string): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data.attemptId !== attemptId || typeof data.essays !== "object") return {};
    return data.essays;
  } catch {
    return {};
  }
}

function clearEssaysFromSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export const useWritingExamStore = create<WritingExamState>((set, get) => ({
  attemptId: null,
  testSetId: null,
  mode: null,
  tasks: [],
  currentTaskIndex: 0,
  essays: {},
  timeLimitSeconds: 0,
  startedAt: null,
  status: "in_progress",
  dirty: false,

  init: (attemptId, testSetId, tasks, mode, timeLimitSeconds, startedAt, existingEssays) => {
    const essays: Record<string, string> = {};

    // Load from backend attempt data first
    if (existingEssays) {
      for (const [key, val] of Object.entries(existingEssays)) {
        if (val?.text) essays[key] = val.text;
      }
    }

    // Merge with sessionStorage cached essays (local takes priority)
    const cached = loadEssaysFromSession(attemptId);
    for (const [key, val] of Object.entries(cached)) {
      if (val && !essays[key]) essays[key] = val;
    }

    set({
      attemptId,
      testSetId,
      mode,
      tasks,
      currentTaskIndex: 0,
      essays,
      timeLimitSeconds,
      startedAt,
      status: "in_progress",
      dirty: false,
    });
    saveEssaysToSession(attemptId, essays);
  },

  setEssay: (taskNumber, text) =>
    set((state) => {
      const next = { ...state.essays, [taskNumber]: text };
      if (state.attemptId) saveEssaysToSession(state.attemptId, next);
      return { essays: next, dirty: true };
    }),

  goToTask: (index) => {
    const { tasks } = get();
    if (index >= 0 && index < tasks.length) {
      set({ currentTaskIndex: index });
    }
  },

  markSaved: () => set({ dirty: false }),

  setStatus: (status) => set({ status }),

  reset: () => {
    clearEssaysFromSession();
    set({
      attemptId: null,
      testSetId: null,
      mode: null,
      tasks: [],
      currentTaskIndex: 0,
      essays: {},
      timeLimitSeconds: 0,
      startedAt: null,
      status: "in_progress",
      dirty: false,
    });
  },
}));
