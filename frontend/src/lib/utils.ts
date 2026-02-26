import { type ClassValue } from 'clsx';

// Simple clsx implementation since we don't want to add another dependency yet
function clsxWrapper(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string') {
      result.push(cls);
    } else if (Array.isArray(cls)) {
      const nested = clsxWrapper(...cls);
      if (nested) result.push(nested);
    } else if (typeof cls === 'object') {
      for (const key in cls) {
        if (cls[key]) result.push(key);
      }
    }
  }

  return result.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return clsxWrapper(...inputs);
}
