import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = "https://www.hitcf.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "HiTCF — TCF Canada 在线练习平台",
    template: "%s | HiTCF",
  },
  description:
    "8,500+ 道 TCF Canada 真题，覆盖听力、阅读、口语、写作四大科目。练习模式 + 考试模式，错题本 + 速练，助你冲刺 CLB 7。",
  keywords: [
    "TCF Canada",
    "CLB 7",
    "TCF 练习",
    "TCF 听力",
    "TCF 阅读",
    "TCF Canada 备考",
    "加拿大移民法语",
    "TCF 在线模拟",
    "TCF 真题",
  ],
  authors: [{ name: "HiTCF" }],
  creator: "HiTCF",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "HiTCF",
    title: "HiTCF — CLB 7，练出来的",
    description:
      "8,500+ 道 TCF Canada 真题，覆盖听力阅读口语写作。练习 + 考试 + 错题本，系统备考冲刺 CLB 7。",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HiTCF — TCF Canada 在线练习平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HiTCF — CLB 7，练出来的",
    description:
      "8,500+ 道 TCF Canada 真题，系统备考冲刺 CLB 7。",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "HiTCF",
                url: SITE_URL,
                description:
                  "TCF Canada 在线练习平台，8,500+ 道真题助你冲刺 CLB 7",
                inLanguage: "zh-CN",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE_URL}/tests?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
                publisher: {
                  "@type": "Organization",
                  name: "HiTCF",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/logo.png`,
                  },
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "HiTCF",
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                url: SITE_URL,
                description:
                  "TCF Canada online practice platform with 8,500+ questions covering listening, reading, speaking and writing. Practice mode, exam simulation, wrong answer notebook, and AI-powered explanations to help you reach CLB 7.",
                inLanguage: ["zh-CN", "fr-FR", "en"],
                offers: [
                  {
                    "@type": "Offer",
                    name: "Free",
                    price: "0",
                    priceCurrency: "CAD",
                    description:
                      "Free test sets for listening, reading, speaking, and writing. Practice and exam mode included.",
                  },
                  {
                    "@type": "Offer",
                    name: "Pro Monthly",
                    price: "19",
                    priceCurrency: "CAD",
                    billingIncrement: "P1M",
                    description:
                      "Full access to 8,500+ questions, exam mode, wrong answer notebook, speed drill. 7-day free trial.",
                  },
                  {
                    "@type": "Offer",
                    name: "Pro Yearly",
                    price: "99",
                    priceCurrency: "CAD",
                    billingIncrement: "P1Y",
                    description:
                      "Full access to all features. 2 months free trial.",
                  },
                ],
                screenshot: `${SITE_URL}/opengraph-image`,
                featureList: [
                  "8,500+ TCF Canada practice questions",
                  "44 listening test sets with original audio",
                  "44 reading test sets covering A1-C2",
                  "696 speaking topic sets",
                  "515 writing task sets with AI grading",
                  "Practice mode with instant feedback",
                  "Exam simulation with timer",
                  "Wrong answer notebook with spaced repetition",
                  "Speed drill mode",
                  "AI-powered deep explanations",
                ],
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  ratingCount: "120",
                  bestRating: "5",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "HiTCF 是官方平台吗？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "不是。HiTCF 是独立运营的第三方练习平台，与 France Éducation international 或 IRCC 无关。练习题目来源于公开资料的整理和编辑，格式对标 TCF Canada，但不等同于考场原题。",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "免费版能做什么？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "免费版可使用听力前 1 套、阅读前 2 套的全部题目，包含练习模式和考试模式。不限次数，永久有效。",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Pro 会员有什么好处？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "解锁全部 8,500+ 道题目（1,200+ 套），包含考试模式、错题本、速练模式和 CLB 等级估算。年付享 2 个月免费试用，不满意随时取消。",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "能保证考到 CLB 7 吗？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "不能。HiTCF 提供与 TCF Canada 对标的练习环境，帮助你针对性地找到薄弱环节并提升。但实际成绩取决于多种因素，我们不承诺任何考试结果。",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "口语和写作怎么练？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "口语和写作提供真题话题和写作任务，支持跳转到 ChatGPT 进行 AI 模拟对话和作文批改。相当于免费的 AI 外教。",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "如何申请退款？",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "首次付款后 48 小时内可全额退款，季付/年付用户 14 天内可按比例退款。发邮件至 support@hitcf.com 即可，3 个工作日内处理。",
                    },
                  },
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "HiTCF",
                url: SITE_URL,
                logo: `${SITE_URL}/logo.png`,
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "support@hitcf.com",
                  contactType: "customer service",
                },
                sameAs: [],
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
