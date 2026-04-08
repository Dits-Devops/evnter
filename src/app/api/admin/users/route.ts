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
      .select('id, name, email, whatsapp, role, pro_status, pro_payment_proof_url, created_at')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    return NextResponse.json({ users: data });
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
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, role, pro_status } = await request.json();
    const supabase = createServerClient();
    const updates: Record<string, string> = {};
    if (role) updates.role = role;
    if (pro_status) updates.pro_status = pro_status;

    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (error) return NextResponse.json({ error: 'Gagal update user' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
