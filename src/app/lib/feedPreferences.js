import { readJsonObject } from "./browserStorage";

export const FEED_PREFERENCES_KEY = "fraudshield-feed-preferences";

export const FEED_SORT_OPTIONS = [
  "Latest",
  "Highest Risk",
  "Most Reports",
  "Most Discussed",
  "Most Shared",
];

const defaultFeedPreferences = {
  activeFilter: "All",
  sortMode: "Latest",
};

export function getFeedPreferences() {
  const savedPreferences = readJsonObject(FEED_PREFERENCES_KEY, {});

  return normalizeFeedPreferences(savedPreferences);
}

export function saveFeedPreferences(preferences) {
  localStorage.setItem(
    FEED_PREFERENCES_KEY,
    JSON.stringify(normalizeFeedPreferences(preferences)),
  );
}

export function clearFeedPreferences() {
  localStorage.removeItem(FEED_PREFERENCES_KEY);
}

function normalizeFeedPreferences(preferences = {}) {
  const safeSortMode = FEED_SORT_OPTIONS.includes(preferences.sortMode)
    ? preferences.sortMode
    : defaultFeedPreferences.sortMode;
  const safeActiveFilter =
    typeof preferences.activeFilter === "string" && preferences.activeFilter
      ? preferences.activeFilter
      : defaultFeedPreferences.activeFilter;

  return {
    activeFilter: safeActiveFilter,
    sortMode: safeSortMode,
  };
}
