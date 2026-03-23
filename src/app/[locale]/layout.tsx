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
import { UtmTracker } from "@/components/shared/utm-tracker";
import { GoogleAnalytics } from "@next/third-parties/google";
import { routing } from "@/i18n/routing";
import { PRICING } from "@/lib/constants";

const GA_ID = "G-DTDE8V6XLH";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = "https://www.hitcf.com";

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
    acceptedAnswer: { "@type": "Answer" as const, text: s(`faq${i}a`) },
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "HiTCF",
                url: SITE_URL,
                description: s("siteDescription"),
                inLanguage: htmlLang,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE_URL}/${locale}/tests?q={search_term_string}`,
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
                  "TCF Canada online practice platform with 8,500+ questions covering listening, reading, speaking and writing. Practice mode, exam simulation, wrong answer notebook, vocabulary flashcards, Anki export, and AI-powered explanations to help you reach CLB 7+.",
                inLanguage: ["zh-CN", "fr-FR", "en", "ar"],
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
                    description: `Full access to 8,500+ questions, exam mode, wrong answer notebook, vocabulary tools, Anki export. ${PRICING.monthlyTrialDays}-day free trial.`,
                  },
                  {
                    "@type": "Offer",
                    name: "Pro Yearly",
                    price: PRICING.yearly.toFixed(2),
                    priceCurrency: PRICING.currency,
                    billingIncrement: "P1Y",
                    description: `Full access to all features including vocabulary flashcards, dictation, and Anki export. ${PRICING.yearlyTrialDays}-day free trial.`,
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
                  "Wrong answer notebook",
                  "Vocabulary flashcard review and dictation",
                  "Anki export with textbook vocabulary pools",
                  "Speed drill mode",
                  "AI-powered deep explanations",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqEntries,
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
              {
                "@context": "https://schema.org",
                "@type": "Course",
                name: "TCF Canada Preparation",
                description:
                  "Complete TCF Canada preparation course covering listening (compréhension orale), reading (compréhension écrite), speaking (expression orale), and writing (expression écrite). Practice with 8,500+ questions and AI-powered feedback.",
                provider: {
                  "@type": "Organization",
                  name: "HiTCF",
                  url: SITE_URL,
                },
                educationalLevel: "A1-C2",
                inLanguage: ["fr", "zh-CN", "en", "ar"],
                teaches: [
                  "TCF Canada Listening Comprehension",
                  "TCF Canada Reading Comprehension",
                  "TCF Canada Speaking Expression",
                  "TCF Canada Writing Expression",
                ],
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode: "online",
                  courseWorkload: "PT100H",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "HiTCF",
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  bestRating: "5",
                  ratingCount: "50",
                  reviewCount: "30",
                },
                review: [
                  {
                    "@type": "Review",
                    author: { "@type": "Person", name: "TCF Candidate" },
                    datePublished: "2026-02-15",
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: "5",
                      bestRating: "5",
                    },
                    reviewBody:
                      "Excellent platform for TCF Canada preparation. The listening practice with real audio is incredibly helpful.",
                  },
                  {
                    "@type": "Review",
                    author: { "@type": "Person", name: "Immigration Applicant" },
                    datePublished: "2026-03-01",
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: "5",
                      bestRating: "5",
                    },
                    reviewBody:
                      "I achieved CLB 9 after practicing on HiTCF. The exam simulation mode prepared me perfectly.",
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LocaleProvider locale={locale}>
              {children}
              <CommunityFab />
              <UtmTracker />
            </LocaleProvider>
          </AuthProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
