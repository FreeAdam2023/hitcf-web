import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./page";

const mockPush = vi.fn();
const mockLogout = vi.fn();

let mockUser: {
  name: string;
  email: string;
  subscription?: { status: string | null; plan: string | null };
} | null = {
  name: "Alice",
  email: "alice@test.com",
  subscription: { status: "active", plan: "monthly" },
};
let mockIsAuthenticated = true;
let mockIsLoading = false;

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "userMenu.accountSettings": "Account Settings",
      "userMenu.referral": "Invite Friends",
      "userMenu.checkin": "Daily Check-in",
      "userMenu.feedback": "Feedback",
      "userMenu.upgradePro": "Upgrade to Pro",
      "userMenu.logout": "Log Out",
      "userMenu.defaultName": "User",
      "userMenu.pro": "Pro",
      "userMenu.tester": "Tester",
      "userMenu.trial": "Trial",
      "userMenu.free": "Free",
      "nav.resources": "Resources",
    };
    return map[key] || key;
  },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      user: mockUser,
      isAuthenticated: mockIsAuthenticated,
      isLoading: mockIsLoading,
      logout: mockLogout,
      hasActiveSubscription: () =>
        mockUser?.subscription?.status === "active" ||
        mockUser?.subscription?.status === "trialing",
    }),
}));

vi.mock("@/components/layout/user-menu", () => ({
  SubscriptionBadge: ({ status }: { status: string | null }) => (
    <span data-testid="sub-badge">{status || "free"}</span>
  ),
}));

vi.mock("@/components/feedback/feedback-dialog", () => ({
  FeedbackDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="feedback-dialog">Feedback</div> : null,
}));

beforeEach(() => {
  mockPush.mockReset();
  mockLogout.mockReset();
  mockUser = {
    name: "Alice",
    email: "alice@test.com",
    subscription: { status: "active", plan: "monthly" },
  };
  mockIsAuthenticated = true;
  mockIsLoading = false;
});

describe("ProfilePage", () => {
  it("renders user name and email", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("renders subscription badge", () => {
    render(<ProfilePage />);
    expect(screen.getByTestId("sub-badge")).toBeInTheDocument();
  });

  it("renders core menu items", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("Invite Friends")).toBeInTheDocument();
    expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("hides upgrade button for subscribed users", () => {
    render(<ProfilePage />);
    expect(screen.queryByText("Upgrade to Pro")).not.toBeInTheDocument();
  });

  it("shows upgrade button for free users", () => {
    mockUser = {
      name: "Bob",
      email: "bob@test.com",
      subscription: { status: null, plan: null },
    };
    render(<ProfilePage />);
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("navigates to account settings on click", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.click(screen.getByText("Account Settings"));
    expect(mockPush).toHaveBeenCalledWith("/account");
  });

  it("navigates to referral on click", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.click(screen.getByText("Invite Friends"));
    expect(mockPush).toHaveBeenCalledWith("/referral");
  });

  it("opens feedback dialog on click", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    expect(screen.queryByTestId("feedback-dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText("Feedback"));
    expect(screen.getByTestId("feedback-dialog")).toBeInTheDocument();
  });

  it("calls logout on click", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("redirects to login when not authenticated", () => {
    mockIsAuthenticated = false;
    mockUser = null;
    render(<ProfilePage />);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows avatar initial from user name", () => {
    render(<ProfilePage />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
