import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getTranslations, getLocale } from "next-intl/server";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "sonner";
import { CommunityFab } from "@/components/layout/community-fab";
import { UtmTracker } from "@/components/shared/utm-tracker";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: {
      default: t("siteTitle"),
      template: t("titleTemplate"),
    },
    description: t("siteDescription"),
    keywords: t("keywords").split(","),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const s = await getTranslations("schema");
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
        <link rel="alternate" hrefLang="zh" href="https://www.hitcf.com" />
        <link rel="alternate" hrefLang="en" href="https://www.hitcf.com" />
        <link rel="alternate" hrefLang="fr" href="https://www.hitcf.com" />
        <link rel="alternate" hrefLang="ar" href="https://www.hitcf.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.hitcf.com" />
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
                  "TCF Canada online practice platform with 8,500+ questions covering listening, reading, speaking and writing. Practice mode, exam simulation, wrong answer notebook, vocabulary flashcards, Anki export, and AI-powered explanations to help you reach CLB 7.",
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
                    price: "19.90",
                    priceCurrency: "USD",
                    billingIncrement: "P1M",
                    description:
                      "Full access to 8,500+ questions, exam mode, wrong answer notebook, vocabulary tools, Anki export. 7-day free trial.",
                  },
                  {
                    "@type": "Offer",
                    name: "Pro Yearly",
                    price: "99.90",
                    priceCurrency: "USD",
                    billingIncrement: "P1Y",
                    description:
                      "Full access to all features including vocabulary flashcards, dictation, and Anki export. 2 months free trial.",
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
            ]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LocaleProvider>
              {children}
              <CommunityFab />
              <UtmTracker />
            </LocaleProvider>
          </AuthProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
