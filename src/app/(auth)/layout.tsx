import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <BackgroundGlow variant="spotlight" className="min-h-screen bg-background flex flex-col justify-center p-6 pb-24">
      <div className="w-full flex-1 flex flex-col justify-center max-w-md mx-auto relative z-10 py-6 pb-16">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)]">
              <span className="text-3xl select-none">🎟️</span>
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-full text-blue-950 flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              2026
            </div>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-1.5">
            EVNTER
          </h1>
          <p className="text-muted-foreground mt-1 text-xs font-semibold">
            Next-gen Event & Ticket Experience
          </p>
        </div>
        {children}
      </div>
    </BackgroundGlow>
  );
}
