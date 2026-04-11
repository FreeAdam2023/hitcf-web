import { Navbar } from "@/components/layout/navbar";
import { MotivationStrip } from "@/components/layout/motivation-strip";
import { DailyExpression } from "@/components/layout/daily-expression";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { MainContainer } from "@/components/layout/main-container";
import { WatermarkOverlay } from "@/components/shared/watermark-overlay";
import { PageTracker } from "@/components/analytics/page-tracker";
import { TrialExpiredModal } from "@/components/shared/trial-expired-modal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <MotivationStrip />
      <DailyExpression />
      <PageTracker />
      <MainContainer>{children}</MainContainer>
      <ConditionalFooter />
      <WatermarkOverlay />
      <TrialExpiredModal />
    </div>
  );
}
