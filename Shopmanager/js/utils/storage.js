/**
 * utils/storage.js
 * Abstraction over localStorage & sessionStorage with JSON support.
 * Covers: localStorage, sessionStorage
 */

const Storage = (() => {

  // ---------- localStorage ----------

  const get = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn(`[Storage.get] key="${key}"`, e);
      return null;
    }
  };

  const set = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[Storage.set] key="${key}"`, e);
      return false;
    }
  };

  const remove = (key) => {
    try { localStorage.removeItem(key); } catch (e) { /* silent */ }
  };

  const clear = () => {
    try { localStorage.clear(); } catch (e) { /* silent */ }
  };

  // ---------- sessionStorage ----------

  const session = {
    get: (key) => {
      try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    set: (key, value) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch { return false; }
    },
    remove: (key) => {
      try { sessionStorage.removeItem(key); } catch { /* silent */ }
    },
  };

  return { get, set, remove, clear, session };
})();

// Storage keys constants
const STORAGE_KEYS = {
  CART: 'shopmanager_cart',
  LAST_SEARCH: 'shopmanager_last_search',
  VIEW_MODE: 'shopmanager_view_mode',
  CURRENT_PAGE: 'shopmanager_current_page',
};
