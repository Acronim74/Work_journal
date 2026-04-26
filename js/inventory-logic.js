/* ============================================================
   inventory-logic.js — чистая логика инвентаризации (без DOM/IndexedDB).
   Подключается до inventory.js. Нужен глобальный L (i18n) в браузере.
   ============================================================ */

const INV_FIELD_TYPES = ['text', 'number', 'select', 'date', 'boolean', 'multi_select', 'composite'];

const INV_DICT_SLUG = { STORAGE: 'storageLocations', UNITS: 'units' };
const INV_DICT_SYSTEM_SLUGS = new Set([INV_DICT_SLUG.STORAGE, INV_DICT_SLUG.UNITS]);

function invUuid() {
  return 'f_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
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
  const i18n = (typeof L !== 'undefined' && L) ? L : {};
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
          i18n.inv_composite_part_default1 || 'Часть 1',
          i18n.inv_composite_part_default2 || 'Часть 2',
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

function invValueFingerprint(field, v) {
  if (field.type === 'composite' || field.type === 'multi_select') return JSON.stringify(v ?? null);
  if (field.type === 'number' && field.unitMode === 'dictionary') return JSON.stringify(v ?? null);
  return String(v ?? '');
}
