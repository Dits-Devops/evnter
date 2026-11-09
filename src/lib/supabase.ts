import { createClient } from '@supabase/supabase-js';
import { mockUsers, mockEvents, mockTickets, mockNotifications, mockRegistrations } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Quick check if Supabase host is known offline or unresolvable to prevent Windows DNS 8-second thread blocking
export const isSupabaseOffline = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  supabaseUrl.includes('wszhfcjtzjxxbnylfflz') ||
  supabaseUrl.includes('placeholder') ||
  supabaseAnonKey.includes('placeholder');

// In-memory data store for the mock client to provide realistic, dynamic, stateful responses (0ms lag)
const store: Record<string, any[]> = {
  users: [...mockUsers],
  events: [...mockEvents],
  tickets: [...mockTickets],
  notifications: [...mockNotifications],
  event_registrations: [...mockRegistrations],
  checkin_logs: [] as any[],
  pro_upgrade_payment_settings: [
    {
      id: 'pay-1',
      payment_name: 'QRIS & Transfer BCA',
      account_name: 'PT EVNTER KREATIF NUSANTARA',
      account_number: '8271039941',
      qris_image: null,
      whatsapp_admin: '085882846665',
      description: 'Transfer ke rekening di atas atau scan QRIS',
      updated_at: new Date().toISOString(),
    },
  ],
};

function createMockQueryBuilder(table: string) {
  let records: any[] = store[table] ? [...store[table]] : [];
  let isSingle = false;

  const builder: any = {
    select: (_fields?: string) => builder,
    insert: (data: any) => {
      const items = Array.isArray(data) ? data : [data];
      const stamped = items.map((item, idx) => ({
        id: item.id || `mock-${table}-${Date.now()}-${idx}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      }));
      if (store[table]) {
        store[table].unshift(...stamped);
      }
      builder._resultData = Array.isArray(data) ? stamped : stamped[0];
      return builder;
    },
    update: (data: any) => {
      builder._updateData = data;
      return builder;
    },
    delete: () => {
      builder._isDelete = true;
      return builder;
    },
    eq: (column: string, val: any) => {
      records = records.filter((r) => String(r[column]) === String(val));
      if (builder._updateData) {
        records.forEach((r) => Object.assign(r, builder._updateData, { updated_at: new Date().toISOString() }));
        builder._resultData = isSingle ? records[0] : records;
      }
      if (builder._isDelete && store[table]) {
        store[table] = store[table].filter((r: any) => String(r[column]) !== String(val));
      }
      return builder;
    },
    order: (_col: string, _opts?: any) => builder,
    limit: (n: number) => {
      records = records.slice(0, n);
      return builder;
    },
    single: () => {
      isSingle = true;
      return builder;
    },
    then: (resolve: any, _reject?: any) => {
      const res = builder._resultData !== undefined 
        ? builder._resultData 
        : (isSingle ? (records[0] || null) : records);
      return Promise.resolve({ data: res, error: null }).then(resolve);
    },
  };

  return builder;
}

function createMockClient() {
  return {
    from: (table: string) => createMockQueryBuilder(table),
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
      unsubscribe: () => {},
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-upload.png' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87' } }),
      }),
    },
  };
}

const realSupabase = !isSupabaseOffline ? createClient(supabaseUrl, supabaseAnonKey) : null;
const mockClient = createMockClient();

export const supabase: any = isSupabaseOffline ? mockClient : realSupabase!;

export function createServerClient(): any {
  if (isSupabaseOffline) {
    return mockClient;
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey);
}

export function withTimeout<T = any>(promise: PromiseLike<T> | Promise<T>, ms: number = 250): Promise<T> {
  if (isSupabaseOffline) {
    return Promise.resolve(promise as any);
  }

  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error('Supabase request timeout'));
      }, ms)
    ),
  ]);
}

