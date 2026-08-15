import { notifyLocalDataUpdated } from "./localDataEvents";

export const RECENT_SEARCHES_KEY = "fraudshield-recent-searches";
export const RECENT_SEARCHES_UPDATED_EVENT = "fraudshield-recent-searches-updated";
const MAX_RECENT_SEARCHES = 6;

export function getRecentSearchesFromBrowser() {
  const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);

  if (!savedSearches) {
    return [];
  }

  try {
    const parsedSearches = JSON.parse(savedSearches);

    if (!Array.isArray(parsedSearches)) {
      return [];
    }

    return parsedSearches;
  } catch (error) {
    console.error("Could not load recent searches:", error);
    return [];
  }
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
