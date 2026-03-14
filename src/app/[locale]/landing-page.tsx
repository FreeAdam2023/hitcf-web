"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Headphones,
  BookOpenText,
  MessageCircle,
  PenLine,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  Zap,
  Shield,
  Clock,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { LOGIN_URL, SITE_STATS, STATS_PARAMS } from "@/lib/constants";

const FEATURE_META = [
  { icon: Headphones, color: "from-blue-500 to-blue-600", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400", borderColor: "hover:border-blue-300 dark:hover:border-blue-700" },
  { icon: BookOpenText, color: "from-emerald-500 to-emerald-600", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400", borderColor: "hover:border-emerald-300 dark:hover:border-emerald-700" },
  { icon: MessageCircle, color: "from-amber-500 to-amber-600", iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400", borderColor: "hover:border-amber-300 dark:hover:border-amber-700" },
  { icon: PenLine, color: "from-purple-500 to-purple-600", iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400", borderColor: "hover:border-purple-300 dark:hover:border-purple-700" },
];

const STAT_META = [
  { value: SITE_STATS.totalQuestions, color: "text-blue-600 dark:text-blue-400" },
  { value: SITE_STATS.totalTestSets, color: "text-emerald-600 dark:text-emerald-400" },
  { value: String(SITE_STATS.listeningReadingSets), color: "text-amber-600 dark:text-amber-400" },
  { value: "78%", color: "text-purple-600 dark:text-purple-400" },
];

const STEP_ICONS = [Sparkles, Target, Zap];

const BANK_META = [
  { icon: Headphones, color: "from-blue-500 to-blue-600", iconColor: "text-blue-500", count: SITE_STATS.listeningReadingQuestions },
  { icon: MessageCircle, color: "from-amber-500 to-amber-600", iconColor: "text-amber-500", count: SITE_STATS.speakingQuestions },
  { icon: PenLine, color: "from-purple-500 to-purple-600", iconColor: "text-purple-500", count: SITE_STATS.writingQuestions },
];

const HIGHLIGHT_ICONS = [Target, Zap, Sparkles];

const TCF_GUIDE = [
  { clb: "CLB 7", tcf: "309–397", highlight: true },
  { clb: "CLB 8", tcf: "398–452" },
  { clb: "CLB 9", tcf: "453–498" },
  { clb: "CLB 10+", tcf: "499–699" },
];

const TRUST_ICONS = [Clock, CreditCard, RefreshCw, Shield];

export function LandingPage() {
  const t = useTranslations();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const isSubscribed = hasActiveSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <Badge
                variant="outline"
                className="animate-fade-in-up mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
              >
                <Target className="mr-1.5 h-3.5 w-3.5" />
                {t("landing.hero.badge")}
              </Badge>
              <h1 className="animate-fade-in-up-d1 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-600 via-primary to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
                  {t("landing.hero.titleHighlight")}
                </span>
                {t("landing.hero.titleSuffix")}
              </h1>
              <p className="animate-fade-in-up-d2 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {t("landing.hero.subtitle")}
              </p>
              <div className="animate-fade-in-up-d3 mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                {isAuthenticated ? (
                  <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                    <Link href="/tests">
                      {t("landing.hero.startPractice")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                      <a href={LOGIN_URL}>
                        {t("landing.hero.registerCta")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                      <a href="#pricing">{t("landing.hero.viewPricing")}</a>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="animate-fade-in-up-d2 relative hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-blue-400/10 to-purple-400/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                  <Image
                    src="/hero-canada-flag.jpg"
                    alt={t("landing.hero.imageAlt")}
                    width={640}
                    height={427}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -left-6 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                  <div className="text-2xl font-extrabold text-primary">8,500+</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.questionsLabel")}</div>
                </div>
                <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  {t("landing.hero.clb7Target")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative border-y border-border/40 bg-card py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {STAT_META.map((s, i) => (
            <div key={i} className={`text-center animate-fade-in-up-d${i + 1}`}>
              <div className={`text-4xl font-extrabold tracking-tight ${s.color}`}>
                {s.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-muted-foreground">
                {t(`landing.stats.${i}`)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Showcase (carousel) ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.showcaseBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.showcaseTitle")}
            </h2>
          </div>

          <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} className="mx-auto max-w-4xl">
            <CarouselContent>
              {/* Slide 0 — Sentence playback */}
              <CarouselItem>
                <div className="flex flex-col items-center gap-8 px-2 lg:flex-row lg:gap-12 lg:min-h-[400px]">
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {t("landing.showcase.0.title")}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("landing.showcase.0.desc")}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-[360px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                      <Image src="/features/transcript.png" alt="Sentence playback" width={800} height={600} className="h-full w-auto object-cover object-top" />
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 1 — Word cards (3 fanned) */}
              <CarouselItem>
                <div className="flex flex-col items-center gap-8 px-2 lg:flex-row lg:gap-12 lg:min-h-[400px]">
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {t("landing.showcase.1.title")}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("landing.showcase.1.desc")}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative h-[340px] w-[300px]">
                      {/* Back — feminine noun (fan left) */}
                      <div className="absolute top-[10%] left-1/2 -ml-[90px] w-[180px] origin-bottom -rotate-[15deg] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                        <Image src="/features/wordcard-fem.png" alt="Feminine noun card" width={180} height={280} className="h-auto w-full object-cover" />
                      </div>
                      {/* Middle — verb conjugation (center) */}
                      <div className="absolute top-[10%] left-1/2 -ml-[90px] w-[180px] origin-bottom z-10 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                        <Image src="/features/wordcard-verb.png" alt="Verb conjugation card" width={180} height={280} className="h-auto w-full object-cover" />
                      </div>
                      {/* Front — masculine noun (fan right) */}
                      <div className="absolute top-[10%] left-1/2 -ml-[90px] w-[180px] origin-bottom rotate-[15deg] z-20 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                        <Image src="/features/wordcard-noun.png" alt="Noun card" width={180} height={280} className="h-auto w-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2 — AI explanation */}
              <CarouselItem>
                <div className="flex flex-col items-center gap-8 px-2 lg:flex-row lg:gap-12 lg:min-h-[400px]">
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {t("landing.showcase.2.title")}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("landing.showcase.2.desc")}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-[360px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                      <Image src="/features/explanation.png" alt="AI explanation" width={500} height={800} className="h-full w-auto object-cover object-top" />
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3 — Flashcard review */}
              <CarouselItem>
                <div className="flex flex-col items-center gap-8 px-2 lg:flex-row lg:gap-12 lg:min-h-[400px]">
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {t("landing.showcase.3.title")}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("landing.showcase.3.desc")}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-[360px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                      <Image src="/features/flashcard.png" alt="Flashcard review" width={800} height={500} className="h-full w-auto object-cover object-top" />
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 4 — Grammar analysis */}
              <CarouselItem>
                <div className="flex flex-col items-center gap-8 px-2 lg:flex-row lg:gap-12 lg:min-h-[400px]">
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {t("landing.showcase.4.title")}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("landing.showcase.4.desc")}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex h-[340px] w-[320px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 p-6 shadow-xl ring-1 ring-black/5 dark:from-primary/10 dark:via-blue-950/30 dark:to-purple-950/20">
                      <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className="w-full max-w-[240px]">
                        <rect x="20" y="10" width="160" height="24" rx="4" fill="hsl(var(--muted))" fillOpacity="0.15" stroke="hsl(var(--border))" strokeWidth="1" />
                        <text x="30" y="26" fontSize="10" fill="hsl(var(--muted-foreground))">Le chat dort sur le canapé</text>
                        <g>
                          <rect x="20" y="48" width="32" height="18" rx="3" fill="hsl(221 83% 53% / 0.12)" />
                          <text x="36" y="60" textAnchor="middle" fontSize="7" fontWeight="600" fill="hsl(221 83% 53%)">DET</text>
                          <rect x="58" y="48" width="32" height="18" rx="3" fill="hsl(262 83% 58% / 0.12)" />
                          <text x="74" y="60" textAnchor="middle" fontSize="7" fontWeight="600" fill="hsl(262 83% 58%)">NOM</text>
                          <rect x="96" y="48" width="32" height="18" rx="3" fill="hsl(142 76% 36% / 0.12)" />
                          <text x="112" y="60" textAnchor="middle" fontSize="7" fontWeight="600" fill="hsl(142 76% 36%)">VERB</text>
                          <rect x="134" y="48" width="46" height="18" rx="3" fill="hsl(38 92% 50% / 0.12)" />
                          <text x="157" y="60" textAnchor="middle" fontSize="7" fontWeight="600" fill="hsl(38 92% 50%)">PREP+NOM</text>
                        </g>
                        <line x1="36" y1="66" x2="36" y2="80" stroke="hsl(221 83% 53% / 0.4)" strokeWidth="1" />
                        <line x1="74" y1="66" x2="74" y2="80" stroke="hsl(262 83% 58% / 0.4)" strokeWidth="1" />
                        <line x1="112" y1="66" x2="112" y2="80" stroke="hsl(142 76% 36% / 0.4)" strokeWidth="1" />
                        <line x1="157" y1="66" x2="157" y2="80" stroke="hsl(38 92% 50% / 0.4)" strokeWidth="1" />
                        <text x="36" y="90" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">Le</text>
                        <text x="74" y="90" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">chat</text>
                        <text x="112" y="90" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">dort</text>
                        <text x="157" y="90" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">sur le…</text>
                        <rect x="20" y="105" width="160" height="44" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                        <text x="30" y="120" fontSize="7" fontWeight="700" fill="hsl(var(--primary))">dormir</text>
                        <text x="65" y="120" fontSize="6" fill="hsl(var(--muted-foreground))">v. intr. · présent · 3e sg.</text>
                        <rect x="30" y="128" width="50" height="10" rx="2" fill="hsl(var(--primary) / 0.08)" />
                        <text x="55" y="136" textAnchor="middle" fontSize="6" fill="hsl(var(--primary))">dormir sur</text>
                        <rect x="86" y="128" width="14" height="10" rx="2" fill="hsl(142 76% 36% / 0.12)" />
                        <text x="93" y="136" textAnchor="middle" fontSize="7" fill="hsl(142 76% 36%)">★</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            <div className="mt-8 flex items-center justify-center gap-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-y border-border/40 bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.featuresBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.featuresTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t("landing.featuresSubtitle")}
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {FEATURE_META.map((f, i) => {
              const title = t(`landing.features.${i}.title`);
              const desc = t(`landing.features.${i}.desc`, STATS_PARAMS);
              return (
                <Card
                  key={i}
                  className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${f.borderColor} animate-fade-in-up-d${i + 1}`}
                >
                  <div className={`h-1 bg-gradient-to-r ${f.color}`} />
                  <CardContent className="flex gap-4 pt-6">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Content Depth ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.contentBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.contentTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.contentSubtitle")}
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {BANK_META.map((bank, i) => {
              const label = t(`landing.banks.${i}.label`);
              const sub = t(`landing.banks.${i}.sub`, STATS_PARAMS);
              return (
                <Card key={i} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up-d${i + 1}`}>
                  <div className={`h-1 bg-gradient-to-r ${bank.color}`} />
                  <CardContent className="pt-6 text-center">
                    <bank.icon className={`mx-auto h-8 w-8 ${bank.iconColor}`} />
                    <div className="mt-4 text-4xl font-extrabold tracking-tight">
                      {bank.count}
                    </div>
                    <div className="mt-1 text-base font-semibold">{label}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              A1–A2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              B1–B2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
              C1–C2
            </span>
            <span>{t("landing.allLevels")}</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-border/40 bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.stepsBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.stepsTitle")}
            </h2>
          </div>
          <div className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent sm:block" />
            {STEP_ICONS.map((StepIcon, idx) => (
              <div key={idx} className={`relative text-center animate-fade-in-up-d${idx + 1}`}>
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 rotate-6" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25">
                    <StepIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-bold text-primary ring-2 ring-primary/20">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{t(`landing.steps.${idx}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`landing.steps.${idx}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.pricingBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.pricingTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.pricingSubtitle")}
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="h-1 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50" />
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">{t("landing.freeName")}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="ml-1 text-muted-foreground">{t("landing.freeUnit")}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {t("landing.freeFeature1", STATS_PARAMS)}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {t("landing.freeFeature2", STATS_PARAMS)}
                  </li>
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  {isAuthenticated ? (
                    <Link href="/tests">{t("landing.freeStart")}</Link>
                  ) : (
                    <a href={LOGIN_URL}>{t("landing.freeRegister")}</a>
                  )}
                </Button>
              </CardContent>
            </Card>
            {/* Pro */}
            <Card className="relative overflow-hidden border-2 border-primary shadow-xl shadow-primary/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
              <div className="absolute -top-0 right-4">
                <Badge className="rounded-t-none bg-gradient-to-r from-primary to-blue-600 text-white shadow-md">
                  {t("landing.proBadge")}
                </Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">{t("landing.proTrial")}</span>
                  <span className="ml-1 text-muted-foreground">{t("landing.proTrialUnit")}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {t(`landing.proFeatures.${i}`)}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                  {isSubscribed ? (
                    <Link href="/tests">{t("landing.proGoToTests")}</Link>
                  ) : (
                    <Link href="/pricing">{t("landing.proStartTrial")}</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Why HiTCF ── */}
      <section className="border-t border-border/40 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.whyBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.whyTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.whySubtitle")}
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {HIGHLIGHT_ICONS.map((HIcon, idx) => {
              const title = t(`landing.highlights.${idx}.title`);
              const desc = t(`landing.highlights.${idx}.desc`);
              return (
                <Card key={idx} className="overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center justify-center bg-muted/20 px-6 pt-6 pb-2">
                    <div className="w-full max-w-[200px]">
                      {idx === 0 && (
                        <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
                          <rect x="10" y="22" width="100" height="10" rx="5" fill="hsl(var(--muted))" fillOpacity="0.3" />
                          <rect x="10" y="22" width="78" height="10" rx="5" fill="hsl(var(--primary))" fillOpacity="0.7" />
                          <line x1="88" y1="18" x2="88" y2="36" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="3 2" />
                          <text x="88" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="hsl(var(--primary))">78%</text>
                          <text x="10" y="50" fontSize="18" fontWeight="800" fill="hsl(var(--primary))">CLB 7</text>
                          <rect x="60" y="42" width="50" height="14" rx="7" fill="hsl(142 76% 36% / 0.12)" />
                          <text x="85" y="53" textAnchor="middle" fontSize="8" fontWeight="600" fill="hsl(142 76% 36%)">{t("landing.svgReached")}</text>
                          <rect x="10" y="64" width="100" height="6" rx="3" fill="hsl(var(--muted))" fillOpacity="0.3" />
                          <rect x="10" y="64" width="62" height="6" rx="3" fill="hsl(38 92% 50% / 0.6)" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
                          {[0, 1, 2].map((i) => (
                            <g key={i}>
                              <rect x={10 + i * 36} y={8 + i * 6} width="32" height="44" rx="4"
                                fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                              <rect x={14 + i * 36} y={14 + i * 6} width="16" height="3" rx="1.5"
                                fill="hsl(var(--muted-foreground) / 0.15)" />
                              <rect x={14 + i * 36} y={20 + i * 6} width="24" height="3" rx="1.5"
                                fill="hsl(var(--muted-foreground) / 0.10)" />
                              <circle cx={34 + i * 36} cy={38 + i * 6} r="5" fill="hsl(0 72% 51% / 0.12)" />
                              <path d={`M${31 + i * 36} ${35 + i * 6}l6 6M${37 + i * 36} ${35 + i * 6}l-6 6`}
                                stroke="hsl(0 72% 51%)" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                          ))}
                          <path d="M100 36 L110 36" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
                          <polygon points="112,36 108,32 108,40" fill="hsl(var(--primary))" />
                          <circle cx="105" cy="60" r="10" fill="hsl(var(--primary) / 0.10)" />
                          <path d="M100 60a5 5 0 0 1 9-2.5M110 60a5 5 0 0 1-9 2.5"
                            stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
                          <circle cx="60" cy="34" r="26" fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth="1.5" />
                          <circle cx="60" cy="34" r="22"
                            stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray="104 138" strokeDashoffset="-34.5"
                            fill="none" />
                          <text x="60" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--foreground))">24:35</text>
                          <text x="60" y="42" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">{t("landing.svgRemaining")}</text>
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <circle key={i} cx={22 + i * 12} cy="72" r="3.5"
                              fill={i < 5 ? "hsl(var(--primary))" : i === 5 ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted))"}
                              stroke={i === 5 ? "hsl(var(--primary))" : "none"} strokeWidth="1" />
                          ))}
                        </svg>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <HIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TCF Guide ── */}
      <section className="border-t border-border/40 bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              {t("landing.guideBadge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.guideTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.guideSubtitle")}
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-xl border">
            {TCF_GUIDE.map((row, i) => (
              <div
                key={row.clb}
                className={`flex items-center justify-between border-b px-4 py-4 last:border-0 ${
                  row.highlight
                    ? "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      row.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {row.clb}
                  </Badge>
                  <span className="font-mono text-sm font-medium">{row.tcf}</span>
                </div>
                <span className="text-sm text-muted-foreground">{t(`landing.guideRows.${i}`)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("landing.guideFootnote")}
          </p>
          <div className="mt-8 text-center">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/resources">
                {t("landing.guideLink")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b border-border/40 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_ICONS.map((TrustIcon, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <TrustIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 text-xs font-medium">{t(`landing.trust.${i}.label`)}</p>
                <p className="text-[10px] text-muted-foreground">{t(`landing.trust.${i}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              FAQ
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("landing.faqTitle")}
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {t(`landing.faq.${i}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.faq.${i}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/40 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/15 via-blue-400/10 to-primary/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/hero-ottawa.jpg"
                  alt={t("landing.ctaImageAlt")}
                  width={640}
                  height={427}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("landing.ctaTitle")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landing.ctaSubtitle", STATS_PARAMS)}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                  {isAuthenticated ? (
                    <Link href="/tests">
                      {t("landing.ctaContinue")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <a href={LOGIN_URL}>
                      {t("landing.ctaRegister")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
