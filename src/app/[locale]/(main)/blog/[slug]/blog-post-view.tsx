"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import type { BlogMeta } from "@/lib/blog";
import type { ReactNode } from "react";

interface BlogPostViewProps {
  meta: BlogMeta;
  children: ReactNode;
}

export function BlogPostView({ meta, children }: BlogPostViewProps) {
  const t = useTranslations("blog");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToBlog")}
      </Link>

      {/* Article header */}
      <header className="mt-6 border-b pb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {meta.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={meta.date}>{meta.date}</time>
          <span aria-hidden="true">&middot;</span>
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Article body — rendered MDX passed as children from server component */}
      <article className="prose prose-neutral dark:prose-invert mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-strong:text-foreground">
        {children}
      </article>

      {/* Footer CTA */}
      <div className="mt-12 rounded-xl border bg-accent/30 p-6 text-center">
        <p className="text-sm font-medium">{t("ctaText")}</p>
        <Link
          href="/tests"
          className="mt-3 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("ctaButton")}
        </Link>
      </div>
    </div>
  );
}
