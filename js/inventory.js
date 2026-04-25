/* ============================================================
   inventory.js — модуль «Инвентаризация»
   Этап 1: шаблоны (CRUD + архив), описи (живые документы),
            простая таблица позиций с подтверждениями, печать A4.
   ============================================================ */

/* ---------- Поля шаблона ---------- */
const INV_FIELD_TYPES = ['text', 'number', 'select', 'date', 'boolean'];

function invUuid() {
  return 'f_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function invFieldTypeLabel(type) {
  const map = {
    text:    L.inv_field_type_text    || 'Текст',
    number:  L.inv_field_type_number  || 'Число',
    select:  L.inv_field_type_select  || 'Список',
    date:    L.inv_field_type_date    || 'Дата',
    boolean: L.inv_field_type_boolean || 'Да/Нет',
  };
  return map[type] || type;
}

function invDefaultEmptyValue(field) {
  if (!field) return '';
  if (field.type === 'number')  return null;
  if (field.type === 'boolean') return false;
  return '';
}

/** Нормализация полей шаблона/снимка: убрать битые записи, гарантировать key и label */
function invNormalizeTemplateFields(fields) {
  if (!Array.isArray(fields)) return [];
  const out = [];
  for (const f of fields) {
    if (!f) continue;
    const key = String(f.key || '').trim();
    if (!key) continue;
    const type = INV_FIELD_TYPES.includes(f.type) ? f.type : 'text';
    let label = String(f.label || f.name || '').trim();
    if (!label) label = key;
    const base = { key, label, type, required: !!f.required };
    if (type === 'select') {
      base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
    }
    if (type === 'number') {
      base.unit = f.unit != null ? String(f.unit) : '';
    }
    out.push(base);
  }
  return out;
}

/**
 * Подмешать актуальную структуру шаблона в снимок описи: новые поля в конец,
 * существующие по key — обновить подпись/тип; поля, удалённые из шаблона, в описи оставляем.
 */
function invMergeRecordSnapshotWithTemplate(snapshotFields, templateFields) {
  const snap = invNormalizeTemplateFields(snapshotFields);
  const tpl  = invNormalizeTemplateFields(templateFields);
  if (tpl.length === 0) return snap;
  const tplByKey = new Map(tpl.map(f => [f.key, f]));
  const merged = snap.map(f => {
    const t = tplByKey.get(f.key);
    return t ? { ...f, ...t, key: f.key } : { ...f };
  });
  const seen = new Set(snap.map(f => f.key));
  for (const t of tpl) {
    if (!seen.has(t.key)) {
      merged.push({ ...t });
      seen.add(t.key);
    }
  }
  return merged;
}

function invGetRecordFields(rec) {
  return invNormalizeTemplateFields(rec?.templateSnapshot?.fields || []);
}

async function syncInventoryRecordsAfterTemplateSave(templateId, templateFields) {
  const tplRows = invNormalizeTemplateFields(templateFields);
  const all = await dbGetAllInventoryRecords();
  const now = invNowIso();
  for (const rec of all) {
    if (rec.templateId !== templateId) continue;
    const prev = invNormalizeTemplateFields(rec.templateSnapshot?.fields || []);
    const merged = invMergeRecordSnapshotWithTemplate(prev, tplRows);
    if (JSON.stringify(prev) === JSON.stringify(merged)) continue;
    rec.templateSnapshot = { ...(rec.templateSnapshot || {}), fields: merged };
    rec.updatedAt = now;
    await dbPutInventoryRecord(rec);
  }
}

/* ---------- Утилиты ---------- */

function invEsc(s) { return (typeof esc === 'function') ? esc(s) : String(s ?? ''); }

function invFormatDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('T')[0].split('-');
  if (parts.length !== 3) return iso;
  if (typeof L?.formatDate === 'function') return L.formatDate(parts[0], parts[1], parts[2]);
  return iso;
}

function invToday() { return new Date().toISOString().slice(0, 10); }

function invNowIso() { return new Date().toISOString(); }

function invItemCount(rec) {
  return Array.isArray(rec?.items) ? rec.items.length : 0;
}

function invTplName(tpl) {
  return (tpl && tpl.name) ? tpl.name : (L.inv_tpl_unnamed || '— без названия —');
}

function invConfirm(msg) { return window.confirm(msg); }

function invToast(msg, kind) {
  if (typeof toast === 'function') toast(msg, kind);
}

function invScheduleSave() {
  if (typeof window.scheduleSharedDbSave === 'function') window.scheduleSharedDbSave();
}

/* ============================================================
   ШАБЛОНЫ — список и CRUD
   ============================================================ */

let invTplCache = [];

async function renderInventoryTemplatesPage() {
  const container = document.getElementById('inventoryTemplatesList');
  if (!container) return;

  invTplCache = await dbGetAllInventoryTemplates();
  const showArchived = !!document.getElementById('invTplShowArchived')?.checked;
  let list = invTplCache.slice();
  if (!showArchived) list = list.filter(t => !t.archived);
  list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base', numeric: true }));

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">${invEsc(L.inv_tpl_empty_title || 'Нет шаблонов')}</div>
        <div class="empty-state-text">${invEsc(L.inv_tpl_empty_text || 'Создайте первый шаблон описи')}</div>
      </div>`;
    return;
  }

  container.innerHTML = list.map(t => {
    const fields = Array.isArray(t.fields) ? t.fields : [];
    const fieldList = fields.map(f => `${invEsc(f.label || f.name || '')} <span style="color:var(--text-dim);">(${invEsc(invFieldTypeLabel(f.type))})</span>`).join(', ');
    const archBadge = t.archived ? `<span class="badge" style="background:rgba(255,255,255,0.06);color:var(--text-dim);padding:2px 8px;border-radius:10px;margin-left:8px;font-size:11px;">${invEsc(L.inv_tpl_badge_archived || 'архив')}</span>` : '';
    const desc = t.desc ? `<div class="meta">${invEsc(t.desc)}</div>` : '';
    const archBtn = t.archived
      ? `<button class="btn btn-ghost btn-sm" onclick="restoreInventoryTemplate(${t.id})">${invEsc(L.inv_btn_restore || 'Восстановить')}</button>`
      : `<button class="btn btn-ghost btn-sm" onclick="archiveInventoryTemplate(${t.id})">${invEsc(L.inv_btn_archive || 'В архив')}</button>`;
    return `
      <div class="inv-template-card ${t.archived ? 'archived' : ''}" id="inv-tpl-${t.id}">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;">${invEsc(invTplName(t))}${archBadge}</div>
          ${desc}
          <div class="meta">${invEsc(L.inv_tpl_fields_label || 'Поля')}: ${fieldList || '<em style="color:var(--text-dim);">—</em>'}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm" onclick="openInventoryTemplateEdit(${t.id})">${invEsc(L.inv_btn_edit_short || 'Изм.')}</button>
          ${archBtn}
        </div>
      </div>`;
  }).join('');
}

/* --- редактор шаблона --- */

let invTplEditing = null; // { id|null, name, desc, archived, fields:[{key,label,type,options?,unit?,required?}] }

function openInventoryTemplateCreate() {
  invTplEditing = {
    id: null,
    name: '',
    desc: '',
    archived: false,
    fields: [
      { key: invUuid(), label: L.inv_default_field_desc  || 'Описание',   type: 'text',   required: true },
      { key: invUuid(), label: L.inv_default_field_qty   || 'Количество', type: 'number', required: false, unit: 'шт' },
    ],
  };
  showInventoryTemplateModal();
}

async function openInventoryTemplateEdit(id) {
  const t = await dbGetInventoryTemplate(id);
  if (!t) return;
  invTplEditing = {
    id: t.id,
    name: t.name || '',
    desc: t.desc || '',
    archived: !!t.archived,
    fields: (Array.isArray(t.fields) ? t.fields : []).map(f => ({
      key: f.key || invUuid(),
      label: f.label || f.name || '',
      type: INV_FIELD_TYPES.includes(f.type) ? f.type : 'text',
      options: Array.isArray(f.options) ? f.options.slice() : [],
      unit: f.unit || '',
      required: !!f.required,
    })),
  };
  showInventoryTemplateModal();
}

function showInventoryTemplateModal() {
  const titleEl = document.getElementById('invTemplateModalTitle');
  if (titleEl) {
    titleEl.textContent = invTplEditing.id
      ? (L.inv_modal_template_edit_title || 'Редактирование шаблона')
      : (L.inv_modal_template_new_title  || 'Новый шаблон');
  }
  document.getElementById('invTplName').value = invTplEditing.name;
  document.getElementById('invTplDesc').value = invTplEditing.desc;
  renderInventoryTemplateFieldsList();
  document.getElementById('invTemplateModal')?.classList.add('open');
  setTimeout(() => document.getElementById('invTplName')?.focus(), 50);
}

function closeInventoryTemplateModal() {
  document.getElementById('invTemplateModal')?.classList.remove('open');
  invTplEditing = null;
}

function renderInventoryTemplateFieldsList() {
  const wrap = document.getElementById('invTplFieldsList');
  if (!wrap || !invTplEditing) return;
  if (invTplEditing.fields.length === 0) {
    wrap.innerHTML = `<div style="color:var(--text-dim);font-size:12px;">${invEsc(L.inv_tpl_no_fields || 'Поля не добавлены')}</div>`;
    return;
  }
  wrap.innerHTML = invTplEditing.fields.map((f, idx) => {
    const opts = INV_FIELD_TYPES.map(t =>
      `<option value="${t}" ${t === f.type ? 'selected' : ''}>${invEsc(invFieldTypeLabel(t))}</option>`
    ).join('');
    const optionsBlock = f.type === 'select'
      ? `<div class="field-row-options">
           <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_options_label || 'Варианты (через запятую)')}</label>
           <input type="text" class="form-input" value="${invEsc((f.options || []).join(', '))}"
                  oninput="onInventoryTemplateFieldOptions(${idx}, this.value)">
         </div>`
      : '';
    const unitBlock = f.type === 'number'
      ? `<input type="text" class="form-input" placeholder="${invEsc(L.inv_field_unit_placeholder || 'ед.')}"
                value="${invEsc(f.unit || '')}" oninput="onInventoryTemplateFieldUnit(${idx}, this.value)">`
      : `<span></span>`;
    return `
      <div class="inv-field-row">
        <input type="text" class="form-input" placeholder="${invEsc(L.inv_field_label_placeholder || 'Название поля')}"
               value="${invEsc(f.label)}" oninput="onInventoryTemplateFieldLabel(${idx}, this.value)">
        <select class="form-select" onchange="onInventoryTemplateFieldType(${idx}, this.value)">${opts}</select>
        ${unitBlock}
        <label class="checkbox-row" title="${invEsc(L.inv_field_required || 'Обязательное')}">
          <input type="checkbox" ${f.required ? 'checked' : ''} onchange="onInventoryTemplateFieldRequired(${idx}, this.checked)">
          <span>*</span>
        </label>
        <span class="inv-field-row-handle">
          <button type="button" class="btn btn-ghost btn-sm btn-icon" title="↑" onclick="moveInventoryTemplateField(${idx}, -1)">↑</button>
          <button type="button" class="btn btn-ghost btn-sm btn-icon" title="↓" onclick="moveInventoryTemplateField(${idx},  1)">↓</button>
          <button type="button" class="btn btn-danger btn-sm btn-icon" title="${invEsc(L.btn_delete || 'Удалить')}" onclick="removeInventoryTemplateField(${idx})">🗑</button>
        </span>
        ${optionsBlock}
      </div>`;
  }).join('');
}

function addInventoryTemplateField() {
  if (!invTplEditing) return;
  invTplEditing.fields.push({ key: invUuid(), label: '', type: 'text', required: false, options: [], unit: '' });
  renderInventoryTemplateFieldsList();
}
function removeInventoryTemplateField(idx) {
  if (!invTplEditing) return;
  if (!invConfirm(L.inv_confirm_remove_field || 'Удалить это поле?')) return;
  invTplEditing.fields.splice(idx, 1);
  renderInventoryTemplateFieldsList();
}
function moveInventoryTemplateField(idx, delta) {
  if (!invTplEditing) return;
  const j = idx + delta;
  if (j < 0 || j >= invTplEditing.fields.length) return;
  const arr = invTplEditing.fields;
  [arr[idx], arr[j]] = [arr[j], arr[idx]];
  renderInventoryTemplateFieldsList();
}
function onInventoryTemplateFieldLabel(idx, v)    { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].label = v; }
function onInventoryTemplateFieldType(idx, v)     { if (invTplEditing?.fields[idx]) { invTplEditing.fields[idx].type = v; renderInventoryTemplateFieldsList(); } }
function onInventoryTemplateFieldUnit(idx, v)     { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].unit = v; }
function onInventoryTemplateFieldRequired(idx, v) { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].required = !!v; }
function onInventoryTemplateFieldOptions(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  invTplEditing.fields[idx].options = String(v || '').split(',').map(s => s.trim()).filter(Boolean);
}

async function saveInventoryTemplateModal() {
  if (!invTplEditing) return;
  const name = (document.getElementById('invTplName')?.value || '').trim();
  const desc = (document.getElementById('invTplDesc')?.value || '').trim();
  if (!name) { invToast(L.inv_err_template_name_required || 'Укажите название шаблона', 'error'); return; }
  const fields = (invTplEditing.fields || []).filter(f => (f.label || '').trim());
  if (fields.length === 0) { invToast(L.inv_err_template_fields_required || 'Добавьте хотя бы одно поле', 'error'); return; }

  const cleanFields = invNormalizeTemplateFields(fields.map(f => ({
    key: f.key || invUuid(),
    label: f.label.trim(),
    type: INV_FIELD_TYPES.includes(f.type) ? f.type : 'text',
    options: (f.type === 'select') ? (Array.isArray(f.options) ? f.options.filter(Boolean) : []) : undefined,
    unit:    (f.type === 'number') ? (f.unit || '') : undefined,
    required: !!f.required,
  })));

  const now = invNowIso();
  if (invTplEditing.id) {
    const existing = await dbGetInventoryTemplate(invTplEditing.id);
    const updated = {
      ...(existing || {}),
      id: invTplEditing.id,
      name, desc,
      archived: !!invTplEditing.archived,
      fields: cleanFields,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };
    await dbPutInventoryTemplate(updated);
    try {
      await syncInventoryRecordsAfterTemplateSave(invTplEditing.id, cleanFields);
    } catch (e) {
      console.error('[syncInventoryRecordsAfterTemplateSave]', e);
      invToast(L.inv_toast_template_sync_failed || 'Шаблон сохранён, но не удалось обновить связанные описи', 'error');
    }
  } else {
    await dbAddInventoryTemplate({
      name, desc,
      archived: false,
      fields: cleanFields,
      createdAt: now,
      updatedAt: now,
    });
  }

  closeInventoryTemplateModal();
  invToast(L.inv_toast_template_saved || 'Шаблон сохранён', 'success');
  invScheduleSave();
  await renderInventoryTemplatesPage();
  if (typeof currentPage !== 'undefined' && currentPage === 'inventory' && typeof renderInventoryPage === 'function') {
    await renderInventoryPage();
  }
}

async function archiveInventoryTemplate(id) {
  if (!invConfirm(L.inv_confirm_archive_template || 'Отправить шаблон в архив?')) return;
  const t = await dbGetInventoryTemplate(id);
  if (!t) return;
  t.archived = true;
  t.updatedAt = invNowIso();
  await dbPutInventoryTemplate(t);
  invToast(L.inv_toast_template_archived || 'Шаблон в архиве', 'success');
  invScheduleSave();
  await renderInventoryTemplatesPage();
}

async function restoreInventoryTemplate(id) {
  const t = await dbGetInventoryTemplate(id);
  if (!t) return;
  t.archived = false;
  t.updatedAt = invNowIso();
  await dbPutInventoryTemplate(t);
  invToast(L.inv_toast_template_restored || 'Шаблон восстановлен', 'success');
  invScheduleSave();
  await renderInventoryTemplatesPage();
}

/* ============================================================
   ОПИСИ — список
   ============================================================ */

let invRecCache = [];

async function renderInventoryPage() {
  const detail = document.getElementById('inventoryRecordDetail');
  if (detail && !detail.classList.contains('hidden') && detail.dataset.recId) {
    await renderInventoryRecordDetail(parseInt(detail.dataset.recId, 10));
    return;
  }

  const list = document.getElementById('inventoryRecordsList');
  if (!list) return;

  invRecCache = await dbGetAllInventoryRecords();
  const tpls = await dbGetAllInventoryTemplates();
  const tplById = new Map(tpls.map(t => [t.id, t]));

  // populate template filter
  const filterSel = document.getElementById('invRecFilterTpl');
  if (filterSel) {
    const cur = filterSel.value;
    const opts = ['<option value="">' + invEsc(L.inv_filter_all_templates || 'Все шаблоны') + '</option>']
      .concat(tpls.filter(t => !t.archived).map(t => `<option value="${t.id}">${invEsc(invTplName(t))}</option>`));
    filterSel.innerHTML = opts.join('');
    if (cur) filterSel.value = cur;
  }

  const search = (document.getElementById('invRecSearch')?.value || '').toLowerCase().trim();
  const tplFilter = document.getElementById('invRecFilterTpl')?.value || '';

  let rows = invRecCache.slice();
  if (search)    rows = rows.filter(r => (r.name || '').toLowerCase().includes(search));
  if (tplFilter) rows = rows.filter(r => String(r.templateId) === String(tplFilter));
  rows.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));

  if (rows.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-title">${invEsc(L.inv_empty_title || 'Описей пока нет')}</div>
        <div class="empty-state-text">${invEsc(L.inv_empty_text || 'Создайте первую опись по шаблону')}</div>
      </div>`;
    return;
  }

  list.innerHTML = rows.map(r => {
    const tpl = tplById.get(r.templateId);
    const tplLabel = tpl ? invTplName(tpl) : (r.templateSnapshot?.name || L.inv_tpl_unknown || '— шаблон не найден —');
    const dateLine = r.date ? invFormatDate(r.date) : invFormatDate(r.createdAt);
    return `
      <div class="inv-record-card" id="inv-rec-${r.id}">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;">${invEsc(r.name || L.inv_record_unnamed || '— без названия —')}</div>
          <div class="meta">
            ${invEsc(L.inv_record_template_label || 'Шаблон')}: ${invEsc(tplLabel)}
            &nbsp;·&nbsp; ${invEsc(L.inv_record_date_label || 'Дата')}: ${invEsc(dateLine || '—')}
            &nbsp;·&nbsp; ${invEsc(L.inv_record_items_label || 'Позиций')}: ${invItemCount(r)}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm" onclick="openInventoryRecordDetail(${r.id})">${invEsc(L.inv_btn_open || 'Открыть')}</button>
          <button class="btn btn-danger btn-sm btn-icon" title="${invEsc(L.btn_delete || 'Удалить')}" onclick="deleteInventoryRecord(${r.id})">🗑</button>
        </div>
      </div>`;
  }).join('');
}

function clearInventoryFilters() {
  const s = document.getElementById('invRecSearch'); if (s) s.value = '';
  const f = document.getElementById('invRecFilterTpl'); if (f) f.value = '';
  renderInventoryPage();
}

/* --- создание описи --- */

async function openInventoryRecordCreate() {
  const tpls = await dbGetAllInventoryTemplates();
  const active = tpls.filter(t => !t.archived);
  const sel = document.getElementById('invRecCreateTpl');
  if (!sel) return;
  if (active.length === 0) {
    invToast(L.inv_err_no_active_templates || 'Нет активных шаблонов — создайте шаблон', 'error');
    showPage('inventory-templates');
    return;
  }
  sel.innerHTML = active
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base', numeric: true }))
    .map(t => `<option value="${t.id}">${invEsc(invTplName(t))}</option>`).join('');
  document.getElementById('invRecCreateName').value = '';
  document.getElementById('invRecCreateDate').value = invToday();
  document.getElementById('invRecordCreateModal')?.classList.add('open');
  setTimeout(() => document.getElementById('invRecCreateName')?.focus(), 50);
}

function closeInventoryRecordCreateModal() {
  document.getElementById('invRecordCreateModal')?.classList.remove('open');
}

async function saveInventoryRecordCreateModal() {
  const tplId = parseInt(document.getElementById('invRecCreateTpl')?.value, 10);
  const name  = (document.getElementById('invRecCreateName')?.value || '').trim();
  const date  = document.getElementById('invRecCreateDate')?.value || invToday();
  if (!tplId) { invToast(L.inv_err_template_required || 'Выберите шаблон', 'error'); return; }
  if (!name)  { invToast(L.inv_err_record_name_required || 'Укажите название описи', 'error'); return; }
  const tpl = await dbGetInventoryTemplate(tplId);
  if (!tpl) { invToast(L.inv_err_template_missing || 'Шаблон не найден', 'error'); return; }
  if (tpl.archived) { invToast(L.inv_err_template_archived || 'Шаблон в архиве — выберите другой', 'error'); return; }

  const now = invNowIso();
  const id = await dbAddInventoryRecord({
    templateId: tplId,
    templateSnapshot: {
      name: tpl.name,
      desc: tpl.desc || '',
      fields: (tpl.fields || []).map(f => ({ ...f })),
    },
    name,
    date,
    items: [],
    createdAt: now,
    updatedAt: now,
  });
  closeInventoryRecordCreateModal();
  invToast(L.inv_toast_record_created || 'Опись создана', 'success');
  invScheduleSave();
  await openInventoryRecordDetail(id);
}

async function deleteInventoryRecord(id) {
  if (!invConfirm(L.inv_confirm_delete_record || 'Удалить эту опись со всеми позициями?')) return;
  await dbDeleteInventoryRecord(id);
  invToast(L.inv_toast_record_deleted || 'Опись удалена', 'success');
  invScheduleSave();
  // если открыта была эта опись — вернуться к списку
  const detail = document.getElementById('inventoryRecordDetail');
  if (detail && detail.dataset.recId && parseInt(detail.dataset.recId, 10) === id) {
    closeInventoryRecordDetail();
  }
  await renderInventoryPage();
}

/* ============================================================
   ОПИСЬ — детальный просмотр
   ============================================================ */

async function openInventoryRecordDetail(id) {
  const detail = document.getElementById('inventoryRecordDetail');
  const list   = document.getElementById('inventoryRecordsList');
  if (!detail || !list) return;
  detail.dataset.recId = String(id);
  list.classList.add('hidden');
  detail.classList.remove('hidden');
  await renderInventoryRecordDetail(id);
}

function closeInventoryRecordDetail() {
  const detail = document.getElementById('inventoryRecordDetail');
  const list   = document.getElementById('inventoryRecordsList');
  if (!detail || !list) return;
  delete detail.dataset.recId;
  detail.classList.add('hidden');
  detail.innerHTML = '';
  list.classList.remove('hidden');
  renderInventoryPage();
}

async function renderInventoryRecordDetail(id) {
  const detail = document.getElementById('inventoryRecordDetail');
  if (!detail) return;
  const rec = await dbGetInventoryRecord(id);
  if (!rec) {
    detail.innerHTML = `<div class="empty-state"><div class="empty-state-title">${invEsc(L.inv_record_not_found || 'Опись не найдена')}</div></div>`;
    return;
  }
  const fields = invGetRecordFields(rec);
  const items  = Array.isArray(rec.items) ? rec.items : [];
  const search = (document.getElementById('invItemSearch')?.value || '').toLowerCase().trim();

  let visibleItems = items.slice();
  if (search) {
    visibleItems = visibleItems.filter(it => {
      return fields.some(f => {
        const v = invItemValueText(it, f);
        return v && String(v).toLowerCase().includes(search);
      });
    });
  }

  const headers = fields.map(f => `<th>${invEsc(f.label)}${f.type === 'number' && f.unit ? ` <span style="color:var(--text-dim);">(${invEsc(f.unit)})</span>` : ''}</th>`).join('');
  const colCount = fields.length + 1;

  const rowsHtml = visibleItems.length === 0
    ? `<tr><td colspan="${colCount}" style="text-align:center;color:var(--text-dim);padding:18px;">${invEsc(L.inv_no_items || 'Позиций нет — нажмите «Добавить позицию»')}</td></tr>`
    : visibleItems.map(it => {
        const cells = fields.map(f => `<td>${invEsc(invItemValueText(it, f))}</td>`).join('');
        return `
          <tr>
            ${cells}
            <td class="col-actions">
              <button class="btn btn-ghost btn-sm" onclick="openInventoryItemEdit(${rec.id}, '${invEsc(it.id)}')">${invEsc(L.inv_btn_edit_short || 'Изм.')}</button>
              <button class="btn btn-danger btn-sm btn-icon" title="${invEsc(L.btn_delete || 'Удалить')}" onclick="deleteInventoryItem(${rec.id}, '${invEsc(it.id)}')">🗑</button>
            </td>
          </tr>`;
      }).join('');

  detail.innerHTML = `
    <div class="inv-record-detail-header">
      <div>
        <div class="inv-record-detail-title">${invEsc(rec.name || '—')}</div>
        <div class="inv-record-detail-meta">
          ${invEsc(L.inv_record_template_label || 'Шаблон')}: ${invEsc(rec.templateSnapshot?.name || '—')}
          &nbsp;·&nbsp; ${invEsc(L.inv_record_date_label || 'Дата')}: ${invEsc(invFormatDate(rec.date) || '—')}
          &nbsp;·&nbsp; ${invEsc(L.inv_record_items_label || 'Позиций')}: ${items.length}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn btn-ghost btn-sm" onclick="closeInventoryRecordDetail()">← ${invEsc(L.inv_btn_back_to_records || 'К списку')}</button>
        <button class="btn btn-ghost btn-sm" onclick="openInventoryItemAdd(${rec.id})">+ ${invEsc(L.inv_btn_add_item || 'Добавить позицию')}</button>
        <button class="btn btn-ghost btn-sm" onclick="renameInventoryRecord(${rec.id})">${invEsc(L.inv_btn_rename || 'Переименовать')}</button>
        <button class="btn btn-primary btn-sm" onclick="printInventoryRecord(${rec.id})">🖶 ${invEsc(L.inv_btn_print || 'Печать')}</button>
      </div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-input" id="invItemSearch" oninput="renderInventoryRecordDetail(${rec.id})"
             value="${invEsc(document.getElementById('invItemSearch')?.value || '')}"
             placeholder="${invEsc(L.inv_items_search_placeholder || 'Поиск по позициям...')}" style="flex:1;">
    </div>
    <div class="inv-table-wrap">
      <table class="inv-table">
        <thead><tr>${headers}<th class="col-actions"></th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function invItemValueText(item, field) {
  if (!field) return '';
  const raw = item?.values ? item.values[field.key] : undefined;
  if (raw === undefined || raw === null || raw === '') return '';
  if (field.type === 'boolean') return raw ? (L.inv_yes || 'Да') : (L.inv_no || 'Нет');
  if (field.type === 'date')    return invFormatDate(raw);
  if (field.type === 'number')  return String(raw);
  return String(raw);
}

async function renameInventoryRecord(id) {
  const rec = await dbGetInventoryRecord(id);
  if (!rec) return;
  const newName = window.prompt(L.inv_prompt_rename_record || 'Новое название описи:', rec.name || '');
  if (newName === null) return;
  const trimmed = String(newName).trim();
  if (!trimmed) { invToast(L.inv_err_record_name_required || 'Укажите название описи', 'error'); return; }
  rec.name = trimmed;
  rec.updatedAt = invNowIso();
  await dbPutInventoryRecord(rec);
  invToast(L.inv_toast_record_renamed || 'Опись переименована', 'success');
  invScheduleSave();
  await renderInventoryRecordDetail(id);
}

/* ============================================================
   ПОЗИЦИИ ОПИСИ — добавление/редактирование/удаление
   ============================================================ */

let invItemEditing = null; // { recordId, itemId|null, values:{}, _origValues:{} }

async function openInventoryItemAdd(recordId) {
  const rec = await dbGetInventoryRecord(recordId);
  if (!rec) return;
  const fields = invGetRecordFields(rec);
  const initial = {};
  fields.forEach(f => { if (f.key) initial[f.key] = invDefaultEmptyValue(f); });
  invItemEditing = {
    recordId,
    itemId: null,
    values: initial,
    _origValues: { ...initial },
  };
  showInventoryItemModal(rec, true);
}

async function openInventoryItemEdit(recordId, itemId) {
  const rec = await dbGetInventoryRecord(recordId);
  if (!rec) return;
  const it = (rec.items || []).find(x => String(x.id) === String(itemId));
  if (!it) return;
  const fields = invGetRecordFields(rec);
  const diskVals = { ...(it.values || {}) };
  const values = { ...diskVals };
  fields.forEach(f => {
    if (!f.key) return;
    if (!(f.key in values)) values[f.key] = invDefaultEmptyValue(f);
  });
  invItemEditing = {
    recordId,
    itemId: it.id,
    values,
    _origValues: diskVals,
  };
  showInventoryItemModal(rec, false);
}

function showInventoryItemModal(rec, isNew) {
  const titleEl = document.getElementById('invItemModalTitle');
  if (titleEl) titleEl.textContent = isNew
    ? (L.inv_modal_item_add_title  || 'Новая позиция')
    : (L.inv_modal_item_edit_title || 'Редактирование позиции');

  const body = document.getElementById('invItemFormBody');
  const fields = invGetRecordFields(rec);
  body.innerHTML = `<div class="form-grid">${fields.map(f => renderInventoryItemFieldInput(f)).join('')}</div>`;
  document.getElementById('invItemModal')?.classList.add('open');
  setTimeout(() => body.querySelector('input,select,textarea')?.focus(), 50);
}

function renderInventoryItemFieldInput(field) {
  const id = `invItemFld_${field.key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const val = invItemEditing?.values?.[field.key];
  const req = field.required ? '<span class="required"> *</span>' : '';
  const labelHtml = `<span>${invEsc(field.label)}${field.type === 'number' && field.unit ? ` <span style="color:var(--text-dim);">(${invEsc(field.unit)})</span>` : ''}</span>${req}`;
  let inputHtml;
  switch (field.type) {
    case 'number':
      inputHtml = `<input type="number" step="any" class="form-input" id="${id}" value="${val == null ? '' : invEsc(val)}"
                          data-inv-key="${invEsc(field.key)}"
                          oninput="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'number')">`;
      break;
    case 'select': {
      const opts = ['<option value=""></option>'].concat(
        (field.options || []).map(o => `<option value="${invEsc(o)}" ${String(val || '') === String(o) ? 'selected' : ''}>${invEsc(o)}</option>`)
      ).join('');
      inputHtml = `<select class="form-select" id="${id}" data-inv-key="${invEsc(field.key)}"
                          onchange="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'select')">${opts}</select>`;
      break;
    }
    case 'date':
      inputHtml = `<input type="date" class="form-input" id="${id}" value="${invEsc(val || '')}"
                          data-inv-key="${invEsc(field.key)}"
                          onchange="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'date')">`;
      break;
    case 'boolean':
      inputHtml = `<label class="checkbox-row"><input type="checkbox" id="${id}" ${val ? 'checked' : ''}
                          data-inv-key="${invEsc(field.key)}"
                          onchange="onInventoryItemFieldChange(this.dataset.invKey, this.checked, 'boolean')"><span>${invEsc(L.inv_yes || 'Да')}</span></label>`;
      break;
    case 'text':
    default:
      inputHtml = `<input type="text" class="form-input" id="${id}" value="${invEsc(val || '')}"
                          data-inv-key="${invEsc(field.key)}"
                          oninput="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'text')">`;
  }
  return `<div class="form-group full"><label class="form-label">${labelHtml}</label>${inputHtml}</div>`;
}

function onInventoryItemFieldChange(key, raw, type) {
  if (!invItemEditing) return;
  if (type === 'number') {
    if (raw === '' || raw === null) { invItemEditing.values[key] = null; return; }
    const num = Number(raw);
    invItemEditing.values[key] = Number.isFinite(num) ? num : null;
    return;
  }
  if (type === 'boolean') { invItemEditing.values[key] = !!raw; return; }
  invItemEditing.values[key] = raw;
}

function closeInventoryItemModal() {
  document.getElementById('invItemModal')?.classList.remove('open');
  invItemEditing = null;
}

async function saveInventoryItemModal() {
  if (!invItemEditing) return;
  const rec = await dbGetInventoryRecord(invItemEditing.recordId);
  if (!rec) { closeInventoryItemModal(); return; }
  const fields = invGetRecordFields(rec);

  // required check
  for (const f of fields) {
    if (!f.required) continue;
    const v = invItemEditing.values[f.key];
    const empty = (v === undefined || v === null || v === '' || (f.type === 'boolean' && v === false));
    if (empty) {
      invToast((L.inv_err_field_required || 'Обязательное поле:') + ' ' + f.label, 'error');
      return;
    }
  }

  const isEdit = invItemEditing.itemId != null;
  // подтверждение редактирования количества/описания
  if (isEdit) {
    const sensitiveChange = fields.some(f => {
      if (f.type !== 'number' && f.type !== 'text') return false;
      if (!Object.prototype.hasOwnProperty.call(invItemEditing._origValues, f.key)) return false;
      const oldV = invItemEditing._origValues[f.key];
      const newV = invItemEditing.values[f.key];
      return String(oldV ?? '') !== String(newV ?? '');
    });
    if (sensitiveChange) {
      if (!invConfirm(L.inv_confirm_edit_item || 'Сохранить изменения позиции?')) return;
    }
  }

  const items = Array.isArray(rec.items) ? rec.items.slice() : [];
  if (isEdit) {
    const idx = items.findIndex(x => String(x.id) === String(invItemEditing.itemId));
    if (idx >= 0) {
      items[idx] = { ...items[idx], values: { ...invItemEditing.values }, updatedAt: invNowIso() };
    }
  } else {
    items.push({
      id: invUuid(),
      values: { ...invItemEditing.values },
      createdAt: invNowIso(),
      updatedAt: invNowIso(),
    });
  }
  rec.items = items;
  rec.updatedAt = invNowIso();
  await dbPutInventoryRecord(rec);
  closeInventoryItemModal();
  invToast(isEdit ? (L.inv_toast_item_updated || 'Позиция обновлена')
                  : (L.inv_toast_item_added   || 'Позиция добавлена'), 'success');
  invScheduleSave();
  await renderInventoryRecordDetail(rec.id);
}

async function deleteInventoryItem(recordId, itemId) {
  if (!invConfirm(L.inv_confirm_delete_item || 'Удалить эту позицию?')) return;
  const rec = await dbGetInventoryRecord(recordId);
  if (!rec) return;
  rec.items = (rec.items || []).filter(x => String(x.id) !== String(itemId));
  rec.updatedAt = invNowIso();
  await dbPutInventoryRecord(rec);
  invToast(L.inv_toast_item_deleted || 'Позиция удалена', 'success');
  invScheduleSave();
  await renderInventoryRecordDetail(recordId);
}

/* ============================================================
   ПЕЧАТЬ A4
   ============================================================ */
async function printInventoryRecord(id) {
  const rec = await dbGetInventoryRecord(id);
  if (!rec) return;
  const fields = invGetRecordFields(rec);
  const items  = Array.isArray(rec.items) ? rec.items : [];

  const headers = fields.map(f => `<th>${invEsc(f.label)}${f.type === 'number' && f.unit ? ` (${invEsc(f.unit)})` : ''}</th>`).join('');
  const rows = items.length === 0
    ? `<tr><td colspan="${fields.length || 1}" style="text-align:center;color:#888;">${invEsc(L.inv_no_items || 'Позиций нет')}</td></tr>`
    : items.map((it, idx) => {
        const cells = fields.map(f => `<td>${invEsc(invItemValueText(it, f))}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

  const dateLine = invFormatDate(rec.date) || invFormatDate(rec.createdAt) || '';
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${invEsc(rec.name || '')}</title>
<style>
  @page { size: A4 portrait; margin: 18mm; }
  body { font-family: Arial, Helvetica, sans-serif; color:#000; font-size: 12px; }
  h1 { font-size: 18px; margin: 0 0 4px 0; }
  .sub { color:#444; margin-bottom: 14px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background:#eee; }
</style></head><body>
  <h1>${invEsc(rec.name || '')}</h1>
  <div class="sub">${invEsc(L.inv_print_date || 'Дата')}: ${invEsc(dateLine)}</div>
  <table>
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 100); };<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) { invToast(L.inv_err_popup_blocked || 'Откройте всплывающие окна для печати', 'error'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

/* ============================================================
   СИДИРОВАНИЕ ПРЕДУСТАНОВЛЕННОГО ШАБЛОНА
   ============================================================ */
async function ensureDefaultInventoryTemplate() {
  try {
    const all = await dbGetAllInventoryTemplates();
    if (all && all.length > 0) return;
    const now = invNowIso();
    await dbAddInventoryTemplate({
      name: L.inv_seed_tpl_name || 'Запасные части (минимум)',
      desc: L.inv_seed_tpl_desc || 'Базовый шаблон. Можно изменить или удалить.',
      archived: false,
      fields: [
        { key: invUuid(), label: L.inv_seed_field_desc || 'Описание',         type: 'text',   required: true },
        { key: invUuid(), label: L.inv_seed_field_part || 'Номер по каталогу', type: 'text',   required: false },
        { key: invUuid(), label: L.inv_seed_field_qty  || 'Количество',       type: 'number', required: false, unit: L.inv_seed_unit_pcs || 'шт' },
        { key: invUuid(), label: L.inv_seed_field_loc  || 'Место хранения',   type: 'text',   required: false },
      ],
      createdAt: now,
      updatedAt: now,
    });
    invScheduleSave();
  } catch (e) {
    console.error('[ensureDefaultInventoryTemplate]', e);
  }
}

// Инициализация: дождаться готовности IndexedDB (db задаётся в db.js initDB) и засеять предустановленный шаблон
function _invWaitForDbAndSeed(triesLeft) {
  if (typeof db !== 'undefined' && db) {
    ensureDefaultInventoryTemplate();
    return;
  }
  if (triesLeft <= 0) return;
  setTimeout(() => _invWaitForDbAndSeed(triesLeft - 1), 250);
}
document.addEventListener('DOMContentLoaded', () => { _invWaitForDbAndSeed(40); });
