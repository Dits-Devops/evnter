export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 p-6">
      <div className="w-full flex-1 flex flex-col justify-center max-w-md mx-auto">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center mb-4">
            <span className="text-3xl">🎟️</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">EVNTER</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Platform tiket event masa kini</p>
        </div>
        {children}
      </div>
    </div>
  );
}
