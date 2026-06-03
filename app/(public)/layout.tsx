import Link from "next/link";
import AppFooter from "@/app/components/ui/AppFooter";
import AppLogo from "@/app/components/ui/AppLogo";

export const dynamic = "force-static";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <AppLogo size="md" />
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/about" className="text-text-secondary hover:text-text-primary transition-colors">About</Link>
            <Link href="/faq" className="text-text-secondary hover:text-text-primary transition-colors">FAQ</Link>
            <Link href="/blog" className="text-text-secondary hover:text-text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="text-text-secondary hover:text-text-primary transition-colors">Contact</Link>
            <Link href="/login" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity">Sign In</Link>
            <Link href="/register" className="text-sm font-semibold bg-primary text-text-inverse px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Sign Up</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
