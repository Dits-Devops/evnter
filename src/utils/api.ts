export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    const json = await response.json();
    if (!response.ok) {
      return { error: json.error || 'Terjadi kesalahan' };
    }
    return { data: json };
  } catch {
    return { error: 'Koneksi bermasalah, silakan coba lagi' };
  }
}
