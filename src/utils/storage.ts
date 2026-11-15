import {
  AssetItem,
  DesignProject,
  TemplateDefinition,
} from '../types/design';

const DB_NAME = 'sitecraft_studio_db';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_ASSETS = 'custom_assets';
const STORE_TEMPLATES = 'custom_templates';
const FALLBACK_PROJECTS_KEY = 'sitecraft_projects_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
        db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
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
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (projects.length > 0) {
      return projects.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    for (const proj of seedProjects) {
      await saveProjectToStorage(proj);
    }
    return seedProjects;
  } catch {
    try {
      const raw = localStorage.getItem(FALLBACK_PROJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DesignProject[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return seedProjects;
  }
}

export async function saveProjectToStorage(project: DesignProject): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.put(project);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return;
  } catch {
    // Fallback to localStorage only if IndexedDB fails
  }

  try {
    const raw = localStorage.getItem(FALLBACK_PROJECTS_KEY);
    const list: DesignProject[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    localStorage.setItem(FALLBACK_PROJECTS_KEY, JSON.stringify(list));
  } catch {
    // ignore quota error
  }
}

export async function deleteProjectFromStorage(projectId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.delete(projectId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }

  try {
    const raw = localStorage.getItem(FALLBACK_PROJECTS_KEY);
    if (raw) {
      const list: DesignProject[] = JSON.parse(raw);
      localStorage.setItem(
        FALLBACK_PROJECTS_KEY,
        JSON.stringify(list.filter((p) => p.id !== projectId))
      );
    }
  } catch {
    // ignore
  }
}

// Custom Assets Persistence in IndexedDB (Never stores large images in localStorage)
export async function loadCustomAssets(): Promise<AssetItem[]> {
  try {
    const db = await openDatabase();
    const assets = await new Promise<AssetItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readonly');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return assets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function saveCustomAsset(asset: AssetItem): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.put(asset);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save asset in IndexedDB:', err);
  }
}

export async function deleteCustomAsset(assetId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.delete(assetId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete asset from IndexedDB:', err);
  }
}

// Custom User Templates Persistence in IndexedDB
export async function loadCustomTemplates(): Promise<TemplateDefinition[]> {
  try {
    const db = await openDatabase();
    const templates = await new Promise<TemplateDefinition[]>((resolve, reject) => {
      const tx = db.transaction(STORE_TEMPLATES, 'readonly');
      const store = tx.objectStore(STORE_TEMPLATES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return templates;
  } catch {
    return [];
  }
}

export async function saveCustomTemplate(template: TemplateDefinition): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
      const store = tx.objectStore(STORE_TEMPLATES);
      const req = store.put(template);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save custom template in IndexedDB:', err);
  }
}

export async function deleteCustomTemplate(templateId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
      const store = tx.objectStore(STORE_TEMPLATES);
      const req = store.delete(templateId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete custom template from IndexedDB:', err);
  }
}
