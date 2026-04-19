/* ============================================================
   db.js — IndexedDB wrapper
   Stores: entries, categories, snapshots, issues, plans, meta, tasks
   ============================================================ */

const DB_NAME    = 'WorkJournalDB';
const DB_VERSION = 5;          // v5: задачи (tasks)

let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;

      if (!d.objectStoreNames.contains('entries')) {
        const s = d.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
        s.createIndex('date',     'date');
        s.createIndex('category', 'category');
      }
      if (!d.objectStoreNames.contains('categories')) {
        d.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      // v2
      if (!d.objectStoreNames.contains('snapshots')) {
        const sn = d.createObjectStore('snapshots', { keyPath: 'id', autoIncrement: true });
        sn.createIndex('createdAt', 'createdAt');
      }
      // v3
      if (!d.objectStoreNames.contains('issues')) {
        const is = d.createObjectStore('issues', { keyPath: 'id', autoIncrement: true });
        is.createIndex('date',   'date');
        is.createIndex('status', 'status');
      }
      if (!d.objectStoreNames.contains('plans')) {
        const pl = d.createObjectStore('plans', { keyPath: 'id', autoIncrement: true });
        pl.createIndex('datePlanned', 'datePlanned');
        pl.createIndex('status',      'status');
      }
      if (!d.objectStoreNames.contains('meta')) {
        d.createObjectStore('meta', { keyPath: 'key' });
      }
      // v5
      if (!d.objectStoreNames.contains('tasks')) {
        const tk = d.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        tk.createIndex('sourceType', 'sourceType');
        tk.createIndex('sourceId',   'sourceId');
        tk.createIndex('status',     'status');
        tk.createIndex('source',     ['sourceType', 'sourceId']);
      }
    };

    req.onsuccess = (e) => { db = e.target.result; resolve(); };
    req.onerror   = (e) => reject(e);
  });
}

/* ---- generic helpers ---- */

function dbAll(store) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = reject;
  });
}

function dbAdd(store, data) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(data);
    let key;
    req.onsuccess = () => { key = req.result; };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve(key);
    tx.onerror = () => reject(tx.error);
  });
}

function dbPut(store, data) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(data);
    let key;
    req.onsuccess = () => { key = req.result; };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve(key);
    tx.onerror = () => reject(tx.error);
  });
}

function dbDelete(store, id) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbClear(store) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).clear();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbGet(store, id) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error('DB not initialized')); return; }
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = reject;
  });
}

/**
 * Один согласованный снимок всех хранилищ для экспорта в work-journal-db.json.
 * Параллельные dbAll() в разных транзакциях дают разные моменты времени — часть
 * хранилищ может читаться «до» коммита записей/категорий, часть «после».
 */
function dbReadAllForExport() {
  const stores = ['entries', 'categories', 'issues', 'plans', 'snapshots', 'tasks'];
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'));
      return;
    }
    try {
      const tx = db.transaction(stores, 'readonly');
      const out = {};
      stores.forEach((name) => {
        const req = tx.objectStore(name).getAll();
        req.onsuccess = () => { out[name] = req.result; };
        req.onerror = () => reject(req.error);
      });
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    } catch (e) {
      reject(e);
    }
  });
}

/* ── ISSUES ── */
function dbGetAllIssues()    { return dbAll('issues'); }
function dbAddIssue(o)       { return dbAdd('issues', o); }
function dbPutIssue(o)       { return dbPut('issues', o); }
function dbDeleteIssue(id)   { return dbDelete('issues', id); }

/* ── PLANS ── */
function dbGetAllPlans()     { return dbAll('plans'); }
function dbAddPlan(o)        { return dbAdd('plans', o); }
function dbPutPlan(o)        { return dbPut('plans', o); }
function dbDeletePlan(id)    { return dbDelete('plans', id); }

/* ── TASKS ── */
function dbGetAllTasks()     { return dbAll('tasks'); }
function dbAddTask(o)        { return dbAdd('tasks', o); }
function dbPutTask(o)        { return dbPut('tasks', o); }
function dbDeleteTask(id)   { return dbDelete('tasks', id); }
