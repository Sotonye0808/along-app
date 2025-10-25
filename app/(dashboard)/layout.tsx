import { DashboardNavbar } from "@/components/features/navigation/DashboardNavbar";
import { MobileTopBar } from "@/components/features/navigation/MobileTopBar";
import { DesktopTopBar } from "@/components/features/navigation/DesktopTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <DashboardNavbar />
      <MobileTopBar />
      <DesktopTopBar />

      {/* Main Content */}
      <main className="md:ml-20 md:mt-16 mt-16 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto p-4">{children}</div>
      </main>
    </div>
  );
}
