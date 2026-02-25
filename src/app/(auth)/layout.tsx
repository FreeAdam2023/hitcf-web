import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/tests" className="mb-8">
        <Image src="/logo.png" alt="HiTCF" width={56} height={56} />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
