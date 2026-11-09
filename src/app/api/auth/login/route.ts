import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, isSupabaseOffline, withTimeout } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';
import { mockUsers } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

function localDemoEnabled(request: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.DEMO_AUTH_ENABLED !== 'true' || !appUrl || !process.env.DEMO_AUTH_PASSWORD_HASH_B64 || !process.env.JWT_SECRET) return false;
  try {
    return ['localhost', '127.0.0.1'].includes(new URL(appUrl).hostname)
      && ['localhost', '127.0.0.1'].includes(request.nextUrl.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Explicit local-only demo login; real deployments continue to use database credentials.
    if (localDemoEnabled(request)) {
      const demoUser = mockUsers.find((user) => user.email === email.trim().toLowerCase());
      if (demoUser && await comparePassword(password, Buffer.from(process.env.DEMO_AUTH_PASSWORD_HASH_B64!, 'base64').toString('utf8'))) {
        const token = signToken(demoUser);
        const response = NextResponse.json({ success: true, user: demoUser, token });
        response.cookies.set('token', token, {
          httpOnly: true, secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
        });
        return response;
      }
      if (isSupabaseOffline) {
        return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
      }
    }

    if (isSupabaseOffline) {
      return NextResponse.json({ error: 'Login tidak tersedia saat database offline' }, { status: 503 });
    }

    try {
      const supabase = createServerClient();
      const { data: user, error } = await withTimeout(supabase
        .from('users')
        .select('id, name, email, password_hash, role, pro_status, whatsapp')
        .eq('email', email.trim().toLowerCase())
        .single(), 3000);

      if (!error && user?.password_hash) {
        const valid = await comparePassword(password, user.password_hash);
        if (valid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password_hash: _, ...safeUser } = user;
          const token = signToken(safeUser);
          const response = NextResponse.json({ success: true, user: safeUser, token });
          response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });
          return response;
        }
      }
    } catch {
      return NextResponse.json({ error: 'Login sementara tidak tersedia' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
