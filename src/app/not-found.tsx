import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Full background image */}
      <Image
        src="/hero-mountain-404.jpg"
        alt="雪山登山者"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 text-center text-white">
        <h1 className="text-9xl font-bold tracking-tighter text-white drop-shadow-lg">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            迷路了？这条路不通
          </h2>
          <p className="mx-auto max-w-sm text-sm text-white/90 drop-shadow-sm">
            页面不存在或已被移除。别慌，备考的路还在，回去继续刷题吧。
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/tests">返回题库</Link>
          </Button>
          <Button asChild size="lg" className="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30 border border-white/40">
            <Link href="/">回到首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
