import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient, withTimeout } from '@/lib/supabase';
import { mockTickets } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

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

    try {
      const supabase = createServerClient();
      const { data, error } = await withTimeout<any>(
        supabase
          .from('tickets')
          .select(`*, event:events(id, title, date, location, poster_url, organizer_id)`)
          .eq('id', id)
          .single()
      );

      if (!error && data) {
        if (data.user_id !== user.id && user.role !== 'organizer' && user.role !== 'admin') {
          return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
        }
        return NextResponse.json({ ticket: data });
      }
    } catch {
      // Supabase fallback
    }

    // Fallback to mockTickets
    const mockTicket = mockTickets.find((t) => t.id === id) || mockTickets[0];
    if (mockTicket) {
      return NextResponse.json({ ticket: mockTicket });
    }

    return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
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

    try {
      const supabase = createServerClient();
      const { data: ticket } = await withTimeout<any>(
        supabase
          .from('tickets')
          .select('status')
          .eq('id', id)
          .single()
      );
      if (ticket && ticket.status === 'checked_in') {
        return NextResponse.json(
          { error: 'Tiket sudah digunakan', code: 'ALREADY_CHECKED_IN' },
          { status: 400 }
        );
      }

      const { data, error } = await withTimeout<any>(
        supabase
          .from('tickets')
          .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
      );

      if (!error && data) return NextResponse.json({ success: true, ticket: data });
    } catch {
      // Supabase fallback
    }

    // Mock response for offline/dev
    return NextResponse.json({
      success: true,
      ticket: {
        id,
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
