import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  BookMarked,
  Zap,
  Eye,
  BarChart3,
  Star,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guide" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const features = [
  {
    icon: Headphones,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-950",
    titleKey: "listening.title",
    descKey: "listening.desc",
    details: ["listening.d1", "listening.d2", "listening.d3", "listening.d4"],
  },
  {
    icon: BookOpen,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950",
    titleKey: "reading.title",
    descKey: "reading.desc",
    details: ["reading.d1", "reading.d2", "reading.d3", "reading.d4"],
  },
  {
    icon: Mic,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-950",
    titleKey: "speaking.title",
    descKey: "speaking.desc",
    details: ["speaking.d1", "speaking.d2", "speaking.d3"],
  },
  {
    icon: PenTool,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-950",
    titleKey: "writing.title",
    descKey: "writing.desc",
    details: ["writing.d1", "writing.d2", "writing.d3"],
  },
  {
    icon: BookMarked,
    color: "text-pink-600 bg-pink-100 dark:bg-pink-950",
    titleKey: "vocabulary.title",
    descKey: "vocabulary.desc",
    details: ["vocabulary.d1", "vocabulary.d2", "vocabulary.d3"],
  },
];

const modes = [
  { icon: BookOpen, key: "practice", color: "text-blue-600" },
  { icon: Zap, key: "speedDrill", color: "text-orange-600" },
  { icon: Eye, key: "openBook", color: "text-purple-600" },
  { icon: BarChart3, key: "exam", color: "text-red-600" },
];

const highlights = [
  "highlight.translation",
  "highlight.wordLookup",
  "highlight.wrongNote",
  "highlight.progress",
  "highlight.multilang",
  "highlight.referral",
];

export default async function GuidePage() {
  const t = await getTranslations("guide.platform");

  return (
    <>
      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      {/* Features */}
      <h2>{t("features.title")}</h2>
      <div className="not-prose grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.titleKey} className="rounded-xl border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg p-2 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{t(`features.${f.titleKey}`)}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t(`features.${f.descKey}`)}</p>
            <ul className="space-y-1">
              {f.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Star className="mt-0.5 h-3 w-3 shrink-0 text-yellow-500" />
                  <span>{t(`features.${d}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Practice Modes */}
      <h2>{t("modes.title")}</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {modes.map((m) => (
          <div key={m.key} className="flex items-start gap-3 rounded-lg border p-4">
            <m.icon className={`mt-0.5 h-5 w-5 shrink-0 ${m.color}`} />
            <div>
              <h3 className="font-semibold">{t(`modes.${m.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`modes.${m.key}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <h2>{t("highlights.title")}</h2>
      <ul>
        {highlights.map((h) => (
          <li key={h}>{t(h)}</li>
        ))}
      </ul>

      {/* CTA */}
      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.start")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          {t("cta.pricing")}
        </Link>
      </div>

      {/* Links to sub-guides */}
      <h2>{t("moreGuides.title")}</h2>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {[
          { href: "/guide/tcf-canada", label: t("moreGuides.tcf") },
          { href: "/guide/tcf-listening", label: t("moreGuides.listening") },
          { href: "/guide/tcf-reading", label: t("moreGuides.reading") },
          { href: "/guide/tcf-speaking", label: t("moreGuides.speaking") },
          { href: "/guide/tcf-writing", label: t("moreGuides.writing") },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
