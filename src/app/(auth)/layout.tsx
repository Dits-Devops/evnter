export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-blue-600">🎟️ EVNTER</h1>
          <p className="text-gray-500 mt-2">Platform tiket event #1 Indonesia</p>
        </div>
        {children}
      </div>
    </div>
  );
}
