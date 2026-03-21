export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      {children}
    </article>
  );
}
