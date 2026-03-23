import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { BlogPostView } from "./blog-post-view";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/blog/${slug}`]),
      ),
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    author: { "@type": "Organization", name: "HiTCF" },
    publisher: {
      "@type": "Organization",
      name: "HiTCF",
      logo: { "@type": "ImageObject", url: "https://www.hitcf.com/logo.png" },
    },
    mainEntityOfPage: `https://www.hitcf.com/${locale}/blog/${slug}`,
    keywords: post.meta.tags,
    inLanguage: post.meta.locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostView meta={post.meta}>
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </BlogPostView>
    </>
  );
}
