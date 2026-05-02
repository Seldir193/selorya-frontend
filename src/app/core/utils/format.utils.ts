export function formatDisplayDateOnly(value: string, locale: string): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDisplayDate(value: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatMoney(value: string, currency: string, language: string): string {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(Number(value));
}
