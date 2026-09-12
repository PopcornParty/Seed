const KEY = "seed.saved.v1";

export interface SavedSearch {
  id: string;
  name: string;
  createdAt: number;
  config: unknown;
  results?: unknown;
  favouriteSeeds?: string[];
}

function read(): SavedSearch[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: SavedSearch[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listSaved(): SavedSearch[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveSearch(item: Omit<SavedSearch, "id" | "createdAt"> & { id?: string }) {
  const items = read();
  const rec: SavedSearch = {
    id: item.id || crypto.randomUUID(),
    name: item.name,
    createdAt: Date.now(),
    config: item.config,
    results: item.results,
    favouriteSeeds: item.favouriteSeeds || []
  };
  write([rec, ...items].slice(0, 80));
  return rec;
}

export function deleteSaved(id: string) {
  write(read().filter((x) => x.id !== id));
}

export function toggleFavourite(seed: string) {
  const favKey = "seed.favs.v1";
  const favs: string[] = JSON.parse(localStorage.getItem(favKey) || "[]");
  const next = favs.includes(seed) ? favs.filter((s) => s !== seed) : [seed, ...favs].slice(0, 200);
  localStorage.setItem(favKey, JSON.stringify(next));
  return next;
}

export function listFavourites(): string[] {
  try {
    return JSON.parse(localStorage.getItem("seed.favs.v1") || "[]");
  } catch {
    return [];
  }
}
