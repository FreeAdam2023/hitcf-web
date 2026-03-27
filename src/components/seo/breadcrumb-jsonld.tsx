/**
 * Server-side BreadcrumbList JSON-LD for SEO.
 * Renders structured data that Google can read without JS execution.
 */

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: string;
}) {
  const origin = "https://hitcf.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${origin}/${locale}${item.href}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
