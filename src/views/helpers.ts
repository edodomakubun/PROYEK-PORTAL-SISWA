import { AuditLog, MasterClass, OnlineUser, PriorityStudent, Role, Student, StudentClassHistory, StudentDocument, User } from '../types';

// ============================================================
// GLOBAL TIMEZONE HELPER — WIT (Waktu Indonesia Timur, UTC+9)
// Gunakan fungsi ini di seluruh file untuk konsistensi waktu.
// ============================================================
export const WIT_LOCALE = 'id-ID';
export const WIT_TZ: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jayapura' };

/** Format tanggal + jam lengkap dalam WIT, mis. "27 Agt 2026, 02.33.00" */
export function formatWIT(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleString(WIT_LOCALE, {
      ...WIT_TZ,
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch {
    return String(dateInput);
  }
}

/** Format tanggal saja dalam WIT, mis. "27 Agt 2026" */
export function formatWITDate(dateInput: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString(WIT_LOCALE, { ...WIT_TZ, ...(opts || { day: 'numeric', month: 'short', year: 'numeric' }) });
  } catch {
    return String(dateInput);
  }
}

// Bulletproof Base64 encoded SVG Data URI (Vibrant indigo gradient avatar)
export const DEFAULT_AVATAR = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImF2YXRhckdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzNzMwYTMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI2MCIgZmlsbD0idXJsKCNhdmF0YXJHcmFkKSIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIyIiBmaWxsPSIjZmZmZmZmIi8+PHBhdGggZD0iTTYwIDc0Yy0yNCAwLTQwIDEyLTQwIDI2djRoODB2LTRjMC0xNC0xNi0yNi04MC0yNnoiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOTUiLz48L3N2Zz4=`;

/**
 * Format tanggal ke format Indonesia, mis. "27 Agustus 2026"
 * Mendukung format: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD
 */
export function formatIndonesianDate(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) return '-';
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const str = dateStr.trim();

  // If already contains Indonesian month name, return as is
  if (MONTHS.some(m => str.toLowerCase().includes(m.toLowerCase()))) {
    return str;
  }

  // ISO Format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }

  // Format DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const monthIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = ddmmyyyyMatch[3];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }

  return str;
}
