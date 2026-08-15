export const WATCHLIST_KEY = "fraudshield-watchlist";
export const WATCHLIST_UPDATED_EVENT = "fraudshield-watchlist-updated";

export function getWatchlistFromBrowser() {
  const savedItems = localStorage.getItem(WATCHLIST_KEY);

  if (!savedItems) {
    return [];
  }

  try {
    const parsedItems = JSON.parse(savedItems);

    if (!Array.isArray(parsedItems)) {
      return [];
    }

    return parsedItems;
  } catch (error) {
    console.error("Could not load watchlist:", error);
    return [];
  }
}

export function saveWatchlist(items) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));
}

export function isIdentifierWatched(identifier) {
  const cleanIdentifier = normalizeIdentifier(identifier);

  return getWatchlistFromBrowser().some(
    (item) => item.normalizedIdentifier === cleanIdentifier,
  );
}

export function addToWatchlist({ identifier, type, riskLevel, reportId, title }) {
  const cleanIdentifier = normalizeIdentifier(identifier);
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
