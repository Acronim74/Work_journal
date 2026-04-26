/* ============================================================
   app.js — main application logic
   ============================================================ */

const PAGES = ['journal', 'categories', 'reports', 'issues', 'plans', 'tasks',
  'inventory', 'inventory-templates', 'dictionaries', 'archive', 'settings'];
/** Относительный путь к файлу обмена (Electron): см. main.js EXCHANGE_DIR / EXCHANGE_FILENAME */
const EXCHANGE_FILE_REL = 'journal-exchange/work-journal-backup.json';

let currentPage    = 'journal';
let editingEntryId = null;
let allEntries     = [];
let allCategories  = [];

function sortCategoriesByName(categories) {
  return [...(categories || [])].sort((a, b) =>
    String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  );
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  initTheme();
  i18nInit();
  await initDB();

  await tryLoadSharedDbFromServer();
  setupSharedDbUnloadSave();

  applyI18n();
  renderLangPicker();
  updateHeaderDate();
  setTodayDate();

  await refresh();
  updateElectronDbInfo();
}

async function refresh() {
  allEntries    = await dbAll('entries');
  allCategories = sortCategoriesByName(await dbAll('categories'));
  if (typeof ensureInventoryDictionaries === 'function') await ensureInventoryDictionaries();
  updateStats();
  renderJournal();
  renderCatGrid();
  populateCatSelects();
  populateReportCatSelect();
  await reconcileTasksWithSources();
  if (currentPage === 'tasks') await renderTasks();
  if (currentPage === 'inventory' && typeof renderInventoryPage === 'function') await renderInventoryPage();
  if (currentPage === 'inventory-templates' && typeof renderInventoryTemplatesPage === 'function') await renderInventoryTemplatesPage();
  if (currentPage === 'dictionaries' && typeof renderDictionariesPage === 'function') await renderDictionariesPage();
}

function updateHeaderDate() {
  const el = document.getElementById('headerDate');
  if (el) el.textContent = L.headerDate(new Date());
}

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  const fDate = document.getElementById('fDate');
  if (fDate && !fDate.value) fDate.value = today;
}

function updateStats() {
  document.getElementById('statTotal').textContent = allEntries.length;
  const now   = new Date();
  const month = allEntries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  document.getElementById('statMonth').textContent = month;
  document.getElementById('statCats').textContent  = allCategories.length;

  // Issues & Plans counters (async, non-blocking)
  dbGetAllIssues().then(items => {
    const open = items.filter(i => i.status !== 'resolved').length;
    document.getElementById('statIssues').textContent = open;
  });
  dbGetAllPlans().then(items => {
    const pending = items.filter(i => i.status !== 'done').length;
    document.getElementById('statPlans').textContent = pending;
  });

  scheduleSharedDbSave();
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function showPage(page) {
  const prevPage = currentPage;
  PAGES.forEach(p => {
    const pageEl = document.getElementById('page-' + p);
    const navEl  = document.getElementById('nav-'  + p);
    if (pageEl) pageEl.classList.toggle('hidden', p !== page);
    if (navEl)  navEl.classList.toggle('active',  p === page);
  });
  currentPage = page;

  // Close all open modals on any navigation
  cancelEntryModal(); closeCatModal(); closeViewModal();
  cancelIssueModal(); cancelResolveIssueModal(); closePlanModal(); cancelResolvePlanModal();
  closeTaskCreateModal(); closeTaskAppendModal(); cancelTaskCompleteModal();
  if (typeof dismissInventoryModals === 'function') dismissInventoryModals(null);

  // Auto-fill "this month" when opening reports for the first time
  if (page === 'reports') {
    const rFrom = document.getElementById('rDateFrom');
    if (!rFrom.value) {
      applyPreset('month');
    } else {
      renderReportPreview();
    }
  }
  if (page === 'archive') {
    renderSnapshotList();
  }
  if (page === 'issues') {
    populateCategorySelect('issueFilterCat', true);
    populateCategorySelect('iCat', false);
    renderIssues();
  }
  if (page === 'plans') {
    populateCategorySelect('planFilterCat', true);
    populateCategorySelect('pCat', false);
    renderPlans();
  }
  if (page === 'tasks') {
    renderTasks();
  }
  if (page === 'inventory' && typeof renderInventoryPage === 'function') {
    renderInventoryPage();
  }
  if (page === 'inventory-templates' && typeof renderInventoryTemplatesPage === 'function') {
    renderInventoryTemplatesPage();
  }
  if (page === 'dictionaries' && typeof renderDictionariesPage === 'function') {
    renderDictionariesPage();
  }
  if (page === 'settings') {
    updateElectronDbInfo();
  }
}

/* ============================================================
   JOURNAL
   ============================================================ */
function renderJournal() {
  const search    = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('filterCat')?.value    || '';
  const dateFrom  = document.getElementById('filterDateFrom')?.value || '';
  const dateTo    = document.getElementById('filterDateTo')?.value   || '';

  let filtered = [...allEntries];
  if (search)    filtered = filtered.filter(e =>
    (e.description || '').toLowerCase().includes(search) ||
    (e.actions     || '').toLowerCase().includes(search) ||
    (e.category    || '').toLowerCase().includes(search)
  );
  if (catFilter) filtered = filtered.filter(e => e.category === catFilter);
  if (dateFrom)  filtered = filtered.filter(e => e.date >= dateFrom);
  if (dateTo)    filtered = filtered.filter(e => e.date <= dateTo);

  filtered.sort((a, b) => b.date.localeCompare(a.date));

  const container = document.getElementById('journalList');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div class="empty-state-title">${esc(L.empty_journal_title)}</div>
        <div class="empty-state-text">${esc(L.empty_journal_text)}</div>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(e => buildEntryCard(e, search)).join('');
}

function buildEntryCard(e, search) {
  const desc    = search ? highlight(e.description || '', search) : esc(e.description || '');
  const actions = search ? highlight(e.actions     || '', search) : esc(e.actions     || '');
  const [y, m, d] = (e.date || '--').split('-');
  const dateStr   = L.formatDate(y, m, d);

  let issueMetaHtml = '';
  if (e.fromIssueId && (e.issueFoundDate || e.issueResolvedDate)) {
    const [fy, fm, fd] = (e.issueFoundDate || '--').split('-');
    const [ry, rm, rd] = (e.issueResolvedDate || '--').split('-');
    const bits = [];
    if (e.issueFoundDate) bits.push(esc(L.card_issue_found(L.formatDate(fy, fm, fd))));
    if (e.issueResolvedDate) bits.push(esc(L.card_issue_resolved(L.formatDate(ry, rm, rd))));
    issueMetaHtml = `<div class="card-issue-meta">${bits.join(' · ')}</div>`;
  }

  let planMetaHtml = '';
  if (e.fromPlanId && (e.planPlannedDate || e.planDoneDate)) {
    const [py, pm, pd] = (e.planPlannedDate || '--').split('-');
    const [dy, dm, dd] = (e.planDoneDate || '--').split('-');
    const pbits = [];
    if (e.planPlannedDate) pbits.push(esc(L.card_plan_planned_line(L.formatDate(py, pm, pd))));
    if (e.planDoneDate) pbits.push(esc(L.card_plan_done_line(L.formatDate(dy, dm, dd))));
    planMetaHtml = `<div class="card-issue-meta">${pbits.join(' · ')}</div>`;
  }

  const partsHtml = (e.parts && e.parts.some(p => p.name))
    ? `<div class="card-section">
         <div class="card-section-label">${esc(L.card_parts)}</div>
         <div class="parts-chips">
           ${e.parts.filter(p => p.name).map(p =>
             `<span class="part-chip">${esc(p.name)}${p.qty
               ? `<span class="qty">× ${esc(p.qty)}</span>` : ''}</span>`
           ).join('')}
         </div>
       </div>` : '';

  const actionsHtml = e.actions
    ? `<div class="card-section">
         <div class="card-section-label">${esc(L.card_actions)}</div>
         <div class="card-section-content">${actions}</div>
       </div>` : '';

  // Photo strip (show up to 5 thumbnails + count)
  const photos    = e.photos || [];
  const showCount = Math.min(photos.length, 5);
  const moreCount = photos.length - showCount;
  const photoStrip = photos.length > 0
    ? `<div class="card-photo-strip">
        ${photos.slice(0, showCount).map(p =>
          `<div class="card-photo-mini"><img src="${esc(getPhotoDisplayUrl(p))}" alt="" loading="lazy"></div>`
        ).join('')}
        ${moreCount > 0 ? `<div class="card-photo-more">+${moreCount}</div>` : ''}
       </div>` : '';

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-meta">
          <span class="badge badge-date">📅 ${dateStr}</span>
          ${e.category ? `<span class="badge badge-cat">${esc(e.category)}</span>` : ''}
          ${e.fromIssueId ? `<span class="badge badge-cat badge-from-issue" title="${esc(L.badge_from_issue_tip)}">${esc(L.badge_from_issue)}</span>` : ''}
          ${e.fromPlanId ? `<span class="badge badge-cat badge-from-issue" title="${esc(L.badge_from_plan_tip)}">${esc(L.badge_from_plan)}</span>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" onclick="openViewModal(${e.id})"
                  data-i18n="btn_view">${esc(L.btn_view)}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="${esc(L.btn_edit)}"
                  onclick="editEntry(${e.id})">✎</button>
          <button class="btn btn-danger btn-sm btn-icon" title="${esc(L.btn_delete)}"
                  onclick="deleteEntry(${e.id})">🗑</button>
        </div>
      </div>
      <div class="card-title">${desc}</div>
      ${issueMetaHtml}
      ${planMetaHtml}
      ${actionsHtml}
      ${partsHtml}
      ${photoStrip}
    </div>`;
}

function clearFilters() {
  document.getElementById('searchInput').value    = '';
  document.getElementById('filterCat').value      = '';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value   = '';
  renderJournal();
}

/* ============================================================
   ENTRY MODAL
   ============================================================ */
function openEntryModal(entry = null) {
  editingEntryId = entry ? entry.id : null;
  document.getElementById('modalTitle').textContent =
    entry ? L.modal_editEntry : L.modal_newEntry;
  document.getElementById('fDate').value    = entry ? entry.date        : new Date().toISOString().split('T')[0];
  document.getElementById('fCat').value     = entry ? (entry.category   || '') : '';
  document.getElementById('fDesc').value    = entry ? (entry.description || '') : '';
  document.getElementById('fActions').value = entry ? (entry.actions    || '') : '';

  const pl = document.getElementById('partsList');
  pl.innerHTML = '';
  const parts = (entry && entry.parts && entry.parts.length) ? entry.parts : [];
  parts.forEach(p => addPartRow(p.name, p.qty));

  initPhotoPicker(entry ? (entry.photos || []) : [], 'journal', 'photoPickerGrid', 'photoCounter');

  document.getElementById('entryModal').classList.add('open');
  setTimeout(() => document.getElementById('fDesc').focus(), 200);
}

function closeEntryModal() {
  document.getElementById('entryModal').classList.remove('open');
  editingEntryId = null;
}

// Called from Cancel — откат только если открыто окно записи (не трогаем черновик поломки)
async function cancelEntryModal() {
  if (document.getElementById('entryModal').classList.contains('open')) {
    await rollbackPhotos();
  }
  closeEntryModal();
}

async function editEntry(id) {
  const entry = allEntries.find(e => e.id === id);
  if (entry) openEntryModal(entry);
}

async function deleteEntry(id) {
  if (!confirm(L.confirm_deleteEntry)) return;
  const entry = allEntries.find(e => e.id === id);
  if (entry && entry.fromIssueId) {
    const iss = await dbGet('issues', entry.fromIssueId);
    if (iss && iss.resolutionEntryId === id) {
      const cleared = { ...iss, status: 'open', updatedAt: new Date().toISOString() };
      delete cleared.resolutionEntryId;
      delete cleared.resolvedAt;
      delete cleared.resolutionActions;
      delete cleared.resolutionParts;
      delete cleared.resolutionPhotos;
      await dbPutIssue(cleared);
    }
  }
  if (entry && entry.fromPlanId) {
    const pl = await dbGet('plans', entry.fromPlanId);
    if (pl && pl.completionEntryId === id) {
      const cleared = { ...pl, status: 'planned', updatedAt: new Date().toISOString() };
      delete cleared.completionEntryId;
      delete cleared.finishedAt;
      delete cleared.completionActions;
      delete cleared.completionParts;
      delete cleared.completionPhotos;
      await dbPutPlan(cleared);
    }
  }
  if (entry && entry.photos && entry.photos.length) {
    for (const p of entry.photos) {
      let fname = p.filename;
      if (!fname && p.url) {
        const i = p.url.indexOf('photos/');
        if (i >= 0) fname = p.url.slice(i + 'photos/'.length);
      }
      if (fname) await deletePhotoFile(fname);
    }
  }
  await dbDelete('entries', id);
  toast(L.toast_entryDeleted, 'success');
  await refresh();
}

async function saveEntry() {
  const date        = document.getElementById('fDate').value;
  const category    = document.getElementById('fCat').value;
  const description = document.getElementById('fDesc').value.trim();
  const actions     = document.getElementById('fActions').value.trim();

  if (!date)        { toast(L.val_date, 'error'); return; }
  if (!description) { toast(L.val_desc, 'error'); return; }

  const parts = [];
  document.querySelectorAll('#partsList .part-item').forEach(row => {
    const name = row.querySelector('.part-name').value.trim();
    const qty  = row.querySelector('.part-qty').value.trim();
    if (name) parts.push({ name, qty });
  });

  const photos = await commitPhotos();
  const entry  = { date, category, description, actions, parts, photos };
  if (editingEntryId) {
    const prev = allEntries.find(e => e.id === editingEntryId);
    entry.id = editingEntryId;
    if (prev) {
      if (prev.fromIssueId) entry.fromIssueId = prev.fromIssueId;
      if (prev.issueFoundDate) entry.issueFoundDate = prev.issueFoundDate;
      if (prev.issueResolvedDate) entry.issueResolvedDate = prev.issueResolvedDate;
      if (prev.fromPlanId) entry.fromPlanId = prev.fromPlanId;
      if (prev.planPlannedDate) entry.planPlannedDate = prev.planPlannedDate;
      if (prev.planDoneDate) entry.planDoneDate = prev.planDoneDate;
    }
    await dbPut('entries', entry);
    toast(L.toast_entryUpdated, 'success');
  } else {
    await dbAdd('entries', entry);
    toast(L.toast_entrySaved, 'success');
  }
  closeEntryModal();
  await refresh();
}

/* ============================================================
   PARTS
   ============================================================ */
function addPartRow(name = '', qty = '') {
  const row = document.createElement('div');
  row.className = 'part-item';
  row.innerHTML = `
    <input type="text" class="form-input part-name"
           placeholder="${esc(L.field_partName)}" value="${esc(name)}">
    <input type="text" class="form-input part-qty"
           placeholder="${esc(L.field_partQty)}"  value="${esc(qty)}">
    <button class="btn btn-danger btn-icon btn-sm"
            onclick="this.closest('.part-item').remove()">✕</button>`;
  document.getElementById('partsList').appendChild(row);
  if (!name) row.querySelector('.part-name').focus();
}

function addResolvePartRow(name = '', qty = '') {
  const row = document.createElement('div');
  row.className = 'resolve-part-item';
  row.innerHTML = `
    <input type="text" class="form-input part-name"
           placeholder="${esc(L.field_partName)}" value="${esc(name)}">
    <input type="text" class="form-input part-qty"
           placeholder="${esc(L.field_partQty)}"  value="${esc(qty)}">
    <button class="btn btn-danger btn-icon btn-sm"
            onclick="this.closest('.resolve-part-item').remove()">✕</button>`;
  document.getElementById('resolvePartsList').appendChild(row);
  if (!name) row.querySelector('.part-name').focus();
}

/* ============================================================
   CATEGORIES
   ============================================================ */
function renderCatGrid() {
  const grid = document.getElementById('catGrid');
  if (allCategories.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🏷</div>
        <div class="empty-state-title">${esc(L.empty_cats_title)}</div>
        <div class="empty-state-text">${esc(L.empty_cats_text)}</div>
      </div>`;
    return;
  }
  grid.innerHTML = allCategories.map(c => {
    const count = allEntries.filter(e => e.category === c.name).length;
    return `
      <div class="cat-card">
        <span class="cat-name" title="${esc(c.name)}">${esc(c.name)}</span>
        <span class="cat-count">${L.catRecords(count)}</span>
        <button class="btn btn-danger btn-icon btn-sm"
                onclick="deleteCat(${c.id}, '${esc(c.name)}')"
                title="${esc(L.btn_delete)}">✕</button>
      </div>`;
  }).join('');
}

function populateCatSelects() {
  const opts = allCategories.map(c =>
    `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');

  const filterCat = document.getElementById('filterCat');
  if (filterCat)
    filterCat.innerHTML = `<option value="">${esc(L.filter_allCats)}</option>` + opts;

  const fCat = document.getElementById('fCat');
  if (fCat)
    fCat.innerHTML = `<option value="">${esc(L.field_catPlaceholder)}</option>` + opts;
}

// Universal helper: populate any <select> with categories
// withAll=true → adds "all categories" option first
// selected → pre-select this value
function populateCategorySelect(elementId, withAll, selected = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const opts = allCategories.map(c =>
    `<option value="${esc(c.name)}" ${c.name === selected ? 'selected' : ''}>${esc(c.name)}</option>`
  ).join('');
  const placeholder = withAll
    ? `<option value="">${esc(L.filter_allCats || 'Все категории')}</option>`
    : `<option value="">${esc(L.field_catPlaceholder || '— категория —')}</option>`;
  el.innerHTML = placeholder + opts;
  if (selected) el.value = selected;
}

function openCatModal() {
  document.getElementById('fCatName').value = '';
  document.getElementById('catModal').classList.add('open');
  setTimeout(() => document.getElementById('fCatName').focus(), 200);
}

function closeCatModal() {
  document.getElementById('catModal').classList.remove('open');
}

async function saveCat() {
  const name = document.getElementById('fCatName').value.trim();
  if (!name) { toast(L.val_catName, 'error'); return; }
  if (allCategories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
    toast(L.toast_catExists, 'error'); return;
  }
  await dbAdd('categories', { name });
  toast(L.toast_catAdded, 'success');
  closeCatModal();
  await refresh();
}

async function deleteCat(id, name) {
  const count = allEntries.filter(e => e.category === name).length;
  if (!confirm(L.confirm_deleteCat(name, count))) return;
  await dbDelete('categories', id);
  toast(L.toast_catDeleted, 'success');
  await refresh();
}

/* ============================================================
   REPORT helpers (UI only, logic in report.js)
   ============================================================ */
function clearPresetActive() {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

/* ============================================================
   EXPORT / IMPORT  (экспорт — отдельный файл; зеркало только work-journal-db.json)
   ============================================================ */

const EXPORT_FORMAT_VERSION = 5;

async function gatherExportPayload() {
  const out = await dbReadAllForExport();
  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    entries:    out.entries,
    categories: out.categories,
    issues:     out.issues,
    plans:      out.plans,
    snapshots:  out.snapshots,
    tasks:      out.tasks,
    inventoryTemplates: out.inventoryTemplates || [],
    inventoryRecords:   out.inventoryRecords   || [],
    dictionaries:       out.dictionaries       || [],
  };
}

/**
 * Полная замена локальной БД из объекта экспорта (v1: только entries/categories).
 * @param {{ skipSnapshot?: boolean }} opts — skipSnapshot: не делать авто-снимок (загрузка с сервера)
 */
async function applyImportedPayload(data, opts = {}) {
  const skipSnapshot = opts.skipSnapshot === true;
  if (!data || !Array.isArray(data.entries) || !Array.isArray(data.categories)) return false;

  if (!skipSnapshot) await createSnapshot(SNAP_REASON.import);

  await dbClear('entries');
  await dbClear('categories');
  await dbClear('issues');
  await dbClear('plans');
  await dbClear('snapshots');
  await dbClear('tasks');
  await dbClear('inventoryTemplates');
  await dbClear('inventoryRecords');
  await dbClear('dictionaries');

  for (const e of data.entries) await dbAdd('entries', e);
  for (const c of data.categories) await dbAdd('categories', c);

  const issues = Array.isArray(data.issues) ? data.issues : [];
  const plans = Array.isArray(data.plans) ? data.plans : [];
  const snapshots = Array.isArray(data.snapshots) ? data.snapshots : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const invTpls = Array.isArray(data.inventoryTemplates) ? data.inventoryTemplates : [];
  const invRecs = Array.isArray(data.inventoryRecords)   ? data.inventoryRecords   : [];
  const invDicts = Array.isArray(data.dictionaries)      ? data.dictionaries       : [];
  for (const i of issues) await dbAdd('issues', i);
  for (const p of plans) await dbAdd('plans', p);
  for (const s of snapshots) await dbAdd('snapshots', s);
  for (const t of tasks) await dbAdd('tasks', t);
  for (const t of invTpls) await dbAdd('inventoryTemplates', t);
  for (const r of invRecs) await dbAdd('inventoryRecords',   r);
  for (const d of invDicts) await dbPut('dictionaries', d);

  await refresh();
  return true;
}

function isElectronContext() {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined';
}

function updateElectronDbInfo() {
  const row = document.getElementById('electronDbInfoRow');
  if (row) row.classList.toggle('hidden', !isElectronContext());
}

let sharedDbSaveTimer = null;
/** Очередь: только одно сохранение work-journal-db.json за раз (нет гонки чтения/записи). */
let saveFileChain = Promise.resolve();

async function saveSharedDbNow(opts = {}) {
  if (!isElectronContext()) return false;
  const p = saveFileChain.then(async () => {
    try {
      const payload = await gatherExportPayload();
      return await window.api.saveDb(JSON.stringify(payload, null, 2));
    } catch (e) {
      console.error('[saveSharedDbNow]', e);
      return false;
    }
  });
  saveFileChain = p.catch(() => {});
  return p;
}

function scheduleSharedDbSave() {
  if (!isElectronContext()) return;
  clearTimeout(sharedDbSaveTimer);
  sharedDbSaveTimer = setTimeout(() => {
    sharedDbSaveTimer = null;
    void saveSharedDbNow();
  }, 900);
}

window.scheduleSharedDbSave = scheduleSharedDbSave;

function setupSharedDbUnloadSave() {
  if (!isElectronContext()) return;
  const flush = () => { void saveSharedDbNow({ keepalive: true }); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

async function tryLoadSharedDbFromServer() {
  if (!isElectronContext()) return;
  try {
    const data = await window.api.loadDb();
    if (!data) return;
    await applyImportedPayload(data, { skipSnapshot: true });
  } catch (_) {}
}

async function exportDB() {
  if (isElectronContext()) {
    clearTimeout(sharedDbSaveTimer);
    sharedDbSaveTimer = null;
    let json;
    try {
      const payload = await gatherExportPayload();
      json = JSON.stringify(payload, null, 2);
    } catch (e) {
      console.error('[exportDB]', e);
      toast(L.toast_db_save_failed, 'error');
      return;
    }
    const res = await window.api.exportDb(json);
    if (res.ok) toast(L.toast_export_saved_exchange(EXCHANGE_FILE_REL), 'success');
    else toast(L.toast_db_save_failed, 'error');
    return;
  }
  const data = await gatherExportPayload();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `work-journal-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(L.toast_exported_download, 'success');
}

/**
 * Импорт: в Electron — из journal-exchange/work-journal-backup.json; в браузере — выбор файла.
 */
async function importDB(event) {
  if (isElectronContext()) {
    const res = await window.api.importExchange();
    if (res.missing) {
      toast(L.toast_import_exchange_missing(EXCHANGE_FILE_REL), 'error');
      return;
    }
    if (!res.ok || !res.data) {
      toast(L.toast_badFile, 'error');
      return;
    }
    const data = res.data;
    if (!data.entries || !data.categories) { toast(L.toast_noData, 'error'); return; }
    if (!confirm(L.confirm_import(data.entries.length, data.categories.length))) return;

    const ok = await applyImportedPayload(data, { skipSnapshot: false });
    if (ok) toast(L.toast_imported(data.entries.length), 'success');
    return;
  }

  const file = event && event.target && event.target.files && event.target.files[0];

  if (file) {
    let data;
    try { data = JSON.parse(await file.text()); }
    catch { toast(L.toast_badFile, 'error'); event.target.value = ''; return; }

    if (!data.entries || !data.categories) { toast(L.toast_noData, 'error'); event.target.value = ''; return; }
    if (!confirm(L.confirm_import(data.entries.length, data.categories.length))) {
      event.target.value = '';
      return;
    }

    const ok = await applyImportedPayload(data, { skipSnapshot: false });
    event.target.value = '';
    if (ok) toast(L.toast_imported(data.entries.length), 'success');
    return;
  }

  const input = document.getElementById('importFile');
  if (input) input.click();
}

async function clearAllData() {
  if (!confirm(L.confirm_clearAll)) return;
  await createSnapshot(SNAP_REASON.clear);
  await dbClear('entries');
  await dbClear('categories');
  await dbClear('issues');
  await dbClear('plans');
  await dbClear('tasks');
  await dbClear('inventoryTemplates');
  await dbClear('inventoryRecords');
  await dbClear('dictionaries');
  await dbClear('snapshots');
  await refresh();
  toast(L.toast_cleared, 'success');
}

/* ============================================================
   UTILITIES
   ============================================================ */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function highlight(text, query) {
  if (!query) return esc(text);
  return esc(text).replace(new RegExp('(' + escRe(query) + ')', 'gi'),
    '<span class="hl">$1</span>');
}

/* ============================================================
   TASKS  (очередь: план / поломка → журнал — одна запись, без двойного закрытия)
   ============================================================ */
const TASK_ST = { ACTIVE: 'active', RETURNED: 'returned', COMPLETED: 'completed' };
const TASK_REASON = { TASK: 'task', SOURCE: 'source' };

function taskIsOpenStatus(st) {
  return st === TASK_ST.ACTIVE || st === TASK_ST.RETURNED;
}

/** Только активная задача блокирует повторное «В задачи» на карточке плана/поломки (возвращённая — нет). */
function taskIsActiveStatus(st) {
  return st === TASK_ST.ACTIVE;
}

function taskEscHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function dbFindOpenTaskForSource(sourceType, sourceId) {
  const all = await dbGetAllTasks();
  return all.find(t => t && t.sourceType === sourceType && t.sourceId === sourceId && taskIsActiveStatus(t.status)) || null;
}

async function deleteTasksForSource(sourceType, sourceId) {
  const all = await dbGetAllTasks();
  const toDelete = all.filter(t => t && t.sourceType === sourceType && t.sourceId === sourceId);
  for (const t of toDelete) await dbDeleteTask(t.id);
}

async function markOpenTasksCompletedForSource(sourceType, sourceId, { journalEntryId, completedReason }) {
  const all = await dbGetAllTasks();
  const now = new Date().toISOString();
  for (const t of all) {
    if (!t || t.sourceType !== sourceType || t.sourceId !== sourceId) continue;
    if (!taskIsOpenStatus(t.status)) continue;
    await dbPutTask({
      ...t,
      status: TASK_ST.COMPLETED,
      completedAt: now,
      completedReason,
      journalEntryId: journalEntryId || t.journalEntryId || null,
      updatedAt: now,
    });
  }
}

async function reopenTasksCompletedBySource(sourceType, sourceId) {
  const all = await dbGetAllTasks();
  const now = new Date().toISOString();
  for (const t of all) {
    if (!t || t.sourceType !== sourceType || t.sourceId !== sourceId) continue;
    if (t.status !== TASK_ST.COMPLETED) continue;
    if (t.completedReason !== TASK_REASON.SOURCE) continue;
    await dbPutTask({
      ...t,
      status: TASK_ST.ACTIVE,
      completedAt: null,
      completedReason: null,
      journalEntryId: null,
      updatedAt: now,
    });
  }
}

async function reconcileTasksWithSources() {
  const [issues, plans, tasks] = await Promise.all([
    dbGetAllIssues(),
    dbGetAllPlans(),
    dbGetAllTasks(),
  ]);
  const issueById = new Map(issues.map(i => [i.id, i]));
  const planById  = new Map(plans.map(p => [p.id, p]));

  for (const t of tasks) {
    if (!t || !taskIsOpenStatus(t.status)) continue;
    if (t.sourceType === 'issue') {
      const iss = issueById.get(t.sourceId);
      if (!iss) continue;
      if (iss.status === 'resolved' && iss.resolutionEntryId) {
        await markOpenTasksCompletedForSource('issue', iss.id, {
          journalEntryId: iss.resolutionEntryId,
          completedReason: TASK_REASON.SOURCE,
        });
      }
    } else if (t.sourceType === 'plan') {
      const pl = planById.get(t.sourceId);
      if (!pl) continue;
      if (pl.status === 'done' && pl.completionEntryId) {
        await markOpenTasksCompletedForSource('plan', pl.id, {
          journalEntryId: pl.completionEntryId,
          completedReason: TASK_REASON.SOURCE,
        });
      }
    }
  }
}

function taskSnapshotFromIssue(issue) {
  return {
    title: issue?.desc || '',
    category: issue?.category || '',
    detail: String(issue?.notes || '').trim(),
  };
}

function taskSnapshotFromPlan(plan) {
  return {
    title: plan?.desc || '',
    category: plan?.category || '',
    detail: String(plan?.actions || '').trim(),
  };
}

function taskSourceDetailLabel(task) {
  if (!task) return '';
  return task.sourceType === 'plan' ? L.field_planActions : L.field_issueNotes;
}

function taskCreateSourceLabelHtml(snap, badgeText) {
  const header = `${badgeText}: ${snap.title || '—'}${snap.category ? ` · ${snap.category}` : ''}`;
  const detail = snap.detail || '';
  return `<div>${esc(header)}</div>${detail
    ? `<div class="muted" style="white-space:pre-wrap;margin-top:8px;font-size:12px;line-height:1.45">${esc(detail)}</div>`
    : ''}`;
}

/** Одна строка дополнения в плане/поломке (как в журнале дат). */
function formatTaskAppendLineForSource(atIso, text) {
  const day = String(atIso || '').split('T')[0];
  const [y, m, d] = day.split('-');
  const dateHuman = (y && m && d) ? L.formatDate(y, m, d) : String(atIso || '').slice(0, 10);
  const body = String(text || '').trim();
  if (!body) return '';
  return `[${dateHuman}] ${body}`;
}

async function appendTaskNoteToPlanOrIssue(sourceType, sourceId, atIso, text) {
  const line = formatTaskAppendLineForSource(atIso, text);
  if (!line) return;
  const ts = new Date().toISOString();
  if (sourceType === 'plan') {
    const plan = await dbGet('plans', sourceId);
    if (!plan || plan.status === 'done') return;
    const base = String(plan.actions || '').trimEnd();
    const next = base ? `${base}\n\n${line}` : line;
    await dbPutPlan({ ...plan, actions: next, updatedAt: ts });
  } else if (sourceType === 'issue') {
    const issue = await dbGet('issues', sourceId);
    if (!issue || issue.status === 'resolved') return;
    const base = String(issue.notes || '').trimEnd();
    const next = base ? `${base}\n\n${line}` : line;
    await dbPutIssue({ ...issue, notes: next, updatedAt: ts });
  }
}

/** Все дополнения из appendLog — в план/поломку (без повторов той же строки). */
async function flushTaskAppendLogToPlanOrIssue(task) {
  if (!task || !task.sourceId) return;
  const logs = Array.isArray(task.appendLog)
    ? task.appendLog.filter(x => x && String(x.text || '').trim())
    : [];
  if (!logs.length) return;
  const ts = new Date().toISOString();
  if (task.sourceType === 'plan') {
    const plan = await dbGet('plans', task.sourceId);
    if (!plan || plan.status === 'done') return;
    let body = String(plan.actions || '').trimEnd();
    for (const entry of logs) {
      const line = formatTaskAppendLineForSource(entry.at, entry.text);
      if (!line || body.includes(line)) continue;
      body = body ? `${body}\n\n${line}` : line;
    }
    const prev = String(plan.actions || '').trimEnd();
    if (body !== prev) await dbPutPlan({ ...plan, actions: body, updatedAt: ts });
  } else if (task.sourceType === 'issue') {
    const issue = await dbGet('issues', task.sourceId);
    if (!issue || issue.status === 'resolved') return;
    let body = String(issue.notes || '').trimEnd();
    for (const entry of logs) {
      const line = formatTaskAppendLineForSource(entry.at, entry.text);
      if (!line || body.includes(line)) continue;
      body = body ? `${body}\n\n${line}` : line;
    }
    const prev = String(issue.notes || '').trimEnd();
    if (body !== prev) await dbPutIssue({ ...issue, notes: body, updatedAt: ts });
  }
}

let taskCreateDraft = null; // { sourceType, sourceId }
let appendingTaskId = null;
let completingTaskId = null;

function closeTaskCreateModal() {
  document.getElementById('taskCreateModal')?.classList.remove('open');
  taskCreateDraft = null;
}

async function openTaskCreateFromIssue(issueId) {
  const existing = await dbFindOpenTaskForSource('issue', issueId);
  if (existing) { toast(L.tasks_err_active_exists, 'error'); return; }

  const issues = await dbGetAllIssues();
  const issue = issues.find(i => i.id === issueId);
  if (!issue) { toast(L.tasks_err_missing_source, 'error'); return; }
  if (issue.status === 'resolved') { toast(L.tasks_err_source_closed, 'error'); return; }

  taskCreateDraft = { sourceType: 'issue', sourceId: issueId };
  const snap = taskSnapshotFromIssue(issue);
  const el = document.getElementById('taskCreateSourceLabel');
  if (el) el.innerHTML = taskCreateSourceLabelHtml(snap, L.tasks_badge_issue);
  document.getElementById('taskCreateAssignees').value = '';
  document.getElementById('taskCreateModal')?.classList.add('open');
  applyI18n();
  setTimeout(() => document.getElementById('taskCreateAssignees')?.focus(), 50);
}

async function openTaskCreateFromPlan(planId) {
  const existing = await dbFindOpenTaskForSource('plan', planId);
  if (existing) { toast(L.tasks_err_active_exists, 'error'); return; }

  const plans = await dbGetAllPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) { toast(L.tasks_err_missing_source, 'error'); return; }
  if (plan.status === 'done') { toast(L.tasks_err_source_closed, 'error'); return; }

  taskCreateDraft = { sourceType: 'plan', sourceId: planId };
  const snap = taskSnapshotFromPlan(plan);
  const el = document.getElementById('taskCreateSourceLabel');
  if (el) el.innerHTML = taskCreateSourceLabelHtml(snap, L.tasks_badge_plan);
  document.getElementById('taskCreateAssignees').value = '';
  document.getElementById('taskCreateModal')?.classList.add('open');
  applyI18n();
  setTimeout(() => document.getElementById('taskCreateAssignees')?.focus(), 50);
}

async function saveTaskCreateModal() {
  if (!taskCreateDraft) { closeTaskCreateModal(); return; }
  const assigneesText = document.getElementById('taskCreateAssignees')?.value.trim() || '';

  const { sourceType, sourceId } = taskCreateDraft;
  const existing = await dbFindOpenTaskForSource(sourceType, sourceId);
  if (existing) { toast(L.tasks_err_active_exists, 'error'); closeTaskCreateModal(); return; }

  let snap = { title: '', category: '', detail: '' };
  if (sourceType === 'issue') {
    const issues = await dbGetAllIssues();
    const issue = issues.find(i => i.id === sourceId);
    if (!issue) { toast(L.tasks_err_missing_source, 'error'); closeTaskCreateModal(); return; }
    if (issue.status === 'resolved') { toast(L.tasks_err_source_closed, 'error'); closeTaskCreateModal(); return; }
    snap = taskSnapshotFromIssue(issue);
  } else {
    const plans = await dbGetAllPlans();
    const plan = plans.find(p => p.id === sourceId);
    if (!plan) { toast(L.tasks_err_missing_source, 'error'); closeTaskCreateModal(); return; }
    if (plan.status === 'done') { toast(L.tasks_err_source_closed, 'error'); closeTaskCreateModal(); return; }
    snap = taskSnapshotFromPlan(plan);
  }

  const now = new Date().toISOString();
  await dbAddTask({
    sourceType,
    sourceId,
    status: TASK_ST.ACTIVE,
    assigneesText,
    sourceTitle: snap.title,
    sourceCategory: snap.category,
    sourceDetail: snap.detail || '',
    appendLog: [],
    createdAt: now,
    updatedAt: now,
  });

  toast(L.tasks_toast_enqueued, 'success');
  closeTaskCreateModal();
  if (currentPage === 'tasks') await renderTasks();
  if (currentPage === 'issues') await renderIssues();
  if (currentPage === 'plans') await renderPlans();
  scheduleSharedDbSave();
}

function closeTaskAppendModal() {
  document.getElementById('taskAppendModal')?.classList.remove('open');
  appendingTaskId = null;
}

async function openTaskAppendModal(taskId) {
  const t = await dbGet('tasks', taskId);
  if (!t) return;
  if (!taskIsOpenStatus(t.status)) { toast(L.tasks_err_source_closed, 'error'); return; }
  appendingTaskId = taskId;
  document.getElementById('taskAppendText').value = '';
  document.getElementById('taskAppendModal')?.classList.add('open');
  setTimeout(() => document.getElementById('taskAppendText')?.focus(), 50);
}

async function saveTaskAppendModal() {
  if (!appendingTaskId) { closeTaskAppendModal(); return; }
  const text = document.getElementById('taskAppendText')?.value.trim() || '';
  if (!text) { toast(L.tasks_val_append, 'error'); return; }

  const t = await dbGet('tasks', appendingTaskId);
  if (!t) { closeTaskAppendModal(); return; }
  if (!taskIsOpenStatus(t.status)) { toast(L.tasks_err_source_closed, 'error'); closeTaskAppendModal(); return; }

  const now = new Date().toISOString();
  const log = Array.isArray(t.appendLog) ? t.appendLog.slice() : [];
  log.push({ at: now, text });
  await dbPutTask({ ...t, appendLog: log, updatedAt: now });

  try {
    await appendTaskNoteToPlanOrIssue(t.sourceType, t.sourceId, now, text);
  } catch (e) {
    console.error(e);
    toast(L.tasks_sync_append_failed, 'error');
  }

  toast(L.tasks_append_saved, 'success');
  closeTaskAppendModal();
  await renderTasks();
  if (currentPage === 'plans') await renderPlans();
  if (currentPage === 'issues') await renderIssues();
  scheduleSharedDbSave();
}

async function markTaskReturned(taskId) {
  const t = await dbGet('tasks', taskId);
  if (!t || !taskIsOpenStatus(t.status)) return;
  const now = new Date().toISOString();
  await dbPutTask({ ...t, status: TASK_ST.RETURNED, updatedAt: now });
  const t2 = await dbGet('tasks', taskId);
  try {
    await flushTaskAppendLogToPlanOrIssue(t2);
  } catch (e) {
    console.error(e);
    toast(L.tasks_sync_append_failed, 'error');
  }
  toast(L.tasks_returned, 'success');
  await renderTasks();
  if (currentPage === 'plans') await renderPlans();
  if (currentPage === 'issues') await renderIssues();
  scheduleSharedDbSave();
}

function closeTaskCompleteModal() {
  document.getElementById('taskCompleteModal')?.classList.remove('open');
  completingTaskId = null;
}

async function cancelTaskCompleteModal() {
  if (document.getElementById('taskCompleteModal')?.classList.contains('open')) {
    await rollbackPhotos();
  }
  closeTaskCompleteModal();
}

function addTaskCompletePartRow(name = '', qty = '') {
  const list = document.getElementById('tcPartsList');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'resolve-part-item';
  row.innerHTML = `
    <input type="text" class="form-input part-name"
           placeholder="${esc(L.field_partName)}" value="${esc(name)}">
    <input type="text" class="form-input part-qty"
           placeholder="${esc(L.field_partQty)}"  value="${esc(qty)}">
    <button class="btn btn-danger btn-icon btn-sm"
            onclick="this.closest('.resolve-part-item').remove()">✕</button>`;
  list.appendChild(row);
  if (!name) row.querySelector('.part-name').focus();
}

async function openTaskCompleteModal(taskId) {
  const t = await dbGet('tasks', taskId);
  if (!t) return;
  if (!taskIsOpenStatus(t.status)) { toast(L.tasks_err_source_closed, 'error'); return; }

  completingTaskId = taskId;
  const badge = t.sourceType === 'plan' ? L.tasks_badge_plan : L.tasks_badge_issue;
  const snap = {
    title: t.sourceTitle || '',
    category: t.sourceCategory || '',
    detail: String(t.sourceDetail || '').trim(),
  };
  const ref = document.getElementById('taskCompleteRefLabel');
  if (ref) ref.innerHTML = taskCreateSourceLabelHtml(snap, badge);

  document.getElementById('tcDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('tcActions').value = '';
  document.getElementById('tcPartsList').innerHTML = '';
  initPhotoPicker([], 'journal', 'tcPhotoPickerGrid', 'tcPhotoCounter');

  document.getElementById('taskCompleteModal')?.classList.add('open');
  applyI18n();
  setTimeout(() => document.getElementById('tcActions')?.focus(), 80);
}

async function saveTaskCompleteModal() {
  if (!completingTaskId) return;

  const task = await dbGet('tasks', completingTaskId);
  if (!task || !taskIsOpenStatus(task.status)) {
    toast(L.tasks_err_source_closed, 'error');
    await cancelTaskCompleteModal();
    return;
  }

  const when = document.getElementById('tcDate')?.value || '';
  if (!when) { toast(L.val_date, 'error'); return; }

  const actions = document.getElementById('tcActions')?.value.trim() || '';
  const parts = [];
  document.querySelectorAll('#tcPartsList .resolve-part-item').forEach(row => {
    const name = row.querySelector('.part-name').value.trim();
    const qty  = row.querySelector('.part-qty').value.trim();
    if (name) parts.push({ name, qty });
  });

  const now = new Date().toISOString();

  if (task.sourceType === 'issue') {
    const issues = await dbGetAllIssues();
    const issue = issues.find(i => i.id === task.sourceId);
    if (!issue) { toast(L.tasks_err_missing_source, 'error'); await cancelTaskCompleteModal(); return; }

    if (issue.status === 'resolved' && issue.resolutionEntryId) {
      await rollbackPhotos();
      await dbPutTask({
        ...task,
        status: TASK_ST.COMPLETED,
        completedAt: now,
        completedReason: TASK_REASON.TASK,
        journalEntryId: issue.resolutionEntryId,
        updatedAt: now,
      });
      toast(L.tasks_completed_linked, 'success');
      await cancelTaskCompleteModal();
      await refresh();
      updateStats();
      if (currentPage === 'issues') await renderIssues();
      if (currentPage === 'tasks') await renderTasks();
      scheduleSharedDbSave();
      return;
    }

    const photos = await commitPhotos();

    const description = L.issue_resolve_entry_title(issue.desc || '');
    const entry = {
      date: when,
      category: issue.category || '',
      description,
      actions,
      parts,
      photos,
      fromIssueId: issue.id,
      issueFoundDate: issue.date,
      issueResolvedDate: when,
    };
    const entryId = await dbAdd('entries', entry);

    await dbPutIssue({
      ...issue,
      status: 'resolved',
      resolvedAt: when,
      resolutionActions: actions,
      resolutionParts: parts,
      resolutionPhotos: photos,
      resolutionEntryId: entryId,
      updatedAt: now,
    });

    await dbPutTask({
      ...task,
      status: TASK_ST.COMPLETED,
      completedAt: now,
      completedReason: TASK_REASON.TASK,
      journalEntryId: entryId,
      updatedAt: now,
    });

    toast(L.toast_issue_resolved_logged, 'success');
    await cancelTaskCompleteModal();
    await refresh();
    updateStats();
    if (currentPage === 'issues') await renderIssues();
    if (currentPage === 'tasks') await renderTasks();
    scheduleSharedDbSave();
    return;
  }

  // plan
  const plans = await dbGetAllPlans();
  const plan = plans.find(p => p.id === task.sourceId);
  if (!plan) { toast(L.tasks_err_missing_source, 'error'); await cancelTaskCompleteModal(); return; }

  if (plan.status === 'done' && plan.completionEntryId) {
    await rollbackPhotos();
    await dbPutTask({
      ...task,
      status: TASK_ST.COMPLETED,
      completedAt: now,
      completedReason: TASK_REASON.TASK,
      journalEntryId: plan.completionEntryId,
      updatedAt: now,
    });
    toast(L.tasks_completed_linked, 'success');
    await cancelTaskCompleteModal();
    await refresh();
    updateStats();
    if (currentPage === 'plans') await renderPlans();
    if (currentPage === 'tasks') await renderTasks();
    scheduleSharedDbSave();
    return;
  }

  const photos = await commitPhotos();

  const description = L.plan_resolve_entry_title(plan.desc || '');
  const entry = {
    date: when,
    category: plan.category || '',
    description,
    actions,
    parts,
    photos,
    fromPlanId: plan.id,
    planPlannedDate: plan.datePlanned,
    planDoneDate: when,
  };
  const entryId = await dbAdd('entries', entry);

  await dbPutPlan({
    ...plan,
    status: 'done',
    finishedAt: when,
    completionActions: actions,
    completionParts: parts,
    completionPhotos: photos,
    completionEntryId: entryId,
    updatedAt: now,
  });

  await dbPutTask({
    ...task,
    status: TASK_ST.COMPLETED,
    completedAt: now,
    completedReason: TASK_REASON.TASK,
    journalEntryId: entryId,
    updatedAt: now,
  });

  toast(L.toast_plan_done_logged, 'success');
  await cancelTaskCompleteModal();
  await refresh();
  updateStats();
  if (currentPage === 'plans') await renderPlans();
  if (currentPage === 'tasks') await renderTasks();
  scheduleSharedDbSave();
}

function clearTaskFilters() {
  const s = document.getElementById('taskSearch');
  if (s) s.value = '';
  const f = document.getElementById('taskFilterStatus');
  if (f) f.value = 'open';
  renderTasks();
}

async function renderTasks() {
  const search = (document.getElementById('taskSearch')?.value || '').toLowerCase().trim();
  const stF = document.getElementById('taskFilterStatus')?.value || 'open';

  let items = await dbGetAllTasks();

  const matchesSearch = (t) => {
    if (!search) return true;
    const hay = [
      t.sourceTitle,
      t.sourceCategory,
      t.sourceDetail,
      t.assigneesText,
      ...(Array.isArray(t.appendLog) ? t.appendLog.map(x => x && x.text) : []),
    ].map(x => String(x || '').toLowerCase()).join(' | ');
    return hay.includes(search);
  };
  items = items.filter(matchesSearch);

  if (stF === 'active') items = items.filter(t => t.status === TASK_ST.ACTIVE);
  else if (stF === 'returned') items = items.filter(t => t.status === TASK_ST.RETURNED);
  else if (stF === 'open') items = items.filter(t => taskIsOpenStatus(t.status));
  else if (stF === 'completed') items = items.filter(t => t.status === TASK_ST.COMPLETED);

  items.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));

  const container = document.getElementById('tasksList');
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🗂</div>
      <div class="empty-state-title">${esc(L.tasks_empty_title)}</div>
      <div class="empty-state-text">${esc(L.tasks_empty_text)}</div>
    </div>`;
    applyI18n();
    return;
  }

  const badge = (t) => (t.sourceType === 'plan' ? L.tasks_badge_plan : L.tasks_badge_issue);
  const stLabel = (t) => {
    if (t.status === TASK_ST.ACTIVE) return L.tasks_status_active;
    if (t.status === TASK_ST.RETURNED) return L.tasks_status_returned;
    if (t.status === TASK_ST.COMPLETED && t.completedReason === TASK_REASON.SOURCE) return L.tasks_status_completed_source;
    return L.tasks_status_completed;
  };

  container.innerHTML = items.map(t => {
    const title = highlight(esc(t.sourceTitle || '—'), search);
    const detailRaw = String(t.sourceDetail || '').trim();
    const detailHtml = detailRaw
      ? `<div class="issue-resolution-block" style="margin-top:6px">
           <div class="issue-resolution-label">${esc(taskSourceDetailLabel(t))}</div>
           <div class="card-actions-text">${highlight(esc(detailRaw), search)}</div>
         </div>`
      : '';
    const cat = t.sourceCategory ? `<span class="cat-chip">${esc(t.sourceCategory)}</span>` : '';
    const assignees = t.assigneesText
      ? `<div class="card-notes">${esc(L.tasks_assigned_prefix)} ${highlight(esc(t.assigneesText), search)}</div>`
      : '';

    const logs = Array.isArray(t.appendLog) ? t.appendLog.filter(x => x && x.text) : [];
    const logHtml = logs.length
      ? `<div class="issue-resolution-block" style="margin-top:8px">
           <div class="issue-resolution-label">${esc(L.tasks_log_title)}</div>
           ${logs.slice().reverse().map(x => {
             const [y, m, d] = String(x.at || '').split('T')[0].split('-');
             const dt = (y && m && d) ? esc(L.formatDate(y, m, d)) : esc(x.at || '');
             return `<div class="card-section-content"><span class="muted">${dt}</span> — ${highlight(esc(x.text), search)}</div>`;
           }).join('')}
         </div>`
      : '';

    const returnBtn = (t.status === TASK_ST.ACTIVE)
      ? `<button class="btn btn-ghost btn-sm" onclick="markTaskReturned(${t.id})">${esc(L.tasks_btn_return)}</button>`
      : '';

    const actions = taskIsOpenStatus(t.status)
      ? `<div class="card-actions">
          <button class="btn btn-ghost btn-sm" onclick="openTaskAppendModal(${t.id})">${esc(L.tasks_btn_append)}</button>
          ${returnBtn}
          <button class="btn btn-ghost btn-sm" onclick="openTaskCompleteModal(${t.id})">${esc(L.plan_mark_done)}</button>
          <button class="btn btn-ghost btn-sm" onclick="printTaskSheet(${t.id})">${esc(L.btn_print)}</button>
        </div>`
      : `<div class="card-actions">
          <button class="btn btn-ghost btn-sm" onclick="printTaskSheet(${t.id})">${esc(L.btn_print)}</button>
        </div>`;

    return `<div class="card">
      <div class="card-header">
        <div class="card-meta">
          <span class="cat-chip">${esc(badge(t))}</span>
          ${cat}
          <span class="status-badge status-${t.status === TASK_ST.COMPLETED ? 'resolved' : 'open'}">${esc(stLabel(t))}</span>
        </div>
        ${actions}
      </div>
      <div class="card-title">${title}</div>
      ${detailHtml}
      ${assignees}
      ${logHtml}
    </div>`;
  }).join('');

  applyI18n();
}

async function printTaskSheet(taskId) {
  const t = await dbGet('tasks', taskId);
  if (!t) return;

  const badge = t.sourceType === 'plan' ? L.tasks_badge_plan : L.tasks_badge_issue;
  const logs = Array.isArray(t.appendLog) ? t.appendLog.filter(x => x && x.text) : [];
  const logsHtml = logs.length
    ? `<div class="rp-block"><div class="rp-h3">${taskEscHtml(L.tasks_log_title)}</div>
        ${logs.map(x => {
          const [y, m, d] = String(x.at || '').split('T')[0].split('-');
          const dt = (y && m && d) ? taskEscHtml(L.formatDate(y, m, d)) : taskEscHtml(x.at || '');
          return `<div class="rp-line"><span class="rp-muted">${dt}</span> — ${taskEscHtml(x.text)}</div>`;
        }).join('')}
      </div>`
    : '';

  const assignees = t.assigneesText
    ? `<div class="rp-line"><b>${taskEscHtml(L.tasks_assigned_prefix)}</b> ${taskEscHtml(t.assigneesText)}</div>`
    : '';

  const detailRaw = String(t.sourceDetail || '').trim();
  const detailBlock = detailRaw
    ? `<div class="rp-block">
         <div class="rp-h3">${taskEscHtml(taskSourceDetailLabel(t))}</div>
         <div class="rp-line" style="white-space:pre-wrap">${taskEscHtml(detailRaw)}</div>
       </div>`
    : '';

  const body = `
    <div class="rp-title">${taskEscHtml(L.tasks_print_title)}</div>
    <div class="rp-meta">${taskEscHtml(badge)} · ${taskEscHtml(t.sourceCategory || L.report_no_category)}</div>
    <div class="rp-block">
      <div class="rp-h3">${taskEscHtml(L.tasks_field_source)}</div>
      <div class="rp-line"><b>${taskEscHtml(t.sourceTitle || '—')}</b></div>
      ${assignees}
    </div>
    ${detailBlock}
    ${logsHtml}
  `;

  const now = new Date();
  const [ny, nm, nd] = now.toISOString().split('T')[0].split('-');
  const printHtml = buildPrintHtml({
    title: L.tasks_print_title,
    period: '',
    generated: L.report_generated(L.formatDate(ny, nm, nd)),
    totalEntries: stLabelForPrint(t),
    body,
  });
  openPrintWindow(printHtml);
}

function stLabelForPrint(t) {
  if (t.status === TASK_ST.ACTIVE) return L.tasks_status_active;
  if (t.status === TASK_ST.RETURNED) return L.tasks_status_returned;
  if (t.status === TASK_ST.COMPLETED && t.completedReason === TASK_REASON.SOURCE) return L.tasks_status_completed_source;
  return L.tasks_status_completed;
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function toggleTheme() {
  const current = localStorage.getItem('theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
}

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const el        = document.createElement('div');
  el.className    = 'toast ' + type;
  el.textContent  = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ============================================================
   KEYBOARD
   ============================================================ */
document.addEventListener('keydown', e => {
  // Lightbox navigation
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'Escape')     { closeLightbox(); return; }
    if (e.key === 'ArrowRight') { lightboxNext(); return; }
    if (e.key === 'ArrowLeft')  { lightboxPrev(); return; }
  }
  if (e.key === 'Escape') {
    cancelEntryModal(); closeCatModal(); closeViewModal();
    cancelIssueModal(); cancelResolveIssueModal(); closePlanModal(); cancelResolvePlanModal();
    closeTaskCreateModal(); closeTaskAppendModal(); cancelTaskCompleteModal();
    if (typeof closeInventoryTemplateModal === 'function') closeInventoryTemplateModal();
    if (typeof closeInventoryRecordCreateModal === 'function') closeInventoryRecordCreateModal();
    if (typeof closeInventoryItemModal === 'function') closeInventoryItemModal();
    if (typeof closeInvRecordRenameModal === 'function') closeInvRecordRenameModal();
    if (typeof closeInvDictCreateModal === 'function') closeInvDictCreateModal();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (document.getElementById('entryModal').classList.contains('open')) saveEntry();
    if (document.getElementById('catModal').classList.contains('open'))   saveCat();
    if (document.getElementById('issueModal').classList.contains('open')) saveIssue();
    if (document.getElementById('issueResolveModal').classList.contains('open')) saveResolveIssue();
    if (document.getElementById('planModal').classList.contains('open'))  savePlan();
    if (document.getElementById('planResolveModal').classList.contains('open')) saveResolvePlan();
    if (document.getElementById('taskAppendModal').classList.contains('open')) saveTaskAppendModal();
    if (document.getElementById('taskCreateModal').classList.contains('open')) saveTaskCreateModal();
    if (document.getElementById('taskCompleteModal').classList.contains('open')) saveTaskCompleteModal();
  }
});

document.getElementById('entryModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cancelEntryModal();
});
document.getElementById('catModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCatModal();
});
document.getElementById('issueModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cancelIssueModal();
});
document.getElementById('planModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closePlanModal();
});
document.getElementById('issueResolveModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cancelResolveIssueModal();
});
document.getElementById('planResolveModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cancelResolvePlanModal();
});
document.getElementById('taskCreateModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeTaskCreateModal();
});
document.getElementById('taskAppendModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeTaskAppendModal();
});
document.getElementById('taskCompleteModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cancelTaskCompleteModal();
});

document.getElementById('btnOpenNewEntry')?.addEventListener('click', () => openEntryModal());
document.getElementById('btnOpenNewCat')?.addEventListener('click', () => openCatModal());

/* ============================================================
   ISSUES  (поломки)
   ============================================================ */
let editingIssueId = null;

async function openIssuePhotosLightbox(issueId, startIdx) {
  const items = await dbGetAllIssues();
  const item = items.find(i => i.id === issueId);
  if (!item || !item.photos || !item.photos.length) return;
  _viewPhotos = item.photos.map(p => getPhotoDisplayUrl(p));
  const idx = Math.max(0, Math.min(startIdx, item.photos.length - 1));
  openLightbox(idx, 'view');
}

async function openIssueResolutionPhotosLightbox(issueId, startIdx) {
  const items = await dbGetAllIssues();
  const item = items.find(i => i.id === issueId);
  const photos = item?.resolutionPhotos || [];
  if (!photos.length) return;
  _viewPhotos = photos.map(p => getPhotoDisplayUrl(p));
  const idx = Math.max(0, Math.min(startIdx, photos.length - 1));
  openLightbox(idx, 'view');
}

function openIssueModal(issue = null) {
  editingIssueId = issue ? issue.id : null;
  document.getElementById('issueModalTitle').setAttribute('data-i18n', issue ? 'modal_editIssue' : 'modal_newIssue');
  document.getElementById('issueModalTitle').textContent = issue ? L.modal_editIssue : L.modal_newIssue;

  document.getElementById('iDate').value     = issue ? issue.date     : new Date().toISOString().split('T')[0];
  document.getElementById('iDesc').value     = issue ? issue.desc     : '';
  document.getElementById('iNotes').value    = issue ? issue.notes    : '';
  document.getElementById('iPriority').value = issue ? issue.priority : 'medium';
  document.getElementById('iStatus').value   = issue ? issue.status   : 'open';
  populateCategorySelect('iCat', false, issue ? issue.category : '');
  applyI18n();

  initPhotoPicker(issue ? (issue.photos || []) : [], 'issues', 'issuePhotoPickerGrid', 'issuePhotoCounter');

  document.getElementById('issueModal').classList.add('open');
  document.getElementById('iDesc').focus();
}

function closeIssueModal() {
  document.getElementById('issueModal').classList.remove('open');
  editingIssueId = null;
}

async function cancelIssueModal() {
  if (document.getElementById('issueModal').classList.contains('open')) {
    await rollbackPhotos();
  }
  closeIssueModal();
}

async function saveIssue() {
  const desc = document.getElementById('iDesc').value.trim();
  if (!desc) { document.getElementById('iDesc').focus(); toast(L.field_issueDesc || 'Описание поломки', 'error'); return; }

  const newStatus = document.getElementById('iStatus').value;
  if (newStatus === 'resolved' && !editingIssueId) {
    toast(L.issue_resolve_use_list_button, 'error');
    return;
  }

  const photos = await commitPhotos();
  let obj = {
    date:     document.getElementById('iDate').value,
    category: document.getElementById('iCat').value,
    desc,
    notes:    document.getElementById('iNotes').value.trim(),
    priority: document.getElementById('iPriority').value,
    status:   newStatus,
    photos,
    updatedAt: new Date().toISOString()
  };

  if (editingIssueId) {
    const prev = await dbGet('issues', editingIssueId);
    if (!prev) { closeIssueModal(); return; }
    if (newStatus === 'resolved' && !prev.resolutionEntryId) {
      toast(L.issue_resolve_use_list_button, 'error');
      return;
    }
    obj.id = editingIssueId;
    obj.createdAt = prev.createdAt;
    if (newStatus === 'resolved' && prev.resolutionEntryId) {
      obj.resolutionEntryId = prev.resolutionEntryId;
      obj.resolvedAt = prev.resolvedAt;
      obj.resolutionActions = prev.resolutionActions;
      obj.resolutionParts = prev.resolutionParts;
      obj.resolutionPhotos = prev.resolutionPhotos;
    }
    await dbPutIssue(obj);
    toast(L.toast_issueUpdated || 'Поломка обновлена', 'success');
  } else {
    obj.createdAt = new Date().toISOString();
    await dbAddIssue(obj);
    toast(L.toast_issueSaved || 'Поломка добавлена', 'success');
  }

  closeIssueModal();
  updateStats();
  renderIssues();
  scheduleSharedDbSave();
}

async function deleteIssue(id) {
  if (!confirm(L.confirm_deleteIssue || 'Удалить запись о поломке?')) return;
  const items = await dbGetAllIssues();
  const item = items.find(i => i.id === id);
  if (item && item.resolutionEntryId) {
    const ent = await dbGet('entries', item.resolutionEntryId);
    if (ent && ent.photos && ent.photos.length) {
      for (const p of ent.photos) {
        let fname = p.filename;
        if (!fname && p.url) {
          const i = p.url.indexOf('photos/');
          if (i >= 0) fname = p.url.slice(i + 'photos/'.length);
        }
        if (fname) await deletePhotoFile(fname);
      }
    }
    if (ent) await dbDelete('entries', item.resolutionEntryId);
  }
  if (item && item.photos && item.photos.length) {
    for (const p of item.photos) {
      let fname = p.filename;
      if (!fname && p.url) {
        const i = p.url.indexOf('photos/');
        if (i >= 0) fname = p.url.slice(i + 'photos/'.length);
      }
      if (fname) await deletePhotoFile(fname);
    }
  }
  await deleteTasksForSource('issue', id);
  await dbDeleteIssue(id);
  toast(L.toast_issueDeleted || 'Поломка удалена', 'success');
  updateStats();
  renderIssues();
  if (currentPage === 'tasks') await renderTasks();
  scheduleSharedDbSave();
}

/** Кнопка «Устранена» открывает форму; «Открыть снова» сбрасывает статус без удаления записи в журнале. */
async function onIssueResolvedToggle(id, current) {
  if (current === 'resolved') {
    if (!confirm(L.issue_reopen_confirm)) return;
    const all = await dbGetAllIssues();
    const item = all.find(i => i.id === id);
    if (!item) return;
    const next = { ...item, status: 'open', updatedAt: new Date().toISOString() };
    delete next.resolvedAt;
    delete next.resolutionActions;
    delete next.resolutionParts;
    delete next.resolutionPhotos;
    delete next.resolutionEntryId;
    await dbPutIssue(next);
    await reopenTasksCompletedBySource('issue', id);
    updateStats();
    renderIssues();
    if (currentPage === 'tasks') await renderTasks();
    scheduleSharedDbSave();
    return;
  }
  openResolveIssueModal(id);
}

let resolvingIssueId = null;

async function openResolveIssueModal(issueId) {
  const all = await dbGetAllIssues();
  const issue = all.find(i => i.id === issueId);
  if (!issue) return;
  resolvingIssueId = issueId;
  document.getElementById('resolveIssueRefDesc').textContent = issue.desc || '—';
  document.getElementById('rDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('rActions').value = '';
  document.getElementById('resolvePartsList').innerHTML = '';
  initPhotoPicker([], 'journal', 'resolvePhotoPickerGrid', 'resolvePhotoCounter');
  document.getElementById('issueResolveModal').classList.add('open');
  applyI18n();
  setTimeout(() => document.getElementById('rActions').focus(), 100);
}

function closeResolveIssueModal() {
  document.getElementById('issueResolveModal').classList.remove('open');
  resolvingIssueId = null;
}

async function cancelResolveIssueModal() {
  if (document.getElementById('issueResolveModal').classList.contains('open')) {
    await rollbackPhotos();
  }
  closeResolveIssueModal();
}

async function saveResolveIssue() {
  if (!resolvingIssueId) return;
  const rDate = document.getElementById('rDate').value;
  if (!rDate) {
    toast(L.val_date, 'error');
    return;
  }
  const all = await dbGetAllIssues();
  const issue = all.find(i => i.id === resolvingIssueId);
  if (!issue) {
    closeResolveIssueModal();
    return;
  }
  if (issue.status === 'resolved' && issue.resolutionEntryId) {
    toast(L.tasks_err_double_resolve, 'error');
    closeResolveIssueModal();
    return;
  }

  const rActions = document.getElementById('rActions').value.trim();
  const parts = [];
  document.querySelectorAll('#resolvePartsList .resolve-part-item').forEach(row => {
    const name = row.querySelector('.part-name').value.trim();
    const qty  = row.querySelector('.part-qty').value.trim();
    if (name) parts.push({ name, qty });
  });

  const photos = await commitPhotos();
  const description = L.issue_resolve_entry_title(issue.desc || '');
  const entry = {
    date: rDate,
    category: issue.category || '',
    description,
    actions: rActions,
    parts,
    photos,
    fromIssueId: issue.id,
    issueFoundDate: issue.date,
    issueResolvedDate: rDate,
  };

  const entryId = await dbAdd('entries', entry);

  await dbPutIssue({
    ...issue,
    status: 'resolved',
    resolvedAt: rDate,
    resolutionActions: rActions,
    resolutionParts: parts,
    resolutionPhotos: photos,
    resolutionEntryId: entryId,
    updatedAt: new Date().toISOString(),
  });

  await markOpenTasksCompletedForSource('issue', issue.id, {
    journalEntryId: entryId,
    completedReason: TASK_REASON.SOURCE,
  });

  closeResolveIssueModal();
  toast(L.toast_issue_resolved_logged, 'success');
  await refresh();
  updateStats();
  renderIssues();
  scheduleSharedDbSave();
}

function goToIssueFromJournal(fromIssueId) {
  closeViewModal();
  showPage('issues');
  setTimeout(() => {
    const el = document.getElementById('issue-card-' + fromIssueId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('issue-card-highlight');
      setTimeout(() => el.classList.remove('issue-card-highlight'), 2400);
    }
  }, 80);
}

async function renderIssues() {
  const search = (document.getElementById('issueSearch')?.value || '').toLowerCase();
  const catF   = document.getElementById('issueFilterCat')?.value  || '';
  const stF    = document.getElementById('issueFilterStatus')?.value || '';

  let items = await dbGetAllIssues();

  // Sort: open first, then by date desc
  const statusOrder = { open: 0, inprogress: 1, resolved: 2 };
  items.sort((a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1) || (b.date || '').localeCompare(a.date || ''));

  if (search) items = items.filter(i =>
    (i.desc || '').toLowerCase().includes(search) ||
    (i.notes || '').toLowerCase().includes(search) ||
    (i.category || '').toLowerCase().includes(search)
  );
  if (catF) items = items.filter(i => i.category === catF);
  if (stF)  items = items.filter(i => i.status === stF);

  const tasks = await dbGetAllTasks();
  const activeIssueTaskIds = new Set(
    tasks
      .filter(t => t && t.sourceType === 'issue' && taskIsActiveStatus(t.status))
      .map(t => t.sourceId)
  );

  const container = document.getElementById('issuesList');
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-title" data-i18n="empty_issues_title">${L.empty_issues_title || 'Поломок нет'}</div>
      <div class="empty-state-text"  data-i18n="empty_issues_text">${L.empty_issues_text || 'Нажмите «+ Новая поломка»'}</div>
    </div>`;
    return;
  }

  const priorityLabels = { low: L.priority_low, medium: L.priority_medium, high: L.priority_high, critical: L.priority_critical };
  const statusLabels   = { open: L.status_open, inprogress: L.status_inprogress, resolved: L.status_resolved };
  const catMap = Object.fromEntries(allCategories.map(c => [c.name, c.name]));

  container.innerHTML = items.map(item => {
    const catLabel = item.category ? `<span class="cat-chip">${esc(item.category)}</span>` : '';
    const queued = activeIssueTaskIds.has(item.id);
    const queueChip = queued ? `<span class="cat-chip">${esc(L.tasks_queued_chip)}</span>` : '';
    const toggleLabel = item.status === 'resolved'
      ? (L.status_open || 'Открыть')
      : (L.status_resolved || 'Устранена');
    const photos    = item.photos || [];
    const showCount = Math.min(photos.length, 5);
    const moreCount = photos.length - showCount;
    const photoStrip = photos.length > 0
      ? `<div class="card-photo-strip">
          ${photos.slice(0, showCount).map((p, pi) =>
            `<div class="card-photo-mini" role="button" tabindex="0"
                 onclick="openIssuePhotosLightbox(${item.id},${pi})">
               <img src="${esc(getPhotoDisplayUrl(p))}" alt="" loading="lazy"></div>`
          ).join('')}
          ${moreCount > 0 ? `<div class="card-photo-more" onclick="openIssuePhotosLightbox(${item.id},0)">+${moreCount}</div>` : ''}
        </div>`
      : '';

    const resParts = item.resolutionParts || [];
    const hasResParts = resParts.some(p => p.name);
    const resPartsHtml = hasResParts
      ? `<div class="parts-chips" style="margin-top:6px">${resParts.filter(p => p.name).map(p =>
          `<span class="part-chip">${esc(p.name)}${p.qty
            ? `<span class="qty">× ${esc(p.qty)}</span>` : ''}</span>`
        ).join('')}</div>` : '';

    const resPhotos = item.resolutionPhotos || [];
    const rs = Math.min(resPhotos.length, 4);
    const rm = resPhotos.length - rs;
    const resPhotoStrip = item.status === 'resolved' && resPhotos.length > 0
      ? `<div class="card-photo-strip">
          ${resPhotos.slice(0, rs).map((p, pi) =>
            `<div class="card-photo-mini" role="button" tabindex="0"
                 onclick="openIssueResolutionPhotosLightbox(${item.id},${pi})">
               <img src="${esc(getPhotoDisplayUrl(p))}" alt="" loading="lazy"></div>`
          ).join('')}
          ${rm > 0 ? `<div class="card-photo-more" onclick="openIssueResolutionPhotosLightbox(${item.id},0)">+${rm}</div>` : ''}
        </div>` : '';

    const hasResolutionDetail = item.status === 'resolved' && (
      item.resolvedAt ||
      (item.resolutionActions && item.resolutionActions.trim()) ||
      hasResParts ||
      resPhotos.length > 0
    );
    let resolvedDateHtml = '';
    if (item.status === 'resolved' && item.resolvedAt) {
      const [yr, mr, dr] = item.resolvedAt.split('-');
      resolvedDateHtml = `<div class="card-notes muted">${esc(L.card_issue_resolved(L.formatDate(yr, mr, dr)))}</div>`;
    }
    const resolutionBlock = hasResolutionDetail
      ? `<div class="issue-resolution-block">
           <div class="issue-resolution-label">${esc(L.issue_resolution_section)}</div>
           ${resolvedDateHtml}
           ${item.resolutionActions ? `<div class="card-section-content">${esc(item.resolutionActions)}</div>` : ''}
           ${resPartsHtml}
           ${resPhotoStrip}
         </div>`
      : '';

    const toTasksBtn = (item.status !== 'resolved' && !queued)
      ? `<button class="btn btn-ghost btn-sm" onclick="openTaskCreateFromIssue(${item.id})">${esc(L.tasks_btn_to_tasks)}</button>`
      : '';

    return `<div class="card issue-${item.status}" id="issue-card-${item.id}">
      <div class="card-header">
        <div class="card-meta">
          <span class="card-date">${(([y,m,d]) => L.formatDate(y,m,d))((item.date||'--').split('-'))}</span>
          ${catLabel}
          ${queueChip}
          <span class="priority-badge priority-${item.priority}">${priorityLabels[item.priority] || item.priority}</span>
          <span class="status-badge status-${item.status}">${statusLabels[item.status] || item.status}</span>
        </div>
        <div class="card-actions">
          ${toTasksBtn}
          <button class="btn btn-ghost btn-sm" onclick="onIssueResolvedToggle(${item.id},'${item.status}')">${toggleLabel}</button>
          <button class="btn btn-ghost btn-icon" title="Edit" onclick="openIssueModal(${JSON.stringify(item).replace(/"/g,'&quot;')})">✎</button>
          <button class="btn btn-ghost btn-icon danger" title="Delete" onclick="deleteIssue(${item.id})">🗑</button>
        </div>
      </div>
      <div class="card-title">${highlight(esc(item.desc), search)}</div>
      ${item.notes ? `<div class="card-notes">${highlight(esc(item.notes), search)}</div>` : ''}
      ${photoStrip}
      ${resolutionBlock}
    </div>`;
  }).join('');
}

function clearIssueFilters() {
  document.getElementById('issueSearch').value      = '';
  document.getElementById('issueFilterCat').value   = '';
  document.getElementById('issueFilterStatus').value = '';
  renderIssues();
}

/* ============================================================
   PLANS  (планирование)
   ============================================================ */
let editingPlanId = null;

function syncPlanDateMode() {
  const range = document.getElementById('pModeRange').checked;
  document.getElementById('pDateEndGroup').classList.toggle('hidden', !range);
  const lbl = document.getElementById('pDateLabel');
  if (lbl) lbl.setAttribute('data-i18n', range ? 'field_datePlannedFrom' : 'field_datePlanned');
}

function addPlanPartRow(name = '', qty = '') {
  const list = document.getElementById('planPartsList');
  const row = document.createElement('div');
  row.className = 'part-row';
  row.innerHTML = `
    <input type="text"   class="form-input part-name" placeholder="${L.field_partName || 'Наименование'}" value="${esc(name)}">
    <input type="number" class="form-input part-qty"  placeholder="${L.field_partQty || 'Кол-во'}"        value="${esc(qty)}" min="0" style="max-width:80px">
    <button class="btn btn-ghost btn-icon danger" onclick="this.closest('.part-row').remove()">✕</button>`;
  list.appendChild(row);
}

function openPlanModal(plan = null) {
  editingPlanId = plan ? plan.id : null;
  document.getElementById('planModalTitle').setAttribute('data-i18n', plan ? 'modal_editPlan' : 'modal_newPlan');
  document.getElementById('planModalTitle').textContent = plan ? L.modal_editPlan : L.modal_newPlan;

  const today = new Date().toISOString().split('T')[0];
  const end = plan && plan.datePlannedEnd && plan.datePlannedEnd !== plan.datePlanned ? plan.datePlannedEnd : '';
  if (end) {
    document.getElementById('pModeRange').checked = true;
    document.getElementById('pDate').value    = plan.datePlanned || '';
    document.getElementById('pDateEnd').value = end;
  } else {
    document.getElementById('pModeSingle').checked = true;
    document.getElementById('pDate').value    = plan ? (plan.datePlanned || '') : today;
    document.getElementById('pDateEnd').value = '';
  }
  syncPlanDateMode();

  document.getElementById('pDesc').value    = plan ? plan.desc        : '';
  document.getElementById('pActions').value = plan ? plan.actions     : '';
  document.getElementById('pStatus').value  = plan ? plan.status      : 'planned';
  document.getElementById('planPartsList').innerHTML = '';
  (plan && plan.parts || []).forEach(p => addPlanPartRow(p.name, p.qty));
  populateCategorySelect('pCat', false, plan ? plan.category : '');
  applyI18n();

  document.getElementById('planModal').classList.add('open');
  document.getElementById('pDesc').focus();
}

function closePlanModal() {
  document.getElementById('planModal').classList.remove('open');
  editingPlanId = null;
}

function addPlanResolvePartRow(name = '', qty = '') {
  const list = document.getElementById('planResolvePartsList');
  const row = document.createElement('div');
  row.className = 'plan-resolve-part-item';
  row.innerHTML = `
    <input type="text" class="form-input part-name"
           placeholder="${esc(L.field_partName)}" value="${esc(name)}">
    <input type="text" class="form-input part-qty"
           placeholder="${esc(L.field_partQty)}"  value="${esc(qty)}">
    <button class="btn btn-danger btn-icon btn-sm"
            onclick="this.closest('.plan-resolve-part-item').remove()">✕</button>`;
  list.appendChild(row);
  if (!name) row.querySelector('.part-name').focus();
}

async function savePlan() {
  const desc = document.getElementById('pDesc').value.trim();
  if (!desc) { document.getElementById('pDesc').focus(); toast(L.field_planDesc || 'Описание задачи', 'error'); return; }

  const newStatus = document.getElementById('pStatus').value;
  if (newStatus === 'done' && !editingPlanId) {
    toast(L.plan_resolve_use_list_button, 'error');
    return;
  }

  const start = document.getElementById('pDate').value;
  if (!start) { document.getElementById('pDate').focus(); toast(L.val_plan_date || 'Укажите дату', 'error'); return; }

  const rangeMode = document.getElementById('pModeRange').checked;
  let datePlannedEnd = '';
  if (rangeMode) {
    datePlannedEnd = document.getElementById('pDateEnd').value;
    if (!datePlannedEnd) { document.getElementById('pDateEnd').focus(); toast(L.val_plan_end_date, 'error'); return; }
    if (datePlannedEnd < start) {
      toast(L.val_plan_range_order || 'Дата окончания не может быть раньше начала', 'error');
      return;
    }
  }

  const parts = [...document.querySelectorAll('#planPartsList .part-row')].map(r => ({
    name: r.querySelector('.part-name').value.trim(),
    qty:  r.querySelector('.part-qty').value.trim()
  })).filter(p => p.name);

  let obj = {
    datePlanned: start,
    category:    document.getElementById('pCat').value,
    desc,
    actions:     document.getElementById('pActions').value.trim(),
    parts,
    status:      newStatus,
    updatedAt:   new Date().toISOString()
  };
  if (rangeMode && datePlannedEnd) obj.datePlannedEnd = datePlannedEnd;

  if (editingPlanId) {
    const prev = await dbGet('plans', editingPlanId);
    if (!prev) { closePlanModal(); return; }
    if (newStatus === 'done' && !prev.completionEntryId) {
      toast(L.plan_resolve_use_list_button, 'error');
      return;
    }
    obj.id = editingPlanId;
    obj.createdAt = prev.createdAt;
    if (newStatus === 'done' && prev.completionEntryId) {
      obj.completionEntryId = prev.completionEntryId;
      obj.finishedAt = prev.finishedAt;
      obj.completionActions = prev.completionActions;
      obj.completionParts = prev.completionParts;
      obj.completionPhotos = prev.completionPhotos;
    }
    await dbPutPlan(obj);
    toast(L.toast_planUpdated || 'План обновлён', 'success');
  } else {
    obj.createdAt = new Date().toISOString();
    await dbAddPlan(obj);
    toast(L.toast_planSaved || 'План добавлен', 'success');
  }

  closePlanModal();
  updateStats();
  renderPlans();
  scheduleSharedDbSave();
}

async function deletePlan(id) {
  if (!confirm(L.confirm_deletePlan || 'Удалить план?')) return;
  const all = await dbGetAllPlans();
  const item = all.find(p => p.id === id);
  if (item && item.completionEntryId) {
    const ent = await dbGet('entries', item.completionEntryId);
    if (ent && ent.photos && ent.photos.length) {
      for (const p of ent.photos) {
        let fname = p.filename;
        if (!fname && p.url) {
          const i = p.url.indexOf('photos/');
          if (i >= 0) fname = p.url.slice(i + 'photos/'.length);
        }
        if (fname) await deletePhotoFile(fname);
      }
    }
    if (ent) await dbDelete('entries', item.completionEntryId);
  }
  await deleteTasksForSource('plan', id);
  await dbDeletePlan(id);
  toast(L.toast_planDeleted || 'План удалён', 'success');
  updateStats();
  renderPlans();
  if (currentPage === 'tasks') await renderTasks();
  scheduleSharedDbSave();
}

async function onPlanDoneToggle(id, current) {
  if (current === 'done') {
    if (!confirm(L.plan_reopen_confirm)) return;
    const all = await dbGetAllPlans();
    const item = all.find(p => p.id === id);
    if (!item) return;
    const next = { ...item, status: 'planned', updatedAt: new Date().toISOString() };
    delete next.completionEntryId;
    delete next.finishedAt;
    delete next.completionActions;
    delete next.completionParts;
    delete next.completionPhotos;
    await dbPutPlan(next);
    await reopenTasksCompletedBySource('plan', id);
    updateStats();
    renderPlans();
    if (currentPage === 'tasks') await renderTasks();
    scheduleSharedDbSave();
    return;
  }
  openResolvePlanModal(id);
}

let resolvingPlanId = null;

async function openResolvePlanModal(planId) {
  const all = await dbGetAllPlans();
  const plan = all.find(p => p.id === planId);
  if (!plan) return;
  resolvingPlanId = planId;
  document.getElementById('planResolveRefDesc').textContent = plan.desc || '—';
  document.getElementById('planResolveRefPeriod').textContent = plan.datePlanned ? formatPlanPeriodHuman(plan) : '—';
  document.getElementById('prDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('prActions').value = '';
  document.getElementById('planResolvePartsList').innerHTML = '';
  initPhotoPicker([], 'journal', 'planResolvePhotoPickerGrid', 'planResolvePhotoCounter');
  document.getElementById('planResolveModal').classList.add('open');
  applyI18n();
  setTimeout(() => document.getElementById('prActions').focus(), 100);
}

function closeResolvePlanModal() {
  document.getElementById('planResolveModal').classList.remove('open');
  resolvingPlanId = null;
}

async function cancelResolvePlanModal() {
  if (document.getElementById('planResolveModal').classList.contains('open')) {
    await rollbackPhotos();
  }
  closeResolvePlanModal();
}

async function saveResolvePlan() {
  if (!resolvingPlanId) return;
  const prDate = document.getElementById('prDate').value;
  if (!prDate) {
    toast(L.val_date, 'error');
    return;
  }
  const all = await dbGetAllPlans();
  const plan = all.find(p => p.id === resolvingPlanId);
  if (!plan) {
    closeResolvePlanModal();
    return;
  }
  if (plan.status === 'done' && plan.completionEntryId) {
    toast(L.tasks_err_double_resolve, 'error');
    closeResolvePlanModal();
    return;
  }

  const prActions = document.getElementById('prActions').value.trim();
  const parts = [];
  document.querySelectorAll('#planResolvePartsList .plan-resolve-part-item').forEach(row => {
    const name = row.querySelector('.part-name').value.trim();
    const qty  = row.querySelector('.part-qty').value.trim();
    if (name) parts.push({ name, qty });
  });

  const photos = await commitPhotos();
  const description = L.plan_resolve_entry_title(plan.desc || '');
  const entry = {
    date: prDate,
    category: plan.category || '',
    description,
    actions: prActions,
    parts,
    photos,
    fromPlanId: plan.id,
    planPlannedDate: plan.datePlanned,
    planDoneDate: prDate,
  };

  const entryId = await dbAdd('entries', entry);

  await dbPutPlan({
    ...plan,
    status: 'done',
    finishedAt: prDate,
    completionActions: prActions,
    completionParts: parts,
    completionPhotos: photos,
    completionEntryId: entryId,
    updatedAt: new Date().toISOString(),
  });

  await markOpenTasksCompletedForSource('plan', plan.id, {
    journalEntryId: entryId,
    completedReason: TASK_REASON.SOURCE,
  });

  closeResolvePlanModal();
  toast(L.toast_plan_done_logged, 'success');
  await refresh();
  updateStats();
  renderPlans();
  scheduleSharedDbSave();
}

function goToPlanFromJournal(fromPlanId) {
  closeViewModal();
  showPage('plans');
  setTimeout(() => {
    const el = document.getElementById('plan-card-' + fromPlanId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('issue-card-highlight');
      setTimeout(() => el.classList.remove('issue-card-highlight'), 2400);
    }
  }, 80);
}

async function openPlanCompletionPhotosLightbox(planId, startIdx) {
  const items = await dbGetAllPlans();
  const plan = items.find(p => p.id === planId);
  const photos = plan?.completionPhotos || [];
  if (!photos.length) return;
  _viewPhotos = photos.map(p => getPhotoDisplayUrl(p));
  const idx = Math.max(0, Math.min(startIdx, photos.length - 1));
  openLightbox(idx, 'view');
}

async function renderPlans() {
  const search = (document.getElementById('planSearch')?.value || '').toLowerCase();
  const catF   = document.getElementById('planFilterCat')?.value  || '';
  const stF    = document.getElementById('planFilterStatus')?.value || '';
  const today_ = new Date().toISOString().split('T')[0];

  let items = await dbGetAllPlans();
  // Completed plans remain linked to journal entries, but do not clutter active plans list.
  items = items.filter(i => i.status !== 'done');

  // Sort: planned/overdue first → by date asc, then done → by date desc
  items.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    return (a.datePlanned || '').localeCompare(b.datePlanned || '');
  });

  if (search) items = items.filter(i =>
    (i.desc || '').toLowerCase().includes(search) ||
    (i.actions || '').toLowerCase().includes(search) ||
    (i.category || '').toLowerCase().includes(search)
  );
  if (catF) items = items.filter(i => i.category === catF);
  if (stF)  items = items.filter(i => i.status === stF);

  const tasks = await dbGetAllTasks();
  const activePlanTaskIds = new Set(
    tasks
      .filter(t => t && t.sourceType === 'plan' && taskIsActiveStatus(t.status))
      .map(t => t.sourceId)
  );

  const container = document.getElementById('plansList');
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📌</div>
      <div class="empty-state-title">${L.empty_plans_title || 'Планов нет'}</div>
      <div class="empty-state-text">${L.empty_plans_text  || 'Нажмите «+ Новый план»'}</div>
    </div>`;
    return;
  }

  const statusLabels = { planned: L.status_planned, done: L.status_done };

  container.innerHTML = items.map(item => {
    const deadline = planRangeEnd(item);
    const overdue = item.status === 'planned' && deadline && deadline < today_;
    const catLabel = item.category ? `<span class="cat-chip">${esc(item.category)}</span>` : '';
    const queued = activePlanTaskIds.has(item.id);
    const queueChip = queued ? `<span class="cat-chip">${esc(L.tasks_queued_chip)}</span>` : '';
    const dateStr = formatPlanPeriodHuman(item);
    const dateLabel = item.datePlanned
      ? `<span class="plan-date ${overdue ? 'overdue' : ''}">${esc(dateStr)}${overdue ? ' ⚠' : ''}</span>`
      : '';
    const partsHtml = (item.parts || []).filter(p => p.name).length
      ? `<div class="parts-chips">${item.parts.filter(p => p.name).map(p =>
          `<span class="part-chip">${esc(p.name)}${p.qty ? ' × ' + esc(p.qty) : ''}</span>`).join('')}</div>`
      : '';
    const toggleLabel = item.status === 'done' ? (L.plan_mark_planned || '↺ Вернуть') : (L.plan_mark_done || '✓ Выполнено');

    const compParts = item.completionParts || [];
    const hasCompParts = compParts.some(p => p.name);
    const compPartsHtml = hasCompParts
      ? `<div class="parts-chips" style="margin-top:6px">${compParts.filter(p => p.name).map(p =>
          `<span class="part-chip">${esc(p.name)}${p.qty
            ? `<span class="qty">× ${esc(p.qty)}</span>` : ''}</span>`
        ).join('')}</div>` : '';

    const compPhotos = item.completionPhotos || [];
    const cs = Math.min(compPhotos.length, 4);
    const cm = compPhotos.length - cs;
    const compPhotoStrip = item.status === 'done' && compPhotos.length > 0
      ? `<div class="card-photo-strip">
          ${compPhotos.slice(0, cs).map((p, pi) =>
            `<div class="card-photo-mini" role="button" tabindex="0"
                 onclick="openPlanCompletionPhotosLightbox(${item.id},${pi})">
               <img src="${esc(getPhotoDisplayUrl(p))}" alt="" loading="lazy"></div>`
          ).join('')}
          ${cm > 0 ? `<div class="card-photo-more" onclick="openPlanCompletionPhotosLightbox(${item.id},0)">+${cm}</div>` : ''}
        </div>` : '';

    const hasCompletionDetail = item.status === 'done' && (
      item.finishedAt ||
      (item.completionActions && item.completionActions.trim()) ||
      hasCompParts ||
      compPhotos.length > 0
    );
    let doneDateHtml = '';
    if (item.status === 'done' && item.finishedAt) {
      const [yf, mf, df] = item.finishedAt.split('-');
      doneDateHtml = `<div class="card-notes muted">${esc(L.card_plan_done_line(L.formatDate(yf, mf, df)))}</div>`;
    }
    const completionBlock = hasCompletionDetail
      ? `<div class="issue-resolution-block">
           <div class="issue-resolution-label">${esc(L.plan_completion_section)}</div>
           ${doneDateHtml}
           ${item.completionActions ? `<div class="card-section-content">${esc(item.completionActions)}</div>` : ''}
           ${compPartsHtml}
           ${compPhotoStrip}
         </div>`
      : '';

    const toTasksBtn = (!queued && item.status !== 'done')
      ? `<button class="btn btn-ghost btn-sm" onclick="openTaskCreateFromPlan(${item.id})">${esc(L.tasks_btn_to_tasks)}</button>`
      : '';

    return `<div class="card plan-${item.status}${overdue ? ' plan-overdue' : ''}" id="plan-card-${item.id}">
      <div class="card-header">
        <div class="card-meta">
          ${dateLabel}
          ${catLabel}
          ${queueChip}
          <span class="status-badge status-${item.status}">${statusLabels[item.status] || item.status}</span>
        </div>
        <div class="card-actions">
          ${toTasksBtn}
          <button class="btn btn-ghost btn-sm" onclick="onPlanDoneToggle(${item.id},'${item.status}')">${toggleLabel}</button>
          <button class="btn btn-ghost btn-icon" onclick="openPlanModal(${JSON.stringify(item).replace(/"/g,'&quot;')})">✎</button>
          <button class="btn btn-ghost btn-icon danger" onclick="deletePlan(${item.id})">🗑</button>
        </div>
      </div>
      <div class="card-title">${highlight(esc(item.desc), search)}</div>
      ${item.actions ? `<div class="card-actions-text">${highlight(esc(item.actions), search)}</div>` : ''}
      ${partsHtml}
      ${completionBlock}
    </div>`;
  }).join('');
}

function clearPlanFilters() {
  document.getElementById('planSearch').value       = '';
  document.getElementById('planFilterCat').value    = '';
  document.getElementById('planFilterStatus').value = '';
  renderPlans();
}

/* ============================================================
   HELP
   ============================================================ */
function openHelp() {
  const helpFiles = {
    ru: 'help-ru.html',
    en: 'help-en.html',
    pl: 'help-pl.html',
    ro: 'help-ro.html',
    pt: 'help-pt.html',
  };
  const file = helpFiles[currentLang] || 'help-en.html';
  if (isElectronContext()) {
    window.api.openHelp(file);
  } else {
    window.open(file, '_blank');
  }
}

/* ============================================================
   BOOT
   ============================================================ */
init();
