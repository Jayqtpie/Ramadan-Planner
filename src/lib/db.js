import { openDB } from 'idb';

const DB_NAME = 'ramadan-planner-db';
const DB_VERSION = 1;

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('niyyah')) db.createObjectStore('niyyah', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('quranTracker')) db.createObjectStore('quranTracker', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('dailyPages')) db.createObjectStore('dailyPages', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('weeklyReflections')) db.createObjectStore('weeklyReflections', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('lastTenNights')) db.createObjectStore('lastTenNights', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('eidChecklist')) db.createObjectStore('eidChecklist', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('postRamadan')) db.createObjectStore('postRamadan', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getData(store, id) {
  const db = await getDB();
  return db.get(store, id);
}

export async function setData(store, data) {
  const db = await getDB();
  await db.put(store, data);
}

export async function getAllData(store) {
  const db = await getDB();
  return db.getAll(store);
}

export async function deleteData(store, id) {
  const db = await getDB();
  await db.delete(store, id);
}

export async function clearStore(store) {
  const db = await getDB();
  await db.clear(store);
}

export async function exportAllData() {
  const db = await getDB();
  const stores = ['settings', 'niyyah', 'goals', 'quranTracker', 'dailyPages', 'weeklyReflections', 'lastTenNights', 'eidChecklist', 'postRamadan'];
  const data = {};
  for (const store of stores) {
    data[store] = await db.getAll(store);
  }
  return data;
}

export async function importAllData(data) {
  const db = await getDB();
  const stores = Object.keys(data);
  for (const store of stores) {
    if (db.objectStoreNames.contains(store)) {
      const tx = db.transaction(store, 'readwrite');
      await tx.store.clear();
      for (const item of data[store]) {
        await tx.store.put(item);
      }
      await tx.done;
    }
  }
}

export async function clearAllData() {
  const db = await getDB();
  const stores = ['settings', 'niyyah', 'goals', 'quranTracker', 'dailyPages', 'weeklyReflections', 'lastTenNights', 'eidChecklist', 'postRamadan'];
  for (const store of stores) {
    await db.clear(store);
  }
}
