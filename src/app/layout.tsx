import type { Metadata } from "next";
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "HiTCF",
              url: SITE_URL,
              description:
                "TCF Canada 在线练习平台，8,500+ 道真题助你冲刺 CLB 7",
              inLanguage: "zh-CN",
              publisher: {
                "@type": "Organization",
                name: "HiTCF",
                url: SITE_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${SITE_URL}/logo.png`,
                },
              },
            }),
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
