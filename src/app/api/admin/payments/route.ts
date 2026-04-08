import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, whatsapp, pro_status, pro_payment_proof_url, updated_at')
      .in('pro_status', ['pending', 'approved'])
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    return NextResponse.json({ payments: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, action } = await request.json();
    const supabase = createServerClient();

    if (action === 'approve') {
      await supabase
        .from('users')
        .update({ pro_status: 'approved', role: 'organizer' })
        .eq('id', userId);
      return NextResponse.json({
        success: true,
        message: 'Pembayaran disetujui, user menjadi organizer',
      });
    } else if (action === 'reject') {
      await supabase
        .from('users')
        .update({ pro_status: 'free', pro_payment_proof_url: null })
        .eq('id', userId);
      return NextResponse.json({ success: true, message: 'Pembayaran ditolak' });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
