'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import StatusMessage from '@/components/StatusMessage';
import Button from '@/components/Button';
import Card from '@/components/Card';

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

interface ScanResult {
  success: boolean;
  message?: string;
  error?: string;
  ticket?: {
    ticket_code: string;
    user?: { name: string };
    event?: { title: string };
  };
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleScan(token: string) {
    setProcessing(true);
    setScanning(false);
    const res = await fetch('/api/tickets/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_token: token }),
    });
    const data = await res.json();
    setResult(data);
    setProcessing(false);
  }

  function resetScanner() {
    setResult(null);
    setScanning(true);
  }

  return (
    <div>
      <Header title="📷 Scanner Tiket" />
      <div className="px-4 py-4">
        {!scanning && !result && (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">📷</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Scan QR Code Tiket</h2>
            <p className="text-gray-500 text-sm mb-6">
              Arahkan kamera ke QR Code yang ada di tiket peserta
            </p>
            <Button size="lg" onClick={() => setScanning(true)}>
              Mulai Scan
            </Button>
          </div>
        )}

        {scanning && (
          <div>
            <QRScanner onScan={handleScan} active={scanning} />
            <div className="mt-4">
              <Button variant="secondary" fullWidth onClick={() => setScanning(false)}>
                Batal
              </Button>
            </div>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Memvalidasi tiket...</p>
          </div>
        )}

        {result && !processing && (
          <div className="flex flex-col gap-4">
            <StatusMessage
              type={result.success ? 'success' : 'error'}
              message={result.message || result.error || ''}
            />

            {result.ticket && (
              <Card>
                <h3 className="font-bold text-gray-800 mb-3">Detail Tiket</h3>
                <div className="space-y-2">
                  {result.ticket.user?.name && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <p className="text-sm text-gray-700">{result.ticket.user.name}</p>
                    </div>
                  )}
                  {result.ticket.event?.title && (
                    <div className="flex items-center gap-2">
                      <span>🎪</span>
                      <p className="text-sm text-gray-700">{result.ticket.event.title}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>🎟️</span>
                    <p className="text-sm font-mono text-gray-700">{result.ticket.ticket_code}</p>
                  </div>
                </div>
              </Card>
            )}

            <Button onClick={resetScanner} fullWidth>
              Scan Tiket Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
