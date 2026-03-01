"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Headphones,
  BookOpenText,
  PenLine,
  MessageCircle,
  MapPin,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Youtube,
  Wrench,
  Globe,
  CalendarCheck,
  Clock,
  Target,
  BookOpen,
  TableProperties,
  Info,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";

/* ── constants ── */

const VALID_TABS = ["exam", "scores", "resources", "centers"];

/* ── data ── */

const SUBJECT_META = [
  { icon: Headphones, score: "0–699", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { icon: BookOpenText, score: "0–699", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  { icon: PenLine, score: "0–20", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  { icon: MessageCircle, score: "0–20", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
];

const NCLC_ROWS = [
  { level: "4", co: "331–368", ce: "342–374", ee: "4–5", eo: "4–5" },
  { level: "5", co: "369–397", ce: "375–405", ee: "6", eo: "6" },
  { level: "6", co: "398–457", ce: "406–452", ee: "7–9", eo: "7–9" },
  { level: "7", co: "458–502", ce: "453–498", ee: "10–11", eo: "10–11", highlight: true },
  { level: "8", co: "503–522", ce: "499–523", ee: "12–13", eo: "12–13" },
  { level: "9", co: "523–548", ce: "524–548", ee: "14–15", eo: "14–15" },
  { level: "10+", co: "549–699", ce: "549–699", ee: "16–20", eo: "16–20" },
];

const IMMIGRATION_REQS = ["NCLC 7", "NCLC 7", "NCLC 7", "NCLC 4"];

const OFFICIAL_RESOURCE_URLS = [
  { name: "TV5MONDE", url: "https://apprendre.tv5monde.com" },
  { name: "RFI Savoirs", url: "https://savoirs.rfi.fr" },
  { name: "Journal en français facile", url: "https://francaisfacile.rfi.fr/fr/podcasts/journal-en-fran%C3%A7ais-facile/" },
  { name: "France Éducation international", url: "https://www.france-education-international.fr/hub/tcf" },
  { name: "Français Facile", url: "https://www.francaisfacile.com" },
  { name: "innerFrench", url: "https://innerfrench.com" },
];

const YOUTUBE_RESOURCE_URLS = [
  { name: "Français Authentique", url: "https://www.youtube.com/@francaisauthentique" },
  { name: "The perfect French with Dylane", url: "https://www.youtube.com/@theperfectfrenchwithdylane" },
  { name: "Français avec Pierre", url: "https://www.youtube.com/@FrancaisavecPierre" },
  { name: "InnerFrench", url: "https://www.youtube.com/@innerFrench" },
  { name: "Easy French", url: "https://www.youtube.com/@EasyFrench" },
  { name: "Learn French with Alexa", url: "https://www.youtube.com/@leaboreal" },
];

const TOOL_RESOURCE_URLS = [
  { url: "https://www.bilibili.com" },
  { url: "https://apps.ankiweb.net" },
  { url: "https://www.duolingo.com" },
  { url: "https://www.logicieleducatif.fr" },
  { url: "https://www.lawlessfrench.com" },
];

const CHINA_CENTER_URLS = [
  "https://www.blcu.edu.cn",
  "https://www.afchine.org/zh",
  "https://www.afshanghai.org",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afchine.org/zh",
  "https://www.afhongkong.org",
];

const CANADA_CENTERS = [
  { city: "Toronto", org: "Alliance Française Toronto", address: "24 Spadina Rd, Toronto, ON", url: "https://www.alliance-francaise.ca/en/exams/tcf-canada" },
  { city: "Montréal", org: "Alliance Française de Montréal", address: "1425 Blvd René-Lévesque O, Montréal, QC", url: "https://www.afmontreal.com" },
  { city: "Vancouver", org: "Alliance Française Vancouver", address: "6161 Cambie St, Vancouver, BC", url: "https://www.afvancouver.ca" },
  { city: "Calgary", org: "Alliance Française Calgary", address: "1520 4 St SW, Calgary, AB", url: "https://www.afcalgary.ca" },
  { city: "Ottawa", org: "Alliance Française Ottawa", address: "352 MacLaren St, Ottawa, ON", url: "https://www.af.ca/ottawa" },
  { city: "Halifax", org: "Alliance Française Halifax", address: "1526 Dresden Row, Halifax, NS", url: "https://www.afhalifax.ca" },
  { city: "Edmonton", org: "Alliance Française Edmonton", address: "10507 Saskatchewan Dr, Edmonton, AB", url: "https://www.afedmonton.ca" },
];

/* ── component ── */

export function ResourcesContent() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("exam");
  const [autoRotate, setAutoRotate] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const richB = { b: (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong> };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
      setAutoRotate(false);
    }
  }, []);

  const rotateTab = useCallback(() => {
    setActiveTab((prev) => {
      const idx = VALID_TABS.indexOf(prev);
      return VALID_TABS[(idx + 1) % VALID_TABS.length];
    });
  }, []);

  useEffect(() => {
    if (!autoRotate) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(rotateTab, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRotate, rotateTab]);

  function handleTabChange(value: string) {
    setAutoRotate(false);
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-background to-blue-50/30 dark:from-emerald-950/10 dark:to-blue-950/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <GraduationCap className="h-4 w-4" />
                {t("resources.hero.badge")}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {t("resources.hero.title")}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                {t("resources.hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href="/tests"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-primary to-blue-600 px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:from-primary/90 hover:to-blue-600/90"
                >
                  {t("resources.hero.startPractice")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex h-11 items-center gap-2 rounded-md border px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <Users className="h-4 w-4" />
                      {t("resources.hero.joinCommunity")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="w-64 p-4">
                    <p className="text-xs font-semibold mb-1">{t("resources.hero.communityTitle")}</p>
                    <p className="text-[11px] text-muted-foreground mb-3">{t("resources.hero.communityDesc")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <a href="https://www.xiaohongshu.com/user/profile/605439725" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1.5">
                        <Image src="/qr-xiaohongshu-cropped.jpg" alt="Xiaohongshu QR" width={100} height={100} className="rounded-lg border transition-transform group-hover:scale-105" />
                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{t("resources.hero.followXhs")}</span>
                      </a>
                      <div className="flex flex-col items-center gap-1.5">
                        <Image src="/qr-wechat-cropped.jpg" alt="WeChat QR" width={100} height={100} className="rounded-lg border" />
                        <span className="text-[11px] text-muted-foreground">{t("resources.hero.addWechat")}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/15 via-blue-400/10 to-purple-400/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                  <Image
                    src="/hero-quebec.jpg"
                    alt={t("resources.hero.imageAlt")}
                    width={640}
                    height={427}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              {autoRotate ? (
                <>{t("resources.tabs.autoRotateHint")}</>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5 animate-bounce-x" />
                  {t("resources.tabs.manualHint")}
                </>
              )}
            </p>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mx-auto mb-10 grid w-full max-w-2xl grid-cols-4 h-auto p-1.5 bg-muted/80 rounded-xl shadow-sm ring-1 ring-border/50">
              <TabsTrigger value="exam" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <BookOpen className="h-4 w-4 hidden sm:block" />
                {t("resources.tabs.exam")}
              </TabsTrigger>
              <TabsTrigger value="scores" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <TableProperties className="h-4 w-4 hidden sm:block" />
                {t("resources.tabs.scores")}
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <GraduationCap className="h-4 w-4 hidden sm:block" />
                {t("resources.tabs.resources")}
              </TabsTrigger>
              <TabsTrigger value="centers" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <MapPin className="h-4 w-4 hidden sm:block" />
                {t("resources.tabs.centers")}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Exam Format ── */}
            <TabsContent value="exam" forceMount className="data-[state=inactive]:hidden">
              {/* Intro */}
              <div className="mx-auto max-w-3xl mb-12">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("resources.exam.title")}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {t.rich("resources.exam.desc", richB)}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => {
                    const purpose = t(`resources.exam.purposes.${i}`);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <Target className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{purpose}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    {t("resources.exam.validityLabel")} <strong className="text-foreground">{t("resources.exam.validityValue")}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    {t("resources.exam.intervalLabel")} <strong className="text-foreground">{t("resources.exam.intervalValue")}</strong>
                  </div>
                </div>
              </div>

              {/* Four subjects */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SUBJECT_META.map((s, i) => {
                  const name = t(`resources.exam.subjects.${i}.name`);
                  const questions = t(`resources.exam.subjects.${i}.questions`);
                  const duration = t(`resources.exam.subjects.${i}.duration`);
                  return (
                    <div
                      key={i}
                      className="rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <h3 className="mt-3 font-bold">{name}</h3>
                      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>{t("resources.exam.questionCount")}</span>
                          <span className="font-medium text-foreground">{questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("resources.exam.durationLabel")}</span>
                          <span className="font-medium text-foreground">{duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("resources.exam.scoreLabel")}</span>
                          <span className="font-mono font-medium text-foreground">{s.score}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Writing & Speaking tâches */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                      <PenLine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold">{t("resources.exam.writingTitle")}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                          {i + 1}
                        </span>
                        <span>{t(`resources.exam.writingTasks.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <MessageCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold">{t("resources.exam.speakingTitle")}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          {i + 1}
                        </span>
                        <span>{t(`resources.exam.speakingTasks.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 2: Score Table ── */}
            <TabsContent value="scores" forceMount className="data-[state=inactive]:hidden">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("resources.scores.title")}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {t("resources.scores.subtitle")}
                </p>
                <div className="mt-8 overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold">{t("resources.scores.headers.nclc")}</th>
                        <th className="px-4 py-3 text-center font-semibold">{t("resources.scores.headers.co")}</th>
                        <th className="px-4 py-3 text-center font-semibold">{t("resources.scores.headers.ce")}</th>
                        <th className="px-4 py-3 text-center font-semibold">{t("resources.scores.headers.ee")}</th>
                        <th className="px-4 py-3 text-center font-semibold">{t("resources.scores.headers.eo")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {NCLC_ROWS.map((row) => (
                        <tr
                          key={row.level}
                          className={`border-b last:border-0 ${
                            row.highlight
                              ? "bg-primary/5 ring-1 ring-inset ring-primary/20 font-semibold"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${
                                row.highlight
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {row.level}
                              {row.highlight && " *"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono">{row.co}</td>
                          <td className="px-4 py-3 text-center font-mono">{row.ce}</td>
                          <td className="px-4 py-3 text-center font-mono">{row.ee}</td>
                          <td className="px-4 py-3 text-center font-mono">{row.eo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t.rich("resources.scores.footnote", richB)}
                </p>

                {/* NCLC 7 explanation callout */}
                <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-primary">{t("resources.scores.nclc7Title")}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        {t.rich("resources.scores.nclc7Desc", richB)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immigration programs reference */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">{t("resources.scores.immigrationTitle")}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => {
                      const name = t(`resources.scores.programs.${i}.name`);
                      const desc = t(`resources.scores.programs.${i}.desc`);
                      return (
                        <div key={i} className="rounded-lg border bg-card px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                              {IMMIGRATION_REQS[i]}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 3: Study Resources ── */}
            <TabsContent value="resources" forceMount className="data-[state=inactive]:hidden">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t("resources.learn.title")}
              </h2>
              <p className="mt-3 mb-10 text-muted-foreground">
                {t("resources.learn.subtitle")}
              </p>

              {/* Official resources */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold">{t("resources.learn.officialTitle")}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {OFFICIAL_RESOURCE_URLS.map((r, i) => {
                    const desc = t(`resources.learn.official.${i}.desc`);
                    const tag = t(`resources.learn.official.${i}.tag`);
                    return (
                      <a
                        key={r.name}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold group-hover:text-primary transition-colors">{r.name}</h4>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {tag && (
                          <span className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                            {tag}
                          </span>
                        )}
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* YouTube */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                    <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold">{t("resources.learn.youtubeTitle")}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {YOUTUBE_RESOURCE_URLS.map((r, i) => {
                    const desc = t(`resources.learn.youtube.${i}.desc`);
                    const tag = t(`resources.learn.youtube.${i}.tag`);
                    return (
                      <a
                        key={r.name}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-red-300 dark:hover:border-red-700"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{r.name}</h4>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="mt-1.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                          {tag}
                        </span>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Tools */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold">{t("resources.learn.toolsTitle")}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TOOL_RESOURCE_URLS.map((r, i) => {
                    const name = t(`resources.learn.tools.${i}.name`);
                    const desc = t(`resources.learn.tools.${i}.desc`);
                    return (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-700"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{name}</h4>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 4: Test Centers ── */}
            <TabsContent value="centers" forceMount className="data-[state=inactive]:hidden">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t("resources.centers.title")}
              </h2>
              <p className="mt-3 mb-8 text-muted-foreground">
                {t("resources.centers.subtitle")}
              </p>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* China */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="flex items-center gap-2 bg-muted/50 px-5 py-3 border-b">
                    <span className="text-base">🇨🇳</span>
                    <h3 className="font-bold">{t("resources.centers.chinaTitle")}</h3>
                  </div>
                  <div className="divide-y">
                    {CHINA_CENTER_URLS.map((url, i) => {
                      const city = t(`resources.centers.china.${i}.city`);
                      const org = t(`resources.centers.china.${i}.org`);
                      const note = t(`resources.centers.china.${i}.note`);
                      return (
                        <div key={`${city}-${i}`} className="flex items-start justify-between gap-3 px-5 py-3.5 text-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{city}</span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <MapPin className="h-3 w-3" />
                                {org}
                              </a>
                              {note && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {note}
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                          >
                            {t("resources.centers.website")}
                            <ExternalLink className="ml-1 inline h-3 w-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground space-y-1">
                    <div>
                      {t.rich("resources.centers.chinaFee", richB)}
                    </div>
                    <div>
                      {t("resources.centers.globalSearch")}
                      <a
                        href="https://www.france-education-international.fr/en/tcf-all-audiences/register-session"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        france-education-international.fr
                        <ExternalLink className="ml-1 inline h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Canada */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="flex items-center gap-2 bg-muted/50 px-5 py-3 border-b">
                    <span className="text-base">🇨🇦</span>
                    <h3 className="font-bold">{t("resources.centers.canadaTitle")}</h3>
                  </div>
                  <div className="divide-y">
                    {CANADA_CENTERS.map((c) => (
                      <div key={c.city} className="flex items-start justify-between gap-3 px-5 py-3.5 text-sm">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{c.city}</span>
                            <span className="text-muted-foreground">{c.org}</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.org + " " + c.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            {c.address}
                          </a>
                        </div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                        >
                          {t("resources.centers.website")}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
                    {t.rich("resources.centers.canadaFee", richB)}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="relative mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("resources.cta.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("resources.cta.subtitle")}
          </p>
          <div className="mt-8">
            <Link
              href="/tests"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-primary to-blue-600 px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:from-primary/90 hover:to-blue-600/90"
            >
              {t("resources.cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
          {t("resources.disclaimer.text")}
          <span className="mx-2">·</span>
          <Link href="/disclaimer" className="hover:text-foreground transition-colors">{t("resources.disclaimer.link")}</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
