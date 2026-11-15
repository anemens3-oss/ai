import { DesignProject } from '../types/design';

const DB_NAME = 'sitecraft_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const FALLBACK_KEY = 'sitecraft_projects_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllProjects(seedProjects: DesignProject[]): Promise<DesignProject[]> {
  try {
    const db = await openDatabase();
    const projects = await new Promise<DesignProject[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (projects.length > 0) {
      return projects.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    // Seed initial projects if empty
    for (const proj of seedProjects) {
      await saveProjectToStorage(proj);
    }
    return seedProjects;
  } catch {
    try {
      const raw = localStorage.getItem(FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DesignProject[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(seedProjects));
    } catch {
      // ignore storage quota errors
    }
    return seedProjects;
  }
}

export async function saveProjectToStorage(project: DesignProject): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(project);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
  }

  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    const list: DesignProject[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export async function deleteProjectFromStorage(projectId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(projectId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }

  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) {
      const list: DesignProject[] = JSON.parse(raw);
      localStorage.setItem(
        FALLBACK_KEY,
        JSON.stringify(list.filter((p) => p.id !== projectId))
      );
    }
  } catch {
    // ignore
  }
}
