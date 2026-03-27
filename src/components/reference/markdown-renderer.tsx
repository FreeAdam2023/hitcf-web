"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { FrenchText } from "@/components/practice/french-text";

/** Check if text contains French characters (accented letters common in French) */
const FR_RE = /[a-zA-ZÀ-ÿœŒæÆçÇ]{2,}/;

/**
 * Recursively walk React children. If a node is a plain string containing
 * French-looking words, wrap it with <FrenchText> for clickable vocabulary.
 */
function wrapFrenchWords(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" && FR_RE.test(child)) {
      return <FrenchText text={child} />;
    }
    // Recurse into React elements (e.g. <strong>, <em>)
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
      return React.cloneElement(child, {}, wrapFrenchWords(child.props.children));
    }
    return child;
  });
}

const components: Partial<Components> = {
  table: ({ children, ...props }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      className="bg-gradient-to-r from-muted/80 to-muted/40 dark:from-muted/50 dark:to-muted/20"
      {...props}
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3.5 py-2.5 border-b border-border/40" {...props}>
      {wrapFrenchWords(children)}
    </td>
  ),
  tr: ({ children, ...props }) => (
    <tr
      className="even:bg-muted/15 hover:bg-accent/30 transition-colors"
      {...props}
    >
      {children}
    </tr>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-10 mb-4 flex items-center gap-2 text-xl font-bold tracking-tight scroll-mt-20 border-b border-border/60 pb-2"
      id={
        typeof children === "string"
          ? children
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "")
          : undefined
      }
      {...props}
    >
      <span className="inline-block w-1 h-6 rounded-full bg-primary shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-7 mb-3 text-base font-semibold tracking-tight scroll-mt-20 text-foreground/90"
      id={
        typeof children === "string"
          ? children
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "")
          : undefined
      }
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2.5 leading-relaxed text-foreground/85" {...props}>
      {wrapFrenchWords(children)}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="my-3 ml-4 list-disc space-y-1.5 text-foreground/85 marker:text-primary/50"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="my-3 ml-4 list-decimal space-y-1.5 text-foreground/85 marker:text-primary/50"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed pl-1" {...props}>
      {wrapFrenchWords(children)}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-5 border-l-4 border-primary/50 bg-primary/5 dark:bg-primary/10 px-4 py-3 rounded-r-xl text-sm shadow-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-foreground" {...props}>
      {children}
    </strong>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className="block my-5 rounded-xl bg-muted/70 dark:bg-muted/40 p-4 text-sm font-mono overflow-x-auto border border-border/50"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[0.85em] font-mono font-semibold text-primary"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="my-5 rounded-xl bg-muted/70 dark:bg-muted/40 p-4 overflow-x-auto text-sm border border-border/50"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border/60" />,
};

export function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
