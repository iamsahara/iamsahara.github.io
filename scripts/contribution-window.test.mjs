import assert from 'node:assert/strict';
import { sixMonthRange, selectSixMonths } from '../assets/js/contribution-window.mjs';

for (const [end, start] of [
  ['2026-10-15', '2026-04-16'],
  ['2026-08-31', '2026-03-01'],
  ['2024-08-31', '2024-03-01'],
  ['2024-08-29', '2024-03-01'],
  ['2024-02-29', '2023-08-30'],
  ['2026-03-31', '2025-10-01'],
  ['2026-01-01', '2025-07-02'],
]) assert.deepEqual(sixMonthRange(end), { start, end });
assert.throws(() => sixMonthRange('2026-02-29'));

const days = Array.from({ length: 370 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 9, 12 + index)).toISOString().slice(0, 10),
  count: index,
}));
const recent = selectSixMonths(days, '2026-10-15');
assert.equal(recent.length, 183);
assert.equal(recent[0].date, '2026-04-16');
assert.equal(recent.at(-1).date, '2026-10-15');
assert.equal(recent.reduce((total, day) => total + day.count, 0), 50691);
assert.throws(() => selectSixMonths(days.filter(day => day.date !== '2026-06-01'), '2026-10-15'));
assert.throws(() => selectSixMonths(days.filter(day => day.date !== '2026-10-15'), '2026-10-15'));
console.log('Six-month calendar boundaries, filtering, totals, and missing-data checks passed.');
