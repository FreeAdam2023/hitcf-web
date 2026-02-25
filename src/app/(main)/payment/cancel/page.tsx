"use client";

import Link from "next/link";
import Image from "next/image";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-2xl">
      {/* Full background image */}
      <Image
        src="/hero-geese-fly.jpg"
        alt="加拿大雁"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 text-center text-white">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg sm:text-4xl">
            像加拿大雁一样，先飞一会儿
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/85 drop-shadow-sm">
            本次支付未完成，没有产生任何费用。加拿大雁冬天飞走，春天还会回来——我们也在这里等你。
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
            <Link href="/pricing">
              <RotateCcw className="h-4 w-4" />
              重新选择方案
            </Link>
          </Button>
          <Button asChild size="lg" className="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30 border border-white/40 gap-2">
            <Link href="/tests">
              <ArrowLeft className="h-4 w-4" />
              返回题库
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
