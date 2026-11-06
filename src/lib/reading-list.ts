/** Browser-local reading list. No account, cookies, tracking, or network requests. */
const STORAGE_KEY = 'visha-shop:saved-guides:v1';
const CHANGE_EVENT = 'visha-shop:saved-guides-changed';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return [...new Set(data.filter((value): value is string => typeof value === 'string' && SLUG.test(value)))].slice(0, 100);
  } catch {
    return [];
  }
}

export function isSaved(slug: string): boolean {
  return getSavedIds().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  if (!SLUG.test(slug)) return false;
  const current = getSavedIds();
  const currentlySaved = current.includes(slug);
  const updated = currentlySaved ? current.filter(item => item !== slug) : [...current, slug];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return !currentlySaved;
  } catch {
    // Storage can be blocked in private browsing. Do not claim the item was saved.
    return false;
  }
}

export function subscribeToSavedChanges(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
