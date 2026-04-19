/* ============================================================
   report.js — report generation & print
   ============================================================ */

/* ============================================================
   PERIOD PRESETS
   ============================================================ */
function getPresetDates(preset) {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  const d     = now.getDate();

  const iso = (date) => date.toISOString().split('T')[0];

  switch (preset) {
    case 'week': {
      const day  = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
      const mon  = new Date(y, m, d - day);
      const sun  = new Date(y, m, d - day + 6);
      return { from: iso(mon), to: iso(sun) };
    }
    case 'month':
      return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) };
    case 'quarter': {
      const qStart = Math.floor(m / 3) * 3;
      return { from: iso(new Date(y, qStart, 1)), to: iso(new Date(y, qStart + 3, 0)) };
    }
    case 'year':
      return { from: iso(new Date(y, 0, 1)), to: iso(new Date(y, 11, 31)) };
    default:
      return null;
  }
}

function applyPreset(preset) {
  const dates = getPresetDates(preset);
  if (!dates) return;

  document.getElementById('rDateFrom').value = dates.from;
  document.getElementById('rDateTo').value   = dates.to;

  // Highlight active preset btn
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === preset);
  });
  renderReportPreview();
}

/* ============================================================
   REPORT TYPE (journal / issues / plans)
   ============================================================ */
function getReportType() {
  const tab = document.querySelector('.report-type-tab.active');
  return tab ? tab.dataset.reportType : 'journal';
}

function setReportType(type) {
  document.querySelectorAll('.report-type-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.reportType === type);
  });
  renderReportPreview();
}

/* ============================================================
   FILTER & COLLECT
   ============================================================ */
function getReportPeriodOrNull() {
  const from = document.getElementById('rDateFrom').value;
  const to   = document.getElementById('rDateTo').value;
  if (!from || !to) return null;
  return { from, to };
}

function collectReportEntries() {
  const period = getReportPeriodOrNull();
  if (!period) return null;

  const catVal = document.getElementById('rCatFilter').value;
  let entries = allEntries.filter(e => e.date >= period.from && e.date <= period.to);
  if (catVal) entries = entries.filter(e => e.category === catVal);

  entries.sort((a, b) => a.date.localeCompare(b.date));
  return { entries, from: period.from, to: period.to };
}

function planRangeEnd(p) {
  if (!p || !p.datePlanned) return '';
  const e = p.datePlannedEnd && p.datePlannedEnd.length && p.datePlannedEnd >= p.datePlanned
    ? p.datePlannedEnd
    : p.datePlanned;
  return e;
}

function planOverlapsPeriod(p, from, to) {
  if (!p.datePlanned) return false;
  const start = p.datePlanned;
  const end   = planRangeEnd(p);
  return !(end < from || start > to);
}

function formatPlanPeriodHuman(p) {
  if (!p.datePlanned) return '—';
  const [y1, m1, d1] = p.datePlanned.split('-');
  const a = L.formatDate(y1, m1, d1);
  const endRaw = p.datePlannedEnd && p.datePlannedEnd.length ? p.datePlannedEnd : null;
  const end = endRaw && endRaw !== p.datePlanned ? endRaw : null;
  if (!end) return a;
  const [y2, m2, d2] = end.split('-');
  return `${a} — ${L.formatDate(y2, m2, d2)}`;
}

/* ============================================================
   PREVIEW (live, in-page)
   ============================================================ */
function reportPreviewNoPeriod() {
  const container = document.getElementById('reportPreview');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div class="empty-state-title">${esc(L.report_period_label)}</div>
      <div class="empty-state-text">${esc(L.report_period_custom)}</div>
    </div>`;
  document.getElementById('reportPrintBtn').disabled = true;
}

async function renderReportPreview() {
  const type = getReportType();
  if (type === 'journal') return renderJournalReportPreview();
  if (type === 'issues') return renderIssuesReportPreview();
  if (type === 'plans')  return renderPlansReportPreview();
}

function renderJournalReportPreview() {
  const period = getReportPeriodOrNull();
  const container = document.getElementById('reportPreview');
  if (!period) { reportPreviewNoPeriod(); return; }

  const result = collectReportEntries();
  if (!result) { reportPreviewNoPeriod(); return; }

  const { entries, from, to } = result;
  const fromFmt = fmtDateStr(from);
  const toFmt   = fmtDateStr(to);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <div class="empty-state-title">${esc(L.empty_report_title)}</div>
        <div class="empty-state-text">${esc(L.empty_report_text)}</div>
      </div>`;
    document.getElementById('reportPrintBtn').disabled = true;
    return;
  }

  document.getElementById('reportPrintBtn').disabled = false;

  const byDate = groupByDate(entries);

  let html = `
    <div class="rp-header">
      <div class="rp-title">${esc(L.report_doc_title)}</div>
      <div class="rp-meta">${esc(L.report_period_text(fromFmt, toFmt))}</div>
      <div class="rp-meta">${esc(L.report_total_entries(entries.length))}</div>
    </div>`;

  byDate.forEach(({ date, items }) => {
    html += `<div class="rp-date-group">
      <div class="rp-date-heading">${esc(fmtDateStr(date))}</div>`;

    items.forEach((e, idx) => {
      const catBadge = e.category
        ? `<span class="rp-badge">${esc(e.category)}</span>` : '';

      const actionsHtml = e.actions
        ? `<div class="rp-sub-label">${esc(L.report_section_actions)}</div>
           <div class="rp-sub-text">${esc(e.actions)}</div>` : '';

      const partsHtml = (e.parts && e.parts.some(p => p.name))
        ? `<div class="rp-sub-label">${esc(L.report_section_parts)}</div>
           <div class="rp-parts">
             ${e.parts.filter(p => p.name).map(p =>
               `<span class="rp-part">${esc(p.name)}${p.qty ? ` × ${esc(p.qty)}` : ''}</span>`
             ).join('')}
           </div>` : '';

      html += `
        <div class="rp-entry">
          <div class="rp-entry-num">${idx + 1}</div>
          <div class="rp-entry-body">
            <div class="rp-entry-title">${esc(e.description)}${catBadge ? ' ' + catBadge : ''}</div>
            ${actionsHtml}
            ${partsHtml}
          </div>
        </div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
}

async function renderIssuesReportPreview() {
  const period = getReportPeriodOrNull();
  const container = document.getElementById('reportPreview');
  if (!period) { reportPreviewNoPeriod(); return; }

  const catVal = document.getElementById('rCatFilter').value;
  let issues = await dbGetAllIssues();
  issues = issues.filter(i => i.date >= period.from && i.date <= period.to);
  if (catVal) issues = issues.filter(i => i.category === catVal);
  issues.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const fromFmt = fmtDateStr(period.from);
  const toFmt   = fmtDateStr(period.to);

  if (issues.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠</div>
        <div class="empty-state-title">${esc(L.empty_report_issues_title)}</div>
        <div class="empty-state-text">${esc(L.empty_report_issues_text)}</div>
      </div>`;
    document.getElementById('reportPrintBtn').disabled = true;
    return;
  }

  document.getElementById('reportPrintBtn').disabled = false;

  const priorityLabels = { low: L.priority_low, medium: L.priority_medium, high: L.priority_high, critical: L.priority_critical };
  const statusLabels   = { open: L.status_open, inprogress: L.status_inprogress, resolved: L.status_resolved };
  const byDate = groupIssuesByDate(issues);

  let html = `
    <div class="rp-header">
      <div class="rp-title">${esc(L.report_doc_issues)}</div>
      <div class="rp-meta">${esc(L.report_period_text(fromFmt, toFmt))}</div>
      <div class="rp-meta">${esc(L.report_total_issues(issues.length))}</div>
    </div>`;

  byDate.forEach(({ date, items }) => {
    html += `<div class="rp-date-group">
      <div class="rp-date-heading">${esc(fmtDateStr(date))}</div>`;
    items.forEach((item, idx) => {
      const catBadge = item.category ? `<span class="rp-badge">${esc(item.category)}</span>` : '';
      const pri = priorityLabels[item.priority] || item.priority;
      const st  = statusLabels[item.status] || item.status;
      const meta = esc(`${pri} · ${st}`);
      const notesHtml = item.notes
        ? `<div class="rp-sub-label">${esc(L.report_section_notes)}</div>
           <div class="rp-sub-text">${esc(item.notes)}</div>` : '';
      html += `
        <div class="rp-entry">
          <div class="rp-entry-num">${idx + 1}</div>
          <div class="rp-entry-body">
            <div class="rp-entry-title">${esc(item.desc)} ${catBadge}</div>
            <div class="rp-sub-text" style="font-size:10px;color:var(--text-muted, #666)">${meta}</div>
            ${notesHtml}
          </div>
        </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

async function renderPlansReportPreview() {
  const period = getReportPeriodOrNull();
  const container = document.getElementById('reportPreview');
  if (!period) { reportPreviewNoPeriod(); return; }

  const catVal = document.getElementById('rCatFilter').value;
  let plans = await dbGetAllPlans();
  plans = plans.filter(p => planOverlapsPeriod(p, period.from, period.to));
  plans = plans.filter(p => p.status !== 'done');
  if (catVal) plans = plans.filter(p => p.category === catVal);
  plans.sort((a, b) => (a.datePlanned || '').localeCompare(b.datePlanned || ''));

  const fromFmt = fmtDateStr(period.from);
  const toFmt   = fmtDateStr(period.to);

  if (plans.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📌</div>
        <div class="empty-state-title">${esc(L.empty_report_plans_title)}</div>
        <div class="empty-state-text">${esc(L.empty_report_plans_text)}</div>
      </div>`;
    document.getElementById('reportPrintBtn').disabled = true;
    return;
  }

  document.getElementById('reportPrintBtn').disabled = false;

  const statusLabels = { planned: L.status_planned, done: L.status_done };
  const byStart = groupPlansByStartDate(plans);

  let html = `
    <div class="rp-header">
      <div class="rp-title">${esc(L.report_doc_plans)}</div>
      <div class="rp-meta">${esc(L.report_period_text(fromFmt, toFmt))}</div>
      <div class="rp-meta">${esc(L.report_total_plans(plans.length))}</div>
    </div>`;

  byStart.forEach(({ date, items }) => {
    html += `<div class="rp-date-group">
      <div class="rp-date-heading">${esc(fmtDateStr(date))}</div>`;
    items.forEach((item, idx) => {
      const catBadge = item.category ? `<span class="rp-badge">${esc(item.category)}</span>` : '';
      const st = statusLabels[item.status] || item.status;
      const rangeLine = formatPlanPeriodHuman(item);
      const actionsHtml = item.actions
        ? `<div class="rp-sub-label">${esc(L.field_planActions)}</div>
           <div class="rp-sub-text">${esc(item.actions)}</div>` : '';
      const partsHtml = (item.parts && item.parts.some(p => p.name))
        ? `<div class="rp-sub-label">${esc(L.report_section_parts)}</div>
           <div class="rp-parts">
             ${item.parts.filter(p => p.name).map(p =>
               `<span class="rp-part">${esc(p.name)}${p.qty ? ` × ${esc(p.qty)}` : ''}</span>`
             ).join('')}
           </div>` : '';
      html += `
        <div class="rp-entry">
          <div class="rp-entry-num">${idx + 1}</div>
          <div class="rp-entry-body">
            <div class="rp-entry-title">${esc(item.desc)} ${catBadge}</div>
            <div class="rp-sub-text" style="font-size:10px;color:var(--text-muted, #666)">${esc(L.report_plan_dates_label)} ${esc(rangeLine)} · ${esc(st)}</div>
            ${actionsHtml}
            ${partsHtml}
          </div>
        </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

/* ============================================================
   PRINT
   ============================================================ */
async function printReport() {
  const period = getReportPeriodOrNull();
  if (!period) { toast(L.val_report_dates, 'error'); return; }

  const type = getReportType();
  if (type === 'journal') printJournalReport(period);
  else if (type === 'issues') await printIssuesReport(period);
  else if (type === 'plans') await printPlansReport(period);
}

function printJournalReport(period) {
  const catVal = document.getElementById('rCatFilter').value;
  let entries = allEntries.filter(e => e.date >= period.from && e.date <= period.to);
  if (catVal) entries = entries.filter(e => e.category === catVal);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  if (entries.length === 0) return;

  const fromFmt = fmtDateStr(period.from);
  const toFmt   = fmtDateStr(period.to);
  const nowFmt  = fmtDateStr(new Date().toISOString().split('T')[0]);
  const byDate  = groupByDate(entries);

  let entriesHtml = '';
  byDate.forEach(({ date, items }) => {
    entriesHtml += `
      <div class="date-group">
        <div class="date-heading">${escHtml(fmtDateStr(date))}</div>`;

    items.forEach((e, idx) => {
      const cat = e.category || L.report_no_category;

      const actionsBlock = e.actions
        ? `<div class="sub-label">${escHtml(L.report_section_actions)}</div>
           <div class="sub-text">${escHtml(e.actions).replace(/\n/g, '<br>')}</div>` : '';

      const partsBlock = (e.parts && e.parts.some(p => p.name))
        ? `<div class="sub-label">${escHtml(L.report_section_parts)}</div>
           <ul class="parts-list">
             ${e.parts.filter(p => p.name).map(p =>
               `<li>${escHtml(p.name)}${p.qty ? ` <span class="qty">× ${escHtml(p.qty)}</span>` : ''}</li>`
             ).join('')}
           </ul>` : '';

      const photosBlock = renderPrintPhotosBlock(e.photos || []);

      entriesHtml += `
        <div class="entry">
          <div class="entry-num">${idx + 1}</div>
          <div class="entry-body">
            <div class="entry-title">${escHtml(e.description)}</div>
            <div class="entry-cat">${escHtml(cat)}</div>
            ${actionsBlock}
            ${partsBlock}
            ${photosBlock}
          </div>
        </div>`;
    });

    entriesHtml += `</div>`;
  });

  const printHtml = buildPrintHtml({
    title: L.report_doc_title,
    period: L.report_period_text(fromFmt, toFmt),
    generated: L.report_generated(nowFmt),
    totalEntries: L.report_total_entries(entries.length),
    body: entriesHtml,
  });

  openPrintWindow(printHtml);
}

async function printIssuesReport(period) {
  const catVal = document.getElementById('rCatFilter').value;
  let issues = await dbGetAllIssues();
  issues = issues.filter(i => i.date >= period.from && i.date <= period.to);
  if (catVal) issues = issues.filter(i => i.category === catVal);
  issues.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  if (issues.length === 0) return;

  const fromFmt = fmtDateStr(period.from);
  const toFmt   = fmtDateStr(period.to);
  const nowFmt  = fmtDateStr(new Date().toISOString().split('T')[0]);
  const priorityLabels = { low: L.priority_low, medium: L.priority_medium, high: L.priority_high, critical: L.priority_critical };
  const statusLabels   = { open: L.status_open, inprogress: L.status_inprogress, resolved: L.status_resolved };
  const byDate = groupIssuesByDate(issues);

  let body = '';
  byDate.forEach(({ date, items }) => {
    body += `<div class="date-group"><div class="date-heading">${escHtml(fmtDateStr(date))}</div>`;
    items.forEach((item, idx) => {
      const cat  = item.category || L.report_no_category;
      const pri  = priorityLabels[item.priority] || item.priority;
      const st   = statusLabels[item.status] || item.status;
      const notesBlock = item.notes
        ? `<div class="sub-label">${escHtml(L.report_section_notes)}</div>
           <div class="sub-text">${escHtml(item.notes).replace(/\n/g, '<br>')}</div>` : '';
      const photosBlock = renderPrintPhotosBlock(item.photos || []);
      body += `
        <div class="entry">
          <div class="entry-num">${idx + 1}</div>
          <div class="entry-body">
            <div class="entry-title">${escHtml(item.desc)}</div>
            <div class="entry-cat">${escHtml(cat)} · ${escHtml(pri)} · ${escHtml(st)}</div>
            ${notesBlock}
            ${photosBlock}
          </div>
        </div>`;
    });
    body += `</div>`;
  });

  const printHtml = buildPrintHtml({
    title: L.report_doc_issues,
    period: L.report_period_text(fromFmt, toFmt),
    generated: L.report_generated(nowFmt),
    totalEntries: L.report_total_issues(issues.length),
    body,
  });
  openPrintWindow(printHtml);
}

async function printPlansReport(period) {
  const catVal = document.getElementById('rCatFilter').value;
  let plans = await dbGetAllPlans();
  plans = plans.filter(p => planOverlapsPeriod(p, period.from, period.to));
  plans = plans.filter(p => p.status !== 'done');
  if (catVal) plans = plans.filter(p => p.category === catVal);
  plans.sort((a, b) => (a.datePlanned || '').localeCompare(b.datePlanned || ''));
  if (plans.length === 0) return;

  const fromFmt = fmtDateStr(period.from);
  const toFmt   = fmtDateStr(period.to);
  const nowFmt  = fmtDateStr(new Date().toISOString().split('T')[0]);
  const statusLabels = { planned: L.status_planned, done: L.status_done };
  const byStart = groupPlansByStartDate(plans);

  let body = '';
  byStart.forEach(({ date, items }) => {
    body += `<div class="date-group"><div class="date-heading">${escHtml(fmtDateStr(date))}</div>`;
    items.forEach((item, idx) => {
      const cat = item.category || L.report_no_category;
      const st  = statusLabels[item.status] || item.status;
      const range = formatPlanPeriodHuman(item);
      const actionsBlock = item.actions
        ? `<div class="sub-label">${escHtml(L.field_planActions)}</div>
           <div class="sub-text">${escHtml(item.actions).replace(/\n/g, '<br>')}</div>` : '';
      const partsBlock = (item.parts && item.parts.some(p => p.name))
        ? `<div class="sub-label">${escHtml(L.report_section_parts)}</div>
           <ul class="parts-list">
             ${item.parts.filter(p => p.name).map(p =>
               `<li>${escHtml(p.name)}${p.qty ? ` <span class="qty">× ${escHtml(p.qty)}</span>` : ''}</li>`
             ).join('')}
           </ul>` : '';
      const photosBlock = renderPrintPhotosBlock(item.completionPhotos || item.photos || []);
      body += `
        <div class="entry">
          <div class="entry-num">${idx + 1}</div>
          <div class="entry-body">
            <div class="entry-title">${escHtml(item.desc)}</div>
            <div class="entry-cat">${escHtml(cat)} · ${escHtml(L.report_plan_dates_label)} ${escHtml(range)} · ${escHtml(st)}</div>
            ${actionsBlock}
            ${partsBlock}
            ${photosBlock}
          </div>
        </div>`;
    });
    body += `</div>`;
  });

  const printHtml = buildPrintHtml({
    title: L.report_doc_plans,
    period: L.report_period_text(fromFmt, toFmt),
    generated: L.report_generated(nowFmt),
    totalEntries: L.report_total_plans(plans.length),
    body,
  });
  openPrintWindow(printHtml);
}

function openPrintWindow(printHtml) {
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(printHtml);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ============================================================
   BUILD PRINT HTML
   ============================================================ */
function buildPrintHtml({ title, period, generated, totalEntries, body }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escHtml(title)}</title>
<style>
  /* No external fonts — works fully offline */
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Liberation Sans', 'Arial', 'Helvetica Neue', sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 0;
  }

  /* ── SCREEN WRAPPER ── */
  @media screen {
    body { background: #e8e8e8; padding: 20px; }
    .page {
      background: #fff;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm 18mm 20mm 25mm;
      box-shadow: 0 2px 20px rgba(0,0,0,0.15);
      min-height: 297mm;
    }
    .print-controls {
      position: fixed;
      top: 16px; right: 16px;
      display: flex; gap: 8px; z-index: 100;
    }
    .print-btn, .close-btn {
      padding: 8px 16px;
      border: none; border-radius: 6px;
      cursor: pointer; font-size: 13px;
      font-family: inherit;
    }
    .print-btn { background: #1a56db; color: #fff; font-weight: 700; }
    .print-btn:hover { background: #1e40af; }
    .close-btn { background: #fff; border: 1px solid #ccc; color: #444; }
    .close-btn:hover { background: #f0f0f0; }
  }

  @media print {
    .print-controls { display: none !important; }
    .page { padding: 15mm 12mm 15mm 20mm; }
    body { background: #fff; }
    .date-group { page-break-inside: avoid; }
    .entry { page-break-inside: avoid; }
  }

  /* ── HEADER ── */
  .doc-header {
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 10pt;
    margin-bottom: 16pt;
  }

  .doc-title {
    font-size: 16pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 4pt;
  }

  .doc-meta {
    font-size: 9pt;
    color: #555;
    display: flex;
    flex-wrap: wrap;
    gap: 16pt;
    margin-top: 6pt;
  }

  .doc-meta span { white-space: nowrap; }

  /* ── DATE GROUP ── */
  .date-group {
    margin-bottom: 18pt;
  }

  .date-heading {
    font-size: 11pt;
    font-weight: 700;
    background: #f0f0f0;
    border-left: 4pt solid #1a1a1a;
    padding: 4pt 8pt;
    margin-bottom: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── ENTRY ── */
  .entry {
    display: flex;
    gap: 8pt;
    margin-bottom: 8pt;
    padding-bottom: 8pt;
    border-bottom: 1pt solid #e0e0e0;
  }
  .entry:last-child { border-bottom: none; }

  .entry-num {
    flex-shrink: 0;
    width: 18pt;
    height: 18pt;
    background: #1a1a1a;
    color: #fff;
    border-radius: 50%;
    font-size: 8pt;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1pt;
  }

  .entry-body { flex: 1; }

  .entry-title {
    font-size: 11pt;
    font-weight: 700;
    margin-bottom: 2pt;
  }

  .entry-cat {
    font-size: 8pt;
    color: #666;
    margin-bottom: 4pt;
    font-style: italic;
  }

  .sub-label {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #333;
    margin-top: 4pt;
    margin-bottom: 2pt;
  }

  .sub-text {
    font-size: 10pt;
    color: #333;
    line-height: 1.5;
    margin-bottom: 2pt;
  }

  .parts-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 4pt;
    margin-top: 2pt;
  }

  .parts-list li {
    background: #f4f4f4;
    border: 1pt solid #ddd;
    border-radius: 3pt;
    padding: 1pt 6pt;
    font-size: 9pt;
  }

  .qty { color: #888; }

  /* ── PHOTOS IN PRINT ── */
  .entry-photos {
    display: flex;
    flex-wrap: wrap;
    gap: 6pt;
    margin-top: 5pt;
  }

  .entry-photo {
    max-width: 62mm;
    max-height: 92mm; /* fits in ~1/3 of A4 height */
    width: auto;
    height: auto;
    object-fit: contain;
    border: 1pt solid #ddd;
    border-radius: 3pt;
    background: #fafafa;
  }

  /* ── FOOTER ── */
  .doc-footer {
    margin-top: 20pt;
    padding-top: 8pt;
    border-top: 1pt solid #ccc;
    font-size: 8pt;
    color: #888;
    display: flex;
    justify-content: space-between;
  }

  @media print {
    .doc-footer {
      position: fixed;
      bottom: 10mm;
      left: 20mm;
      right: 12mm;
    }
  }
</style>
</head>
<body>

<div class="print-controls">
  <button class="print-btn" onclick="window.print()">🖨 Print / Ctrl+P</button>
  <button class="close-btn" onclick="window.close()">✕ Close</button>
</div>

<div class="page">
  <div class="doc-header">
    <div class="doc-title">${escHtml(title)}</div>
    <div class="doc-meta">
      <span>${escHtml(period)}</span>
      <span>${escHtml(totalEntries)}</span>
      <span>${escHtml(generated)}</span>
    </div>
  </div>

  ${body}

  <div class="doc-footer">
    <span>${escHtml(title)}</span>
    <span>${escHtml(period)}</span>
  </div>
</div>

</body>
</html>`;
}

/* ============================================================
   HELPERS
   ============================================================ */
function groupByDate(entries) {
  const map = new Map();
  entries.forEach(e => {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date).push(e);
  });
  return Array.from(map, ([date, items]) => ({ date, items }));
}

function groupIssuesByDate(issues) {
  const map = new Map();
  issues.forEach(i => {
    const d = i.date || '';
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(i);
  });
  return Array.from(map, ([date, items]) => ({ date, items }));
}

function groupPlansByStartDate(plans) {
  const map = new Map();
  plans.forEach(p => {
    const d = p.datePlanned || '';
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(p);
  });
  return Array.from(map, ([date, items]) => ({ date, items }));
}

function fmtDateStr(isoOrDate) {
  const s = typeof isoOrDate === 'string' ? isoOrDate : isoOrDate.toISOString().split('T')[0];
  const [y, m, d] = s.split('-');
  return L.formatDate(y, m, d);
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function printPhotoSrc(p) {
  if (!p) return '';

  if (p.url && /^photo:\/\//i.test(p.url)) return p.url;

  let fname = String(p.filename || '').trim();
  if (!fname && p.url) {
    const u = String(p.url);
    const i = u.indexOf('photos/');
    if (i >= 0) fname = u.slice(i + 'photos/'.length);
    else fname = u.replace(/^.*[/\\]/, '');
  }
  if (!fname) return '';

  const normalized = fname
    .replace(/\\/g, '/')
    .replace(/^photos\//i, '')
    .replace(/^\/+/, '');
  return normalized ? `photo:///${encodeURI(normalized)}` : '';
}

function renderPrintPhotosBlock(photos) {
  const list = Array.isArray(photos) ? photos : [];
  if (!list.length) return '';
  const imgs = list
    .map((p) => printPhotoSrc(p))
    .filter(Boolean)
    .map((src) => `<img class="entry-photo" src="${escHtml(src)}" alt="">`)
    .join('');
  if (!imgs) return '';
  return `
    <div class="sub-label">${escHtml(L.view_photos_label || 'Photos')}</div>
    <div class="entry-photos">${imgs}</div>`;
}

/* ============================================================
   POPULATE REPORT CAT SELECT
   ============================================================ */
function populateReportCatSelect() {
  const sel = document.getElementById('rCatFilter');
  if (!sel) return;
  sel.innerHTML = `<option value="">${esc(L.report_cat_all)}</option>` +
    allCategories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
}
