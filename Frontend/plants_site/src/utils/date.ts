
/**
 * Convert a Gregorian date to Jalali (Persian) date
 * Uses the built-in Intl.DateTimeFormat with fa-IR locale and persian calendar
 */
export function toJalaliDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}


export function formatDate(dateString: string, language: 'en' | 'fa'): string {
  if (language === 'fa') {
    return toJalaliDate(dateString);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
