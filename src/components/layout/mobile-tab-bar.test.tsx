import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTabBar } from "./mobile-tab-bar";

let mockPathname = "/tests";
let mockUser: { email: string } | null = { email: "test@hitcf.com" };

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
      "nav.home": "Home",
      "nav.tests": "Tests",
      "nav.review": "Review",
      "nav.vocabulary": "Vocabulary",
      "nav.history": "History",
      "nav.profile": "Me",
      "nav.pricing": "Pricing",
      "nav.login": "Log in",
    };
    return map[key] || key;
  },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser }),
}));

describe("MobileTabBar", () => {
  describe("logged in", () => {
    it("renders all 5 tabs", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/tests";
      render(<MobileTabBar />);

      expect(screen.getByText("Tests")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();
      expect(screen.getByText("Vocabulary")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("Me")).toBeInTheDocument();
    });

    it("highlights the active tab", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/vocabulary";
      render(<MobileTabBar />);

      const vocabTab = screen.getByTestId("tab-/vocabulary");
      const testsTab = screen.getByTestId("tab-/tests");

      expect(vocabTab.className).toContain("text-primary");
      expect(testsTab.className).not.toContain("text-primary");
    });

    it("highlights tab for nested routes", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/review/bookmarks";
      render(<MobileTabBar />);

      const reviewTab = screen.getByTestId("tab-/review");
      expect(reviewTab.className).toContain("text-primary");
    });

    it("renders correct hrefs for all tabs", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/tests";
      render(<MobileTabBar />);

      expect(screen.getByTestId("tab-/tests")).toHaveAttribute("href", "/tests");
      expect(screen.getByTestId("tab-/review")).toHaveAttribute("href", "/review");
      expect(screen.getByTestId("tab-/vocabulary")).toHaveAttribute("href", "/vocabulary");
      expect(screen.getByTestId("tab-/history")).toHaveAttribute("href", "/history");
      expect(screen.getByTestId("tab-/profile")).toHaveAttribute("href", "/profile");
    });
  });

  describe("guest", () => {
    it("renders guest tabs without pricing", () => {
      mockUser = null;
      mockPathname = "/";
      render(<MobileTabBar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Tests")).toBeInTheDocument();
      expect(screen.getByText("Log in")).toBeInTheDocument();
      expect(screen.queryByText("Pricing")).not.toBeInTheDocument();
      expect(screen.queryByText("Review")).not.toBeInTheDocument();
    });

    it("guest login tab links to /login", () => {
      mockUser = null;
      mockPathname = "/tests";
      render(<MobileTabBar />);

      expect(screen.getByTestId("tab-/login")).toHaveAttribute("href", "/login");
    });
  });

  describe("hidden pages", () => {
    it("returns null on practice pages", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/practice/abc123";
      const { container } = render(<MobileTabBar />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null on exam pages", () => {
      mockUser = { email: "test@hitcf.com" };
      mockPathname = "/exam/abc123";
      const { container } = render(<MobileTabBar />);
      expect(container.innerHTML).toBe("");
    });
  });
});
