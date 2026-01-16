import AsyncStorage from '@react-native-async-storage/async-storage';

import { type ScanFormat, getHistoryDedupeKey } from '../utils/scanUtils';

export type ScanHistoryItem = {
  id: string;
  format: ScanFormat;
  value: string;
  createdAt: number;
};

const STORAGE_KEY = 'scan_history_v1';
const MAX_ITEMS = 100;

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is ScanHistoryItem => {
        return (
          typeof x === 'object' &&
          x !== null &&
          typeof (x as any).id === 'string' &&
          typeof (x as any).format === 'string' &&
          typeof (x as any).value === 'string' &&
          typeof (x as any).createdAt === 'number'
        );
      })
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export async function addToScanHistory(input: {
  format: ScanFormat;
  value: string;
  createdAt?: number;
}): Promise<ScanHistoryItem[]> {
  const createdAt = input.createdAt ?? Date.now();
  const current = await getScanHistory();

  const dedupeKey = getHistoryDedupeKey(input.format, input.value);

  const withoutDupes = current.filter(
    (item) => getHistoryDedupeKey(item.format, item.value) !== dedupeKey
  );

  const newItem: ScanHistoryItem = {
    id: `${createdAt}-${Math.random().toString(16).slice(2)}`,
    format: input.format,
    value: input.value,
    createdAt,
  };

  const next = [newItem, ...withoutDupes].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function removeFromScanHistory(id: string): Promise<ScanHistoryItem[]> {
  const current = await getScanHistory();
  const next = current.filter((x) => x.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearScanHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
