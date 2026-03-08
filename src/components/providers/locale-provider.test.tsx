import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "./locale-provider";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/zh/tests",
}));

// Mock auth store
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { user: null }) => unknown) =>
    selector({ user: null }),
}));

// Mock next-intl to just render children with locale
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({
    children,
    locale,
  }: {
    children: React.ReactNode;
    locale: string;
  }) => (
    <div data-testid="intl-provider" data-locale={locale}>
      {children}
    </div>
  ),
}));

beforeEach(() => {
  document.documentElement.dir = "ltr";
});

describe("LocaleProvider", () => {
  it("should render children with valid locale", () => {
    render(
      <LocaleProvider locale="en">
        <span>Hello</span>
      </LocaleProvider>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByTestId("intl-provider").dataset.locale).toBe("en");
  });

  it("should fall back to en for invalid locale", () => {
    render(
      <LocaleProvider locale="de">
        <span>Hallo</span>
      </LocaleProvider>,
    );
    expect(screen.getByTestId("intl-provider").dataset.locale).toBe("en");
  });

  it("should set dir=rtl for Arabic", () => {
    render(
      <LocaleProvider locale="ar">
        <span>مرحبا</span>
      </LocaleProvider>,
    );
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("should set dir=ltr for non-Arabic", () => {
    render(
      <LocaleProvider locale="fr">
        <span>Bonjour</span>
      </LocaleProvider>,
    );
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("should accept all 4 supported locales", () => {
    for (const locale of ["zh", "en", "fr", "ar"]) {
      const { unmount } = render(
        <LocaleProvider locale={locale}>
          <span>test</span>
        </LocaleProvider>,
      );
      expect(screen.getByTestId("intl-provider").dataset.locale).toBe(locale);
      unmount();
    }
  });
});
