import { selectSixMonths } from './contribution-window.mjs';

export function initGitHubActivity(section = document.getElementById('github-activity')) {
  if (!section) return;
  const summary = document.getElementById('github-activity-summary');
  const calendar = document.getElementById('github-activity-calendar');
  const range = document.getElementById('github-activity-range');
  const note = document.getElementById('github-activity-note');
  const namespace = 'http://www.w3.org/2000/svg';
  const monthFormat = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });
  const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' });
  const hour = 60 * 60 * 1000;
  let request;
  let refreshedAt = 0;
  let started = false;

  function svgElement(tag, attributes, text) {
    const element = document.createElementNS(namespace, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function validateDays(data) {
    if (!Array.isArray(data.contributions) || !data.contributions.length || data.contributions.length > 371) throw new Error('Invalid calendar');
    const days = data.contributions.map(day => {
      const date = new Date(`${day.date}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day.date ||
          !Number.isSafeInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4) throw new Error('Invalid contribution');
      return { ...day, dateObject: date };
    }).sort((a, b) => a.date.localeCompare(b.date));
    // Missing or duplicate dates must not silently become zero-contribution days.
    if (days.some((day, index) => index > 0 && day.dateObject - days[index - 1].dateObject !== 86400000)) throw new Error('Incomplete calendar');
    return days;
  }

  function render(days) {
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const firstDay = days[0].dateObject.getUTCDay();
    const columns = Math.ceil((firstDay + days.length) / 7);
    const width = 36 + columns * 14;
    const label = `${total.toLocaleString()} contributions in the last six months`;
    const dateRange = `${dateFormat.format(days[0].dateObject)} – ${dateFormat.format(days.at(-1).dateObject)}`;
    const svg = svgElement('svg', { viewBox: `0 0 ${width} 124`, role: 'img', 'aria-label': label });
    svg.append(svgElement('desc', {}, `Daily activity from ${dateFormat.format(days[0].dateObject)} to ${dateFormat.format(days.at(-1).dateObject)}. Darker squares indicate fewer contributions.`));
    for (const [weekday, label] of [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']]) {
      svg.append(svgElement('text', { x: 0, y: 31 + weekday * 14 }, label));
    }
    let lastMonthColumn = -4;
    days.forEach((day, index) => {
      const column = Math.floor((firstDay + index) / 7);
      const row = day.dateObject.getUTCDay();
      const remainingInFirstMonth = new Date(Date.UTC(day.dateObject.getUTCFullYear(), day.dateObject.getUTCMonth() + 1, 0)).getUTCDate() - day.dateObject.getUTCDate();
      if (((index === 0 && remainingInFirstMonth >= 18) || day.dateObject.getUTCDate() === 1) && column > lastMonthColumn + 2 && column < columns - 2) {
        svg.append(svgElement('text', { x: 36 + column * 14, y: 12 }, monthFormat.format(day.dateObject)));
        lastMonthColumn = column;
      }
      const square = svgElement('rect', { x: 36 + column * 14, y: 22 + row * 14, width: 10, height: 10, rx: 2, 'data-level': day.level });
      square.append(svgElement('title', {}, `${day.count} contribution${day.count === 1 ? '' : 's'} on ${dateFormat.format(day.dateObject)}`));
      svg.append(square);
    });
    calendar.replaceChildren(svg);
    calendar.hidden = false;
    summary.textContent = label;
    range.textContent = dateRange;
    note.textContent = 'Updates automatically · refreshed hourly';
    // Start with recent weeks on a phone; all months remain available by scrolling.
    requestAnimationFrame(() => { calendar.scrollLeft = calendar.scrollWidth; });
  }

  async function load() {
    started = true;
    request?.abort();
    const controller = new AbortController();
    request = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    summary.textContent = 'Loading GitHub activity…';
    calendar.hidden = true;
    section.setAttribute('aria-busy', 'true');
    try {
      // Public profile data only: no GitHub token or private repository access.
      const response = await fetch('https://github-contributions-api.jogruber.de/v4/iamsahara?y=last', { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error('Activity unavailable');
      const days = selectSixMonths(validateDays(await response.json()));
      if (request !== controller) return;
      render(days);
      refreshedAt = Date.now();
    } catch {
      if (request !== controller) return;
      calendar.replaceChildren();
      range.textContent = '';
      summary.textContent = 'GitHub activity is temporarily unavailable.';
      note.textContent = 'You can still view the calendar on my GitHub profile.';
    } finally {
      clearTimeout(timeout);
      if (request === controller) section.removeAttribute('aria-busy');
    }
  }

  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
  }, { rootMargin: '300px' });
  observer.observe(section);
  const refresh = () => {
    if (started && document.visibilityState === 'visible' && Date.now() - refreshedAt >= hour) load();
  };
  setInterval(refresh, hour);
  document.addEventListener('visibilitychange', refresh);
}

initGitHubActivity();
