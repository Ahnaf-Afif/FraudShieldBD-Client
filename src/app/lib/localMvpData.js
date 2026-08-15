import {
  DEMO_SESSION_KEY,
  DEMO_SESSION_UPDATED_EVENT,
} from "./demoSession";
import {
  NOTIFICATION_PREFS_KEY,
  NOTIFICATION_READ_KEY,
  NOTIFICATION_UPDATED_EVENT,
} from "./notificationData";
import { RECENT_SEARCHES_KEY } from "./recentSearches";
import {
  REPORT_COMMENTS_KEY,
  REPORT_DRAFT_KEY,
  REPORT_REACTIONS_KEY,
  REPORT_SUBMISSIONS_KEY,
} from "./reportFeedData";
import { WATCHLIST_KEY, WATCHLIST_UPDATED_EVENT } from "./watchlistData";
import { notifyLocalDataUpdated } from "./localDataEvents";

const activityKeys = [
  REPORT_SUBMISSIONS_KEY,
  REPORT_REACTIONS_KEY,
  REPORT_COMMENTS_KEY,
  REPORT_DRAFT_KEY,
  WATCHLIST_KEY,
  RECENT_SEARCHES_KEY,
  NOTIFICATION_READ_KEY,
];

const allMvpKeys = [...activityKeys, DEMO_SESSION_KEY, NOTIFICATION_PREFS_KEY];
const BACKUP_VERSION = 1;

export function clearLocalMvpActivity() {
  removeLocalStorageKeys(activityKeys);
  notifyLocalMvpDataChanged();
}

export function clearAllLocalMvpData() {
  removeLocalStorageKeys(allMvpKeys);
  notifyLocalMvpDataChanged();
}

export function getLocalMvpStorageSummary() {
  return allMvpKeys.map((key) => {
    const value = localStorage.getItem(key);

    return {
      key,
      isStored: Boolean(value),
      size: value ? value.length : 0,
    };
  });
}

export function createLocalMvpBackup() {
  const data = allMvpKeys.reduce((backupData, key) => {
    const value = localStorage.getItem(key);

    if (!value) {
      return backupData;
    }

    return {
      ...backupData,
      [key]: value,
    };
  }, {});

  return {
    app: "FraudShield BD",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    keys: allMvpKeys,
    data,
  };
}

export function restoreLocalMvpBackup(backup) {
  if (!isValidLocalMvpBackup(backup)) {
    return {
      ok: false,
      message: "This file is not a valid FraudShield BD MVP backup.",
    };
  }

  removeLocalStorageKeys(allMvpKeys);

  Object.entries(backup.data).forEach(([key, value]) => {
    if (allMvpKeys.includes(key) && typeof value === "string") {
      localStorage.setItem(key, value);
    }
  });

  notifyLocalMvpDataChanged();

  return {
    ok: true,
    message: "Local MVP backup restored.",
  };
}

export function isValidLocalMvpBackup(backup) {
  return Boolean(
    backup &&
      backup.app === "FraudShield BD" &&
      backup.version === BACKUP_VERSION &&
      backup.data &&
      typeof backup.data === "object" &&
      !Array.isArray(backup.data),
  );
}

function removeLocalStorageKeys(keys) {
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
}

function notifyLocalMvpDataChanged() {
  window.dispatchEvent(new Event(DEMO_SESSION_UPDATED_EVENT));
  window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
  notifyLocalDataUpdated();
}
