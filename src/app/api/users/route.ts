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
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const body = await request.json();
    const supabase = createServerClient();
    const { name, whatsapp } = body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, whatsapp, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, name, email, role, pro_status, whatsapp')
      .single();

    if (error) return NextResponse.json({ error: 'Gagal update profil' }, { status: 500 });
    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
