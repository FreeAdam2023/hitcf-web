import { describe, it, expect, beforeEach } from "vitest";
import { usePracticeStore } from "./practice-store";

const mockQuestions = [
  { id: "q1", question_number: 1 },
  { id: "q2", question_number: 2 },
  { id: "q3", question_number: 3 },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any[];

beforeEach(() => {
  usePracticeStore.getState().reset();
});

describe("practice-store", () => {
  it("should start with empty state", () => {
    const state = usePracticeStore.getState();
    expect(state.attemptId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.answers.size).toBe(0);
  });

  it("should initialize with questions", () => {
    usePracticeStore.getState().init("attempt-1", mockQuestions, "Test CO 1", "listening");
    const state = usePracticeStore.getState();
    expect(state.attemptId).toBe("attempt-1");
    expect(state.questions).toHaveLength(3);
    expect(state.testSetName).toBe("Test CO 1");
    expect(state.testSetType).toBe("listening");
    expect(state.currentIndex).toBe(0);
  });

  it("should jump to first unanswered on init with existing answers", () => {
    const existing = [
      { question_id: "q1", question_number: 1, selected: "A", is_correct: true },
      { question_id: "q2", question_number: 2, selected: "B", is_correct: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];

    usePracticeStore.getState().init("attempt-1", mockQuestions, null, null, null, existing);
    const state = usePracticeStore.getState();
    // q1 and q2 answered, so should jump to q3 (index 2)
    expect(state.currentIndex).toBe(2);
    expect(state.answers.size).toBe(2);
  });

  it("should navigate forward and backward", () => {
    usePracticeStore.getState().init("attempt-1", mockQuestions);

    usePracticeStore.getState().goNext();
    expect(usePracticeStore.getState().currentIndex).toBe(1);

    usePracticeStore.getState().goNext();
    expect(usePracticeStore.getState().currentIndex).toBe(2);

    // Should not go past the last question
    usePracticeStore.getState().goNext();
    expect(usePracticeStore.getState().currentIndex).toBe(2);

    usePracticeStore.getState().goPrev();
    expect(usePracticeStore.getState().currentIndex).toBe(1);

    usePracticeStore.getState().goPrev();
    expect(usePracticeStore.getState().currentIndex).toBe(0);

    // Should not go below 0
    usePracticeStore.getState().goPrev();
    expect(usePracticeStore.getState().currentIndex).toBe(0);
  });

  it("should go to a specific question", () => {
    usePracticeStore.getState().init("attempt-1", mockQuestions);

    usePracticeStore.getState().goToQuestion(2);
    expect(usePracticeStore.getState().currentIndex).toBe(2);

    // Out of bounds should not change
    usePracticeStore.getState().goToQuestion(-1);
    expect(usePracticeStore.getState().currentIndex).toBe(2);
    usePracticeStore.getState().goToQuestion(10);
    expect(usePracticeStore.getState().currentIndex).toBe(2);
  });

  it("should set an answer", () => {
    usePracticeStore.getState().init("attempt-1", mockQuestions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answer = { question_id: "q1", question_number: 1, selected: "A", is_correct: true } as any;
    usePracticeStore.getState().setAnswer("q1", answer);

    expect(usePracticeStore.getState().answers.get("q1")).toEqual(answer);
  });

  it("should reset to initial state", () => {
    usePracticeStore.getState().init("attempt-1", mockQuestions);
    usePracticeStore.getState().goNext();
    usePracticeStore.getState().reset();

    const state = usePracticeStore.getState();
    expect(state.attemptId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
  });
});
