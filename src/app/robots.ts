import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/practice/", "/exam/", "/results/"],
      },
    ],
    sitemap: "https://www.hitcf.com/sitemap.xml",
  };
}
