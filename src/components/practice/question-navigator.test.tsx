import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionNavigator } from "./question-navigator";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "practice.navigator.title") return "Questions";
    if (key === "practice.navigator.unanswered") return "unanswered";
    if (key === "practice.navigator.correct") return "correct";
    if (key === "practice.navigator.wrong") return "wrong";
    if (key === "practice.navigator.answered") return "answered";
    if (key === "practice.navigator.reviewed") return "reviewed";
    if (key === "practice.navigator.questionLabel")
      return `Q${params?.n} ${params?.status}`;
    if (key === "common.answeredProgress")
      return `${params?.answered}/${params?.total}`;
    return key;
  },
}));

// Mock level-badge
vi.mock("@/components/shared/level-badge", () => ({
  LevelBadge: ({ level }: { level: string }) => <span data-testid="level-badge">{level}</span>,
}));

const baseProps = {
  total: 5,
  currentIndex: 0,
  answers: new Map(),
  questionIds: ["q1", "q2", "q3", "q4", "q5"],
  onNavigate: vi.fn(),
};

describe("QuestionNavigator", () => {
  it("renders question buttons with correct numbers", () => {
    render(<QuestionNavigator {...baseProps} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it("highlights current question with ring", () => {
    render(<QuestionNavigator {...baseProps} currentIndex={2} />);
    const btn = screen.getByText("3");
    expect(btn.className).toContain("ring-2");
  });

  it("calls onNavigate when a question button is clicked", async () => {
    const onNavigate = vi.fn();
    render(<QuestionNavigator {...baseProps} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText("3"));
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it("shows correct count in answered progress", () => {
    const answers = new Map([["q1", { is_correct: true }], ["q2", { is_correct: false }]]);
    render(<QuestionNavigator {...baseProps} answers={answers} />);
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("applies green background for correct answers", () => {
    const answers = new Map([["q1", { is_correct: true }]]);
    render(<QuestionNavigator {...baseProps} answers={answers} />);
    const btn = screen.getByLabelText("Q1 correct");
    expect(btn.className).toContain("bg-green-500");
  });

  it("applies red background for wrong answers", () => {
    const answers = new Map([["q1", { is_correct: false }]]);
    render(<QuestionNavigator {...baseProps} answers={answers} />);
    const btn = screen.getByLabelText("Q1 wrong");
    expect(btn.className).toContain("bg-red-500");
  });

  it("applies purple background for reviewed (unanswered) questions", () => {
    const reviewedIds = new Set(["q2"]);
    render(<QuestionNavigator {...baseProps} reviewedIds={reviewedIds} />);
    const btn = screen.getByLabelText("Q2 reviewed");
    expect(btn.className).toContain("bg-purple-500");
  });

  it("does not apply purple when question is both reviewed and answered", () => {
    const answers = new Map([["q2", { is_correct: true }]]);
    const reviewedIds = new Set(["q2"]);
    render(<QuestionNavigator {...baseProps} answers={answers} reviewedIds={reviewedIds} />);
    const btn = screen.getByLabelText("Q2 correct");
    // Should be green (correct), not purple
    expect(btn.className).toContain("bg-green-500");
    expect(btn.className).not.toContain("bg-purple-500");
  });

  it("unanswered non-reviewed buttons have muted background", () => {
    render(<QuestionNavigator {...baseProps} currentIndex={0} />);
    // Button 3 is not current, not answered, not reviewed
    const btn = screen.getByLabelText("Q3 unanswered");
    expect(btn.className).toContain("bg-muted");
  });

  it("shows answered progress with previousAnswers merged", () => {
    const answers = new Map([["q1", { is_correct: true }]]);
    const previousAnswers = new Map([["q3", { is_correct: false }]]);
    render(
      <QuestionNavigator
        {...baseProps}
        answers={answers}
        previousAnswers={previousAnswers}
      />,
    );
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("exam mode shows primary background for answered questions", () => {
    const answers = new Map([["q1", { is_correct: true }]]);
    render(<QuestionNavigator {...baseProps} answers={answers} mode="exam" />);
    const btn = screen.getByLabelText("Q1 answered");
    expect(btn.className).toContain("bg-primary");
    // Should NOT show green/red in exam mode
    expect(btn.className).not.toContain("bg-green-500");
    expect(btn.className).not.toContain("bg-red-500");
  });
});
