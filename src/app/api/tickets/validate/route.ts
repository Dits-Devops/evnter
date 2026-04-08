import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    const { qr_token } = await request.json();
    if (!qr_token) return NextResponse.json({ error: 'QR token wajib diisi' }, { status: 400 });

    const supabase = createServerClient();
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`*, event:events(id, title, date, status), user:users(id, name)`)
      .eq('qr_token', qr_token)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'QR tidak valid', code: 'INVALID_QR' }, { status: 404 });
    }

    if (ticket.status === 'checked_in') {
      return NextResponse.json(
        { error: 'Tiket sudah digunakan', code: 'ALREADY_CHECKED_IN', ticket },
        { status: 400 }
      );
    }

    if (ticket.event?.status === 'draft') {
      return NextResponse.json(
        { error: 'Event belum dimulai', code: 'EVENT_NOT_STARTED', ticket },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
      .eq('id', ticket.id)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: 'Gagal check-in' }, { status: 500 });

    // Write check-in log (best-effort; table may not exist yet)
    await supabase.from('checkin_logs').insert({
      ticket_id: ticket.id,
      event_id: ticket.event_id,
      user_id: ticket.user_id,
      scanned_by: user.id,
      scanned_at: new Date().toISOString(),
      result: 'success',
    }).then(() => null, () => null);

    return NextResponse.json({
      success: true,
      message: 'Check-in berhasil!',
      ticket: { ...updated, event: ticket.event, user: ticket.user },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
