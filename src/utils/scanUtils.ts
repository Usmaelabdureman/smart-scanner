export type ScanFormat = 'url' | 'email' | 'phone' | 'text';

export function normalizeScanData(data: string): string {
  return data.trim();
}

export function detectScanFormat(raw: string): { format: ScanFormat; value: string } {
  const value = normalizeScanData(raw);

  if (isEmail(value)) {
    return { format: 'email', value };
  }

  const phone = normalizePhone(value);
  if (phone) {
    return { format: 'phone', value: phone };
  }

  const url = normalizeUrl(value);
  if (url) {
    return { format: 'url', value: url };
  }

  return { format: 'text', value };
}

export function isEmail(value: string): boolean {
  // Simple, practical email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[+()\d\s.-]+$/.test(trimmed)) return null;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) return null;

  // Keep + if present, otherwise return digits
  if (trimmed.startsWith('+')) return `+${digits}`;
  return digits;
}

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 4) return null;
  if (/\s/.test(trimmed)) return null;

  const withScheme = ensureUrlScheme(trimmed);
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function ensureUrlScheme(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  // Treat "www." or bare domains as https
  return `https://${value}`;
}

export function getHistoryDedupeKey(format: ScanFormat, value: string): string {
  return `${format}:${value.trim().toLowerCase()}`;
}
