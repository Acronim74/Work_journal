/* ============================================================
   i18n.js — localization manager
   ============================================================ */

const LANGUAGES = {
  ru: LANG_RU,
  en: LANG_EN,
  pl: LANG_PL,
};

const LANG_STORAGE_KEY = 'wj_lang';

let currentLang = 'ru';
let L = LANGUAGES[currentLang];  // active language pack — use L.key anywhere

function i18nInit() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && LANGUAGES[saved]) currentLang = saved;
  L = LANGUAGES[currentLang];
}

function setLanguage(code) {
  if (!LANGUAGES[code]) return;
  currentLang = code;
  L = LANGUAGES[code];
  localStorage.setItem(LANG_STORAGE_KEY, code);
  applyI18n();
  updateHeaderDate();
  updateStats();
  renderJournal();
  renderCatGrid();
  populateCatSelects();
  if (typeof currentPage !== 'undefined' && currentPage === 'tasks' && typeof renderTasks === 'function') {
    renderTasks();
  }
  if (typeof currentPage !== 'undefined' && currentPage === 'inventory' && typeof renderInventoryPage === 'function') {
    renderInventoryPage();
  }
  if (typeof currentPage !== 'undefined' && currentPage === 'inventory-templates' && typeof renderInventoryTemplatesPage === 'function') {
    renderInventoryTemplatesPage();
  }
  if (typeof currentPage !== 'undefined' && currentPage === 'dictionaries' && typeof renderDictionariesPage === 'function') {
    renderDictionariesPage();
  }
  renderLangPicker();
  if (typeof updateElectronDbInfo === 'function') updateElectronDbInfo();
}

/**
 * Apply all [data-i18n] attributes in the DOM.
 * Attribute value = key in the language pack.
 * Special suffixes:
 *   :placeholder  → sets element.placeholder
 *   :title        → sets element.title
 */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = L[key];
    if (val === undefined) return;

    if (key.endsWith(':placeholder')) {
      el.placeholder = val;
    } else if (key.endsWith(':title')) {
      el.title = val;
    } else {
      el.textContent = val;
    }
  });

  // Logo text (special — has inner span)
  const logoEl = document.getElementById('headerLogo');
  if (logoEl) {
    const parts = L.appTitle.split('.');
    logoEl.innerHTML = parts[0] + '<span>.</span>' + parts.slice(1).join('.');
  }

  // Update placeholders that are standalone attributes
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = L.filter_search;

  const filterDateFrom = document.getElementById('filterDateFrom');
  if (filterDateFrom) filterDateFrom.title = L.filter_dateFrom;

  const filterDateTo = document.getElementById('filterDateTo');
  if (filterDateTo) filterDateTo.title = L.filter_dateTo;

  const fDesc = document.getElementById('fDesc');
  if (fDesc) fDesc.placeholder = L.field_descPlaceholder;

  const fActions = document.getElementById('fActions');
  if (fActions) fActions.placeholder = L.field_actionsPlaceholder;

  const fCatName = document.getElementById('fCatName');
  if (fCatName) fCatName.placeholder = L.field_catNamePlaceholder;
}

function renderLangPicker() {
  // Full picker in Settings
  const container = document.getElementById('langPicker');
  if (container) {
    container.innerHTML = Object.values(LANGUAGES).map(lang => `
      <button class="lang-btn ${lang.code === currentLang ? 'active' : ''}"
              onclick="setLanguage('${lang.code}')">
        ${lang.flag} ${lang.name}
      </button>
    `).join('');
  }
  // Compact flag-only picker in header
  const header = document.getElementById('headerLangPicker');
  if (header) {
    header.innerHTML = Object.values(LANGUAGES).map(lang => `
      <button class="lang-btn-compact ${lang.code === currentLang ? 'active' : ''}"
              title="${lang.name}"
              onclick="setLanguage('${lang.code}')">
        ${lang.flag}
      </button>
    `).join('');
  }
}
