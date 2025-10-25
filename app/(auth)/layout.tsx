export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth layout - can add auth-specific styling/components here */}
      <main>{children}</main>
    </div>
  );
}
