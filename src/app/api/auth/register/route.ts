import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, isSupabaseOffline, withTimeout } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, whatsapp } = await request.json();
    if (!name || !email || !password || !whatsapp) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }
    // An in-memory mock cannot provide durable accounts.
    if (isSupabaseOffline) {
      return NextResponse.json({ error: 'Pendaftaran tidak tersedia saat database offline' }, { status: 503 });
    }

    try {
      const supabase = createServerClient();
      const { data: existing } = await withTimeout<any>(
        supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
      );

      if (existing) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
      }

      const password_hash = await hashPassword(password);
      const { data: user, error } = await withTimeout<any>(
        supabase
          .from('users')
          .insert({
            name,
            email,
            password_hash,
            whatsapp,
            role: 'user',
            pro_status: 'free',
          })
          .select('id, name, email, role, pro_status, whatsapp')
          .single()
      );

      if (!error && user) {
        const token = signToken(user);
        const response = NextResponse.json({ success: true, user });
        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
        return response;
      }
    } catch {
      return NextResponse.json({ error: 'Pendaftaran tidak tersedia' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Pendaftaran tidak tersedia' }, { status: 503 });
  } catch (err) {
    const message = process.env.NODE_ENV === 'development'
      ? `Kesalahan server: ${err instanceof Error ? err.message : String(err)}`
      : 'Terjadi kesalahan server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
