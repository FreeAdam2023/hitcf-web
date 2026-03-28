import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuotaExceededModal } from "./quota-exceeded-modal";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    // Return a predictable string so we can assert on plan names
    if (key === "pricing.plans.monthly.name") return "Monthly";
    if (key === "pricing.plans.quarterly.name") return "Quarterly";
    if (key === "pricing.plans.semiannual.name") return "Semi-Annual";
    if (key === "pricing.limitedOffer") return "Limited Offer";
    if (key === "quota.exceeded.subscribe") return "Subscribe";
    if (key === "quota.exceeded.title") return "Quota Exceeded";
    if (key === "quota.exceeded.questionMessage")
      return `Used ${params?.used}/${params?.limit} questions`;
    if (key === "quota.exceeded.recommended") return "Best Value";
    if (key === "quota.exceeded.trialDays")
      return `${params?.days} day trial`;
    if (key === "quota.exceeded.unlimitedAccess") return "Unlimited access";
    if (key === "quota.exceeded.cancelAnytime") return "Cancel anytime";
    if (key === "quota.exceeded.continueFree") return "Continue Free";
    if (key === "quota.exceeded.resetHint") return "Resets daily";
    if (key.startsWith("pricing.plans.") && key.endsWith(".unit"))
      return "/period";
    if (key === "pricing.perMonth") return "/mo";
    if (key === "pricing.save") return `Save ${params?.percent}%`;
    if (key === "pricing.cta.redirecting") return "Redirecting...";
    return key;
  },
}));

// Mock auth store
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}));

// Mock subscriptions API
vi.mock("@/lib/api/subscriptions", () => ({
  createCheckout: vi.fn(),
}));

// Mock analytics
vi.mock("@/lib/analytics/track", () => ({
  trackEvent: vi.fn(),
}));

describe("QuotaExceededModal", () => {
  it("renders all three plan names (monthly, quarterly, semiannual)", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Quarterly")).toBeInTheDocument();
    expect(screen.getByText("Semi-Annual")).toBeInTheDocument();
  });

  it("shows 'Limited Offer' badge for quarterly only", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    const limitedOfferBadges = screen.getAllByText("Limited Offer");
    // Should appear exactly once — on the quarterly plan
    expect(limitedOfferBadges).toHaveLength(1);
  });

  it("shows 'Best Value' badge for semiannual (recommended)", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    expect(screen.getByText("Best Value")).toBeInTheDocument();
  });

  it("renders three subscribe buttons", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    const buttons = screen.getAllByText("Subscribe");
    expect(buttons).toHaveLength(3);
  });

  it("renders continue free button", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    expect(screen.getByText("Continue Free")).toBeInTheDocument();
  });

  it("displays correct prices", () => {
    render(
      <QuotaExceededModal
        open={true}
        onOpenChange={() => {}}
        type="question"
        used={5}
        limit={5}
      />,
    );

    expect(screen.getByText("US$19.9")).toBeInTheDocument();
    expect(screen.getByText("US$49.9")).toBeInTheDocument();
    expect(screen.getByText("US$69.9")).toBeInTheDocument();
  });
});
