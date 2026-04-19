/* ============================================================
   photos.js — загрузка фото (Electron IPC), галерея, лайтбокс
   Пути: photos/journal/… (записи работ), photos/issues/… (поломки), либо legacy photos/файл в корне.
   ============================================================ */

const MAX_PHOTOS = 10;
const PHOTOS_FOLDER = 'photos';

/** scope загрузки в main: journal | issues */
const PHOTO_SCOPE_JOURNAL = 'journal';
const PHOTO_SCOPE_ISSUES = 'issues';
const PHOTO_SCOPES = new Set([PHOTO_SCOPE_JOURNAL, PHOTO_SCOPE_ISSUES]);

function photoUrl(filename) {
  if (!filename) return '';
  const normalized = String(filename).replace(/\\/g, '/').replace(/^photos\//, '').replace(/^\/+/, '');
  return 'photo:///' + encodeURI(normalized);
}

function getPhotoDisplayUrl(p) {
  const name =
    p.filename ||
    (p.url
      ? p.url.startsWith('photo://')
        ? decodeURIComponent(p.url.slice('photo://'.length))
        : (() => {
            const u = String(p.url);
            const photosPrefix = PHOTOS_FOLDER + '/';
            const idx = u.indexOf(photosPrefix);
            if (idx >= 0) return u.slice(idx + photosPrefix.length);
            return u.replace(/^.*[/\\]/, '');
          })()
      : '');
  return name ? photoUrl(name) : '';
}

function photoStoredFilenameFromUrl(url) {
  if (!url || url.startsWith('blob:')) return '';
  if (url.startsWith('photo://')) {
    try {
      const u = new URL(url);
      const hostPart = (u.hostname || '').replace(/^\/+/, '');
      const pathPart = (u.pathname || '').replace(/^\/+/, '');
      return decodeURIComponent([hostPart, pathPart].filter(Boolean).join('/')).replace(/^photos\//, '');
    } catch (_) {
      return decodeURIComponent(url.slice('photo://'.length)).replace(/^photos\//, '');
    }
  }
  const prefix = PHOTOS_FOLDER + '/';
  const idx = url.indexOf(prefix);
  if (idx >= 0) return url.slice(idx + prefix.length);
  return url.replace(/^.*[/\\]/, '');
}

/* ============================================================
   UPLOAD / DELETE (Electron main process)
   ============================================================ */

async function uploadPhoto(file, scope = PHOTO_SCOPE_JOURNAL) {
  const buffer = await file.arrayBuffer();
  const result = await window.api.uploadPhoto(file.name, buffer, scope);
  result.url = photoUrl(result.filename);
  return result;
}

async function deletePhotoFile(filename) {
  if (!filename) return;
  await window.api.deletePhoto(filename).catch(() => {});
}

/* ============================================================
   PHOTO PICKER (inside entry modal)
   ============================================================ */

let _pendingPhotos = [];
let _deletedPhotos = [];
let _photoPickerScope = PHOTO_SCOPE_JOURNAL;
let _photoPickerGridId = 'photoPickerGrid';
let _photoPickerCounterId = 'photoCounter';

function initPhotoPicker(existingPhotos = [], scope = PHOTO_SCOPE_JOURNAL,
  gridId = 'photoPickerGrid', counterId = 'photoCounter') {
  _photoPickerScope = PHOTO_SCOPES.has(scope) ? scope : PHOTO_SCOPE_JOURNAL;
  _photoPickerGridId = gridId;
  _photoPickerCounterId = counterId;
  _pendingPhotos = existingPhotos.map(p => {
    const filename = p.filename || photoStoredFilenameFromUrl(p.url);
    return {
      filename,
      url: getPhotoDisplayUrl({ filename, url: p.url }),
      isNew: false,
    };
  }).filter(p => p.filename);
  _deletedPhotos = [];
  renderPhotoPicker();
}

function renderPhotoPicker() {
  const container = document.getElementById(_photoPickerGridId);
  if (!container) return;

  container.innerHTML = '';

  _pendingPhotos.forEach((p, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'photo-thumb';
    thumb.innerHTML = `
      <img src="${esc(p.url)}" alt="" loading="lazy" onclick="openLightbox(${idx}, 'picker')">
      <button class="photo-thumb-del" title="${esc(L.photo_remove)}"
              onclick="removePendingPhoto(${idx})">✕</button>`;
    container.appendChild(thumb);
  });

  if (_pendingPhotos.length < MAX_PHOTOS) {
    const addBtn = document.createElement('label');
    addBtn.className = 'photo-add-btn';
    addBtn.title = L.photo_add;
    addBtn.innerHTML = `
      <span class="photo-add-icon">+</span>
      <span class="photo-add-label">${esc(L.photo_add)}</span>
      <input type="file" accept="image/*" multiple class="hidden"
             onchange="handlePhotoFilesSelected(event)">`;
    container.appendChild(addBtn);
  }

  const counter = document.getElementById(_photoPickerCounterId);
  if (counter) {
    counter.textContent = _pendingPhotos.length > 0
      ? L.photo_count(_pendingPhotos.length, MAX_PHOTOS)
      : '';
  }
}

async function handlePhotoFilesSelected(event) {
  const files = Array.from(event.target.files);
  event.target.value = '';

  const container = document.getElementById(_photoPickerGridId);
  const remaining = MAX_PHOTOS - _pendingPhotos.length;
  if (remaining <= 0) { toast(L.photo_limit, 'error'); return; }

  const toProcess = files.slice(0, remaining);
  if (files.length > remaining) {
    toast(L.photo_limit_trunc(remaining), 'error');
  }

  const addBtn = container?.querySelector('.photo-add-btn');
  if (addBtn) addBtn.classList.add('uploading');

  for (const file of toProcess) {
    if (!file.type.startsWith('image/')) {
      toast(`${file.name}: ${L.photo_not_image}`, 'error');
      continue;
    }
    try {
      const result = await uploadPhoto(file, _photoPickerScope);
      _pendingPhotos.push({ filename: result.filename, url: result.url, isNew: true });
    } catch (e) {
      toast(`${file.name}: ${e.message || e}`, 'error');
    }
  }

  if (addBtn) addBtn.classList.remove('uploading');
  renderPhotoPicker();
}

function removePendingPhoto(idx) {
  const photo = _pendingPhotos[idx];
  if (!photo) return;

  if (!photo.isNew) {
    _deletedPhotos.push(photo.filename);
  } else {
    deletePhotoFile(photo.filename);
  }

  _pendingPhotos.splice(idx, 1);
  renderPhotoPicker();
}

async function commitPhotos() {
  for (const fname of _deletedPhotos) await deletePhotoFile(fname);
  _deletedPhotos = [];

  return _pendingPhotos.map(p => ({ filename: p.filename, url: photoUrl(p.filename) }));
}

async function rollbackPhotos() {
  for (const p of _pendingPhotos.filter(p => p.isNew)) await deletePhotoFile(p.filename);
  _pendingPhotos = [];
  _deletedPhotos = [];
}

/* ============================================================
   LIGHTBOX
   ============================================================ */

let _lightboxPhotos = [];
let _lightboxIndex  = 0;

function openLightbox(idx, source) {
  _lightboxPhotos = source === 'picker'
    ? _pendingPhotos.map(p => p.url)
    : _viewPhotos;

  if (_lightboxPhotos.length === 0) return;

  _lightboxIndex = Math.max(0, Math.min(idx, _lightboxPhotos.length - 1));
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

function lightboxNext() {
  _lightboxIndex = (_lightboxIndex + 1) % _lightboxPhotos.length;
  renderLightbox();
}

function lightboxPrev() {
  _lightboxIndex = (_lightboxIndex - 1 + _lightboxPhotos.length) % _lightboxPhotos.length;
  renderLightbox();
}

function renderLightbox() {
  document.getElementById('lightboxImg').src   = _lightboxPhotos[_lightboxIndex];
  document.getElementById('lightboxCounter').textContent =
    `${_lightboxIndex + 1} / ${_lightboxPhotos.length}`;

  const arrows = document.querySelectorAll('.lb-arrow');
  arrows.forEach(a => a.style.display = _lightboxPhotos.length > 1 ? '' : 'none');
}

/* ============================================================
   ENTRY DETAIL VIEW MODAL
   ============================================================ */

let _viewPhotos = [];

async function openViewModal(entryId) {
  const entry = allEntries.find(e => e.id === entryId);
  if (!entry) return;

  const [y, m, d] = (entry.date || '---').split('-');
  const dateStr   = L.formatDate(y, m, d);

  _viewPhotos = (entry.photos || []).map(p => getPhotoDisplayUrl(p));

  const modal = document.getElementById('viewModal');

  modal.querySelector('.view-date').textContent     = dateStr;
  modal.querySelector('.view-cat').textContent      = entry.category || '';
  modal.querySelector('.view-cat').style.display    = entry.category ? '' : 'none';
  modal.querySelector('.view-title').textContent    = entry.description || '';

  const linkBlock = modal.querySelector('.view-issue-link-block');
  if (entry.fromIssueId && (entry.issueFoundDate || entry.issueResolvedDate)) {
    linkBlock.classList.remove('hidden');
    const bits = [];
    if (entry.issueFoundDate) {
      const [fy, fm, fd] = entry.issueFoundDate.split('-');
      bits.push(L.view_issue_found_line(L.formatDate(fy, fm, fd)));
    }
    if (entry.issueResolvedDate) {
      const [ry, rm, rd] = entry.issueResolvedDate.split('-');
      bits.push(L.view_issue_resolved_line(L.formatDate(ry, rm, rd)));
    }
    linkBlock.querySelector('.view-issue-dates').textContent = bits.join(' · ');
    const btn = linkBlock.querySelector('.view-issue-more-btn');
    try {
      const issues = await dbGetAllIssues();
      const iss = issues.find(i => i.id === entry.fromIssueId);
      if (iss) {
        btn.style.display = '';
        btn.textContent = L.view_issue_more;
        btn.onclick = () => goToIssueFromJournal(entry.fromIssueId);
      } else {
        btn.style.display = 'none';
      }
    } catch (_) {
      btn.style.display = 'none';
    }
  } else {
    linkBlock.classList.add('hidden');
  }

  const planLinkBlock = modal.querySelector('.view-plan-link-block');
  if (entry.fromPlanId && (entry.planPlannedDate || entry.planDoneDate)) {
    planLinkBlock.classList.remove('hidden');
    const pbits = [];
    if (entry.planPlannedDate) {
      const [py, pm, pd] = entry.planPlannedDate.split('-');
      pbits.push(L.view_plan_planned_line(L.formatDate(py, pm, pd)));
    }
    if (entry.planDoneDate) {
      const [dy, dm, dd] = entry.planDoneDate.split('-');
      pbits.push(L.view_plan_done_line(L.formatDate(dy, dm, dd)));
    }
    planLinkBlock.querySelector('.view-plan-dates').textContent = pbits.join(' · ');
    const pbtn = planLinkBlock.querySelector('.view-plan-more-btn');
    try {
      const plans = await dbGetAllPlans();
      const pl = plans.find(p => p.id === entry.fromPlanId);
      if (pl) {
        pbtn.style.display = '';
        pbtn.textContent = L.view_plan_more;
        pbtn.onclick = () => goToPlanFromJournal(entry.fromPlanId);
      } else {
        pbtn.style.display = 'none';
      }
    } catch (_) {
      pbtn.style.display = 'none';
    }
  } else {
    planLinkBlock.classList.add('hidden');
  }

  const actBlock = modal.querySelector('.view-actions-block');
  if (entry.actions) {
    actBlock.style.display = '';
    modal.querySelector('.view-actions-text').textContent = entry.actions;
  } else {
    actBlock.style.display = 'none';
  }

  const partsBlock = modal.querySelector('.view-parts-block');
  const partsHtml  = modal.querySelector('.view-parts-list');
  const hasParts   = entry.parts && entry.parts.some(p => p.name);
  if (hasParts) {
    partsBlock.style.display = '';
    partsHtml.innerHTML = entry.parts.filter(p => p.name).map(p =>
      `<span class="part-chip">${esc(p.name)}${p.qty
        ? `<span class="qty">× ${esc(p.qty)}</span>` : ''}</span>`
    ).join('');
  } else {
    partsBlock.style.display = 'none';
  }

  const photoBlock = modal.querySelector('.view-photos-block');
  const photoGrid  = modal.querySelector('.view-photo-grid');
  if (_viewPhotos.length > 0) {
    photoBlock.style.display = '';
    photoGrid.innerHTML = _viewPhotos.map((url, idx) =>
      `<div class="photo-thumb view-thumb">
         <img src="${esc(url)}" alt="" loading="lazy"
              onclick="openLightbox(${idx}, 'view')">
       </div>`
    ).join('');
  } else {
    photoBlock.style.display = 'none';
  }

  modal.querySelector('.view-edit-btn').setAttribute('onclick', `closeViewModal(); editEntry(${entry.id})`);

  modal.classList.add('open');
}

function closeViewModal() {
  document.getElementById('viewModal').classList.remove('open');
  _viewPhotos = [];
}
