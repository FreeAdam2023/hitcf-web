import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGrammarCards, matchGrammarCard } from "./questions";

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
