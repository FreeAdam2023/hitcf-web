import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "sonner";
import { CommunityFab } from "@/components/layout/community-fab";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { UtmTracker } from "@/components/shared/utm-tracker";
import { Heartbeat } from "@/components/layout/heartbeat";
import { TrialBanner } from "@/components/shared/trial-banner";
import { PaymentFailedBanner } from "@/components/shared/payment-failed-banner";
import { TrialWelcomeModal } from "@/components/shared/trial-welcome-modal";
import { GoogleAnalytics } from "@next/third-parties/google";
import { routing } from "@/i18n/routing";
import { PRICING, STATS_PARAMS } from "@/lib/constants";

const GA_ID = "G-DTDE8V6XLH";

const geistSans = localFont({
  src: "../fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = "https://hitcf.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: {
      default: t("siteTitle"),
      template: t("titleTemplate"),
    },
    description: t("siteDescription"),
    keywords: t("keywords").split(","),
    applicationName: "HiTCF",
    authors: [{ name: "HiTCF" }],
    creator: "HiTCF",
    appleWebApp: {
      capable: true,
      title: "HiTCF",
      statusBarStyle: "default",
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        zh: "/zh",
        en: "/en",
        fr: "/fr",
        ar: "/ar",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : locale === "fr" ? "fr_FR" : locale === "ar" ? "ar" : "en",
      url: `${SITE_URL}/${locale}`,
      siteName: "HiTCF",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
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
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const s = await getTranslations({ locale, namespace: "schema" });
  const htmlLang = locale === "en" ? "en" : locale === "fr" ? "fr" : locale === "ar" ? "ar" : "zh-CN";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const faqEntries = [1, 2, 3, 4, 5, 6].map((i) => ({
    "@type": "Question" as const,
    name: s(`faq${i}q`),
    acceptedAnswer: { "@type": "Answer" as const, text: s(`faq${i}a`, STATS_PARAMS) },
  }));

  return (
    <html lang={htmlLang} dir={dir} suppressHydrationWarning>
      <head>
        {routing.locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${SITE_URL}/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "EducationalOrganization",
                  "@id": `${SITE_URL}/#org`,
                  name: "HiTCF",
                  alternateName: "HiTCF TCF Canada Practice",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/logo.png`,
                  },
                  description:
                    "Independent online practice platform for the TCF Canada (Test de connaissance du français pour le Canada) exam, providing 1,300+ test sets and 8,500+ questions with AI-powered grading and sentence-level audio analysis.",
                  knowsLanguage: ["fr", "en", "zh", "ar"],
                  knowsAbout: [
                    "TCF Canada",
                    "Test de connaissance du français",
                    "French language proficiency",
                    "Canadian immigration language requirements",
                    "CEFR A1 to C2",
                    "CLB (Canadian Language Benchmarks)",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "support@hitcf.com",
                    contactType: "customer service",
                    availableLanguage: ["en", "fr", "zh"],
                  },
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "HiTCF",
                  description: s("siteDescription"),
                  inLanguage: htmlLang,
                  publisher: { "@id": `${SITE_URL}/#org` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE_URL}/${locale}/tests?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Course",
                  "@id": `${SITE_URL}/#course`,
                  name: "TCF Canada Complete Preparation",
                  description:
                    "Complete TCF Canada preparation aligned to the official exam format (Compréhension Orale, Compréhension Écrite, Expression Écrite, Expression Orale). Includes 1,306 test sets and 8,397 questions, sentence-level audio timestamps generated with OpenAI Whisper, AI speaking evaluation via Azure Speech + Grok, and AI writing feedback on the 4-criteria official TCF rubric.",
                  provider: { "@id": `${SITE_URL}/#org` },
                  educationalLevel: "A1-C2 CEFR",
                  inLanguage: ["fr", "zh", "en", "ar"],
                  teaches: [
                    "TCF Canada Compréhension Orale (Listening)",
                    "TCF Canada Compréhension Écrite (Reading)",
                    "TCF Canada Expression Écrite (Writing)",
                    "TCF Canada Expression Orale (Speaking)",
                  ],
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "online",
                    courseWorkload: "PT100H",
                  },
                  offers: [
                    {
                      "@type": "Offer",
                      name: "Free trial (7 days)",
                      price: "0",
                      priceCurrency: "USD",
                      description:
                        "7-day reverse-trial Pro access on registration, no credit card required.",
                    },
                    {
                      "@type": "Offer",
                      name: "Pro Monthly",
                      price: PRICING.monthly.toFixed(2),
                      priceCurrency: PRICING.currency,
                      description:
                        "Full access to 8,500+ questions, exam mode, wrong-answer notebook, vocabulary tools, Anki export.",
                    },
                    {
                      "@type": "Offer",
                      name: "Pro Semi-Annual",
                      price: PRICING.semiannual.toFixed(2),
                      priceCurrency: PRICING.currency,
                      description:
                        "Best value. Full access to all features including AI speaking and writing evaluation.",
                    },
                  ],
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": `${SITE_URL}/#app`,
                  name: "HiTCF",
                  applicationCategory: "EducationalApplication",
                  operatingSystem: "Web",
                  url: SITE_URL,
                  description:
                    "TCF Canada online practice platform with 1,306 test sets (42 listening, 42 reading, 702 speaking, 520 writing) and 8,397 questions covering A1–C2 CEFR levels. Features include sentence-level audio analysis powered by OpenAI Whisper, AI speaking evaluation via Azure Speech, AI writing feedback on the official 4-criteria TCF rubric, vocabulary flashcards with Anki export, wrong-answer notebook, and real-time exam seat monitoring for Ottawa / Calgary / Vancouver.",
                  inLanguage: ["zh", "fr", "en", "ar"],
                  provider: { "@id": `${SITE_URL}/#org` },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "5",
                    bestRating: "5",
                    ratingCount: "2",
                    reviewCount: "2",
                  },
                  review: [
                    {
                      "@type": "Review",
                      author: {
                        "@type": "Person",
                        name: "momo",
                        image: `${SITE_URL}/reviews/momo.jpg`,
                      },
                      datePublished: "2026-03-22",
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: "5",
                        bestRating: "5",
                      },
                      reviewBody:
                        "您这个听力是设计的最好的。其他的都没有您这个好用，我试用过了就买会员。你的设计很懂客户需求。",
                    },
                    {
                      "@type": "Review",
                      author: {
                        "@type": "Person",
                        name: "肉食动物不吃素",
                        image: `${SITE_URL}/reviews/roushidongwu.webp`,
                      },
                      datePublished: "2026-03-19",
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: "5",
                        bestRating: "5",
                      },
                      reviewBody:
                        "网站真的蛮多细节的，我在别的网站没见过。鼠标碰到单词自动有发音和解释，这个真的很好！",
                    },
                  ],
                  offers: [
                    {
                      "@type": "Offer",
                      name: "Free",
                      price: "0",
                      priceCurrency: "USD",
                      description:
                        "Free test sets for listening, reading, speaking, and writing. Practice and exam mode included.",
                    },
                    {
                      "@type": "Offer",
                      name: "Pro Monthly",
                      price: PRICING.monthly.toFixed(2),
                      priceCurrency: PRICING.currency,
                      billingIncrement: "P1M",
                      description:
                        "Full access to 8,500+ questions, exam mode, wrong answer notebook, vocabulary tools, Anki export.",
                    },
                    {
                      "@type": "Offer",
                      name: "Pro Semi-Annual",
                      price: PRICING.semiannual.toFixed(2),
                      priceCurrency: PRICING.currency,
                      billingIncrement: "P6M",
                      description:
                        "Full access to all features including vocabulary flashcards, dictation, and Anki export.",
                    },
                  ],
                  screenshot: `${SITE_URL}/opengraph-image`,
                  featureList: [
                    "1,306 test sets covering A1–C2 CEFR levels",
                    "8,397 TCF Canada practice questions",
                    "42 listening test sets (1,638 questions) with original audio",
                    "42 reading test sets (1,638 questions)",
                    "702 speaking topic sets (3,536 questions) for Tâche 1/2/3",
                    "520 writing task sets (1,540 questions) with AI grading",
                    "Sentence-level audio timestamps via OpenAI Whisper",
                    "AI speaking evaluation via Azure Speech + Grok (6 TCF dimensions)",
                    "AI writing feedback on 4-criteria official TCF rubric",
                    "Practice mode with instant feedback",
                    "Exam simulation with timer (mirrors real TCF Canada)",
                    "Wrong-answer notebook with spaced repetition",
                    "Vocabulary flashcards with click-to-lookup and Anki CSV export",
                    "Speed drill mode by CEFR level (A1–C2)",
                    "Real-time TCF Canada exam seat monitoring (Ottawa/Calgary/Vancouver)",
                    "4-language interface (Chinese, English, French, Arabic)",
                    "7-day free Pro trial on registration (no credit card)",
                  ],
                },
                {
                  "@type": "FAQPage",
                  "@id": `${SITE_URL}/#faq`,
                  mainEntity: faqEntries,
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LocaleProvider locale={locale}>
              <PaymentFailedBanner />
              <TrialBanner />
              <TrialWelcomeModal />
              {children}
              <MobileTabBar />
              <CommunityFab />
              <UtmTracker />
              <Heartbeat />
            </LocaleProvider>
          </AuthProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
