import { describe, it, expect, beforeEach, vi } from "vitest";
import { useExamStore } from "./exam-store";

const mockQuestions = [
  { id: "q1", question_number: 1, type: "reading" },
  { id: "q2", question_number: 2, type: "reading" },
  { id: "q3", question_number: 3, type: "reading" },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any[];

// Mock sessionStorage
const storage = new Map<string, string>();
vi.stubGlobal("sessionStorage", {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
});

beforeEach(() => {
  useExamStore.getState().reset();
  storage.clear();
});

describe("exam-store", () => {
  it("should start with empty state", () => {
    const state = useExamStore.getState();
    expect(state.attemptId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.answers.size).toBe(0);
  });

  it("should initialize with questions", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    const state = useExamStore.getState();
    expect(state.attemptId).toBe("att-1");
    expect(state.questions).toHaveLength(3);
    expect(state.timeLimitSeconds).toBe(600);
    expect(state.testType).toBe("reading");
  });

  it("should navigate between questions", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    expect(useExamStore.getState().currentIndex).toBe(0);

    useExamStore.getState().goNext();
    expect(useExamStore.getState().currentIndex).toBe(1);

    useExamStore.getState().goNext();
    expect(useExamStore.getState().currentIndex).toBe(2);

    // Should not go beyond last
    useExamStore.getState().goNext();
    expect(useExamStore.getState().currentIndex).toBe(2);

    useExamStore.getState().goPrev();
    expect(useExamStore.getState().currentIndex).toBe(1);

    useExamStore.getState().goToQuestion(0);
    expect(useExamStore.getState().currentIndex).toBe(0);
  });

  it("should persist currentIndex to sessionStorage", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    useExamStore.getState().goNext();
    useExamStore.getState().goNext();

    const raw = storage.get("hitcf_exam_index");
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!);
    expect(data.attemptId).toBe("att-1");
    expect(data.index).toBe(2);
  });

  it("should restore currentIndex from sessionStorage on init", () => {
    // Pre-populate sessionStorage
    storage.set("hitcf_exam_index", JSON.stringify({ attemptId: "att-1", index: 2 }));

    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    expect(useExamStore.getState().currentIndex).toBe(2);
  });

  it("should not restore index for different attemptId", () => {
    storage.set("hitcf_exam_index", JSON.stringify({ attemptId: "att-other", index: 2 }));

    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    expect(useExamStore.getState().currentIndex).toBe(0);
  });

  it("should clamp restored index to valid range", () => {
    storage.set("hitcf_exam_index", JSON.stringify({ attemptId: "att-1", index: 99 }));

    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    expect(useExamStore.getState().currentIndex).toBe(0);
  });

  it("should set and persist answers", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    useExamStore.getState().setAnswer("q1", { question_id: "q1", question_number: 1, selected: "A" });

    expect(useExamStore.getState().answers.size).toBe(1);
    expect(useExamStore.getState().answers.get("q1")?.selected).toBe("A");

    // Answers persisted in sessionStorage
    const raw = storage.get("hitcf_exam_answers");
    expect(raw).toBeTruthy();
  });

  it("should restore answers from sessionStorage on init", () => {
    const answers = [["q1", { question_id: "q1", question_number: 1, selected: "B" }]];
    storage.set("hitcf_exam_answers", JSON.stringify({ attemptId: "att-1", answers }));

    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    expect(useExamStore.getState().answers.get("q1")?.selected).toBe("B");
  });

  it("should toggle flagged questions", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");

    useExamStore.getState().toggleFlag(1);
    expect(useExamStore.getState().flaggedQuestions.has(1)).toBe(true);

    useExamStore.getState().toggleFlag(1);
    expect(useExamStore.getState().flaggedQuestions.has(1)).toBe(false);
  });

  it("should clear everything on reset", () => {
    useExamStore.getState().init("att-1", mockQuestions, 600, "2026-01-01T00:00:00Z");
    useExamStore.getState().setAnswer("q1", { question_id: "q1", question_number: 1, selected: "C" });
    useExamStore.getState().goNext();

    useExamStore.getState().reset();
    const state = useExamStore.getState();
    expect(state.attemptId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.answers.size).toBe(0);
    expect(storage.has("hitcf_exam_answers")).toBe(false);
    expect(storage.has("hitcf_exam_index")).toBe(false);
  });
});
