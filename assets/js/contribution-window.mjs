const dayMilliseconds = 86400000;

export function sixMonthRange(endDate = new Date().toISOString().slice(0, 10)) {
  const end = new Date(`${endDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || !Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== endDate) {
    throw new Error('Invalid end date');
  }
  // Calendar months, not an approximate number of days. Clamp the anniversary
  // to the target month's last day, then exclude it so today's date is included.
  const anniversary = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 6, 1));
  const lastDay = new Date(Date.UTC(anniversary.getUTCFullYear(), anniversary.getUTCMonth() + 1, 0)).getUTCDate();
  anniversary.setUTCDate(Math.min(end.getUTCDate(), lastDay));
  const start = new Date(anniversary.getTime() + dayMilliseconds);
  return { start: start.toISOString().slice(0, 10), end: endDate };
}

export function selectSixMonths(days, endDate) {
  const range = sixMonthRange(endDate);
  const selected = days.filter(day => day.date >= range.start && day.date <= range.end);
  // Never label a partial response as a complete six-month total.
  const expectedDays = (Date.parse(range.end) - Date.parse(range.start)) / dayMilliseconds + 1;
  if (selected.length !== expectedDays || selected.some((day, index) =>
    day.date !== new Date(Date.parse(range.start) + index * dayMilliseconds).toISOString().slice(0, 10))) {
    throw new Error('Incomplete six-month calendar');
  }
  return selected;
}
