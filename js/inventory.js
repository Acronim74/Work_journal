/* ============================================================
   inventory.js — модуль «Инвентаризация»
   Этап 1: шаблоны (CRUD + архив), описи (живые документы),
            простая таблица позиций с подтверждениями, печать A4.
   ============================================================ */

/* ---------- Поля шаблона ---------- */
const INV_FIELD_TYPES = ['text', 'number', 'select', 'date', 'boolean', 'multi_select', 'composite'];

const INV_DICT_SLUG = { STORAGE: 'storageLocations', UNITS: 'units' };
const INV_DICT_SYSTEM_SLUGS = new Set([INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS]);

let _invDictSelectCache = null;

function invDictResolvedLabel(d) {
  if (!d || !d.slug) return '';
  if (d.slug === INV_DICT_SLUG.STORAGE) return L.inv_dict_title_storage || 'Места хранения';
  if (d.slug === INV_DICT_SLUG.UNITS) return L.inv_dict_title_units || 'Единицы измерения';
  const t = (d.title && String(d.title).trim()) ? String(d.title).trim() : '';
  return t || d.slug;
}

async function invRefreshDictSelectCache() {
  await ensureInventoryDictionaries();
  const all = await dbGetAllDictionaries();
  const labelBySlug = {};
  const slugSet = new Set();
  for (const d of all) {
    if (!d || !d.slug) continue;
    slugSet.add(d.slug);
    labelBySlug[d.slug] = invDictResolvedLabel(d);
  }
  for (const s of [INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS]) {
    if (!slugSet.has(s)) slugSet.add(s);
    if (!labelBySlug[s]) labelBySlug[s] = invDictTitle(s);
  }
  const rest = [...slugSet].filter(s => !INV_DICT_SYSTEM_SLUGS.has(s)).sort((a, b) =>
    String(labelBySlug[a] || a).localeCompare(String(labelBySlug[b] || b), undefined, { sensitivity: 'base' }));
  _invDictSelectCache = {
    slugsStorageFirst: [INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS, ...rest],
    slugsUnitsFirst: [INV_DICT_SLUG.UNITS, INV_DICT_SLUG.STORAGE, ...rest],
    labelBySlug,
  };
}

function invUuid() {
  return 'f_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function invFieldTypeLabel(type) {
  const map = {
    text:         L.inv_field_type_text          || 'Текст',
    number:       L.inv_field_type_number        || 'Число',
    select:       L.inv_field_type_select        || 'Список',
    date:         L.inv_field_type_date          || 'Дата',
    boolean:      L.inv_field_type_boolean       || 'Да/Нет',
    multi_select: L.inv_field_type_multi_select  || 'Несколько из списка',
    composite:    L.inv_field_type_composite     || 'Составной номер',
  };
  return map[type] || type;
}

function invDictTitle(slug) {
  if (slug === INV_DICT_SLUG.STORAGE) return L.inv_dict_title_storage || 'Места хранения';
  if (slug === INV_DICT_SLUG.UNITS) return L.inv_dict_title_units || 'Единицы измерения';
  return slug;
}

function invDefaultEmptyValue(field) {
  if (!field) return '';
  if (field.type === 'multi_select') return [];
  if (field.type === 'composite') {
    const n = Math.max(2, (field.compositeParts || []).length || 2);
    return Array(n).fill('');
  }
  if (field.type === 'number') {
    if (field.unitMode === 'dictionary') return { amount: null, unit: '' };
    return null;
  }
  if (field.type === 'boolean') return false;
  return '';
}

async function invLoadDictionariesMap() {
  const all = await dbGetAllDictionaries();
  const m = {};
  for (const d of all) {
    if (d && d.slug) m[d.slug] = Array.isArray(d.values) ? d.values.filter(Boolean) : [];
  }
  return m;
}

function invFieldOptionList(field, dictMap) {
  if (!field) return [];
  if (field.type === 'select' || field.type === 'multi_select') {
    if (field.selectSource === 'dictionary' && field.dictionarySlug) {
      const slug = field.dictionarySlug;
      return (dictMap && dictMap[slug]) ? dictMap[slug].slice() : [];
    }
    return Array.isArray(field.options) ? field.options.filter(Boolean) : [];
  }
  if (field.type === 'number' && field.unitMode === 'dictionary') {
    if (field.unitSource === 'inline') {
      return Array.isArray(field.options) ? field.options.filter(Boolean) : [];
    }
    const slug = field.dictionarySlug || INV_DICT_SLUG.UNITS;
    return (dictMap && dictMap[slug]) ? dictMap[slug].slice() : [];
  }
  return [];
}

function invCompositeToArray(field, raw) {
  const n = Math.max(2, (field.compositeParts || []).length || 2);
  const out = Array(n).fill('');
  if (Array.isArray(raw)) {
    for (let i = 0; i < n; i++) out[i] = raw[i] != null ? String(raw[i]) : '';
    return out;
  }
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const keys = Object.keys(raw).sort();
    for (let i = 0; i < n && i < keys.length; i++) out[i] = String(raw[keys[i]] ?? '');
    return out;
  }
  if (typeof raw === 'string' && raw.trim()) {
    const sep = field.compositeSeparator || '-';
    const p = raw.split(sep);
    for (let i = 0; i < n && i < p.length; i++) out[i] = p[i].trim();
  }
  return out;
}

function invCompositeDisplay(field, raw) {
  const arr = invCompositeToArray(field, raw);
  const sep = field.compositeSeparator || '-';
  return arr.filter(s => String(s).trim()).join(sep);
}

function invIsEmptyValue(field, v) {
  if (v === undefined || v === null || v === '') return true;
  if (field.type === 'boolean' && v === false) return true;
  if (field.type === 'multi_select') return !Array.isArray(v) || v.length === 0;
  if (field.type === 'composite') {
    return invCompositeToArray(field, v).every(p => !String(p || '').trim());
  }
  if (field.type === 'number' && field.unitMode === 'dictionary') {
    if (typeof v !== 'object' || v === null) return true;
    return v.amount == null || v.amount === '';
  }
  return false;
}

function invDeepClone(o) {
  try { return JSON.parse(JSON.stringify(o)); } catch (_) { return o; }
}

/** Нормализация полей шаблона/снимка: убрать битые записи, гарантировать key и label */
function invNormalizeTemplateFields(fields) {
  if (!Array.isArray(fields)) return [];
  const out = [];
  for (const f of fields) {
    if (!f) continue;
    const key = String(f.key || '').trim();
    if (!key) continue;
    let type = INV_FIELD_TYPES.includes(f.type) ? f.type : 'text';
    let label = String(f.label || f.name || '').trim();
    if (!label) label = key;
    const base = { key, label, type, required: !!f.required };

    if (type === 'select' || type === 'multi_select') {
      const src = (f.selectSource === 'dictionary') ? 'dictionary' : 'options';
      base.selectSource = src;
      if (src === 'dictionary') {
        const slug = String(f.dictionarySlug || '').trim();
        base.dictionarySlug = slug || INV_DICT_SLUG.STORAGE;
        base.options = undefined;
      } else {
        base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
        base.dictionarySlug = undefined;
      }
    }

    if (type === 'number') {
      let um = f.unitMode;
      if (um !== 'dictionary' && um !== 'none' && um !== 'free') {
        um = (f.unit && String(f.unit).trim()) ? 'free' : 'none';
      }
      base.unitMode = um;
      if (um === 'dictionary') {
        const us = (f.unitSource === 'inline') ? 'inline' : 'dictionary';
        base.unitSource = us;
        if (us === 'inline') {
          base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
          base.dictionarySlug = undefined;
        } else {
          base.dictionarySlug = String(f.dictionarySlug || '').trim() || INV_DICT_SLUG.UNITS;
          base.options = undefined;
        }
        base.unit = '';
      } else if (um === 'free') {
        base.unit = f.unit != null ? String(f.unit) : '';
        base.dictionarySlug = undefined;
        base.unitSource = undefined;
        base.options = undefined;
      } else {
        base.unit = '';
        base.dictionarySlug = undefined;
        base.unitSource = undefined;
        base.options = undefined;
      }
    }

    if (type === 'composite') {
      let parts = Array.isArray(f.compositeParts) ? f.compositeParts.map(p => String(p || '').trim()).filter(Boolean) : [];
      if (parts.length < 2) {
        parts = [
          L.inv_composite_part_default1 || 'Часть 1',
          L.inv_composite_part_default2 || 'Часть 2',
        ];
      }
      base.compositeParts = parts.slice(0, 8);
      base.compositeSeparator = String(f.compositeSeparator || '-').slice(0, 3) || '-';
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
    const archBtn = t.archived
      ? `<button class="btn btn-ghost btn-sm" onclick="restoreInventoryTemplate(${t.id})">${invEsc(L.inv_btn_restore || 'Восстановить')}</button>`
      : `<button class="btn btn-ghost btn-sm" onclick="archiveInventoryTemplate(${t.id})">${invEsc(L.inv_btn_archive || 'В архив')}</button>`;
    const delBtn = `<button class="btn btn-danger btn-sm" onclick="deleteInventoryTemplate(${t.id})">${invEsc(L.btn_delete || 'Удалить')}</button>`;
    return `
      <div class="inv-template-card ${t.archived ? 'archived' : ''}" id="inv-tpl-${t.id}">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;">${invEsc(invTplName(t))}${archBadge}</div>
          <div class="meta">${invEsc(L.inv_tpl_fields_label || 'Поля')}: ${fieldList || '<em style="color:var(--text-dim);">—</em>'}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" onclick="openInventoryTemplateEdit(${t.id})">${invEsc(L.inv_btn_edit_short || 'Изм.')}</button>
          <button class="btn btn-ghost btn-sm" onclick="duplicateInventoryTemplate(${t.id})">${invEsc(L.inv_btn_duplicate_template || 'Копия')}</button>
          ${archBtn}
          ${delBtn}
        </div>
      </div>`;
  }).join('');
}

/* --- редактор шаблона --- */

let invTplEditing = null; // { id|null, name, archived, fields:[{key,label,type,options?,unit?,required?}] }

async function openInventoryTemplateCreate() {
  dismissInventoryModals('template');
  invTplEditing = {
    id: null,
    name: '',
    archived: false,
    fields: [],
  };
  await showInventoryTemplateModal();
}

async function duplicateInventoryTemplate(id) {
  const t = await dbGetInventoryTemplate(id);
  if (!t) return;
  const suffix = L.inv_tpl_copy_suffix || ' (копия)';
  const name = String(t.name || '').trim() + suffix;
  const now = invNowIso();
  const fields = invNormalizeTemplateFields(t.fields || []).map(f => ({ ...f, key: invUuid() }));
  await dbAddInventoryTemplate({
    name,
    desc: '',
    archived: false,
    fields,
    createdAt: now,
    updatedAt: now,
  });
  invToast(L.inv_toast_template_duplicated || 'Шаблон скопирован', 'success');
  invScheduleSave();
  await renderInventoryTemplatesPage();
  if (typeof currentPage !== 'undefined' && currentPage === 'inventory' && typeof renderInventoryPage === 'function') {
    await renderInventoryPage();
  }
}

async function openInventoryTemplateEdit(id) {
  dismissInventoryModals('template');
  const t = await dbGetInventoryTemplate(id);
  if (!t) return;
  const raw = (Array.isArray(t.fields) ? t.fields : []).map(f => ({ ...f, key: f.key || invUuid() }));
  const norm = invNormalizeTemplateFields(raw);
  invTplEditing = {
    id: t.id,
    name: t.name || '',
    archived: !!t.archived,
    fields: norm.map(f => ({
      ...f,
      options: Array.isArray(f.options) ? [...f.options] : [],
      compositeParts: Array.isArray(f.compositeParts) ? [...f.compositeParts] : [],
    })),
  };
  await showInventoryTemplateModal();
}

async function showInventoryTemplateModal() {
  const titleEl = document.getElementById('invTemplateModalTitle');
  if (titleEl) {
    titleEl.textContent = invTplEditing.id
      ? (L.inv_modal_template_edit_title || 'Редактирование шаблона')
      : (L.inv_modal_template_new_title  || 'Новый шаблон');
  }
  const nameEl = document.getElementById('invTemplateNameInput');
  if (nameEl) nameEl.value = invTplEditing.name || '';
  const delBtn = document.getElementById('invTemplateDeleteBtn');
  if (delBtn) delBtn.style.display = invTplEditing?.id ? '' : 'none';
  await renderInventoryTemplateFieldsList();
  document.getElementById('invTemplateModal')?.classList.add('open');
  setTimeout(() => document.getElementById('invTemplateNameInput')?.focus(), 50);
}

function closeInventoryTemplateModal() {
  document.getElementById('invTemplateModal')?.classList.remove('open');
  invTplEditing = null;
}

function invDictionarySelectHtml(selectedSlug, idx, isUnitDict) {
  const c = _invDictSelectCache;
  const order = (c && (isUnitDict ? c.slugsUnitsFirst : c.slugsStorageFirst) && (isUnitDict ? c.slugsUnitsFirst : c.slugsStorageFirst).length)
    ? (isUnitDict ? c.slugsUnitsFirst : c.slugsStorageFirst)
    : (isUnitDict ? [INV_DICT_SLUG.UNITS, INV_DICT_SLUG.STORAGE] : [INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS]);
  const def = selectedSlug || (isUnitDict ? INV_DICT_SLUG.UNITS : INV_DICT_SLUG.STORAGE);
  const labels = (c && c.labelBySlug) ? c.labelBySlug : {};
  return order.map(sl => {
    const sel = def === sl ? 'selected' : '';
    const lab = labels[sl] || invDictTitle(sl);
    return `<option value="${invEsc(sl)}" ${sel}>${invEsc(lab)}</option>`;
  }).join('');
}

async function renderInventoryTemplateFieldsList() {
  await invRefreshDictSelectCache();
  const wrap = document.getElementById('invTplFieldsList');
  if (!wrap || !invTplEditing) return;
  if (invTplEditing.fields.length === 0) {
    wrap.innerHTML = `
      <div class="inv-tpl-empty-hint">
        <div>${invEsc(L.inv_tpl_empty_editor_hint || 'Добавьте поля кнопкой ниже — название столбца, тип (текст, число, список и т.д.).')}</div>
      </div>`;
    return;
  }
  wrap.innerHTML = invTplEditing.fields.map((f, idx) => {
    const typeOpts = INV_FIELD_TYPES.map(t =>
      `<option value="${t}" ${t === f.type ? 'selected' : ''}>${invEsc(invFieldTypeLabel(t))}</option>`
    ).join('');

    let extraBlocks = '';
    if (f.type === 'select' || f.type === 'multi_select') {
      const src = (f.selectSource === 'dictionary') ? 'dictionary' : 'options';
      extraBlocks = `
        <div class="field-row-options">
          <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_select_source || 'Источник значений')}</label>
          <select class="form-select" onchange="onInventoryTemplateSelectSource(${idx}, this.value)">
            <option value="options" ${src === 'options' ? 'selected' : ''}>${invEsc(L.inv_field_source_options || 'Свой список')}</option>
            <option value="dictionary" ${src === 'dictionary' ? 'selected' : ''}>${invEsc(L.inv_field_source_dictionary || 'Справочник')}</option>
          </select>
        </div>`;
      if (src === 'dictionary') {
        extraBlocks += `
          <div class="field-row-options">
            <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_dictionary_pick || 'Справочник')}</label>
            <select class="form-select" onchange="onInventoryTemplateFieldDictionary(${idx}, this.value)">
              ${invDictionarySelectHtml(f.dictionarySlug, idx, false)}
            </select>
          </div>`;
      } else {
        extraBlocks += `
          <div class="field-row-options">
            <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_options_label || 'Варианты (через запятую)')}</label>
            <input type="text" class="form-input" value="${invEsc((f.options || []).join(', '))}"
                   oninput="onInventoryTemplateFieldOptions(${idx}, this.value)">
          </div>`;
      }
    }

    let unitBlock = '<span></span>';
    if (f.type === 'number') {
      const um = f.unitMode || 'free';
      extraBlocks += `
        <div class="field-row-options">
          <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_unit_mode || 'Единица измерения')}</label>
          <select class="form-select" onchange="onInventoryTemplateUnitMode(${idx}, this.value)">
            <option value="none" ${um === 'none' ? 'selected' : ''}>${invEsc(L.inv_field_unit_none || 'Нет')}</option>
            <option value="free" ${um === 'free' ? 'selected' : ''}>${invEsc(L.inv_field_unit_free || 'Своя подпись')}</option>
            <option value="dictionary" ${um === 'dictionary' ? 'selected' : ''}>${invEsc(L.inv_field_unit_dictionary || 'Из справочника')}</option>
          </select>
        </div>`;
      if (um === 'free') {
        unitBlock = `<input type="text" class="form-input" placeholder="${invEsc(L.inv_field_unit_placeholder || 'ед.')}"
                  value="${invEsc(f.unit || '')}" oninput="onInventoryTemplateFieldUnit(${idx}, this.value)">`;
      } else if (um === 'dictionary') {
        const uSrc = (f.unitSource === 'inline') ? 'inline' : 'dictionary';
        extraBlocks += `
        <div class="field-row-options">
          <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_unit_value_source || 'Источник единиц')}</label>
          <select class="form-select" onchange="onInventoryTemplateUnitSource(${idx}, this.value)">
            <option value="dictionary" ${uSrc === 'dictionary' ? 'selected' : ''}>${invEsc(L.inv_field_source_dictionary || 'Справочник')}</option>
            <option value="inline" ${uSrc === 'inline' ? 'selected' : ''}>${invEsc(L.inv_field_source_options || 'Свой список')}</option>
          </select>
        </div>`;
        if (uSrc === 'dictionary') {
          extraBlocks += `
          <div class="field-row-options">
            <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_dictionary_pick || 'Справочник')}</label>
            <select class="form-select" onchange="onInventoryTemplateFieldDictionary(${idx}, this.value)">
              ${invDictionarySelectHtml(f.dictionarySlug, idx, true)}
            </select>
          </div>`;
        } else {
          extraBlocks += `
          <div class="field-row-options">
            <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_unit_options_label || L.inv_field_options_label || 'Единицы (через запятую)')}</label>
            <input type="text" class="form-input" value="${invEsc((f.options || []).join(', '))}"
                   oninput="onInventoryTemplateFieldOptions(${idx}, this.value)">
          </div>`;
        }
      }
    }

    if (f.type === 'composite') {
      const parts = Array.isArray(f.compositeParts) ? f.compositeParts : [];
      const partRows = parts.map((p, pi) => `
        <div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
          <input type="text" class="form-input" style="flex:1" value="${invEsc(p)}"
                 oninput="onInventoryTemplateCompositePartLabel(${idx}, ${pi}, this.value)">
          <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="removeInventoryTemplateCompositePart(${idx}, ${pi})" title="${invEsc(L.inv_composite_remove_part || 'Убрать')}">🗑</button>
        </div>`).join('');
      extraBlocks += `
        <div class="field-row-options">
          <label class="form-label" style="font-size:11px;">${invEsc(L.inv_field_composite_sep || 'Разделитель частей')}</label>
          <input type="text" class="form-input" style="max-width:80px" value="${invEsc(f.compositeSeparator || '-')}"
                 oninput="onInventoryTemplateCompositeSep(${idx}, this.value)">
          <div style="margin-top:8px;font-size:11px;color:var(--text-dim);">${invEsc(L.inv_field_composite_parts || 'Подписи частей номера')}</div>
          ${partRows}
          <button type="button" class="add-part-btn" style="margin-top:6px" onclick="addInventoryTemplateCompositePart(${idx})">
            + ${invEsc(L.inv_composite_add_part || 'часть')}
          </button>
        </div>`;
    }

    return `
      <div class="inv-field-row">
        <input type="text" class="form-input" placeholder="${invEsc(L.inv_field_label_placeholder || 'Название поля')}"
               value="${invEsc(f.label)}" oninput="onInventoryTemplateFieldLabel(${idx}, this.value)">
        <select class="form-select" onchange="onInventoryTemplateFieldType(${idx}, this.value)">${typeOpts}</select>
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
        ${extraBlocks}
      </div>`;
  }).join('');
}

async function addInventoryTemplateField() {
  if (!invTplEditing) return;
  invTplEditing.fields.push({
    key: invUuid(),
    label: '',
    type: 'text',
    required: false,
    options: [],
    selectSource: 'options',
    dictionarySlug: INV_DICT_SLUG.STORAGE,
    unit: '',
    unitMode: 'free',
    unitSource: 'dictionary',
    compositeParts: [L.inv_composite_part_default1 || 'Часть 1', L.inv_composite_part_default2 || 'Часть 2'],
    compositeSeparator: '-',
  });
  await renderInventoryTemplateFieldsList();
}
async function removeInventoryTemplateField(idx) {
  if (!invTplEditing) return;
  if (!invConfirm(L.inv_confirm_remove_field || 'Удалить это поле?')) return;
  invTplEditing.fields.splice(idx, 1);
  await renderInventoryTemplateFieldsList();
}
async function moveInventoryTemplateField(idx, delta) {
  if (!invTplEditing) return;
  const j = idx + delta;
  if (j < 0 || j >= invTplEditing.fields.length) return;
  const arr = invTplEditing.fields;
  [arr[idx], arr[j]] = [arr[j], arr[idx]];
  await renderInventoryTemplateFieldsList();
}
function onInventoryTemplateFieldLabel(idx, v)    { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].label = v; }
async function onInventoryTemplateFieldType(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  const f = invTplEditing.fields[idx];
  f.type = v;
  if (v === 'select' || v === 'multi_select') {
    if (!f.selectSource) f.selectSource = 'options';
    f.dictionarySlug = f.dictionarySlug || INV_DICT_SLUG.STORAGE;
  }
  if (v === 'number') {
    if (!['none', 'free', 'dictionary'].includes(f.unitMode)) f.unitMode = 'free';
    if (f.unitMode === 'dictionary') {
      f.dictionarySlug = f.dictionarySlug || INV_DICT_SLUG.UNITS;
      if (f.unitSource !== 'inline') f.unitSource = 'dictionary';
    }
  }
  if (v === 'composite') {
    if (!Array.isArray(f.compositeParts) || f.compositeParts.length < 2) {
      f.compositeParts = [L.inv_composite_part_default1 || 'Часть 1', L.inv_composite_part_default2 || 'Часть 2'];
    }
    f.compositeSeparator = f.compositeSeparator || '-';
  }
  await renderInventoryTemplateFieldsList();
}
function onInventoryTemplateFieldUnit(idx, v)     { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].unit = v; }
function onInventoryTemplateFieldRequired(idx, v) { if (invTplEditing?.fields[idx]) invTplEditing.fields[idx].required = !!v; }
function onInventoryTemplateFieldOptions(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  invTplEditing.fields[idx].options = String(v || '').split(',').map(s => s.trim()).filter(Boolean);
}
async function onInventoryTemplateSelectSource(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  invTplEditing.fields[idx].selectSource = v === 'dictionary' ? 'dictionary' : 'options';
  await renderInventoryTemplateFieldsList();
}
function onInventoryTemplateFieldDictionary(idx, slug) {
  if (!invTplEditing?.fields[idx]) return;
  invTplEditing.fields[idx].dictionarySlug = slug;
}
async function onInventoryTemplateUnitMode(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  const f = invTplEditing.fields[idx];
  f.unitMode = v;
  if (v === 'dictionary') {
    f.dictionarySlug = f.dictionarySlug || INV_DICT_SLUG.UNITS;
    f.unit = '';
    if (f.unitSource !== 'inline') f.unitSource = 'dictionary';
  } else {
    f.unitSource = undefined;
    f.dictionarySlug = undefined;
    f.options = [];
  }
  await renderInventoryTemplateFieldsList();
}

async function onInventoryTemplateUnitSource(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  const f = invTplEditing.fields[idx];
  f.unitSource = v === 'inline' ? 'inline' : 'dictionary';
  if (f.unitSource === 'dictionary') {
    f.dictionarySlug = f.dictionarySlug || INV_DICT_SLUG.UNITS;
    f.options = [];
  } else {
    f.dictionarySlug = undefined;
    if (!Array.isArray(f.options)) f.options = [];
  }
  await renderInventoryTemplateFieldsList();
}
function onInventoryTemplateCompositeSep(idx, v) {
  if (!invTplEditing?.fields[idx]) return;
  invTplEditing.fields[idx].compositeSeparator = String(v || '-').slice(0, 3) || '-';
}
function onInventoryTemplateCompositePartLabel(idx, partIdx, v) {
  if (!invTplEditing?.fields[idx]?.compositeParts) return;
  invTplEditing.fields[idx].compositeParts[partIdx] = v;
}
async function addInventoryTemplateCompositePart(idx) {
  if (!invTplEditing?.fields[idx]) return;
  const parts = invTplEditing.fields[idx].compositeParts || [];
  if (parts.length >= 8) return;
  parts.push(`${L.inv_composite_part_default_short || 'Часть'} ${parts.length + 1}`);
  invTplEditing.fields[idx].compositeParts = parts;
  await renderInventoryTemplateFieldsList();
}
async function removeInventoryTemplateCompositePart(idx, partIdx) {
  if (!invTplEditing?.fields[idx]?.compositeParts) return;
  const parts = invTplEditing.fields[idx].compositeParts;
  if (parts.length <= 2) return;
  parts.splice(partIdx, 1);
  await renderInventoryTemplateFieldsList();
}

async function saveInventoryTemplateModal() {
  if (!invTplEditing) return;
  const name = (document.getElementById('invTemplateNameInput')?.value || '').trim();
  const desc = '';
  if (!name) { invToast(L.inv_err_template_name_required || 'Укажите название шаблона', 'error'); return; }
  const fields = (invTplEditing.fields || []).filter(f => (f.label || '').trim());
  const cleanFields = invNormalizeTemplateFields(fields);

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

/**
 * Удалить шаблон и все связанные описи с позициями. Возвращает true, если удаление выполнено.
 */
async function deleteInventoryTemplate(id) {
  const tid = parseInt(id, 10);
  if (!tid) return false;
  const t = await dbGetInventoryTemplate(tid);
  if (!t) return false;
  const name = invTplName(t);
  const all = await dbGetAllInventoryRecords();
  const related = all.filter(r => r.templateId === tid);
  const n = related.length;
  let msg;
  if (n > 0) {
    msg = (L.inv_confirm_delete_template_cascade || 'Удалить шаблон «{name}» и все описи по нему ({n} шт.) вместе с позициями? Это необратимо.')
      .replace(/\{name\}/g, name).replace(/\{n\}/g, String(n));
  } else {
    msg = (L.inv_confirm_delete_template || 'Удалить шаблон «{name}»?').replace(/\{name\}/g, name);
  }
  if (!invConfirm(msg)) return false;
  for (const r of related) {
    await dbDeleteInventoryRecord(r.id);
  }
  await dbDeleteInventoryTemplate(tid);
  invToast(L.inv_toast_template_deleted || 'Шаблон удалён', 'success');
  invScheduleSave();
  await renderInventoryTemplatesPage();
  if (typeof currentPage !== 'undefined' && currentPage === 'inventory' && typeof renderInventoryPage === 'function') {
    await renderInventoryPage();
  }
  const detail = document.getElementById('inventoryRecordDetail');
  if (detail && detail.dataset.recId) {
    const rid = parseInt(detail.dataset.recId, 10);
    if (related.some(r => r.id === rid)) {
      detail.classList.add('hidden');
      delete detail.dataset.recId;
    }
  }
  return true;
}

async function deleteInventoryTemplateFromModal() {
  if (!invTplEditing?.id) return;
  const ok = await deleteInventoryTemplate(invTplEditing.id);
  if (ok) closeInventoryTemplateModal();
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
  dismissInventoryModals('recordCreate');
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
      desc: '',
      fields: invNormalizeTemplateFields((tpl.fields || []).map(f => ({ ...f, key: f.key || invUuid() }))),
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

  const headers = fields.map(f => {
    let suf = '';
    if (f.type === 'number' && f.unitMode === 'free' && f.unit) {
      suf = ` <span style="color:var(--text-dim);">(${invEsc(f.unit)})</span>`;
    } else if (f.type === 'number' && f.unitMode === 'dictionary') {
      suf = ` <span style="color:var(--text-dim);">(${invEsc(L.inv_field_unit_dictionary_short || 'ед.')})</span>`;
    }
    return `<th>${invEsc(f.label)}${suf}</th>`;
  }).join('');
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
              <button class="btn btn-ghost btn-sm" onclick="duplicateInventoryItem(${rec.id}, '${invEsc(it.id)}')">${invEsc(L.inv_btn_duplicate_item || 'Копия')}</button>
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
  if (field.type === 'boolean') {
    if (raw === undefined || raw === null || raw === '') return '';
    return raw ? (L.inv_yes || 'Да') : (L.inv_no || 'Нет');
  }
  if (field.type === 'date') {
    if (raw === undefined || raw === null || raw === '') return '';
    return invFormatDate(raw);
  }
  if (field.type === 'number') {
    if (field.unitMode === 'dictionary') {
      if (raw && typeof raw === 'object' && 'amount' in raw) {
        const a = raw.amount;
        const u = raw.unit || '';
        if ((a == null || a === '') && !u) return '';
        return [String(a ?? ''), u].filter(Boolean).join(' ').trim();
      }
      if (typeof raw === 'number') return String(raw);
      return raw != null && raw !== '' ? String(raw) : '';
    }
    if (raw === undefined || raw === null || raw === '') return '';
    const u = field.unitMode === 'free' && field.unit ? String(field.unit) : '';
    const num = String(raw);
    return u ? `${num} ${u}`.trim() : num;
  }
  if (field.type === 'multi_select') {
    if (!Array.isArray(raw) || raw.length === 0) return '';
    return raw.map(String).join(', ');
  }
  if (field.type === 'composite') {
    return invCompositeDisplay(field, raw);
  }
  if (raw === undefined || raw === null || raw === '') return '';
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

/** Закрыть прочие модалки инвентаризации, чтобы оверлеи не перекрывали друг друга (иначе «поля не кликаются»). */
function dismissInventoryModals(keep) {
  if (keep !== 'template') {
    document.getElementById('invTemplateModal')?.classList.remove('open');
    invTplEditing = null;
  }
  if (keep !== 'item') {
    document.getElementById('invItemModal')?.classList.remove('open');
    invItemEditing = null;
  }
  if (keep !== 'recordCreate') {
    document.getElementById('invRecordCreateModal')?.classList.remove('open');
  }
}

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
  await showInventoryItemModal(rec, true);
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
    else if (f.type === 'composite') {
      values[f.key] = invCompositeToArray(f, values[f.key]);
    } else if (f.type === 'multi_select' && !Array.isArray(values[f.key])) {
      values[f.key] = [];
    } else if (f.type === 'number' && f.unitMode === 'dictionary') {
      const v = values[f.key];
      if (v == null || typeof v !== 'object' || Array.isArray(v)) {
        values[f.key] = { amount: (typeof v === 'number') ? v : null, unit: '' };
      }
    }
  });
  invItemEditing = {
    recordId,
    itemId: it.id,
    values,
    _origValues: diskVals,
  };
  await showInventoryItemModal(rec, false);
}

async function showInventoryItemModal(rec, isNew) {
  dismissInventoryModals('item');
  const titleEl = document.getElementById('invItemModalTitle');
  if (titleEl) titleEl.textContent = isNew
    ? (L.inv_modal_item_add_title  || 'Новая позиция')
    : (L.inv_modal_item_edit_title || 'Редактирование позиции');

  const body = document.getElementById('invItemFormBody');
  const fields = invGetRecordFields(rec);
  const dictMap = await invLoadDictionariesMap();
  body.innerHTML = `<div class="form-grid">${fields.map(f => renderInventoryItemFieldInput(f, dictMap)).join('')}</div>`;
  document.getElementById('invItemModal')?.classList.add('open');
  setTimeout(() => body.querySelector('input,select,textarea')?.focus(), 50);
}

function renderInventoryItemFieldInput(field, dictMap) {
  const id = `invItemFld_${field.key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const val = invItemEditing?.values?.[field.key];
  const req = field.required ? '<span class="required"> *</span>' : '';
  let labelExtra = '';
  if (field.type === 'number' && field.unitMode === 'free' && field.unit) {
    labelExtra = ` <span style="color:var(--text-dim);">(${invEsc(field.unit)})</span>`;
  } else if (field.type === 'number' && field.unitMode === 'dictionary') {
    labelExtra = ` <span style="color:var(--text-dim);">(${invEsc(L.inv_dict_title_units || 'ед.')})</span>`;
  }
  const labelHtml = `<span>${invEsc(field.label)}${labelExtra}</span>${req}`;
  let inputHtml;
  switch (field.type) {
    case 'number':
      if (field.unitMode === 'dictionary') {
        const o = (val && typeof val === 'object' && !Array.isArray(val)) ? val : { amount: null, unit: '' };
        const opts = ['<option value=""></option>'].concat(
          invFieldOptionList(field, dictMap).map(u =>
            `<option value="${invEsc(u)}" ${String(o.unit || '') === String(u) ? 'selected' : ''}>${invEsc(u)}</option>`)
        ).join('');
        inputHtml = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="number" step="any" class="form-input" style="min-width:120px;flex:1" id="${id}"
            value="${o.amount == null ? '' : invEsc(o.amount)}"
            data-inv-key="${invEsc(field.key)}"
            oninput="onInventoryItemNumDictAmount(this.dataset.invKey, this.value)">
          <select class="form-select" style="min-width:140px;flex:1" data-inv-key="${invEsc(field.key)}"
            onchange="onInventoryItemNumDictUnit(this.dataset.invKey, this.value)">${opts}</select>
        </div>`;
      } else {
        inputHtml = `<input type="number" step="any" class="form-input" id="${id}" value="${val == null ? '' : invEsc(val)}"
                          data-inv-key="${invEsc(field.key)}"
                          oninput="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'number')">`;
      }
      break;
    case 'select': {
      const list = invFieldOptionList(field, dictMap);
      if (list.length === 0) {
        inputHtml = `<div style="color:var(--text-dim);font-size:12px;">${invEsc(L.inv_field_no_options || 'Нет вариантов. Укажите список в шаблоне или заполните справочник.')}</div>`;
      } else {
        const opts = ['<option value=""></option>'].concat(
          list.map(o => `<option value="${invEsc(o)}" ${String(val || '') === String(o) ? 'selected' : ''}>${invEsc(o)}</option>`)
        ).join('');
        inputHtml = `<select class="form-select" id="${id}" data-inv-key="${invEsc(field.key)}"
                            onchange="onInventoryItemFieldChange(this.dataset.invKey, this.value, 'select')">${opts}</select>`;
      }
      break;
    }
    case 'multi_select': {
      const list = invFieldOptionList(field, dictMap);
      const sel = Array.isArray(val) ? val.map(String) : [];
      if (list.length === 0) {
        inputHtml = `<div style="color:var(--text-dim);font-size:12px;">${invEsc(L.inv_field_no_options || 'Нет вариантов. Укажите список в шаблоне или заполните справочник.')}</div>`;
        break;
      }
      inputHtml = `<div class="inv-multi-wrap">${list.map(o => {
        const ck = sel.includes(String(o)) ? 'checked' : '';
        return `<label class="checkbox-row" style="display:flex;margin:4px 0;">
          <input type="checkbox" ${ck} data-inv-key="${invEsc(field.key)}" data-opt="${invEsc(o)}"
            onchange="onInventoryItemMultiToggleEl(this)">
          <span>${invEsc(o)}</span>
        </label>`;
      }).join('')}</div>`;
      break;
    }
    case 'composite': {
      const parts = field.compositeParts || [];
      const arr = invCompositeToArray(field, val);
      inputHtml = `<div class="inv-composite-inputs" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">${parts.map((pl, pi) => `
        <div style="flex:1;min-width:72px;">
          <div style="font-size:10px;color:var(--text-dim);margin-bottom:2px;">${invEsc(pl)}</div>
          <input type="text" class="form-input" value="${invEsc(arr[pi] || '')}"
            data-inv-key="${invEsc(field.key)}"
            oninput="onInventoryItemCompositePartChange(this.dataset.invKey, ${pi}, this.value)">
        </div>`).join('')}</div>`;
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

function onInventoryItemNumDictAmount(key, raw) {
  if (!invItemEditing) return;
  let o = invItemEditing.values[key];
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = { amount: null, unit: '' };
  if (raw === '' || raw == null) o.amount = null;
  else {
    const n = Number(raw);
    o.amount = Number.isFinite(n) ? n : null;
  }
  invItemEditing.values[key] = { ...o };
}
function onInventoryItemNumDictUnit(key, raw) {
  if (!invItemEditing) return;
  let o = invItemEditing.values[key];
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = { amount: null, unit: '' };
  o.unit = raw;
  invItemEditing.values[key] = { ...o };
}
function onInventoryItemCompositePartChange(key, partIdx, raw) {
  if (!invItemEditing) return;
  let arr = invItemEditing.values[key];
  if (!Array.isArray(arr)) arr = [];
  arr = arr.slice();
  while (arr.length <= partIdx) arr.push('');
  arr[partIdx] = raw;
  invItemEditing.values[key] = arr;
}
function onInventoryItemMultiToggle(key, opt, checked) {
  if (!invItemEditing) return;
  let arr = Array.isArray(invItemEditing.values[key]) ? invItemEditing.values[key].map(String) : [];
  const s = String(opt);
  if (checked) { if (!arr.includes(s)) arr.push(s); }
  else arr = arr.filter(x => x !== s);
  invItemEditing.values[key] = arr;
}
function onInventoryItemMultiToggleEl(el) {
  if (!el || !el.dataset) return;
  onInventoryItemMultiToggle(el.dataset.invKey, el.dataset.opt, el.checked);
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

function invValueFingerprint(f, v) {
  if (f.type === 'composite' || f.type === 'multi_select') return JSON.stringify(v ?? null);
  if (f.type === 'number' && f.unitMode === 'dictionary') return JSON.stringify(v ?? null);
  return String(v ?? '');
}

async function saveInventoryItemModal() {
  if (!invItemEditing) return;
  const rec = await dbGetInventoryRecord(invItemEditing.recordId);
  if (!rec) { closeInventoryItemModal(); return; }
  const fields = invGetRecordFields(rec);

  for (const f of fields) {
    if (f.type === 'composite') {
      invItemEditing.values[f.key] = invCompositeToArray(f, invItemEditing.values[f.key]);
    }
  }

  for (const f of fields) {
    if (!f.required) continue;
    const v = invItemEditing.values[f.key];
    if (invIsEmptyValue(f, v)) {
      invToast((L.inv_err_field_required || 'Обязательное поле:') + ' ' + f.label, 'error');
      return;
    }
  }

  const isEdit = invItemEditing.itemId != null;
  if (isEdit) {
    const sensitiveChange = fields.some(f => {
      if (!['number', 'text', 'composite', 'multi_select'].includes(f.type)) return false;
      if (!Object.prototype.hasOwnProperty.call(invItemEditing._origValues, f.key)) return false;
      const oldV = invItemEditing._origValues[f.key];
      const newV = invItemEditing.values[f.key];
      return invValueFingerprint(f, oldV) !== invValueFingerprint(f, newV);
    });
    if (sensitiveChange) {
      if (!invConfirm(L.inv_confirm_edit_item || 'Сохранить изменения позиции?')) return;
    }
  }

  const outVals = invDeepClone(invItemEditing.values);
  const items = Array.isArray(rec.items) ? rec.items.slice() : [];
  if (isEdit) {
    const idx = items.findIndex(x => String(x.id) === String(invItemEditing.itemId));
    if (idx >= 0) {
      items[idx] = { ...items[idx], values: outVals, updatedAt: invNowIso() };
    }
  } else {
    items.push({
      id: invUuid(),
      values: outVals,
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

async function duplicateInventoryItem(recordId, itemId) {
  const rec = await dbGetInventoryRecord(recordId);
  if (!rec) return;
  const it = (rec.items || []).find(x => String(x.id) === String(itemId));
  if (!it) return;
  const copy = {
    id: invUuid(),
    values: invDeepClone(it.values || {}),
    createdAt: invNowIso(),
    updatedAt: invNowIso(),
  };
  rec.items = [...(rec.items || []), copy];
  rec.updatedAt = invNowIso();
  await dbPutInventoryRecord(rec);
  invToast(L.inv_toast_item_duplicated || 'Позиция скопирована', 'success');
  invScheduleSave();
  await renderInventoryRecordDetail(recordId);
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

  const headers = fields.map(f => {
    let suf = '';
    if (f.type === 'number' && f.unitMode === 'free' && f.unit) suf = ` (${invEsc(f.unit)})`;
    else if (f.type === 'number' && f.unitMode === 'dictionary') suf = ` (${invEsc(L.inv_field_unit_dictionary_short || 'ед.')})`;
    return `<th>${invEsc(f.label)}${suf}</th>`;
  }).join('');
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
   СПРАВОЧНИКИ (места хранения, единицы)
   ============================================================ */
const INV_DEFAULT_DICTIONARIES = [
  { slug: INV_DICT_SLUG.STORAGE, values: [] },
  { slug: INV_DICT_SLUG.UNITS, values: ['шт', 'кг', 'л', 'м', 'м²', 'упак.'] },
];

async function ensureInventoryDictionaries() {
  try {
    for (const def of INV_DEFAULT_DICTIONARIES) {
      const existing = await dbGetDictionary(def.slug);
      if (existing && Array.isArray(existing.values)) continue;
      await dbPutDictionary({
        slug: def.slug,
        values: def.values.slice(),
        updatedAt: invNowIso(),
      });
    }
    invScheduleSave();
  } catch (e) {
    console.error('[ensureInventoryDictionaries]', e);
  }
}

function invDictCardHtml(slug, titleRowHtml, isSystem) {
  return `
    <div class="inv-dict-card" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md,8px);">
      ${titleRowHtml}
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">${invEsc(L.inv_dict_one_per_line || 'Одна строка — одно значение')}</div>
      <textarea class="form-textarea" id="dict-edit-${slug}" rows="8" style="font-family:monospace;font-size:13px;width:100%;box-sizing:border-box;"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center;">
        <button type="button" class="btn btn-primary btn-sm" onclick="saveInventoryDictionary('${slug}')">${invEsc(L.btn_save || 'Сохранить')}</button>
        ${isSystem ? '' : `<button type="button" class="btn btn-danger btn-sm" onclick="deleteInventoryDictionary('${slug}')">${invEsc(L.inv_dict_delete || 'Удалить')}</button>`}
      </div>
    </div>`;
}

async function renderDictionariesPage() {
  const root = document.getElementById('dictionariesList');
  if (!root) return;
  await ensureInventoryDictionaries();
  const all = await dbGetAllDictionaries();
  const bySlug = new Map((all || []).filter(d => d && d.slug).map(d => [d.slug, d]));
  const customSlugs = (all || []).map(d => d && d.slug).filter(s => s && !INV_DICT_SYSTEM_SLUGS.has(s))
    .sort((a, b) => {
      const ta = invDictResolvedLabel(bySlug.get(a) || { slug: a });
      const tb = invDictResolvedLabel(bySlug.get(b) || { slug: b });
      return String(ta).localeCompare(String(tb), undefined, { sensitivity: 'base' });
    });

  const systemHtml = [INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS].map(slug => {
    const titleRow = `
      <div style="font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span>${invEsc(invDictTitle(slug))}</span>
        <span style="font-size:10px;font-weight:500;color:var(--text-dim);">(${invEsc(L.inv_dict_system_badge || 'встроенный')})</span>
      </div>`;
    return invDictCardHtml(slug, titleRow, true);
  }).join('');

  const customHtml = customSlugs.map(slug => {
    const d = bySlug.get(slug);
    const disp = invDictResolvedLabel(d || { slug });
    const titleRow = `
      <div style="margin-bottom:8px;">
        <label class="form-label" style="font-size:11px;">${invEsc(L.inv_dict_title_label || 'Название в списках')}</label>
        <input type="text" class="form-input" id="dict-title-${slug}" value="${invEsc(d && d.title != null ? String(d.title) : disp)}" style="width:100%;box-sizing:border-box;">
        <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">${invEsc(L.inv_dict_slug_label || 'Код')}: <code>${invEsc(slug)}</code></div>
      </div>`;
    return invDictCardHtml(slug, titleRow, false);
  }).join('');

  root.innerHTML = `
    <div style="margin-bottom:14px;">
      <button type="button" class="btn btn-primary btn-sm" onclick="createInventoryDictionaryFromUi()">${invEsc(L.inv_dict_btn_new || '+ Новый справочник')}</button>
      <div style="font-size:12px;color:var(--text-dim);margin-top:8px;max-width:52rem;line-height:1.4;">${invEsc(L.dict_page_hint_custom || '')}</div>
    </div>
    ${systemHtml}
    ${customHtml || ''}`;

  for (const slug of [INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS, ...customSlugs]) {
    const d = bySlug.get(slug) || await dbGetDictionary(slug);
    const ta = document.getElementById('dict-edit-' + slug);
    if (ta) ta.value = (d && Array.isArray(d.values)) ? d.values.join('\n') : '';
  }
  _invDictSelectCache = null;
}

async function createInventoryDictionaryFromUi() {
  const raw = prompt(L.inv_dict_new_name_prompt || 'Название справочника:', '');
  if (raw == null) return;
  const title = String(raw).trim();
  if (!title) return;
  let slug = 'd_' + Math.random().toString(36).slice(2, 11);
  for (let n = 0; n < 20 && await dbGetDictionary(slug); n++) {
    slug = 'd_' + Math.random().toString(36).slice(2, 11);
  }
  await dbPutDictionary({ slug, title, values: [], updatedAt: invNowIso() });
  invToast(L.inv_toast_dictionary_created || 'Справочник создан', 'success');
  invScheduleSave();
  _invDictSelectCache = null;
  await renderDictionariesPage();
}

async function deleteInventoryDictionary(slug) {
  if (!slug || INV_DICT_SYSTEM_SLUGS.has(slug)) return;
  if (!invConfirm(L.inv_dict_confirm_delete || 'Удалить этот справочник?')) return;
  await dbDeleteDictionary(slug);
  invToast(L.inv_toast_dictionary_deleted || 'Справочник удалён', 'success');
  invScheduleSave();
  _invDictSelectCache = null;
  await renderDictionariesPage();
}

async function saveInventoryDictionary(slug) {
  const ta = document.getElementById('dict-edit-' + slug);
  if (!ta) return;
  const values = ta.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const uniq = [...new Set(values)];
  const payload = { slug, values: uniq, updatedAt: invNowIso() };
  if (!INV_DICT_SYSTEM_SLUGS.has(slug)) {
    const titleEl = document.getElementById('dict-title-' + slug);
    const t = (titleEl && String(titleEl.value || '').trim()) ? String(titleEl.value).trim() : '';
    const prev = await dbGetDictionary(slug);
    payload.title = t || (prev && prev.title) || slug;
  }
  await dbPutDictionary(payload);
  invToast(L.inv_toast_dictionary_saved || 'Справочник сохранён', 'success');
  invScheduleSave();
  _invDictSelectCache = null;
}

// Инициализация: дождаться готовности IndexedDB (db задаётся в db.js initDB) и засеять справочники по умолчанию при отсутствии
function _invWaitForDbAndSeed(triesLeft) {
  if (typeof db !== 'undefined' && db) {
    ensureInventoryDictionaries();
    return;
  }
  if (triesLeft <= 0) return;
  setTimeout(() => _invWaitForDbAndSeed(triesLeft - 1), 250);
}
document.addEventListener('DOMContentLoaded', () => { _invWaitForDbAndSeed(40); });
