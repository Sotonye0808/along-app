import type { Metadata } from "next"
import AppLogo from "@/app/components/ui/AppLogo"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[45%_55%]">
      <aside className="relative hidden overflow-hidden md:flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-[#004A2C] to-[#00623B]">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 250 Q 100 180, 150 200 T 250 150 T 350 180" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M80 80 Q 130 120, 180 90 T 280 130" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.6" />
            <path d="M120 200 Q 180 230, 240 190 T 340 210" stroke="white" strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="50" cy="250" r="3" fill="white" opacity="0.8" />
            <circle cx="150" cy="200" r="4" fill="white" opacity="0.8" />
            <circle cx="250" cy="150" r="3" fill="white" opacity="0.8" />
            <circle cx="350" cy="180" r="4" fill="white" opacity="0.8" />
            <circle cx="80" cy="80" r="3" fill="white" opacity="0.6" />
            <circle cx="180" cy="90" r="3" fill="white" opacity="0.6" />
            <circle cx="280" cy="130" r="4" fill="white" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 mb-6">
          <AppLogo variant="icon" size="lg" linkTo="" />
        </div>

        <h1 className="relative z-10 text-white text-2xl font-bold mb-3">
          Navigate Together.
        </h1>
        <p className="relative z-10 text-white/75 text-sm max-w-xs">
          Share routes, discover better ways, together.
        </p>
      </aside>

      <main className="flex items-center justify-center p-8 bg-bg-base min-h-[100vh] md:min-h-0">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center mb-8 md:hidden">
            <AppLogo variant="icon" size="md" linkTo="" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
