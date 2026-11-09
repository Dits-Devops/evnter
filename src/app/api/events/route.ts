import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient, withTimeout } from '@/lib/supabase';
import { mockEvents } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || 'published';
  const organizerId = searchParams.get('organizer_id');

  try {
    const supabase = createServerClient();
    let query = supabase
      .from('events')
      .select(`*, organizer:users(id, name), ticket_count:tickets(count)`)
      .order('date', { ascending: true });

    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('title', `%${search}%`);
    if (organizerId) query = query.eq('organizer_id', organizerId);

    const { data, error } = await withTimeout<any>(query);
    if (!error && data && data.length > 0) {
      const events = data.map(
        (event: { ticket_count?: { count: number }[] | null; [key: string]: unknown }) => ({
          ...event,
          ticket_count: Array.isArray(event.ticket_count)
            ? (event.ticket_count[0]?.count ?? 0)
            : 0,
        })
      );
      return NextResponse.json({ events });
    }
  } catch {
    // Supabase fallback to mock data
  }

  let filtered = [...mockEvents];
  if (status !== 'all') {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(search) ||
        e.location.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search))
    );
  }
  if (organizerId) {
    const matched = filtered.filter((e) => e.organizer_id === organizerId);
    filtered = matched.length > 0 ? matched : filtered;
  }

  return NextResponse.json({ events: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Hanya organizer yang bisa membuat event' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, description, date, location, poster_url, price,
      metode_pembayaran, nomor_rekening, nama_pemilik,
      qris_image, catatan_pembayaran, max_peserta
    } = body;

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Title, tanggal, dan lokasi wajib diisi' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        date,
        location,
        poster_url,
        price: price || 0,
        organizer_id: user.id,
        status: 'published',
        metode_pembayaran,
        nomor_rekening,
        nama_pemilik,
        qris_image,
        catatan_pembayaran,
        max_peserta: max_peserta ? parseInt(max_peserta) : 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Gagal membuat event' }, { status: 500 });
    return NextResponse.json({ success: true, event: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
