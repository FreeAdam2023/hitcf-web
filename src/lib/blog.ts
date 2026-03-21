import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogMeta {
  title: string;
  date: string;
  description: string;
  tags: string[];
  locale: string;
  slug: string;
}

export interface BlogPost {
  meta: BlogMeta;
  content: string;
}

/**
 * Get all blog post metadata, optionally filtered by locale.
 * Sorted by date descending (newest first).
 */
export function getAllPosts(locale?: string): BlogMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const posts: BlogMeta[] = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return {
        title: data.title ?? "",
        date: data.date ?? "",
        description: data.description ?? "",
        tags: data.tags ?? [],
        locale: data.locale ?? "zh",
        slug,
      } satisfies BlogMeta;
    })
    .filter((post) => !locale || post.locale === locale);

  posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  return posts;
}

/**
 * Get a single blog post by slug.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      title: data.title ?? "",
      date: data.date ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      locale: data.locale ?? "zh",
      slug,
    },
    content,
  };
}

/**
 * Get all unique slugs (for generateStaticParams).
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
