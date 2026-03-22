import { Navbar } from "@/components/layout/navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { MainContainer } from "@/components/layout/main-container";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { WatermarkOverlay } from "@/components/shared/watermark-overlay";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <MainContainer>{children}</MainContainer>
      <ConditionalFooter />
      <MobileTabBar />
      <WatermarkOverlay />
    </div>
  );
}
