import type { Metadata } from "next";
import { LandingPage } from "./landing-page";

export const metadata: Metadata = {
  title: "HiTCF — CLB 7，练出来的 | TCF Canada 在线练习",
  description:
    "3,400+ 道 TCF Canada 真题，覆盖听力、阅读、口语、写作。练习模式 + 考试模式 + 错题本，助你系统备考冲刺 CLB 7。",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LandingPage />;
}
