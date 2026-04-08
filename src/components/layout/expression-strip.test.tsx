import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpressionStrip } from "./expression-strip";

// ─── Mocks ───────────────────────────────────────────────

let mockUser: {
  exam_date: string | null;
  exam_city: string | null;
} | null = null;
let mockIsAuthenticated = false;

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser; isAuthenticated: boolean }) => unknown) =>
    selector({ user: mockUser, isAuthenticated: mockIsAuthenticated }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "zh",
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "motivation.daysLeft" && params?.days !== undefined) return `${params.days}j`;
    if (key === "motivation.today") return "Jour J";
    if (key === "expressions.categories.connector") return "连接词";
    if (key === "expressions.categories.pattern") return "句式";
    if (key === "expressions.categories.idiom") return "惯用语";
    if (key === "expressions.categories.phrase") return "词组";
    if (key === "expressions.categories.register") return "语域";
    if (key.startsWith("expressions.categories.")) return key.split(".").pop();
    return key;
  },
}));

let mockPathname = "/tests";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePathname: () => mockPathname,
}));

// ─── Tests ───────────────────────────────────────────────

describe("ExpressionStrip", () => {
  beforeEach(() => {
    mockUser = null;
    mockIsAuthenticated = false;
    mockPathname = "/tests";
    vi.useRealTimers();
  });

  it("shows expression even when not authenticated (visible to everyone)", () => {
    mockIsAuthenticated = false;
    mockUser = null;
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).not.toBe("");
  });

  it("links to /expressions", () => {
    mockIsAuthenticated = false;
    render(<ExpressionStrip />);
    const link = document.querySelector("a[href='/expressions']");
    expect(link).toBeInTheDocument();
  });

  it("shows countdown when authenticated with future exam date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7)); // April 7, 2026
    mockIsAuthenticated = true;
    mockUser = { exam_date: "2026-05-20", exam_city: "ottawa" };
    render(<ExpressionStrip />);
    expect(screen.getByText("43j")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("hides during practice session", () => {
    mockIsAuthenticated = false;
    mockPathname = "/practice/abc123";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).toBe("");
  });

  it("hides during exam session", () => {
    mockIsAuthenticated = false;
    mockPathname = "/exam/abc123";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).toBe("");
  });

  it("hides during writing practice", () => {
    mockIsAuthenticated = false;
    mockPathname = "/writing-practice/abc123";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).toBe("");
  });

  it("hides during speaking conversation", () => {
    mockIsAuthenticated = false;
    mockPathname = "/speaking-conversation";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).toBe("");
  });

  it("hides on /history for authenticated users", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7));
    mockIsAuthenticated = true;
    mockUser = { exam_date: "2026-05-20", exam_city: "ottawa" };
    mockPathname = "/history";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).toBe("");
    vi.useRealTimers();
  });

  it("shows on /history for unauthenticated users", () => {
    mockIsAuthenticated = false;
    mockPathname = "/history";
    const { container } = render(<ExpressionStrip />);
    expect(container.innerHTML).not.toBe("");
  });
});
