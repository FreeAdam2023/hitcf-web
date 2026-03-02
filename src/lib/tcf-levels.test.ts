import { describe, it, expect } from "vitest";
import {
  getTcfPoints,
  calcTcfScore,
  getEstimatedTcfLevel,
  estimateTcfLevelFromRatio,
  TCF_MAX_SCORE,
} from "./tcf-levels";

describe("getTcfPoints", () => {
  it("should return 3 for questions 1-4", () => {
    expect(getTcfPoints(1)).toBe(3);
    expect(getTcfPoints(4)).toBe(3);
  });

  it("should return 9 for questions 5-10", () => {
    expect(getTcfPoints(5)).toBe(9);
    expect(getTcfPoints(10)).toBe(9);
  });

  it("should return 15 for questions 11-19", () => {
    expect(getTcfPoints(11)).toBe(15);
    expect(getTcfPoints(19)).toBe(15);
  });

  it("should return 21 for questions 20-30", () => {
    expect(getTcfPoints(20)).toBe(21);
    expect(getTcfPoints(30)).toBe(21);
  });

  it("should return 27 for questions 31-35", () => {
    expect(getTcfPoints(31)).toBe(27);
    expect(getTcfPoints(35)).toBe(27);
  });

  it("should return 33 for questions 36-39", () => {
    expect(getTcfPoints(36)).toBe(33);
    expect(getTcfPoints(39)).toBe(33);
  });
});

describe("calcTcfScore", () => {
  it("should return 0 for no correct answers", () => {
    const answers = [
      { question_number: 1, is_correct: false },
      { question_number: 2, is_correct: false },
    ];
    expect(calcTcfScore(answers)).toBe(0);
  });

  it("should sum points for correct answers only", () => {
    const answers = [
      { question_number: 1, is_correct: true },   // 3
      { question_number: 2, is_correct: false },   // 0
      { question_number: 5, is_correct: true },    // 9
      { question_number: 20, is_correct: true },   // 21
    ];
    expect(calcTcfScore(answers)).toBe(3 + 9 + 21);
  });

  it("should handle null is_correct as incorrect", () => {
    const answers = [
      { question_number: 1, is_correct: null },
      { question_number: 5, is_correct: true },
    ];
    expect(calcTcfScore(answers)).toBe(9);
  });

  it("should return 0 for empty array", () => {
    expect(calcTcfScore([])).toBe(0);
  });
});

describe("getEstimatedTcfLevel", () => {
  it("should return C2 for 549+", () => {
    expect(getEstimatedTcfLevel(549).level).toBe("C2");
    expect(getEstimatedTcfLevel(699).level).toBe("C2");
  });

  it("should return C1 for 523-548", () => {
    expect(getEstimatedTcfLevel(523).level).toBe("C1");
    expect(getEstimatedTcfLevel(548).level).toBe("C1");
  });

  it("should return B2 for 458-522", () => {
    expect(getEstimatedTcfLevel(458).level).toBe("B2");
    expect(getEstimatedTcfLevel(522).level).toBe("B2");
  });

  it("should return B1 for 398-457", () => {
    expect(getEstimatedTcfLevel(398).level).toBe("B1");
    expect(getEstimatedTcfLevel(457).level).toBe("B1");
  });

  it("should return A2 for 331-397", () => {
    expect(getEstimatedTcfLevel(331).level).toBe("A2");
    expect(getEstimatedTcfLevel(397).level).toBe("A2");
  });

  it("should return A1 for below 331", () => {
    expect(getEstimatedTcfLevel(330).level).toBe("A1");
    expect(getEstimatedTcfLevel(0).level).toBe("A1");
  });
});

describe("estimateTcfLevelFromRatio", () => {
  it("should return A1 for zero total", () => {
    expect(estimateTcfLevelFromRatio(0, 0).level).toBe("A1");
  });

  it("should return C2 for perfect score", () => {
    expect(estimateTcfLevelFromRatio(39, 39).level).toBe("C2");
  });

  it("should map ratio to approximate level", () => {
    // 50% of 699 = ~350 → A2
    expect(estimateTcfLevelFromRatio(20, 39).level).toBe("A2");
  });
});

describe("TCF_MAX_SCORE", () => {
  it("should be 699", () => {
    expect(TCF_MAX_SCORE).toBe(699);
  });
});
