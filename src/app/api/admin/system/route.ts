import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import os from 'os';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Calculate memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // A rough CPU usage proxy (load average over 1 minute normalized by core count)
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0];
    const cpuUsagePercent = Math.min((loadAvg / cpus.length) * 100, 100);

    return NextResponse.json({
      system: {
        cpu: cpuUsagePercent,
        ram: memUsagePercent,
        uptime: os.uptime(),
        platform: os.platform(),
      }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
