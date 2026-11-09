// Ultra-fast in-memory SWR client cache for EVNTER
import { mockEvents, mockTickets, mockNotifications } from './mockData';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 60000; // 60 seconds

// Pre-seed cache with instant mock datasets so first hits anywhere are 0ms
cache.set('/api/events?status=published', { data: { events: mockEvents }, timestamp: Date.now() });
cache.set('/api/events', { data: { events: mockEvents }, timestamp: Date.now() });
cache.set('/api/tickets', { data: { tickets: mockTickets }, timestamp: Date.now() });
cache.set('/api/notifications', { data: { notifications: mockNotifications }, timestamp: Date.now() });

export async function cachedFetch<T>(url: string, ttl: number = DEFAULT_TTL): Promise<T> {
  // Strip any timestamp cache-busters to ensure cache hits
  const cleanUrl = url.replace(/([?&])t=\d+(&?)/, '$1').replace(/[?&]$/, '');
  const cached = cache.get(cleanUrl) || cache.get(url);
  const now = Date.now();

  // If valid cache exists, return immediately (0ms response)
  if (cached && now - cached.timestamp < ttl) {
    return cached.data as T;
  }

  // If stale cache exists, return stale data immediately and revalidate in background (SWR pattern)
  if (cached) {
    fetch(cleanUrl)
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) {
          cache.set(cleanUrl, { data, timestamp: Date.now() });
        }
      })
      .catch(() => {});
    return cached.data as T;
  }

  // No cache at all: fetch and store
  const res = await fetch(cleanUrl);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }
  const data = await res.json();
  cache.set(cleanUrl, { data, timestamp: now });
  return data as T;
}

export function invalidateCache(urlPrefix?: string) {
  if (!urlPrefix) {
    cache.clear();
  } else {
    for (const key of cache.keys()) {
      if (key.startsWith(urlPrefix)) {
        cache.delete(key);
      }
    }
  }
}
