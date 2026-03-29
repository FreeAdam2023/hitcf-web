"use client";

import { Suspense, useState, useMemo, useRef, useCallback } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { ApiError } from "@/lib/api/client";
import { register, verifyAndComplete } from "@/lib/api/registration";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Step = "create" | "verify";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const t = useTranslations();

  const trackingMeta = useMemo(() => ({
    referrer: typeof document !== "undefined" ? document.referrer : "",
    utm_source: searchParams.get("utm_source") || "",
    utm_medium: searchParams.get("utm_medium") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    referral_code: searchParams.get("ref") || "",
  }), [searchParams]);

  const [step, setStep] = useState<Step>("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const handleTurnstileSuccess = useCallback((token: string) => setTurnstileToken(token), []);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleGoogleRegister = () => {
    setGoogleLoading(true);
    // Persist tracking data in cookies so NextAuth server-side callback can read them
    const { referral_code, utm_source, utm_medium, utm_campaign } = trackingMeta;
    if (referral_code) document.cookie = `ref=${encodeURIComponent(referral_code)};path=/;max-age=3600`;
    if (utm_source) document.cookie = `utm_source=${encodeURIComponent(utm_source)};path=/;max-age=3600`;
    if (utm_medium) document.cookie = `utm_medium=${encodeURIComponent(utm_medium)};path=/;max-age=3600`;
    if (utm_campaign) document.cookie = `utm_campaign=${encodeURIComponent(utm_campaign)};path=/;max-age=3600`;
    signIn("google", { callbackUrl: "/welcome" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError(t("auth.register.mustAgree"));
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError(t("auth.register.invalidEmail"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.register.passwordMinLength"));
      return;
    }

    setLoading(true);

    try {
      await register(email.trim().toLowerCase(), password, trackingMeta, turnstileToken);
      setStep("verify");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.registerFailed"));
      }
      // Reset Turnstile for retry
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyAndComplete(email.trim().toLowerCase(), code.trim());

      // Auto-login
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/welcome");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.verifyFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      // Re-register to resend code (with same password)
      await register(email.trim().toLowerCase(), password, trackingMeta);
      setCode("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.resendFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "create"
            ? t("auth.register.title")
            : t("auth.register.verifyTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === "create"
            ? t("auth.register.subtitle")
            : t("auth.register.verifySentTo", { email })}
        </p>
        {/* Step indicator */}
        <div className="mt-4 flex gap-1.5">
          {(["create", "verify"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s === step
                  ? "bg-primary"
                  : i < (step === "create" ? 0 : 1)
                    ? "bg-primary/40"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {step === "create" && (
        <>
          {/* Google Register */}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-3"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
          >
            <GoogleIcon />
            {googleLoading
              ? t("auth.register.creating")
              : t("auth.register.googleRegister")}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-muted-foreground">
              {t("auth.register.orDivider")}
            </span>
            <hr className="flex-1 border-border" />
          </div>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("auth.register.emailLabel")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium">
                {t("auth.register.passwordLabel")}
              </label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t("auth.register.agreeTerms")}{" "}
                <Link href="/terms-of-service" className="text-primary hover:underline underline-offset-2" target="_blank">
                  {t("auth.register.termsLink")}
                </Link>
                {" "}{t("auth.register.and")}{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline underline-offset-2" target="_blank">
                  {t("auth.register.privacyLink")}
                </Link>
              </span>
            </label>

            {TURNSTILE_SITE_KEY && (
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={handleTurnstileSuccess}
                onExpire={() => setTurnstileToken("")}
                options={{ theme: "auto", size: "flexible" }}
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
              disabled={loading || googleLoading || !agreed || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
            >
              {loading
                ? t("auth.register.creating")
                : t("auth.register.createAccount")}
            </Button>
          </form>
        </>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={loading}
            autoFocus
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
            disabled={loading || code.length !== 6}
          >
            {loading
              ? t("auth.register.verifying")
              : t("auth.register.verifyButton")}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t("auth.register.resend")}
          </button>
        </form>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {t("auth.register.hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {t("auth.register.login")}
        </Link>
      </div>
    </div>
  );
}
