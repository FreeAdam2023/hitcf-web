"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "momo",
    avatar: "/reviews/momo.jpg",
    date: "2026-03-22",
    key: "review1",
  },
  {
    name: "肉食动物不吃素",
    avatar: "/reviews/roushidongwu.webp",
    date: "2026-03-19",
    key: "review2",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {REVIEWS.map((review) => (
            <div
              key={review.key}
              className="relative rounded-xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
              <Stars />
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t(review.key)}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="text-sm font-medium">{review.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
