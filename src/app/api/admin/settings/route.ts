import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Return defaults if table doesn't exist yet
      return NextResponse.json({
        settings: {
          id: null,
          payment_name: 'BCA',
          account_name: 'EVNTER Indonesia',
          account_number: '1234567890',
          qris_image: null,
          whatsapp_admin: '085882846665',
          description: 'Transfer ke rekening di atas atau scan QRIS',
        },
      });
    }
    return NextResponse.json({ settings: data });
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { payment_name, account_name, account_number, qris_image, whatsapp_admin, description } = body;

    const supabase = createServerClient();

    // Try to update existing record first
    const { data: existing } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .single();

    const payload = {
      payment_name,
      account_name,
      account_number,
      qris_image,
      whatsapp_admin,
      description,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing?.id) {
      result = await supabase
        .from('payment_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('payment_settings')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
    }
    return NextResponse.json({ success: true, settings: result.data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
