import type { Metadata } from "next";
import { AccountView } from "./account-view";

export const metadata: Metadata = {
  title: "账号设置",
  description: "管理个人信息、密码和订阅状态。",
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return <AccountView />;
}
