import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: landscape photo (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/login-bg.jpg"
          alt="Canadian landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <Link href="/tests">
            <Image src="/logo.png" alt="HiTCF" width={48} height={48} className="brightness-0 invert" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-white">
            CLB 7，练出来的
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            8,500+ 道 TCF Canada 真题，听力阅读口语写作四科全覆盖。
            系统化备考，让通过不再靠运气。
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        <Link href="/tests" className="mb-8 lg:hidden">
          <Image src="/logo.png" alt="HiTCF" width={48} height={48} />
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
