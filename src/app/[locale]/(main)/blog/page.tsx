import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import { BlogListView } from "./blog-list-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.blog" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { zh: "/zh/blog", en: "/en/blog", fr: "/fr/blog", ar: "/ar/blog" },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = getAllPosts(locale);

  return <BlogListView posts={posts} />;
}
