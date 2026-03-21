"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { BlogMeta } from "@/lib/blog";

interface BlogListViewProps {
  posts: BlogMeta[];
}

export function BlogListView({ posts }: BlogListViewProps) {
  const t = useTranslations("blog");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">{t("noPosts")}</p>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/50 sm:p-6"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.date}>{post.date}</time>
                <span aria-hidden="true">&middot;</span>
                <div className="flex gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition-colors sm:text-xl">
                {post.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
