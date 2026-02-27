"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import {
  sendCode,
  verifyCode,
  completeRegistration,
} from "@/lib/api/registration";

type Step = "email" | "code" | "password";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations();

  const STEP_INFO = {
    email: { title: t("auth.register.emailStep.title"), desc: t("auth.register.emailStep.desc") },
    code: { title: t("auth.register.codeStep.title"), desc: t("auth.register.codeStep.desc") },
    password: { title: t("auth.register.passwordStep.title"), desc: t("auth.register.passwordStep.desc") },
  };

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const info = STEP_INFO[step];

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email.trim())) {
      setError(t("auth.register.invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      await sendCode(email.trim().toLowerCase());
      setStep("code");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.sendFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyCode(email.trim().toLowerCase(), code.trim());
      setVerificationToken(res.verification_token);
      setStep("password");
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

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("auth.register.passwordMinLength"));
      return;
    }
    if (!name.trim()) {
      setError(t("auth.register.nameRequired"));
      return;
    }

    setLoading(true);

    try {
      await completeRegistration(verificationToken, password, name.trim());

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/tests");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.registerFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await sendCode(email.trim().toLowerCase());
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
        <h1 className="text-2xl font-bold tracking-tight">{info.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === "code" ? t("auth.register.codeSent", { email }) : info.desc}
        </p>
        {/* Step indicator */}
        <div className="mt-4 flex gap-1.5">
          {(["email", "code", "password"] as const).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s === step
                  ? "bg-primary"
                  : (["email", "code", "password"] as const).indexOf(s) <
                    (["email", "code", "password"] as const).indexOf(step)
                  ? "bg-primary/40"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {step === "email" && (
        <form onSubmit={handleSendCode} noValidate className="space-y-4">
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
            disabled={loading}
          >
            {loading ? t("auth.register.sending") : t("auth.register.sendCode")}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              {t("auth.register.codeLabel")}
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoFocus
              className="h-11 text-center text-lg tracking-[0.5em] font-mono"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
            disabled={loading || code.length !== 6}
          >
            {loading ? t("auth.register.verifying") : t("auth.register.verify")}
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

      {step === "password" && (
        <form onSubmit={handleComplete} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t("auth.register.nameLabel")}
            </label>
            <Input
              id="name"
              type="text"
              placeholder={t("auth.register.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              maxLength={100}
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
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
            disabled={loading}
          >
            {loading ? t("auth.register.registering") : t("auth.register.complete")}
          </Button>
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
