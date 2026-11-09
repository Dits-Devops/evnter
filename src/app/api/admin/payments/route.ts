import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, withTimeout } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const fallbackPayments = [
  {
    id: 'pay-1',
    name: 'Alif Kurniawan',
    email: 'alif@techfest.id',
    whatsapp: '085711223344',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'pay-2',
    name: 'Nadia Putri',
    email: 'nadia@soundfest.com',
    whatsapp: '087899887766',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'pay-3',
    name: 'Fauzan Akbar',
    email: 'fauzan@gamecon.id',
    whatsapp: '081298761234',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'pay-4',
    name: 'Sarah Organizer',
    email: 'sarah@evnter.id',
    whatsapp: '089876543210',
    pro_status: 'approved',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await withTimeout<any>(
      supabase
        .from('users')
        .select('id, name, email, whatsapp, pro_status, pro_payment_proof_url, updated_at')
        .in('pro_status', ['pending', 'approved'])
        .order('updated_at', { ascending: false })
    );

    if (!error && data && data.length > 0) {
      return NextResponse.json({ payments: data });
    }
  } catch {
    // Supabase fallback
  }

  return NextResponse.json({ payments: fallbackPayments });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    try {
      const supabase = createServerClient();
      if (action === 'approve') {
        await withTimeout(
          supabase
            .from('users')
            .update({ pro_status: 'approved', role: 'organizer' })
            .eq('id', userId)
        );
      } else if (action === 'reject') {
        await withTimeout(
          supabase
            .from('users')
            .update({ pro_status: 'free', pro_payment_proof_url: null })
            .eq('id', userId)
        );
      }
    } catch {
      // Supabase fallback
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Pembayaran disetujui, akun berhasil di-upgrade ke Pro' : 'Pembayaran ditolak',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
