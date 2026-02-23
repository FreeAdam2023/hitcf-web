import type { Metadata } from "next";
import { SpeedDrillConfig } from "./speed-drill-config";

export const metadata: Metadata = {
  title: "速练",
  description: "快速练习模式，按等级和题型自定义专项训练。",
  alternates: { canonical: "/speed-drill" },
};

export default function SpeedDrillPage() {
  return <SpeedDrillConfig />;
}
