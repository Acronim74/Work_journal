const { app, BrowserWindow, ipcMain, protocol, net, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pathToFileURL } = require('url');

// Disable GPU compositing — fixes Electron hit-testing bug where scroll
// compositing layers intercept mouse/keyboard events inside fixed-position
// modal overlays after several DOM mutations.
app.disableHardwareAcceleration();

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const PHOTO_SCOPES = new Set(['journal', 'issues']);

/** Папка обмена с фиксированными именами: экспорт и импорт читают/пишут один файл (не зеркало БД). */
const EXCHANGE_DIR = 'journal-exchange';
const EXCHANGE_FILENAME = 'work-journal-backup.json';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'photo',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
    },
  },
]);

/**
 * Каталог данных рядом с приложением (БД, фото, journal-exchange).
 * Для target «portable» electron-builder запускает exe из %TEMP%; реальный путь к .exe на диске/шаре
 * передаётся в PORTABLE_EXECUTABLE_DIR — без этого вторая машина в сети видела бы пустую БД.
 */
function appRoot() {
  if (!app.isPackaged) return __dirname;
  const portableDir = (process.env.PORTABLE_EXECUTABLE_DIR || '').trim();
  if (portableDir) return path.resolve(portableDir);
  return path.dirname(process.execPath);
}

function exchangeDirPath() {
  return path.join(appRoot(), EXCHANGE_DIR);
}

function exchangeFilePath() {
  return path.join(exchangeDirPath(), EXCHANGE_FILENAME);
}

function ensureDictionaries() {
  const dictDest = path.join(app.getPath('userData'), 'Dictionaries');
  if (!fs.existsSync(dictDest)) fs.mkdirSync(dictDest, { recursive: true });
  const sourceDirs = [
    path.join(appRoot(), 'dictionaries'),
    path.join(process.resourcesPath || '', 'dictionaries'),
    path.join(__dirname, 'dictionaries'),
  ];

  for (const dictSrc of sourceDirs) {
    if (!dictSrc || !fs.existsSync(dictSrc)) continue;
    const files = fs.readdirSync(dictSrc).filter((f) => f.toLowerCase().endsWith('.bdic'));
    for (const file of files) {
      const dest = path.join(dictDest, file);
      if (!fs.existsSync(dest)) {
        try {
          fs.copyFileSync(path.join(dictSrc, file), dest);
          console.log(`[spellcheck] Copied dictionary: ${file}`);
        } catch (e) {
          console.error(`[spellcheck] Failed to copy ${file}:`, e.message);
        }
      }
    }
    if (files.length > 0) return;
  }

  console.warn('[spellcheck] No bundled dictionaries found in source directories');
}

function setupSpellcheck(windowRef) {
  if (!windowRef || windowRef.isDestroyed()) return;
  const session = windowRef.webContents.session;
  session.setSpellCheckerDictionaryDownloadURL('file:///');
  session.setSpellCheckerLanguages(['en-US', 'ru', 'pl', 'ro', 'pt-BR']);

  windowRef.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu();
    for (const suggestion of params.dictionarySuggestions || []) {
      menu.append(
        new MenuItem({
          label: suggestion,
          click: () => windowRef.webContents.replaceMisspelling(suggestion),
        })
      );
    }

    if ((params.dictionarySuggestions || []).length > 0) {
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: `Add "${params.misspelledWord}" to dictionary`,
          click: () => session.addWordToSpellCheckerDictionary(params.misspelledWord),
        })
      );
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'cut', label: 'Cut' }));
      menu.append(new MenuItem({ role: 'copy', label: 'Copy' }));
      menu.append(new MenuItem({ role: 'paste', label: 'Paste' }));
    } else if (params.selectionText) {
      menu.append(new MenuItem({ role: 'copy', label: 'Copy' }));
    }

    if (menu.items.length > 0) menu.popup();
  });
}

let mainWindow;

function ensureDirs() {
  const roots = [
    path.join(appRoot(), 'photos'),
    path.join(appRoot(), 'photos', 'journal'),
    path.join(appRoot(), 'photos', 'issues'),
  ];
  for (const p of roots) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }
  const exchange = exchangeDirPath();
  if (!fs.existsSync(exchange)) fs.mkdirSync(exchange, { recursive: true });
}

/** Безопасный относительный путь от appRoot: photos/... или photos/journal/... */
function normalizePhotoRelativePath(stored) {
  const s = String(stored || '').replace(/\\/g, '/').trim();
  if (!s || s.includes('..')) return null;
  const parts = s.split('/').filter(Boolean);
  if (parts.length === 1) {
    return path.join('photos', path.basename(parts[0]));
  }
  if (parts.length === 2 && PHOTO_SCOPES.has(parts[0])) {
    return path.join('photos', parts[0], path.basename(parts[1]));
  }
  return null;
}

function dbPath() {
  return path.join(appRoot(), 'work-journal-db.json');
}

function writeFileAtomic(destPath, utf8) {
  const tmp = destPath + '.tmp';
  fs.writeFileSync(tmp, utf8, 'utf8');
  fs.renameSync(tmp, destPath);
}

function writeDbAtomic(utf8) {
  writeFileAtomic(dbPath(), utf8);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createHelpWindow(filename) {
  const safe = path.basename(filename || '');
  if (!/^help-[a-z]{2}\.html$/i.test(safe)) return;
  const filePath = path.resolve(__dirname, safe);
  if (!filePath.startsWith(path.resolve(__dirname) + path.sep)) return;
  if (!fs.existsSync(filePath)) return;

  const win = new BrowserWindow({
    width: 920,
    height: 760,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(filePath);
}

app.whenReady().then(() => {
  ensureDictionaries();
  ensureDirs();

  protocol.handle('photo', (request) => {
    const candidates = [];
    const pushCandidate = (s) => {
      const value = String(s || '').replace(/\\/g, '/').replace(/^\/+/, '').trim();
      if (value) candidates.push(value);
    };

    try {
      const u = new URL(request.url);
      pushCandidate(decodeURIComponent([u.hostname || '', (u.pathname || '').replace(/^\/+/, '')].filter(Boolean).join('/')));
      pushCandidate(decodeURIComponent((u.pathname || '').replace(/^\/+/, '')));
    } catch (_) {}

    pushCandidate(decodeURIComponent(request.url.slice('photo://'.length)));

    for (const raw of candidates) {
      const normalizedInput = raw.replace(/^photos[\\/]/i, '');
      const tries = [];

      const safeRel = normalizePhotoRelativePath(normalizedInput);
      if (safeRel) tries.push(path.join(appRoot(), safeRel));

      const base = path.basename(normalizedInput);
      if (base) {
        tries.push(path.join(appRoot(), 'photos', 'issues', base));
        tries.push(path.join(appRoot(), 'photos', 'journal', base));
        tries.push(path.join(appRoot(), 'photos', base));
      }

      for (const filePath of tries) {
        if (fs.existsSync(filePath)) {
          return net.fetch(pathToFileURL(filePath).toString());
        }
      }
    }

    console.warn('[photo] not found:', request.url);
    return new Response('Not Found', { status: 404 });
  });

  ipcMain.handle('photos:upload', async (event, { filename, buffer, scope }) => {
    const sc = PHOTO_SCOPES.has(scope) ? scope : 'journal';
    const photosDir = path.join(appRoot(), 'photos', sc);
    if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });

    let buf;
    if (buffer instanceof ArrayBuffer) buf = Buffer.from(buffer);
    else if (ArrayBuffer.isView(buffer)) buf = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    else buf = Buffer.from(buffer || []);

    const ext = path.extname(filename || '').toLowerCase() || '.jpg';
    if (!ALLOWED_EXT.has(ext)) {
      throw new Error('Unsupported file type');
    }
    const safeName = Date.now() + '_' + crypto.randomBytes(6).toString('hex') + ext;
    const dest = path.join(photosDir, safeName);
    fs.writeFileSync(dest, buf);
    return { filename: `${sc}/${safeName}` };
  });

  ipcMain.handle('photos:delete', async (event, storedPath) => {
    const rel = normalizePhotoRelativePath(storedPath);
    if (!rel) return;
    const filePath = path.join(appRoot(), rel);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  ipcMain.handle('db:save', async (event, jsonString) => {
    try {
      if (!jsonString || jsonString.length < 10) {
        console.error('[db:save] пустая строка, запись отменена');
        return false;
      }
      writeDbAtomic(jsonString);
      return true;
    } catch (e) {
      console.error('[db:save]', e);
      return false;
    }
  });

  ipcMain.handle('db:load', async () => {
    const p = dbPath();
    if (!fs.existsSync(p)) return null;
    try {
      const text = fs.readFileSync(p, 'utf8');
      if (!text.trim()) return null;
      return JSON.parse(text);
    } catch (e) {
      console.error('[db:load]', e);
      return null;
    }
  });

  /** Экспорт в journal-exchange/work-journal-backup.json (отдельно от work-journal-db.json). */
  ipcMain.handle('db:export', async (event, jsonString) => {
    if (!jsonString || jsonString.length < 10) {
      return { ok: false, error: 'empty' };
    }
    const dest = exchangeFilePath();
    try {
      const dir = exchangeDirPath();
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      writeFileAtomic(dest, jsonString);
      return { ok: true, relativePath: path.join(EXCHANGE_DIR, EXCHANGE_FILENAME) };
    } catch (e) {
      console.error('[db:export]', e);
      return { ok: false, error: String(e.message || e) };
    }
  });

  /** Импорт из того же файла, что создаёт экспорт. */
  ipcMain.handle('db:importExchange', async () => {
    const p = exchangeFilePath();
    if (!fs.existsSync(p)) {
      return { ok: false, missing: true };
    }
    try {
      const text = fs.readFileSync(p, 'utf8');
      if (!text.trim()) return { ok: false, missing: true };
      const data = JSON.parse(text);
      return { ok: true, data };
    } catch (e) {
      console.error('[db:importExchange]', e);
      return { ok: false, error: 'parse' };
    }
  });

  ipcMain.handle('help:open', async (event, filename) => {
    createHelpWindow(filename);
  });

  createMainWindow();
  setupSpellcheck(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
