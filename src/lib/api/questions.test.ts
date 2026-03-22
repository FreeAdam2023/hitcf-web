import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGrammarCards,
  matchGrammarCard,
  getExplanationStatus,
  generateExplanation,
  getQuestionDetail,
} from "./questions";
import type { ExplanationResponse } from "./questions";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("grammar cards API client", () => {
  const sampleCard = {
    slug: "passe-compose",
    name: "Passé composé",
    name_zh: "合成过去时",
    name_en: "Past Tense (Compound)",
    category: "tense",
    level: "A2",
    rule: "avoir/être au présent + participe passé",
    rule_zh: "avoir/être 现在时 + 过去分词",
    explanation: "用于描述已完成的动作。",
    explanation_en: "Used to describe completed past actions.",
    examples: [{ fr: "J'ai mangé.", en: "I ate.", zh: "我吃了。" }],
    irregulars: null,
    tags: ["past tense"],
  };

  it("getGrammarCards calls GET /api/grammar-cards", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([sampleCard]),
    });

    const result = await getGrammarCards();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("passe-compose");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/grammar-cards");
  });

  it("getGrammarCards with category filter", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([sampleCard]),
    });

    await getGrammarCards("tense");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/grammar-cards?category=tense");
  });

  it("getGrammarCards returns empty array when no cards", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await getGrammarCards();
    expect(result).toEqual([]);
  });

  it("matchGrammarCard calls GET /api/grammar-cards/match", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sampleCard),
    });

    const result = await matchGrammarCard("passe-compose");
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("passe-compose");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/grammar-cards/match?q=passe-compose");
  });

  it("matchGrammarCard returns null when no match", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(null),
    });

    const result = await matchGrammarCard("nonexistent");
    expect(result).toBeNull();
  });

  it("matchGrammarCard encodes special characters in query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(null),
    });

    await matchGrammarCard("passé composé");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("q=pass%C3%A9%20compos%C3%A9");
  });
});

describe("getQuestionDetail", () => {
  it("calls GET /api/questions/{id}", async () => {
    const detail = { id: "q-1", question_text: "Bonjour", options: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(detail),
    });

    const result = await getQuestionDetail("q-1");
    expect(result).toEqual(detail);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/questions/q-1");
  });
});

describe("explanation async polling API", () => {
  const readyResponse: ExplanationResponse = {
    status: "ready",
    sentence_translation: null,
    correct_reasoning: "The correct answer is B because...",
    distractors: null,
    exam_skill: "comprehension orale",
    trap_pattern: null,
    vocabulary: null,
    similar_tip: null,
    transcript_en: "Hello, how are you?",
    transcript_zh: null,
    transcript_native: null,
    option_translations: null,
  };

  const generatingResponse: ExplanationResponse = { status: "generating" };
  const notStartedResponse: ExplanationResponse = { status: "not_started" };

  describe("getExplanationStatus", () => {
    it("calls GET /api/questions/{id}/explanation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      const result = await getExplanationStatus("q-123");
      expect(result).toEqual(readyResponse);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-123/explanation");
      // GET request — no method override, so init should not specify POST
      const init = mockFetch.mock.calls[0][1] as RequestInit;
      expect(init.method).toBeUndefined();
    });

    it("appends locale query param when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(generatingResponse),
      });

      const result = await getExplanationStatus("q-456", "zh");
      expect(result).toEqual(generatingResponse);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-456/explanation?locale=zh");
    });

    it("omits query string when locale is undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(notStartedResponse),
      });

      await getExplanationStatus("q-789");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-789/explanation");
      expect(url).not.toContain("?");
    });

    it("returns not_started status correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(notStartedResponse),
      });

      const result = await getExplanationStatus("q-100");
      expect(result.status).toBe("not_started");
    });
  });

  describe("generateExplanation", () => {
    it("calls POST /api/questions/{id}/explanation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      const result = await generateExplanation("q-200");
      expect(result).toEqual(readyResponse);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-200/explanation");
      const init = mockFetch.mock.calls[0][1] as RequestInit;
      expect(init.method).toBe("POST");
    });

    it("handles 202-style generating response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(generatingResponse),
      });

      const result = await generateExplanation("q-300");
      expect(result.status).toBe("generating");
      expect(result).toEqual({ status: "generating" });
    });

    it("handles cached ready response with explanation data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      const result = await generateExplanation("q-400");
      expect(result.status).toBe("ready");
      // The ready response should carry explanation fields alongside status
      expect("correct_reasoning" in result).toBe(true);
      if (result.status === "ready") {
        expect(result.correct_reasoning).toBe("The correct answer is B because...");
        expect(result.transcript_en).toBe("Hello, how are you?");
      }
    });

    it("appends force and locale params when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      await generateExplanation("q-500", true, "en");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/questions/q-500/explanation");
      expect(url).toContain("force=true");
      expect(url).toContain("locale=en");
    });

    it("appends only force when locale is omitted", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      await generateExplanation("q-600", true);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-600/explanation?force=true");
    });

    it("appends only locale when force is falsy", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      await generateExplanation("q-700", false, "zh");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-700/explanation?locale=zh");
    });

    it("has no query string when force and locale are both omitted", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
      });

      await generateExplanation("q-800");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/questions/q-800/explanation");
      expect(url).not.toContain("?");
    });
  });
});
