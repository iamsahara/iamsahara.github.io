import { initGitHubActivity } from './github-activity.js';
import './analytics.js';

const viewport = document.getElementById('gallery-wall');
const stage = document.querySelector('.gallery-stage');
const header = document.querySelector('.gallery-header');
const projectWall = document.querySelector('.project-wall');
const productsRoom = document.getElementById('products-room');
const bookTable = document.querySelector('.book-table');
const productRoomArt = document.getElementById('product-room-art');
const hobbyRoom = document.getElementById('hobby-room');
const aboutRoom = document.getElementById('about-room');
const wallSkills = document.querySelector('.wall-skills');
const skillsTrack = wallSkills.querySelector('.skills-track');
const skillsToggle = wallSkills.querySelector('.skills-toggle');
let frameButtons = [];
let bookButtons = [];
const collectionTabs = [...document.querySelectorAll('[data-collection]')];
const loading = document.getElementById('gallery-loading');
const workDialog = document.getElementById('work-dialog');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let collections = { apps: [], books: [] };
const hashRooms = { '#projects': 'apps', '#books': 'books', '#about': 'about' };
let collection = hashRooms[location.hash] || 'apps';

const repeatedSkills = skillsTrack.querySelector('ul').cloneNode(true);
skillsTrack.style.animationDuration = `${repeatedSkills.children.length * 3.1}s`;
repeatedSkills.setAttribute('aria-hidden', 'true');
repeatedSkills.inert = true;
skillsTrack.append(repeatedSkills);
skillsToggle.addEventListener('click', () => {
  const paused = wallSkills.classList.toggle('is-paused');
  skillsToggle.setAttribute('aria-pressed', String(paused));
  skillsToggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} skills animation`);
  skillsToggle.title = `${paused ? 'Play' : 'Pause'} skills animation`;
  skillsToggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
});

function layoutRoom() {
  const width = viewport.clientWidth;
  const phone = width <= 760;
  // Choose the room by the window's shape, then crop its unused foreground.
  // Scenery and exhibits share the same responsive wall and floor boundaries.
  const framing = matchMedia('(max-aspect-ratio: 2/3)').matches
    ? { aspect: 941 / 1672, wallStart: .215, floorStart: .79, wallFraction: .65, zoom: 1.26 }
    : matchMedia('(max-aspect-ratio: 5/4)').matches
      ? { aspect: 1122 / 1402, wallStart: .25, floorStart: .763, wallFraction: .70, zoom: 1.12 }
      : matchMedia('(min-aspect-ratio: 2/1)').matches
        ? { aspect: 1586 / 992, wallStart: .22, floorStart: .53, wallFraction: .61, zoom: 1.15 }
        : { aspect: 1, wallStart: .20, floorStart: .54, wallFraction: .57, zoom: 1.20 };
  const { aspect, wallStart, floorStart, wallFraction } = framing;
  const top = header.offsetHeight + (phone ? 20 : 28);
  const sceneWidth = width * framing.zoom;
  const wallWidth = Math.min(width * .88, sceneWidth * wallFraction * .94);
  stage.style.setProperty('--wall-width', `${wallWidth}px`);
  stage.style.setProperty('--book-size', `${phone ? 285 : Math.min(340, wallWidth / 3.5)}px`);
  stage.style.setProperty('--frame-height', `${phone ? 112 : 136}px`);
  // One camera for all three rooms. Inactive rooms remain measurable so the
  // tallest exhibit, not the selected tab, determines the shared wall bounds.
  const skillsHeight = wallSkills.offsetHeight;
  const contentHeight = Math.max(productsRoom.offsetHeight, hobbyRoom.offsetHeight, aboutRoom.offsetHeight) + skillsHeight + 14;
  const sceneHeight = Math.max(sceneWidth / aspect,
    (Math.max(viewport.clientHeight * .80 - top, contentHeight + 20)) / (floorStart - wallStart));
  const floor = top + sceneHeight * (floorStart - wallStart);
  const sceneOffset = top - sceneHeight * wallStart;
  const wallHeight = floor - top - skillsHeight - 34;
  stage.style.setProperty('--scene-width', `${sceneHeight * aspect}px`);
  stage.style.setProperty('--scene-height', `${sceneHeight}px`);
  stage.style.setProperty('--scene-offset', `${sceneOffset}px`);
  stage.style.setProperty('--stage-height', `${Math.max(viewport.clientHeight, floor + 70)}px`);
  stage.style.setProperty('--wall-top', `${top}px`);
  stage.style.setProperty('--skills-top', `${floor - skillsHeight - 20}px`);
  stage.style.setProperty('--shelf-top', `${top + Math.max(0, (wallHeight - hobbyRoom.offsetHeight) / 2)}px`);
  stage.style.setProperty('--banner-top', `${top}px`);
  stage.style.setProperty('--wall-height', `${wallHeight}px`);
}

function displayTitle(title) {
  return title.replace(/ \((Next\.js|TypeScript)\)$/, '').replace(' Workspace', '');
}

function createExhibit(item, index, isBook) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = isBook ? 'table-book' : 'wall-frame';
  button.dataset.kind = item.kind;
  button.dataset.brand = item.title;
  if (item.mark) button.dataset.mark = item.mark;
  button.setAttribute('aria-label', `Explore ${item.title}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.title = item.title;
  const art = document.createElement('span');
  art.className = isBook ? 'book-cover' : 'frame-art';
  if (item.mark && !isBook) {
    const mark = document.createElement('span');
    mark.className = 'product-mark';
    mark.textContent = item.mark;
    mark.setAttribute('aria-hidden', 'true');
    art.append(mark);
  } else {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    image.className = 'frame-image';
    image.draggable = false;
    art.append(image);
  }
  const caption = document.createElement('span');
  caption.className = isBook ? 'book-label' : 'frame-caption';
  if (isBook) {
    caption.textContent = item.title.replace('My First ', '').replace(' Coloring Book', '').replace(' & Architecture', '').replace(' & Decorative Arts', '');
  } else {
    const number = document.createElement('span');
    number.className = 'frame-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.className = 'frame-title';
    title.textContent = displayTitle(item.title);
    caption.append(number, title);
  }
  if (isBook) {
    // Keep the interactive button flat; only its decorative cover has 3D transforms.
    const object = document.createElement('span');
    object.className = 'book-object';
    object.append(art);
    button.append(object, caption);
  } else button.append(art, caption);
  button.addEventListener('click', () => openWork(item));
  return button;
}

async function renderRoom() {
  frameButtons = collections.apps.map((item, index) => createExhibit(item, index, false));
  bookButtons = collections.books.map((item, index) => createExhibit(item, index, true));
  projectWall.replaceChildren(...frameButtons);
  bookTable.replaceChildren(...bookButtons);
  for (const book of bookButtons) {
    const image = book.querySelector('img');
    const fitCover = () => {
      if (image.naturalHeight) book.style.setProperty('--cover-ratio', image.naturalWidth / image.naturalHeight);
      layoutRoom();
    };
    if (image.complete) fitCover();
    else image.addEventListener('load', fitCover, { once: true });
  }
  updateZones();
  layoutRoom();
}

function updateZones() {
  const isHobby = collection === 'books';
  for (const tab of collectionTabs) tab.setAttribute('aria-pressed', String(tab.dataset.collection === collection));
  document.body.dataset.area = collection;
  for (const [room, name] of [[productsRoom, 'apps'], [hobbyRoom, 'books'], [aboutRoom, 'about']]) {
    const inactive = collection !== name;
    room.hidden = false;
    room.classList.toggle('room-inactive', inactive);
    room.inert = inactive;
    room.setAttribute('aria-hidden', String(inactive));
  }
  const title = collection === 'about' ? 'About Sahar' : isHobby ? 'Bookshelf' : 'Product gallery';
  viewport.setAttribute('aria-label', title);
  document.title = `Sahar — ${title}`;
}

function changeCollection(name, updateHistory = true) {
  const changed = collection !== name;
  const focusRoom = changed && workDialog.open;
  if (focusRoom) {
    workDialog.close();
  }
  collection = name;
  if (updateHistory && changed) history.pushState(null, '', name === 'apps' ? '#projects' : `#${name}`);
  updateZones();
  layoutRoom();
  if (changed) viewport.scrollTo({ top: 0, behavior: 'instant' });
  if (focusRoom) collectionTabs.find(tab => tab.dataset.collection === name)?.focus({ preventScroll: true });
  if (changed && !reduced.matches) (name === 'apps' ? projectWall : name === 'books' ? hobbyRoom : aboutRoom).animate([{ opacity: .4 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
}

window.addEventListener('popstate', () => changeCollection(hashRooms[location.hash] || 'apps', false));
window.addEventListener('resize', layoutRoom);

function showDialog(dialog) {
  document.body.classList.add('dialog-open');
  dialog.showModal();
  dialog.scrollTop = 0;
}

function openWork(item) {
  workDialog.dataset.kind = item.kind;
  workDialog.dataset.brand = item.title;
  const workImage = document.getElementById('work-image');
  const workMark = document.getElementById('work-mark');
  workImage.hidden = !item.image;
  workMark.hidden = Boolean(item.image);
  if (item.image) workImage.src = item.image;
  else {
    workImage.removeAttribute('src');
    workMark.textContent = item.mark;
  }
  document.getElementById('work-image').alt = item.kind === 'book' ? `${item.title} cover` : `${item.title} ${item.kind === 'brand' ? 'logo' : 'interface'}`;
  document.getElementById('work-category').textContent = item.category;
  document.getElementById('work-title').textContent = item.title;
  document.getElementById('work-description').textContent = item.description;
  const actions = document.getElementById('work-actions');
  actions.replaceChildren();
  for (const link of item.links) {
    const anchor = document.createElement('a');
    anchor.className = 'button';
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `${link.label} (opens in a new tab)`);
    anchor.textContent = link.label;
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    anchor.append(arrow);
    actions.append(anchor);
  }
  showDialog(workDialog);
}

for (const dialog of [workDialog]) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}

for (const tab of collectionTabs) {
  tab.addEventListener('click', () => changeCollection(tab.dataset.collection));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = collectionTabs.indexOf(tab);
    const selected = event.key === 'Home' ? collectionTabs[0] : event.key === 'End' ? collectionTabs.at(-1) : collectionTabs[(index + (event.key === 'ArrowLeft' ? -1 : 1) + collectionTabs.length) % collectionTabs.length];
    changeCollection(selected.dataset.collection);
    selected.focus();
  });
}
const shelfStatus = document.getElementById('shelf-status');
function updateShelfStatus() {
  if (!bookButtons.length || !bookTable.clientWidth) return;
  const index = Math.round(bookTable.scrollLeft / bookTable.clientWidth);
  shelfStatus.textContent = `${Math.min(index + 1, bookButtons.length)} / ${bookButtons.length}`;
}
bookTable.addEventListener('scroll', updateShelfStatus, { passive: true });
for (const button of document.querySelectorAll('[data-shelf-step]')) {
  button.addEventListener('click', () => {
    const current = Math.round(bookTable.scrollLeft / bookTable.clientWidth);
    const next = (current + Number(button.dataset.shelfStep) + bookButtons.length) % bookButtons.length;
    bookTable.scrollTo({ left: next * bookTable.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
}
new ResizeObserver(layoutRoom).observe(viewport);
new ResizeObserver(layoutRoom).observe(header);
new ResizeObserver(layoutRoom).observe(wallSkills);
document.fonts.ready.then(layoutRoom);
productRoomArt.addEventListener('load', layoutRoom);

async function loadGallery() {
  try {
    // The homepage owns its content; no second page or extra request is needed.
    const contentUrl = new URL('./', location.href);
    const documentCopy = document.getElementById('portfolio-content').content.cloneNode(true);
    for (const [name, selector] of [['apps', '#app-rail .project'], ['books', '#book-rail .project']]) {
      collections[name] = [...documentCopy.querySelectorAll(selector)].map((card) => {
        const image = card.querySelector('img');
        return {
          title: card.querySelector('h3').textContent.trim(),
          category: card.querySelector('.project-category')?.textContent.trim() || 'Web project',
          description: card.querySelector('.project-copy > p:not(.project-category)').textContent.trim(),
          image: image ? new URL(image.getAttribute('src'), contentUrl).href : null,
          mark: card.dataset.galleryMark || null,
          kind: name === 'books' ? 'book' : card.querySelector('.brand-media') ? 'brand' : 'screen',
          links: [...card.querySelectorAll('.project-copy a')].map((link) => ({
            label: [...link.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim(),
            url: new URL(link.getAttribute('href'), contentUrl).href,
          })),
        };
      });
      if (!collections[name].length) throw new Error('No gallery content');
    }
    const activity = documentCopy.querySelector('#github-activity');
    productsRoom.prepend(activity);
    initGitHubActivity(activity);
    new ResizeObserver(layoutRoom).observe(productsRoom);
    const profile = documentCopy.querySelector('.hero-card');
    profile.querySelector('h1').id = 'profile-title';
    for (const image of profile.querySelectorAll('img')) image.src = new URL(image.getAttribute('src'), contentUrl).href;
    const profileContent = document.getElementById('profile-content');
    const identity = document.createElement('div');
    identity.className = 'banner-identity';
    const name = document.createElement('div');
    name.append(profile.querySelector('h1'), profile.querySelector('.hero-role'));
    identity.append(profile.querySelector('.portrait-ring'), name);
    const biography = profile.querySelector('.hero-bio');
    profileContent.append(identity, biography, profile.querySelector('.social-links'));
    new ResizeObserver(layoutRoom).observe(aboutRoom);
    for (const tab of collectionTabs) tab.disabled = false;
    await renderRoom();
    loading.hidden = true;
  } catch (error) {
    loading.replaceChildren(document.createTextNode('The gallery could not load. '));
    const fallback = document.createElement('a');
    fallback.href = 'https://github.com/iamsahara';
    fallback.textContent = 'View my GitHub projects';
    loading.append(fallback);
    console.error('Unable to load gallery content', error);
  }
}

updateZones();
layoutRoom();
loadGallery();
