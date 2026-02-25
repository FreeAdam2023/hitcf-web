"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { LOGIN_URL } from "@/lib/constants";

const FEATURES = [
  {
    icon: Headphones,
    title: "听力理解",
    desc: "44 套听力真题，1,700+ 道题目，全部配备原版音频",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    icon: BookOpenText,
    title: "阅读理解",
    desc: "44 套阅读真题，1,700+ 道题目，覆盖 A1-C2 全部级别",
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    icon: MessageCircle,
    title: "口语表达",
    desc: "696 套口语话题，3,500+ 个 Tâche 2 + Tâche 3 真题，AI 陪练",
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    icon: PenLine,
    title: "写作表达",
    desc: "515 组写作题目，1,500+ 个任务，短消息 + 博客 + 议论文，AI 批改",
    color: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-300 dark:hover:border-purple-700",
  },
];

const STATS = [
  { value: "8,500+", label: "道真题", color: "text-blue-600 dark:text-blue-400" },
  { value: "1,200+", label: "套模拟题", color: "text-emerald-600 dark:text-emerald-400" },
  { value: "44", label: "套听力含音频", color: "text-amber-600 dark:text-amber-400" },
  { value: "78%", label: "CLB 7 门槛正确率", color: "text-purple-600 dark:text-purple-400" },
];

const STEPS = [
  { icon: Sparkles, title: "注册账号", desc: "邮箱一键登录，无需复杂注册" },
  { icon: Target, title: "选择题套", desc: "按科目浏览，免费题套可直接练习" },
  { icon: Zap, title: "开始练习", desc: "练习模式逐题做，考试模式模拟真实考试" },
];

const HIGHLIGHTS = [
  {
    icon: Target,
    title: "CLB 7 目标导向",
    desc: "所有功能围绕 CLB 7（≈78% 正确率）设计，准备度仪表盘实时追踪你的听力和阅读离目标还差多远。",
    illustration: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
        {/* progress bar background */}
        <rect x="10" y="22" width="100" height="10" rx="5" fill="hsl(var(--muted))" fillOpacity="0.3" />
        {/* progress fill (78%) */}
        <rect x="10" y="22" width="78" height="10" rx="5" fill="hsl(var(--primary))" fillOpacity="0.7" />
        {/* target marker at 78% */}
        <line x1="88" y1="18" x2="88" y2="36" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="3 2" />
        <text x="88" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="hsl(var(--primary))">78%</text>
        {/* current score */}
        <text x="10" y="50" fontSize="18" fontWeight="800" fill="hsl(var(--primary))">CLB 7</text>
        <rect x="60" y="42" width="50" height="14" rx="7" fill="hsl(142 76% 36% / 0.12)" />
        <text x="85" y="53" textAnchor="middle" fontSize="8" fontWeight="600" fill="hsl(142 76% 36%)">已达标</text>
        {/* secondary bar */}
        <rect x="10" y="64" width="100" height="6" rx="3" fill="hsl(var(--muted))" fillOpacity="0.3" />
        <rect x="10" y="64" width="62" height="6" rx="3" fill="hsl(38 92% 50% / 0.6)" />
      </svg>
    ),
  },
  {
    icon: Zap,
    title: "错题本 + 速练",
    desc: "系统自动收集错题，按题型和等级归纳薄弱环节。速练模式利用碎片时间定向突破。",
    illustration: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
        {/* wrong answer cards */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={10 + i * 36} y={8 + i * 6} width="32" height="44" rx="4"
              fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
            <rect x={14 + i * 36} y={14 + i * 6} width="16" height="3" rx="1.5"
              fill="hsl(var(--muted-foreground) / 0.15)" />
            <rect x={14 + i * 36} y={20 + i * 6} width="24" height="3" rx="1.5"
              fill="hsl(var(--muted-foreground) / 0.10)" />
            {/* red X mark */}
            <circle cx={34 + i * 36} cy={38 + i * 6} r="5" fill="hsl(0 72% 51% / 0.12)" />
            <path d={`M${31 + i * 36} ${35 + i * 6}l6 6M${37 + i * 36} ${35 + i * 6}l-6 6`}
              stroke="hsl(0 72% 51%)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
        {/* arrow to practice */}
        <path d="M100 36 L110 36" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
        <polygon points="112,36 108,32 108,40" fill="hsl(var(--primary))" />
        {/* repeat icon */}
        <circle cx="105" cy="60" r="10" fill="hsl(var(--primary) / 0.10)" />
        <path d="M100 60a5 5 0 0 1 9-2.5M110 60a5 5 0 0 1-9 2.5"
          stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    icon: Sparkles,
    title: "考试模式模拟真实考场",
    desc: "严格计时、不可回看、交卷后出分。提前适应考场压力，上场不慌。",
    illustration: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="w-full h-auto">
        {/* timer */}
        <circle cx="60" cy="34" r="26" fill="hsl(var(--muted) / 0.2)" stroke="hsl(var(--border))" strokeWidth="1.5" />
        {/* timer ring progress (75%) */}
        <circle cx="60" cy="34" r="22"
          stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="104 138" strokeDashoffset="-34.5"
          fill="none" />
        {/* time text */}
        <text x="60" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--foreground))">24:35</text>
        <text x="60" y="42" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">剩余</text>
        {/* question dots */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={22 + i * 12} cy="72" r="3.5"
            fill={i < 5 ? "hsl(var(--primary))" : i === 5 ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted))"}
            stroke={i === 5 ? "hsl(var(--primary))" : "none"} strokeWidth="1" />
        ))}
      </svg>
    ),
  },
];

const CONTENT_DEPTH = [
  { level: "A1", listening: 168, reading: 176, color: "bg-emerald-500" },
  { level: "A2", listening: 168, reading: 176, color: "bg-emerald-400" },
  { level: "B1", listening: 168, reading: 176, color: "bg-blue-400" },
  { level: "B2", listening: 210, reading: 220, color: "bg-blue-500" },
  { level: "C1", listening: 252, reading: 264, color: "bg-purple-400" },
  { level: "C2", listening: 252, reading: 264, color: "bg-purple-500" },
];

const TCF_GUIDE = [
  { clb: "CLB 7", tcf: "309–397", desc: "移民（EE / PNP）最低要求", highlight: true },
  { clb: "CLB 8", tcf: "398–452", desc: "EE 加分，部分 PNP 优先" },
  { clb: "CLB 9", tcf: "453–498", desc: "EE 满分语言加分" },
  { clb: "CLB 10+", tcf: "499–699", desc: "最高等级" },
];


const TRUST_ITEMS = [
  { icon: Clock, label: "超长免费试用", desc: "年付 2 个月 · 月付/季付 7 天" },
  { icon: CreditCard, label: "安全支付", desc: "信用卡信息由 Stripe 处理" },
  { icon: RefreshCw, label: "首次扣款可退", desc: "扣款后 48 小时内无理由退款" },
  { icon: Shield, label: "不自动扣费", desc: "试用期内取消 = 零费用" },
];

const LANDING_FAQ = [
  {
    q: "HiTCF 是官方平台吗？",
    a: "不是。HiTCF 是独立运营的第三方练习平台，与 France Éducation international 或 IRCC 无关。练习题目来源于公开资料的整理和编辑，格式对标 TCF Canada，但不等同于考场原题。",
  },
  {
    q: "免费版能做什么？",
    a: "免费版可使用听力前 2 套、阅读前 2 套、口语前 1 套、写作前 1 套的全部题目，包含练习模式和考试模式。不限次数，永久有效。",
  },
  {
    q: "Pro 会员有什么好处？",
    a: "解锁全部 8,500+ 道题目（1,200+ 套），包含考试模式、错题本、速练模式和 CLB 等级估算。年付享 2 个月免费试用，不满意随时取消。",
  },
  {
    q: "能保证考到 CLB 7 吗？",
    a: "不能。HiTCF 提供与 TCF Canada 对标的练习环境，帮助你针对性地找到薄弱环节并提升。但实际成绩取决于多种因素，我们不承诺任何考试结果。",
  },
  {
    q: "口语和写作怎么练？",
    a: "口语和写作提供真题话题和写作任务，支持跳转到 ChatGPT 进行 AI 模拟对话和作文批改。相当于免费的 AI 外教。",
  },
  {
    q: "如何申请退款？",
    a: "首次付款后 48 小时内可全额退款，季付 / 年付用户 14 天内可按比例退款。发邮件至 support@hitcf.com 即可，3 个工作日内处理。",
  },
];

const PLAN_FEATURES = [
  "全部听力 + 阅读题库",
  "考试模式（计时 + 评分）",
  "错题本 + 速练",
  "口语 + 写作 AI 练习",
];

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const isSubscribed = hasActiveSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle background tint */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — text */}
            <div className="text-center lg:text-left">
              <Badge
                variant="outline"
                className="animate-fade-in-up mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
              >
                <Target className="mr-1.5 h-3.5 w-3.5" />
                TCF Canada 备考平台
              </Badge>
              <h1 className="animate-fade-in-up-d1 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-600 via-primary to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
                  CLB 7
                </span>
                ，练出来的
              </h1>
              <p className="animate-fade-in-up-d2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                8,500+ 道 TCF Canada 真题，听力阅读口语写作全覆盖。
                <br className="hidden sm:block" />
                做题、看解析、练错题——你只需要不断重复这个循环。
              </p>
              <div className="animate-fade-in-up-d3 mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                {isAuthenticated ? (
                  <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                    <Link href="/tests">
                      开始练习
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                      <a href={LOGIN_URL}>
                        免费注册，立刻做题
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                      <a href="#pricing">查看定价</a>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right — photo showcase */}
            <div className="animate-fade-in-up-d2 relative hidden lg:block">
              <div className="relative">
                {/* Decorative glow behind photo */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-blue-400/10 to-purple-400/20 blur-2xl" />
                {/* Main photo */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                  <Image
                    src="/hero-canada-flag.jpg"
                    alt="加拿大国旗在蓝天下飘扬"
                    width={640}
                    height={427}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-4 -left-6 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                  <div className="text-2xl font-extrabold text-primary">8,500+</div>
                  <div className="text-xs text-muted-foreground">道真题</div>
                </div>
                {/* Floating badge */}
                <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  CLB 7 目标
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative border-y bg-card py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center animate-fade-in-up-d${i + 1}`}>
              <div className={`text-4xl font-extrabold tracking-tight ${s.color}`}>
                {s.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              四大科目
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              全面覆盖 TCF 考试
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              听说读写一站搞定，从 A1 到 C2 全等级覆盖
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${f.borderColor} animate-fade-in-up-d${i + 1}`}
              >
                {/* Top gradient bar */}
                <div className={`h-1 bg-gradient-to-r ${f.color}`} />
                <CardContent className="flex gap-4 pt-6">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Depth ── */}
      <section className="border-y bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              题库全景
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              从 A1 到 C2，每个等级都有题做
            </h2>
            <p className="mt-3 text-muted-foreground">
              不管你现在什么水平，都能找到适合自己的练习内容
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">等级</th>
                  <th className="px-4 py-3 text-right font-semibold">听力题数</th>
                  <th className="px-4 py-3 text-right font-semibold">阅读题数</th>
                  <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">覆盖度</th>
                </tr>
              </thead>
              <tbody>
                {CONTENT_DEPTH.map((row) => (
                  <tr key={row.level} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono font-bold">
                        {row.level}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{row.listening}</td>
                    <td className="px-4 py-3 text-right font-medium">{row.reading}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${row.color}`}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30">
                  <td className="px-4 py-3 font-bold">合计</td>
                  <td className="px-4 py-3 text-right font-bold">1,709</td>
                  <td className="px-4 py-3 text-right font-bold">1,716</td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    + 口语 3,536 题 + 写作 1,540 题
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            所有听力题目均配备原版音频 · 数据来源于平台实际题库统计
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              简单三步
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              如何使用
            </h2>
          </div>
          <div className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {/* Connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent sm:block" />

            {STEPS.map((item, idx) => (
              <div key={idx} className={`relative text-center animate-fade-in-up-d${idx + 1}`}>
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 rotate-6" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-bold text-primary ring-2 ring-primary/20">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
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
              定价
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              简单透明的定价
            </h2>
            <p className="mt-3 text-muted-foreground">
              免费题套随时练习，订阅解锁全部内容
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">免费版</h3>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="ml-1 text-muted-foreground">/ 永久</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    免费题套练习
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    练习 + 考试模式
                  </li>
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant="outline"
                  asChild
                >
                  {isAuthenticated ? (
                    <Link href="/tests">开始使用</Link>
                  ) : (
                    <a href={LOGIN_URL}>免费注册</a>
                  )}
                </Button>
              </CardContent>
            </Card>
            {/* Pro */}
            <Card className="relative overflow-hidden border-2 border-primary shadow-xl shadow-primary/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
              <div className="absolute -top-0 right-4">
                <Badge className="rounded-t-none bg-gradient-to-r from-primary to-blue-600 text-white shadow-md">
                  推荐
                </Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">2 个月免费</span>
                  <span className="ml-1 text-muted-foreground">试用（年付）</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                  {isSubscribed ? (
                    <Link href="/tests">进入题库</Link>
                  ) : (
                    <Link href="/pricing">开始免费试用</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Why HiTCF ── */}
      <section className="border-t py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              为什么选 HiTCF
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              不只是题库，是完整的备考系统
            </h2>
            <p className="mt-3 text-muted-foreground">
              做题 → 看解析 → 练错题 → 再做题，循环直到达标
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <Card key={h.title} className="overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Illustration area */}
                <div className="flex items-center justify-center bg-muted/20 px-6 pt-6 pb-2">
                  <div className="w-full max-w-[200px]">{h.illustration}</div>
                </div>
                <CardContent className="pt-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <h.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {h.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── TCF Guide ── */}
      <section className="border-t bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              考试科普
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              TCF Canada 分数 vs CLB 等级
            </h2>
            <p className="mt-3 text-muted-foreground">
              加拿大移民局（IRCC）要求的语言成绩对照表
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-xl border">
            {TCF_GUIDE.map((row) => (
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
                <span className="text-sm text-muted-foreground">{row.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            CLB 7 ≈ 78% 正确率 · 这是大部分 EE 和 PNP 项目的最低语言要求
          </p>
          <div className="mt-8 text-center">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/resources">
                查看完整考试指南
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
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
              常见问题
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {LANDING_FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Photo */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/15 via-blue-400/10 to-primary/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/hero-ottawa.jpg"
                  alt="渥太华国会山与渥太华河全景"
                  width={640}
                  height={427}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
            {/* Text */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                离 CLB 7 还差几步？
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                免费题套直接开练，看看你离 CLB 7 还有多远
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
                  {isAuthenticated ? (
                    <Link href="/tests">
                      继续做题
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <a href={LOGIN_URL}>
                      免费注册，测测你的水平
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
