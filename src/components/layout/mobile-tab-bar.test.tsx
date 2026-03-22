import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTabBar } from "./mobile-tab-bar";

let mockPathname = "/tests";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid={`tab-${href}`}>
      {children}
    </a>
  ),
  usePathname: () => mockPathname,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "nav.tests": "Tests",
      "nav.review": "Review",
      "nav.vocabulary": "Vocabulary",
      "nav.history": "History",
      "nav.profile": "Me",
    };
    return map[key] || key;
  },
}));

describe("MobileTabBar", () => {
  it("renders all 5 tabs", () => {
    mockPathname = "/tests";
    render(<MobileTabBar />);

    expect(screen.getByText("Tests")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Vocabulary")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Me")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    mockPathname = "/vocabulary";
    render(<MobileTabBar />);

    const vocabTab = screen.getByTestId("tab-/vocabulary");
    const testsTab = screen.getByTestId("tab-/tests");

    expect(vocabTab.className).toContain("text-primary");
    expect(testsTab.className).not.toContain("text-primary");
  });

  it("highlights tab for nested routes", () => {
    mockPathname = "/review/bookmarks";
    render(<MobileTabBar />);

    const reviewTab = screen.getByTestId("tab-/review");
    expect(reviewTab.className).toContain("text-primary");
  });

  it("returns null on practice pages", () => {
    mockPathname = "/practice/abc123";
    const { container } = render(<MobileTabBar />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null on exam pages", () => {
    mockPathname = "/exam/abc123";
    const { container } = render(<MobileTabBar />);
    expect(container.innerHTML).toBe("");
  });

  it("renders correct hrefs for all tabs", () => {
    mockPathname = "/tests";
    render(<MobileTabBar />);

    expect(screen.getByTestId("tab-/tests")).toHaveAttribute("href", "/tests");
    expect(screen.getByTestId("tab-/review")).toHaveAttribute("href", "/review");
    expect(screen.getByTestId("tab-/vocabulary")).toHaveAttribute("href", "/vocabulary");
    expect(screen.getByTestId("tab-/history")).toHaveAttribute("href", "/history");
    expect(screen.getByTestId("tab-/profile")).toHaveAttribute("href", "/profile");
  });
});
