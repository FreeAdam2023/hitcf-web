"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePracticeStore } from "@/stores/practice-store";
import { useExamStore } from "@/stores/exam-store";
import { completeAttempt } from "@/lib/api/attempts";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { SeatIndicator } from "./seat-indicator";
import { cn, parseUTCms } from "@/lib/utils";
import { localizeTestName } from "@/lib/test-name";
import { useAuthStore } from "@/stores/auth-store";

const NAV_KEYS = [
  { href: "/tests", key: "nav.tests" },
  { href: "/review", key: "nav.review" },
  { href: "/vocabulary", key: "nav.vocabulary" },
  { href: "/history", key: "nav.history" },
  { href: "/reference", key: "nav.reference" },
  { href: "/pricing", key: "nav.pricing", hideWhenSubscribed: true },
  { href: "/resources", key: "nav.resources" },
] as const;

export function Navbar() {
  const t = useTranslations();
  const hasActiveSub = useAuthStore((s) => s.hasActiveSubscription);
  const user = useAuthStore((s) => s.user);

  const pathname = usePathname();
  const isImmersive = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");

  const allItems = NAV_KEYS
    .filter((item) => {
      if (!("hideWhenSubscribed" in item && item.hideWhenSubscribed)) return true;
      // Only hide for real paid subscribers, not reverse_trial/recall/referral
      const plan = user?.subscription?.plan;
      const nonPaidPlans = ["reverse_trial", "recall", "referral", "tester"];
      return !(hasActiveSub() && plan && !nonPaidPlans.includes(plan));
    })
    .map((item) => ({ href: item.href, label: t(item.key) }));

  if (isImmersive) {
    return <ImmersiveHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="me-6 shrink-0">
          <Image src="/logo.png" alt="HiTCF" width={36} height={36} className="md:h-10 md:w-10" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {allItems.map((item) => {
            const isCurrent = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <SeatIndicator />
          <NotificationBell />
          <UserMenu className="hidden md:inline-flex" />
        </div>
      </div>
    </header>
  );
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function ImmersiveHeader() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const isExam = pathname.startsWith("/exam/");
  const label = isExam ? t('common.modes.exam') : t('common.modes.practice');
  const rawTestSetName = usePracticeStore((s) => s.testSetName);
  const testSetType = usePracticeStore((s) => s.testSetType);
  const testSetName = rawTestSetName && testSetType
    ? localizeTestName(t, testSetType, rawTestSetName)
    : rawTestSetName;
  const answersSize = usePracticeStore((s) => s.answers.size);
  const totalQuestions = usePracticeStore((s) => s.questions.length);
  const practiceAttemptId = usePracticeStore((s) => s.attemptId);
  const examStarted = useExamStore((s) => s.examStarted);
  const startedAt = usePracticeStore((s) => s.startedAt);
  const isPractice = !isExam;
  const allAnswered = isPractice && totalQuestions > 0 && answersSize >= totalQuestions;
  const [completing, setCompleting] = useState(false);

  const startRef = useRef(startedAt ? parseUTCms(startedAt) : Date.now());
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startRef.current) / 1000))
  );

  useEffect(() => {
    if (startedAt) {
      startRef.current = parseUTCms(startedAt);
    }
    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-10 max-w-7xl items-center px-4">
        <Image src="/logo.png" alt="HiTCF" width={40} height={40} />
        {testSetName && (
          <span className="ms-3 truncate text-sm font-medium text-foreground max-w-[40vw]">
            {testSetName}
          </span>
        )}
        {isExam && examStarted && (
          <div className="ms-3 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatElapsed(elapsed)}
          </div>
        )}
        <div className="ms-auto flex items-center gap-1">
          {allAnswered ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-green-600 hover:text-green-600 hover:bg-green-600/10 dark:text-green-400 dark:hover:text-green-400"
              disabled={completing}
              onClick={async () => {
                if (!practiceAttemptId) return;
                setCompleting(true);
                try {
                  await completeAttempt(practiceAttemptId);
                  router.push(`/results/${practiceAttemptId}`);
                } catch {
                  setCompleting(false);
                }
              }}
            >
              {completing ? t('common.actions.submitting') : t('practice.session.completePractice')}
            </Button>
          ) : isExam ? (
            /* Exam submit is handled by the navigator panel, not navbar */
            null
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                  {t('nav.exitLabel', { label })}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('nav.exitConfirmTitle', { label })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('nav.exitConfirmAnswered', {
                      answered: answersSize,
                      total: totalQuestions,
                    })}
                    {answersSize > 0 ? ` ${t('nav.exitConfirmProgress', { label })}` : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t('nav.exitConfirmContinue', { label })}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    const returnUrl = sessionStorage.getItem("practiceReturnUrl") || "/tests";
                    sessionStorage.removeItem("practiceReturnUrl");
                    router.push(returnUrl);
                  }}>
                    {t('nav.exitConfirmExit')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </header>
  );
}
