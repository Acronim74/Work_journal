/* ============================================================
   snapshot.js — database snapshots (auto-archive)
   ============================================================ */

const MAX_SNAPSHOTS = 30;   // cap to avoid unbounded growth

/* ---- trigger reasons ---- */
const SNAP_REASON = {
  manual:  'manual',
  clear:   'before_clear',
  import:  'before_import',
};

/* ============================================================
   CREATE SNAPSHOT
   ============================================================ */
async function createSnapshot(reason = SNAP_REASON.manual, label = '') {
  const entries    = await dbAll('entries');
  const categories = await dbAll('categories');
  const issues     = await dbAll('issues');
  const plans      = await dbAll('plans');
  const tasks      = await dbAll('tasks');

  if (
    entries.length === 0 &&
    categories.length === 0 &&
    issues.length === 0 &&
    plans.length === 0 &&
    tasks.length === 0
  ) return null; // nothing to save

  const snap = {
    createdAt:  new Date().toISOString(),
    reason,
    label:      label || '',
    entryCount: entries.length,
    catCount:   categories.length,
    issueCount: issues.length,
    planCount:  plans.length,
    taskCount:  tasks.length,
    data: { entries, categories, issues, plans, tasks },
  };

  const id = await dbAdd('snapshots', snap);

  // Prune oldest if over cap
  await pruneSnapshots();

  return id;
}

async function pruneSnapshots() {
  const all = await dbAll('snapshots');
  if (all.length <= MAX_SNAPSHOTS) return;

  // Sort oldest first
  all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const toDelete = all.slice(0, all.length - MAX_SNAPSHOTS);
  for (const s of toDelete) await dbDelete('snapshots', s.id);
}

/* ============================================================
   RESTORE FROM SNAPSHOT
   ============================================================ */
async function restoreSnapshot(snapshotId) {
  const snap = await dbGet('snapshots', snapshotId);
  if (!snap) { toast(L.snap_notFound, 'error'); return; }

  const confirmMsg = L.snap_confirm_restore(
    formatSnapDate(snap.createdAt),
    snap.entryCount
  );
  if (!confirm(confirmMsg)) return;

  // Auto-save current state before overwriting
  await createSnapshot(SNAP_REASON.import, L.snap_label_beforeRestore);

  await dbClear('entries');
  await dbClear('categories');
  await dbClear('issues');
  await dbClear('plans');
  await dbClear('tasks');

  for (const e of snap.data.entries)    await dbAdd('entries',    e);
  for (const c of snap.data.categories) await dbAdd('categories', c);
  const issues = Array.isArray(snap.data.issues) ? snap.data.issues : [];
  const plans  = Array.isArray(snap.data.plans)  ? snap.data.plans  : [];
  const tasks  = Array.isArray(snap.data.tasks)  ? snap.data.tasks  : [];
  for (const i of issues) await dbAdd('issues', i);
  for (const p of plans)  await dbAdd('plans',  p);
  for (const t of tasks) await dbAdd('tasks',  t);

  await refresh();
  toast(L.snap_restored, 'success');
  renderSnapshotList();
}

/* ============================================================
   DELETE SNAPSHOT
   ============================================================ */
async function deleteSnapshot(id) {
  if (!confirm(L.snap_confirm_delete)) return;
  await dbDelete('snapshots', id);
  toast(L.snap_deleted, 'success');
  renderSnapshotList();
  if (typeof window.scheduleSharedDbSave === 'function') window.scheduleSharedDbSave();
}

/* ============================================================
   DOWNLOAD SNAPSHOT as JSON
   ============================================================ */
async function downloadSnapshot(id) {
  const snap = await dbGet('snapshots', id);
  if (!snap) return;

  const payload = {
    version:    1,
    exportedAt: snap.createdAt,
    entries:    snap.data.entries,
    categories: snap.data.categories,
    issues:     snap.data.issues || [],
    plans:      snap.data.plans || [],
    tasks:      snap.data.tasks || [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `snapshot-${snap.createdAt.slice(0, 16).replace('T', '_').replace(':', '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   RENDER SNAPSHOT LIST
   ============================================================ */
async function renderSnapshotList() {
  const container = document.getElementById('snapshotList');
  if (!container) return;

  const all = await dbAll('snapshots');
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first

  if (all.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗄</div>
        <div class="empty-state-title">${esc(L.snap_empty_title)}</div>
        <div class="empty-state-text">${esc(L.snap_empty_text)}</div>
      </div>`;
    return;
  }

  container.innerHTML = all.map(snap => {
    const reasonLabel = L['snap_reason_' + snap.reason] || snap.reason;
    const dateStr     = formatSnapDate(snap.createdAt);
    const timeStr     = formatSnapTime(snap.createdAt);
    const extraLabel  = snap.label ? ` — ${esc(snap.label)}` : '';
    const taskCount = typeof snap.taskCount === 'number' ? snap.taskCount : (snap.data?.tasks?.length || 0);
    const taskLine  = taskCount > 0 ? ` &nbsp;·&nbsp; ${esc(L.snap_tasks(taskCount))}` : '';

    return `
      <div class="snap-card" id="snap-${snap.id}">
        <div class="snap-card-left">
          <div class="snap-datetime">
            <span class="snap-date">${esc(dateStr)}</span>
            <span class="snap-time">${esc(timeStr)}</span>
          </div>
          <div class="snap-reason-row">
            <span class="snap-reason-badge snap-reason-${snap.reason}">${esc(reasonLabel)}${extraLabel}</span>
          </div>
          <div class="snap-counts">
            ${esc(L.snap_entries(snap.entryCount))} &nbsp;·&nbsp; ${esc(L.snap_cats(snap.catCount))}${taskLine}
          </div>
        </div>
        <div class="snap-card-actions">
          <button class="btn btn-ghost btn-sm" title="${esc(L.snap_btn_download)}"
                  onclick="downloadSnapshot(${snap.id})">↓</button>
          <button class="btn btn-ghost btn-sm" title="${esc(L.snap_btn_restore)}"
                  onclick="restoreSnapshot(${snap.id})">↺ ${esc(L.snap_btn_restore)}</button>
          <button class="btn btn-danger btn-sm btn-icon" title="${esc(L.btn_delete)}"
                  onclick="deleteSnapshot(${snap.id})">🗑</button>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   MANUAL SNAPSHOT (called from UI)
   ============================================================ */
async function manualSnapshot() {
  const id = await createSnapshot(SNAP_REASON.manual);
  if (id === null) { toast(L.snap_empty_nothing, 'error'); return; }
  toast(L.snap_created, 'success');
  renderSnapshotList();
  if (typeof window.scheduleSharedDbSave === 'function') window.scheduleSharedDbSave();
}

/* ============================================================
   DATE HELPERS
   ============================================================ */
function formatSnapDate(iso) {
  const d = new Date(iso);
  const [y, m, day] = d.toISOString().split('T')[0].split('-');
  return L.formatDate(y, m, day);
}

function formatSnapTime(iso) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
