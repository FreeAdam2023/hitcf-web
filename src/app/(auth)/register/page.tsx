"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import {
  sendCode,
  verifyCode,
  completeRegistration,
} from "@/lib/api/registration";

type Step = "email" | "code" | "password";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendCode(email.trim().toLowerCase());
      setStep("code");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("发送失败，请稍后重试");
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
        setError("验证失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("密码至少需要 8 位");
      return;
    }
    if (!name.trim()) {
      setError("请输入姓名");
      return;
    }

    setLoading(true);

    try {
      await completeRegistration(verificationToken, password, name.trim());

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed, redirect to login
        router.push("/login");
      } else {
        router.push("/tests");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("注册失败，请稍后重试");
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
      setError("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("发送失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">注册 HiTCF</CardTitle>
        <CardDescription>
          {step === "email" && "输入邮箱接收验证码"}
          {step === "code" && `验证码已发送至 ${email}`}
          {step === "password" && "设置密码完成注册"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
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
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "发送中..." : "发送验证码"}
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                6 位验证码
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
                className="text-center text-lg tracking-widest"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "验证中..." : "验证"}
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary"
            >
              重新发送验证码
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                姓名
              </label>
              <Input
                id="name"
                type="text"
                placeholder="您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="reg-password"
                type="password"
                placeholder="至少 8 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "完成注册"}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          已有账号？{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            登录
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
