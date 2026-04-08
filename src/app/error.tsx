'use client';
import { useEffect } from 'react';
import Button from '@/components/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="text-6xl mb-4">😔</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
      <p className="text-gray-500 text-center mb-6">Terjadi kesalahan. Silakan coba lagi.</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
