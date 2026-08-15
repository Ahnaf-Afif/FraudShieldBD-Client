import { notifyLocalDataUpdated } from "./localDataEvents";
import { readJsonArray } from "./browserStorage";

export const RECENT_SEARCHES_KEY = "fraudshield-recent-searches";
export const RECENT_SEARCHES_UPDATED_EVENT = "fraudshield-recent-searches-updated";
const MAX_RECENT_SEARCHES = 6;

export function getRecentSearchesFromBrowser() {
  return readJsonArray(RECENT_SEARCHES_KEY)
    .map((search) => String(search || "").trim())
    .filter(Boolean)
    .slice(0, MAX_RECENT_SEARCHES);
}

export function saveRecentSearch(searchValue) {
  const cleanSearchValue = searchValue.trim();

  if (!cleanSearchValue) {
    return;
  }

  const previousSearches = getRecentSearchesFromBrowser();
  const withoutDuplicate = previousSearches.filter(
    (search) => search.toLowerCase() !== cleanSearchValue.toLowerCase(),
  );
  const nextSearches = [cleanSearchValue, ...withoutDuplicate].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
  window.dispatchEvent(new Event(RECENT_SEARCHES_UPDATED_EVENT));
  notifyLocalDataUpdated();
}

export function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  window.dispatchEvent(new Event(RECENT_SEARCHES_UPDATED_EVENT));
  notifyLocalDataUpdated();
}
