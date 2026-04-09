'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAlert } from '@/context/AlertContext';

interface Payment {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  pro_status: string;
  pro_payment_proof_url: string;
  updated_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    const res = await fetch('/api/admin/payments');
    if (res.ok) { const d = await res.json(); setPayments(d.payments || []); }
    setLoading(false);
  }

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    const isConfirm = await alert.confirm(
      action === 'approve' ? 'Setujui Upgrade?' : 'Tolak Upgrade?',
      `Apakah Anda yakin ingin ${action === 'approve' ? 'menerima' : 'menolak'} pembayaran ini?`
    );
    if (!isConfirm) return;

    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      await alert.success('Berhasil', data.message || 'Status berhasil diubah');
      fetchPayments();
    } else {
      await alert.error('Gagal', data.error || 'Terjadi kesalahan saat mengubah status');
    }
  }

  return (
    <div>
      <Header title="💳 Pembayaran Pro" />
      <div className="px-4 py-4">
        {loading ? <LoadingSpinner /> : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">💳</p>
            <p>Tidak ada pembayaran</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map(p => (
              <Card key={p.id}>
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 mb-2">{p.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold mb-3 inline-block ${p.pro_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {p.pro_status}
                </span>
                {p.pro_payment_proof_url && p.pro_payment_proof_url !== 'via-whatsapp' && (
                  <div className="mb-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📸 Bukti Transfer</p>
                    <a href={p.pro_payment_proof_url} target="_blank" rel="noopener noreferrer">
                      <img src={p.pro_payment_proof_url} alt="Bukti Pembayaran" className="w-full h-48 object-cover rounded-xl" />
                    </a>
                  </div>
                )}
                {p.pro_status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(p.id, 'approve')} className="flex-1">✅ Setujui</Button>
                    <Button size="sm" variant="danger" onClick={() => handleAction(p.id, 'reject')} className="flex-1">❌ Tolak</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
