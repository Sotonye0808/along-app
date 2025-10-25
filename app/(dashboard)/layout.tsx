export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Dashboard navbar will be added here */}
      <main>{children}</main>
    </div>
  );
}
