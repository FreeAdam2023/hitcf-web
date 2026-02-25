import { Navbar } from "@/components/layout/navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { MainContainer } from "@/components/layout/main-container";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-noise">
      <Navbar />
      <MainContainer>{children}</MainContainer>
      <ConditionalFooter />
    </div>
  );
}
