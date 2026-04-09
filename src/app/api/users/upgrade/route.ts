import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const body = await request.json();
    const { payment_proof_url } = body;

    if (!payment_proof_url) {
      return NextResponse.json({ error: 'Bukti pembayaran wajib diupload' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('users')
      .update({
        pro_status: 'pending',
        pro_payment_proof_url: payment_proof_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: 'Gagal submit permintaan' }, { status: 500 });

    // Notify admins
    const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
    if (admins) {
      for (const admin of admins) {
        await createNotification(
          admin.id,
          'general',
          `Ada pengajuan Upgrade Pro baru dari ${user.name}.`,
          '/admin/payments'
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Permintaan upgrade terkirim!' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
