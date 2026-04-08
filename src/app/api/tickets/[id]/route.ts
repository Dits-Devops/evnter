import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('tickets')
      .select(`*, event:events(id, title, date, location, poster_url, organizer_id)`)
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    if (data.user_id !== user.id && user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }
    return NextResponse.json({ ticket: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    const supabase = createServerClient();
    const { data: ticket } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', id)
      .single();
    if (!ticket) return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    if (ticket.status === 'checked_in') {
      return NextResponse.json(
        { error: 'Tiket sudah digunakan', code: 'ALREADY_CHECKED_IN' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Gagal check-in' }, { status: 500 });
    return NextResponse.json({ success: true, ticket: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
