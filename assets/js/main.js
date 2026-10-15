import './github-activity.js';

const tablist = document.querySelector('.project-tabs');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('.project-panel')];

function selectPanel(name, focus = false) {
  const selected = document.getElementById(`${name}-tab`);
  if (!selected) return;
  for (const tab of tabs) {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  for (const panel of panels) panel.hidden = panel.id !== selected.getAttribute('aria-controls');
  if (focus) selected.focus();
  updateRails();
}

if (tablist) {
  // Without JS, both collections stay visible and all links continue to work.
  tablist.hidden = false;
  selectPanel(location.hash === '#books' ? 'books' : 'apps');
  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    const name = tab.id === 'books-tab' ? 'books' : 'apps';
    selectPanel(name);
    history.replaceState(null, '', name === 'books' ? '#books' : '#projects');
  });
  tablist.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const name = tabs[next].id === 'books-tab' ? 'books' : 'apps';
    selectPanel(name, true);
    history.replaceState(null, '', name === 'books' ? '#books' : '#projects');
  });
  document.querySelectorAll('[data-show-panel]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      selectPanel(link.dataset.showPanel);
      history.pushState(null, '', link.hash);
      document.getElementById('projects').scrollIntoView();
    });
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#books') selectPanel('books');
    else if (location.hash === '#projects') selectPanel('apps');
  });
}

function updateRail(controls) {
  const rail = document.getElementById(controls.dataset.rail);
  if (!rail || !rail.clientWidth) return;
  const max = rail.scrollWidth - rail.clientWidth;
  controls.hidden = max <= 2;
  controls.querySelector('[data-direction="-1"]').disabled = rail.scrollLeft <= 2;
  controls.querySelector('[data-direction="1"]').disabled = rail.scrollLeft >= max - 2;
}

function updateRails() {
  document.querySelectorAll('.rail-controls').forEach(updateRail);
}

document.querySelectorAll('.rail-controls').forEach((controls) => {
  const rail = document.getElementById(controls.dataset.rail);
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-direction]');
    if (!button) return;
    const card = rail.querySelector('.project');
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap);
    rail.scrollBy({ left: Number(button.dataset.direction) * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  rail.addEventListener('scroll', () => updateRail(controls), { passive: true });
  new ResizeObserver(() => updateRail(controls)).observe(rail);
});
updateRails();

import './analytics.js';
