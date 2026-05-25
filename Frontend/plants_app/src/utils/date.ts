// src/utils/date.ts

/**
 * Convert a Gregorian date to Jalali (Persian) date
 */
export function toJalaliDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    console.warn('Jalali date conversion failed:', e);
    return '—';
  }
}

/**
 * Format date based on current language
 */
export function formatDate(dateString?: string | null, language?: string): string {
  if (!dateString) return '—';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    if (language === 'fa') {
      return toJalaliDate(dateString);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    console.warn('Date formatting failed:', e);
    return '—';
  }
}
