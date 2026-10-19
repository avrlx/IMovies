const indianCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatIndianCurrency(value) {
  return indianCurrency.format(Number(value || 0));
}

export function formatIndianDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatIndianTime(value) {
  if (!value) return '—';
  const [hour, minute] = String(value).split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(2000, 0, 1, hour, minute));
}

export function formatIndianShowtime(date, startTime, dateOptions = {}) {
  return `${formatIndianDate(date, dateOptions)} · ${formatIndianTime(startTime)}`;
}
