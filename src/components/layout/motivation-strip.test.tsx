import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MotivationStrip } from "./motivation-strip";

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
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "motivation.daysLeft" && params?.days !== undefined) return `${params.days}j`;
    if (key === "motivation.today") return "Jour J";
    if (key === "motivation.setExamDate") return "Set exam date";
    if (key.startsWith("history.summary.countdown.")) return key.split(".").pop();
    return key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// ─── Tests ───────────────────────────────────────────────

describe("MotivationStrip", () => {
  beforeEach(() => {
    mockUser = null;
    mockIsAuthenticated = false;
    vi.useRealTimers();
  });

  it("renders nothing when not authenticated", () => {
    mockIsAuthenticated = false;
    mockUser = null;
    const { container } = render(<MotivationStrip />);
    expect(container.innerHTML).toBe("");
  });

  it("shows nudge to set exam date when authenticated but no exam date", () => {
    mockIsAuthenticated = true;
    mockUser = { exam_date: null, exam_city: null };
    render(<MotivationStrip />);
    expect(screen.getByText("Set exam date")).toBeInTheDocument();
  });

  it("shows countdown when exam date is set in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7)); // April 7, 2026
    mockIsAuthenticated = true;
    mockUser = { exam_date: "2026-05-20", exam_city: "ottawa" };
    render(<MotivationStrip />);
    expect(screen.getByText("43j")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows Jour J on exam day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20)); // May 20, 2026
    mockIsAuthenticated = true;
    mockUser = { exam_date: "2026-05-20", exam_city: "ottawa" };
    render(<MotivationStrip />);
    expect(screen.getByText("Jour J")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders nothing when exam date is in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 1)); // June 1, 2026
    mockIsAuthenticated = true;
    mockUser = { exam_date: "2026-05-20", exam_city: "ottawa" };
    const { container } = render(<MotivationStrip />);
    expect(container.innerHTML).toBe("");
    vi.useRealTimers();
  });

  it("nudge links to /history", () => {
    mockIsAuthenticated = true;
    mockUser = { exam_date: null, exam_city: null };
    render(<MotivationStrip />);
    const link = screen.getByText("Set exam date").closest("a");
    expect(link).toHaveAttribute("href", "/history");
  });
});
