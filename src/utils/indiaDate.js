const INDIA_TIME_ZONE = 'Asia/Kolkata';

export function getIndiaTodayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getIndiaCurrentMonthISO() {
  return getIndiaTodayISO().slice(0, 7);
}

export function formatIndianDate(isoDate) {
  if (!isoDate) {
    return '';
  }
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00+05:30`));
}

export function formatIndianMonth(monthIso) {
  if (!monthIso) {
    return '';
  }

  const [year, month] = monthIso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`));
}
