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
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/* ── constants ── */

const VALID_TABS = ["exam", "scores", "resources", "centers"];

/* ── data ── */

const SUBJECTS = [
  {
    icon: Headphones,
    name: "听力理解 (CO)",
    questions: "39 题选择题",
    duration: "35 分钟",
    score: "0–699",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    icon: BookOpenText,
    name: "阅读理解 (CE)",
    questions: "39 题选择题",
    duration: "60 分钟",
    score: "0–699",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    icon: PenLine,
    name: "写作表达 (EE)",
    questions: "3 个写作任务",
    duration: "60 分钟",
    score: "0–20",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  {
    icon: MessageCircle,
    name: "口语表达 (EO)",
    questions: "3 个口语任务",
    duration: "12 分钟",
    score: "0–20",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
  },
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

const IMMIGRATION_PROGRAMS = [
  { program: "Express Entry (CEC)", req: "NCLC 7", desc: "加拿大经验类移民" },
  { program: "Express Entry (FSW)", req: "NCLC 7", desc: "联邦技术移民" },
  { program: "魁北克 PEQ", req: "NCLC 7", desc: "魁北克经验类移民" },
  { program: "公民入籍", req: "NCLC 4", desc: "加拿大公民申请" },
];

const OFFICIAL_RESOURCES = [
  {
    name: "TV5MONDE",
    url: "https://apprendre.tv5monde.com",
    desc: "法国国际电视台旗下免费法语学习平台，A1–C1 全等级视频课程 + 互动练习。按文化、社会、科学等主题分类，同时提升听力和阅读。",
    tag: "A1–C1",
  },
  {
    name: "RFI Savoirs",
    url: "https://savoirs.rfi.fr",
    desc: "法国国际广播电台学习频道，用真实法语新闻音频配练习题。语速从慢到正常都有，练 TCF 听力的绝佳素材。",
    tag: "听力",
  },
  {
    name: "Journal en français facile",
    url: "https://francaisfacile.rfi.fr/fr/podcasts/journal-en-fran%C3%A7ais-facile/",
    desc: "RFI「简明法语新闻」，每天 10 分钟清晰慢速播报国际新闻。坚持每天听一期，有助于稳步提升听力水平。",
    tag: "每日听力",
  },
  {
    name: "France Éducation international",
    url: "https://www.france-education-international.fr/hub/tcf",
    desc: "TCF 官方出题机构网站，查看考试介绍、评分标准和官方样题。备考前务必先了解真实考试格式。",
    tag: "官方",
  },
  {
    name: "Français Facile",
    url: "https://www.francaisfacile.com",
    desc: "老牌法语学习网站，大量免费语法、词汇、听力和阅读练习按难度分级。适合系统性补语法基础。",
    tag: "语法",
  },
  {
    name: "innerFrench",
    url: "https://innerfrench.com",
    desc: "Hugo 的法语学习平台，提供播客、YouTube 视频和系统课程，用自然法语讲文化社会话题。语速适中、内容有深度，适合中级学习者突破瓶颈。",
    tag: "B1–B2",
  },
];

const YOUTUBE_RESOURCES = [
  {
    name: "Français Authentique",
    url: "https://www.youtube.com/@francaisauthentique",
    desc: "百万粉丝沉浸式法语频道，Johan 纯法语讲日常话题。不教语法规则，通过大量自然输入培养语感。",
    tag: "B1+ 语感",
  },
  {
    name: "The perfect French with Dylane",
    url: "https://www.youtube.com/@theperfectfrenchwithdylane",
    desc: "法国人 Dylane 的教学频道，专注语法讲解和词汇扩展，每期短小精悍、清晰有条理。",
    tag: "语法词汇",
  },
  {
    name: "Français avec Pierre",
    url: "https://www.youtube.com/@FrancaisavecPierre",
    desc: "法语教师 Pierre 的综合教学频道，语法、词汇、发音、文化全覆盖。法语 + 字幕形式适合精听。",
    tag: "B1–C1",
  },
  {
    name: "InnerFrench",
    url: "https://www.youtube.com/@innerFrench",
    desc: "Hugo 的纯法语播客频道，每期 20–30 分钟讨论文化社会话题。语速适中，适合泛听 + 积累口语写作素材。",
    tag: "播客泛听",
  },
  {
    name: "Easy French",
    url: "https://www.youtube.com/@EasyFrench",
    desc: "法国街头随机采访系列，真实法国人日常口语 + 法英双字幕。听课本学不到的地道表达和口语节奏。",
    tag: "真实口语",
  },
  {
    name: "Learn French with Alexa",
    url: "https://www.youtube.com/@leaboreal",
    desc: "英法双语教学频道，Alexa 用英语解释法语语法和发音。讲解慢、例子多，零基础到 A2 打基础首选。",
    tag: "零基础",
  },
];

const TOOL_RESOURCES = [
  {
    name: "B 站 (Bilibili)",
    url: "https://www.bilibili.com",
    desc: "搜索「你好法语 A1 教材音频」「TCF 备考」等关键词，大量中文讲解的法语教学视频。中文学习者最容易上手的资源。",
  },
  {
    name: "Anki",
    url: "https://apps.ankiweb.net",
    desc: "开源免费的间隔重复记忆卡片软件，可下载社区共享的 TCF/DELF 词汇牌组。科学算法安排复习节奏，长期记忆效果远超死记硬背。",
  },
  {
    name: "Duolingo",
    url: "https://www.duolingo.com",
    desc: "游戏化语言学习 App，每天 10–15 分钟一课。虽达不到 TCF 深度，但适合保持每日法语接触。",
  },
  {
    name: "LogicielÉducatif",
    url: "https://www.logicieleducatif.fr",
    desc: "法国本土教育游戏网站，小游戏练习拼写、语法和词汇。面向法国学生但对学习者同样有效。",
  },
  {
    name: "Lawless French",
    url: "https://www.lawlessfrench.com",
    desc: "全面的法语语法参考网站，从初级到高级所有语法点 + 例句练习。遇到语法疑问当字典查。",
  },
];

const CHINA_CENTERS = [
  { city: "北京", org: "北京语言大学", url: "https://www.blcu.edu.cn", note: "" },
  { city: "北京", org: "北京法语联盟", url: "https://www.afchine.org/zh", note: "" },
  { city: "上海", org: "上海法语培训中心", url: "https://www.afshanghai.org", note: "" },
  { city: "广州", org: "广州法语联盟", url: "https://www.afchine.org/zh", note: "" },
  { city: "成都", org: "成都法语联盟", url: "https://www.afchine.org/zh", note: "" },
  { city: "武汉", org: "武汉法语联盟", url: "https://www.afchine.org/zh", note: "微信报名" },
  { city: "大连", org: "大连法语联盟", url: "https://www.afchine.org/zh", note: "" },
  { city: "昆明", org: "昆明法语联盟", url: "https://www.afchine.org/zh", note: "微信报名" },
  { city: "山东", org: "山东法语联盟", url: "https://www.afchine.org/zh", note: "新增" },
  { city: "南京", org: "南京法语联盟", url: "https://www.afchine.org/zh", note: "新增" },
  { city: "香港", org: "香港法语联盟", url: "https://www.afhongkong.org", note: "" },
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
  const [activeTab, setActiveTab] = useState("exam");
  const [autoRotate, setAutoRotate] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
                考试指南
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                TCF Canada 备考全攻略
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                考试内容、分数对照、免费学习资源、中加两国考场信息——分类查看，快速找到你需要的。
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/15 via-blue-400/10 to-purple-400/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                  <Image
                    src="/hero-quebec.jpg"
                    alt="魁北克老城法式街景"
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
                <>自动浏览中 · 点击任意板块停止</>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5 animate-bounce-x" />
                  点击切换查看不同板块
                </>
              )}
            </p>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mx-auto mb-10 grid w-full max-w-2xl grid-cols-4 h-auto p-1.5 bg-muted/80 rounded-xl shadow-sm ring-1 ring-border/50">
              <TabsTrigger value="exam" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <BookOpen className="h-4 w-4 hidden sm:block" />
                考试内容
              </TabsTrigger>
              <TabsTrigger value="scores" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <TableProperties className="h-4 w-4 hidden sm:block" />
                分数对照
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <GraduationCap className="h-4 w-4 hidden sm:block" />
                学习资源
              </TabsTrigger>
              <TabsTrigger value="centers" className="gap-1.5 py-3 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-background transition-all">
                <MapPin className="h-4 w-4 hidden sm:block" />
                考场信息
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: 考试内容 ── */}
            <TabsContent value="exam" forceMount className="data-[state=inactive]:hidden">
              {/* 简介 */}
              <div className="mx-auto max-w-3xl mb-12">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  什么是 TCF Canada
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  TCF Canada（Test de connaissance du français pour le Canada）是由
                  <strong className="text-foreground"> France Éducation international</strong>（原 CIEP）开发的法语能力测试，专为加拿大移民和公民申请设计。
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "联邦快速通道（Express Entry）移民",
                    "省提名计划（PNP）",
                    "加拿大公民入籍",
                    "魁北克移民（CSQ / PEQ）",
                  ].map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Target className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    成绩有效期 <strong className="text-foreground">2 年</strong>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    两次考试间隔至少 <strong className="text-foreground">30 天</strong>
                  </div>
                </div>
              </div>

              {/* 四大科目 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SUBJECTS.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <h3 className="mt-3 font-bold">{s.name}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>题量</span>
                        <span className="font-medium text-foreground">{s.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>时长</span>
                        <span className="font-medium text-foreground">{s.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>分数</span>
                        <span className="font-mono font-medium text-foreground">{s.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 写作 & 口语 tâche */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                      <PenLine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold">写作 3 个 Tâche</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "短消息（60–120 词）",
                      "正式信 / 文章（120–150 词）",
                      "议论文（120–180 词）",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                          {i + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <MessageCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold">口语 3 个 Tâche</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "引导面试（2 分钟）",
                      "角色扮演（5.5 分钟，含 2 分钟准备）",
                      "观点论述（4.5 分钟）",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          {i + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 2: 分数对照 ── */}
            <TabsContent value="scores" forceMount className="data-[state=inactive]:hidden">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  NCLC / CLB 分数对照表
                </h2>
                <p className="mt-3 text-muted-foreground">
                  加拿大移民局（IRCC）使用 NCLC / CLB 等级评估语言能力，以下为 TCF Canada 分数对照
                </p>
                <div className="mt-8 overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold">NCLC</th>
                        <th className="px-4 py-3 text-center font-semibold">听力 (CO)</th>
                        <th className="px-4 py-3 text-center font-semibold">阅读 (CE)</th>
                        <th className="px-4 py-3 text-center font-semibold">写作 (EE)</th>
                        <th className="px-4 py-3 text-center font-semibold">口语 (EO)</th>
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
                  * NCLC 7 是大部分 Express Entry 和 PNP 项目的<strong className="text-foreground">最低语言要求</strong>，也是多数考生的目标等级
                </p>

                {/* NCLC 7 explanation callout */}
                <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-primary">为什么 NCLC 7 这么重要？</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        NCLC 7（即 CLB 7）是加拿大大部分经济类移民项目的<strong className="text-foreground">最低法语要求</strong>。达到
                        NCLC 7 意味着你可以在 Express Entry（CEC、FSW）和大部分省提名项目（PNP）中满足语言门槛。更高的
                        NCLC 等级（8、9、10）可以为你的 CRS 综合评分系统获得<strong className="text-foreground">额外加分</strong>，NCLC 9 可获得语言满分加分。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immigration programs reference */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">常见移民项目语言要求</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {IMMIGRATION_PROGRAMS.map((p) => (
                      <div key={p.program} className="rounded-lg border bg-card px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.program}</span>
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {p.req}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 3: 学习资源 ── */}
            <TabsContent value="resources" forceMount className="data-[state=inactive]:hidden">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                免费法语学习资源推荐
              </h2>
              <p className="mt-3 mb-10 text-muted-foreground">
                全部免费或官方渠道，帮你从不同维度提升法语能力
              </p>

              {/* 官方资源 */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold">官方 &amp; 机构资源</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {OFFICIAL_RESOURCES.map((r) => (
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
                      {r.tag && (
                        <span className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                          {r.tag}
                        </span>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* YouTube */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                    <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold">YouTube 频道</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {YOUTUBE_RESOURCES.map((r) => (
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
                        {r.tag}
                      </span>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* 工具类 (includes B站) */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold">工具 &amp; 中文资源</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TOOL_RESOURCES.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{r.name}</h4>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 4: 考场信息 ── */}
            <TabsContent value="centers" forceMount className="data-[state=inactive]:hidden">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                中国 &amp; 加拿大考场
              </h2>
              <p className="mt-3 mb-8 text-muted-foreground">
                考场信息可能变动，请以各考点官方网站通知为准
              </p>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* 中国 */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="flex items-center gap-2 bg-muted/50 px-5 py-3 border-b">
                    <span className="text-base">🇨🇳</span>
                    <h3 className="font-bold">中国考场</h3>
                  </div>
                  <div className="divide-y">
                    {CHINA_CENTERS.map((c, i) => (
                      <div key={`${c.city}-${i}`} className="flex items-start justify-between gap-3 px-5 py-3.5 text-sm">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{c.city}</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.org)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <MapPin className="h-3 w-3" />
                              {c.org}
                            </a>
                            {c.note && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {c.note}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                        >
                          官网
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground space-y-1">
                    <div>
                      费用约 <strong className="text-foreground">¥2,500–2,800</strong>（因城市和机构略有差异）
                    </div>
                    <div>
                      全球考场查询：
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

                {/* 加拿大 */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="flex items-center gap-2 bg-muted/50 px-5 py-3 border-b">
                    <span className="text-base">🇨🇦</span>
                    <h3 className="font-bold">加拿大考场</h3>
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
                          官网
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
                    费用约 <strong className="text-foreground">CAD $390</strong>，每季度开放报名
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
            了解完考试，开始练题吧
          </h2>
          <p className="mt-3 text-muted-foreground">
            8,500+ 道 TCF Canada 真题等你来刷
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tests"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-primary to-blue-600 px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:from-primary/90 hover:to-blue-600/90"
            >
              开始练习
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/resources?tab=resources"
              className="inline-flex h-11 items-center gap-2 rounded-md border px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              查看学习资源
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
          以上信息仅供参考，不构成移民建议。考试政策和考场安排可能随时调整，请以官方渠道为准。
          <span className="mx-2">·</span>
          <Link href="/disclaimer" className="hover:text-foreground transition-colors">免责声明</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
