import { notifyLocalDataUpdated } from "./localDataEvents";
import { readJsonArray } from "./browserStorage";

export const WATCHLIST_KEY = "fraudshield-watchlist";
export const WATCHLIST_UPDATED_EVENT = "fraudshield-watchlist-updated";

export function getWatchlistFromBrowser() {
  return readJsonArray(WATCHLIST_KEY)
    .filter((item) => item && item.identifier)
    .map(normalizeWatchlistItem);
}

export function saveWatchlist(items) {
  const safeItems = items
    .filter((item) => item && item.identifier)
    .map(normalizeWatchlistItem);

  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(safeItems));
  window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));
  notifyLocalDataUpdated();
}

export function isIdentifierWatched(identifier) {
  const cleanIdentifier = normalizeIdentifier(identifier);

  return getWatchlistFromBrowser().some(
    (item) => item.normalizedIdentifier === cleanIdentifier,
  );
}

export function addToWatchlist({ identifier, type, riskLevel, reportId, title }) {
  const cleanIdentifier = normalizeIdentifier(identifier);

  if (!cleanIdentifier) {
    return null;
  }

  const existingItems = getWatchlistFromBrowser();
  const existingItem = existingItems.find(
    (item) => item.normalizedIdentifier === cleanIdentifier,
  );

  if (existingItem) {
    return existingItem;
  }

  const newItem = {
    id: `${cleanIdentifier}-${Date.now()}`,
    identifier,
    normalizedIdentifier: cleanIdentifier,
    type,
    riskLevel,
    reportId,
    title,
    addedAt: new Date().toLocaleString(),
    alertsEnabled: true,
  };

  saveWatchlist([newItem, ...existingItems]);

  return newItem;
}

export function removeFromWatchlist(identifier) {
  const cleanIdentifier = normalizeIdentifier(identifier);
  const remainingItems = getWatchlistFromBrowser().filter(
    (item) => item.normalizedIdentifier !== cleanIdentifier,
  );

  saveWatchlist(remainingItems);
}

export function removeWatchlistItemsByReportId(reportId) {
  const remainingItems = getWatchlistFromBrowser().filter(
    (item) => item.reportId !== reportId,
  );

  saveWatchlist(remainingItems);
}

export function toggleWatchlistAlerts(identifier) {
  const cleanIdentifier = normalizeIdentifier(identifier);
  const updatedItems = getWatchlistFromBrowser().map((item) => {
    if (item.normalizedIdentifier !== cleanIdentifier) {
      return item;
    }

    return {
      ...item,
      alertsEnabled: !item.alertsEnabled,
    };
  });

  saveWatchlist(updatedItems);
}

export function normalizeIdentifier(identifier) {
  return String(identifier || "").trim().toLowerCase();
}

function normalizeWatchlistItem(item) {
  const normalizedIdentifier =
    item.normalizedIdentifier || normalizeIdentifier(item.identifier);

  return {
    ...item,
    id: item.id || `${normalizedIdentifier}-${Date.now()}`,
    normalizedIdentifier,
    type: item.type || "Unknown",
    riskLevel: item.riskLevel || "Unknown",
    reportId: item.reportId || "",
    title: item.title || "Watched identifier",
    alertsEnabled: item.alertsEnabled !== false,
  };
}
