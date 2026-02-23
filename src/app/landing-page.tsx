"use client";

import Link from "next/link";
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
  Users,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/stores/auth-store";

const FEATURES = [
  {
    icon: Headphones,
    title: "听力理解",
    desc: "42 套听力真题，1,600+ 道题目，全部配备原版音频",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    icon: BookOpenText,
    title: "阅读理解",
    desc: "44 套阅读真题，1,680+ 道题目，覆盖 A1-C2 全部级别",
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    icon: MessageCircle,
    title: "口语表达",
    desc: "20 套口语话题，Tâche 2 情景对话 + Tâche 3 观点论述，AI 陪练",
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    icon: PenLine,
    title: "写作表达",
    desc: "10 组写作题目，短消息 + 博客 + 议论文三项任务，AI 批改",
    color: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-300 dark:hover:border-purple-700",
  },
];

const STATS = [
  { value: "78%", label: "CLB 7 正确率门槛", color: "text-blue-600 dark:text-blue-400" },
  { value: "3,400+", label: "道真题练习", color: "text-emerald-600 dark:text-emerald-400" },
  { value: "42", label: "套听力含音频", color: "text-amber-600 dark:text-amber-400" },
  { value: "4", label: "科目全覆盖", color: "text-purple-600 dark:text-purple-400" },
];

const STEPS = [
  { icon: Sparkles, title: "注册账号", desc: "邮箱一键登录，无需复杂注册" },
  { icon: Target, title: "选择题套", desc: "按科目浏览，免费题套可直接练习" },
  { icon: Zap, title: "开始练习", desc: "练习模式逐题做，考试模式模拟真实考试" },
];

const TESTIMONIALS = [
  {
    name: "小鱼在温村",
    avatar: "鱼",
    avatarBg: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
    location: "Vancouver · 2026 年 1 月通过",
    text: "用 HiTCF 练了三周听力，从 B1 提到了 C1。错题本功能特别好用，帮我找到了薄弱环节。强烈推荐给备考的朋友！",
    score: "CLB 8",
    stars: 5,
  },
  {
    name: "枫叶Kevin",
    avatar: "K",
    avatarBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    location: "Toronto · 2025 年 12 月通过",
    text: "之前用其他平台题目太少，HiTCF 有 42 套听力真题，够我刷一个月的。考试模式计时特别接近真实考试，考场上一点都不慌。",
    score: "CLB 7",
    stars: 5,
  },
  {
    name: "Marie在蒙城",
    avatar: "M",
    avatarBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
    location: "Montréal · 2026 年 2 月通过",
    text: "阅读部分覆盖了从 A1 到 C2 所有等级，能清楚看到自己在每个等级的正确率。备考两个月，阅读直接拉满。",
    score: "CLB 9",
    stars: 5,
  },
];

const PLAN_FEATURES = [
  "全部听力 + 阅读题库",
  "考试模式（计时 + 评分）",
  "错题本 + 速练",
  "口语 + 写作 AI 练习",
];

export function LandingPage() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-20 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-400/15 to-blue-400/15 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(224 76% 48%) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:py-36 text-center">
          <Badge
            variant="outline"
            className="animate-fade-in-up mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
          >
            <Target className="mr-1.5 h-3.5 w-3.5" />
            TCF Canada 备考平台
          </Badge>
          <h1 className="animate-fade-in-up-d1 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-primary to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
              CLB 7
            </span>
            ，练出来的
          </h1>
          <p className="animate-fade-in-up-d2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            3,400+ 道 TCF Canada 真题，听力阅读口语写作全覆盖。
            <br className="hidden sm:block" />
            做题、看解析、练错题——你只需要不断重复这个循环。
          </p>
          <div className="animate-fade-in-up-d3 mt-10 flex flex-wrap justify-center gap-4">
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
                  <a href="/cdn-cgi/access/login">
                    免费开始
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <a href="#pricing">查看方案</a>
                </Button>
              </>
            )}
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
                    <a href="/cdn-cgi/access/login">免费注册</a>
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
                  <span className="text-4xl font-extrabold">7 天免费</span>
                  <span className="ml-1 text-muted-foreground">试用</span>
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
                    <Link href="/pricing">查看方案</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              考生评价
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              他们用 HiTCF 达到了 CLB 7+
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="pt-6">
                  <Quote className="h-6 w-6 text-primary/20" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t.text}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.avatarBg}`}>
                      {t.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <Badge className="shrink-0 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300">
                      {t.score}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-0.5">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section className="border-y bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            有人同行，备考不孤单
          </h2>
          <p className="mt-3 text-muted-foreground">
            加入备考社群，和正在冲刺 CLB 7 的考友交流经验、互相监督
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="outline" className="h-11 gap-2" asChild>
              <a href="https://t.me/hitcf_group" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram 群
              </a>
            </Button>
            <Button variant="outline" className="h-11 gap-2" asChild>
              <a href="mailto:support@hitcf.com">
                <MessageCircle className="h-5 w-5" />
                微信群 (邮件索取)
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            已有考生在群内分享备考心得、真题经验
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            离 CLB 7 还差几步？
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            立即注册，免费题套直接开练，看看你的真实水平
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25" asChild>
              {isAuthenticated ? (
                <Link href="/tests">
                  进入题库
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <a href="/cdn-cgi/access/login">
                  免费注册
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              )}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
