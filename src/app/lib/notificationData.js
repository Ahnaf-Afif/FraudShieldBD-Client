import { getRecentSearchesFromBrowser } from "./recentSearches";
import {
  getAllReportsForBrowser,
  getPrimaryIdentifier,
  getRecentlyViewedReportsFromBrowser,
  getSavedReportDraftFromBrowser,
  getSubmittedReportsFromBrowser,
  maskIdentifier,
  normalizeSubmittedReport,
} from "./reportFeedData";
import { getWatchlistFromBrowser } from "./watchlistData";
import { notifyLocalDataUpdated } from "./localDataEvents";
import { readJsonObject } from "./browserStorage";

export const NOTIFICATION_READ_KEY = "fraudshield-read-notifications";
export const NOTIFICATION_PREFS_KEY = "fraudshield-notification-preferences";
export const NOTIFICATION_UPDATED_EVENT = "fraudshield-notifications-updated";

export const defaultNotificationPreferences = {
  Report: true,
  Draft: true,
  Watchlist: true,
  Viewed: true,
  Search: true,
  Alert: true,
};

export function getNotificationsForBrowser(demoUser) {
  const submittedReports = getSubmittedReportsFromBrowser().map(
    normalizeSubmittedReport,
  );
  const draftReport = getSavedReportDraftFromBrowser();
  const watchlistItems = getWatchlistFromBrowser();
  const recentlyViewedReports = getRecentlyViewedReportsFromBrowser();
  const recentSearches = getRecentSearchesFromBrowser();
  const allReports = getAllReportsForBrowser();
  const readNotifications = getReadNotifications();
  const preferences = getNotificationPreferences();

  const notifications = [
    ...(preferences.Report
      ? createSubmittedReportNotifications(submittedReports, demoUser)
      : []),
    ...(preferences.Report
      ? createFollowUpReportNotifications(allReports, demoUser)
      : []),
    ...(preferences.Draft ? createDraftNotifications(draftReport, demoUser) : []),
    ...(preferences.Watchlist ? createWatchlistNotifications(watchlistItems) : []),
    ...(preferences.Viewed
      ? createRecentlyViewedNotifications(recentlyViewedReports)
      : []),
    ...(preferences.Search ? createRecentSearchNotifications(recentSearches) : []),
    ...(preferences.Alert ? createHighRiskNotifications(allReports) : []),
  ];

  return notifications.map((notification) => ({
    ...notification,
    isRead: Boolean(readNotifications[notification.id]),
  }));
}

export function getUnreadNotificationCount(demoUser) {
  return getNotificationsForBrowser(demoUser).filter(
    (notification) => !notification.isRead,
  ).length;
}

export function markNotificationAsRead(notificationId) {
  if (!notificationId) {
    return;
  }

  const readNotifications = getReadNotifications();

  localStorage.setItem(
    NOTIFICATION_READ_KEY,
    JSON.stringify({
      ...readNotifications,
      [notificationId]: true,
    }),
  );
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
}

export function markNotificationAsUnread(notificationId) {
  if (!notificationId) {
    return;
  }

  const readNotifications = getReadNotifications();
  delete readNotifications[notificationId];
  localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(readNotifications));
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
}

export function markAllNotificationsAsRead(notifications) {
  const readNotifications = getReadNotifications();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const nextReadNotifications = safeNotifications.reduce(
    (readMap, notification) => ({
      ...readMap,
      [notification.id]: true,
    }),
    readNotifications,
  );

  localStorage.setItem(
    NOTIFICATION_READ_KEY,
    JSON.stringify(nextReadNotifications),
  );
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
}

export function clearReadNotifications() {
  localStorage.removeItem(NOTIFICATION_READ_KEY);
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
}

export function getNotificationPreferences() {
  const savedPreferences = readJsonObject(NOTIFICATION_PREFS_KEY, null);

  if (!savedPreferences) {
    return defaultNotificationPreferences;
  }

  return normalizeNotificationPreferences(savedPreferences);
}

export function saveNotificationPreferences(preferences) {
  localStorage.setItem(
    NOTIFICATION_PREFS_KEY,
    JSON.stringify(normalizeNotificationPreferences(preferences)),
  );
  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
  notifyLocalDataUpdated();
}

function getReadNotifications() {
  return readJsonObject(NOTIFICATION_READ_KEY);
}

function createSubmittedReportNotifications(reports, demoUser) {
  if (!demoUser) {
    return [];
  }

  return reports
    .filter((report) => isOwnedByUser(report, demoUser))
    .slice(0, 5)
    .map((report) => ({
      id: `submitted-${report.reportId}`,
      type: "Report",
      title: "Report saved to your account",
      message: `${report.title || "Untitled report"} is available in My Reports.`,
      href: `/reports/${report.reportId}`,
      createdAt: report.submittedAt || "Recently",
      tone: report.riskLevel || "Submitted",
    }));
}

function createFollowUpReportNotifications(reports, demoUser) {
  if (!demoUser) {
    return [];
  }

  const ownedReportIds = new Set(
    reports
      .filter((report) => isOwnedByUser(report, demoUser))
      .map((report) => report.reportId),
  );

  return reports
    .filter((report) => ownedReportIds.has(report.relatedReportId))
    .slice(0, 5)
    .map((report) => ({
      id: `follow-up-${report.reportId}`,
      type: "Report",
      title: "New follow-up report",
      message: `${report.title || "A connected report"} was submitted from one of your reports.`,
      href: `/reports/${report.reportId}`,
      createdAt: report.submittedAt || "Recently",
      tone: "Follow-up",
    }));
}

function createDraftNotifications(draftReport, demoUser) {
  if (!draftReport || (demoUser && !isOwnedByUser(draftReport, demoUser))) {
    return [];
  }

  return [
    {
      id: `draft-${draftReport.reportId}`,
      type: "Draft",
      title: "Draft waiting to finish",
      message: `${draftReport.title || "Untitled report draft"} was saved in this browser.`,
      href: "/report-fraud",
      createdAt: draftReport.savedAt || "Saved recently",
      tone: "Draft",
    },
  ];
}

function createWatchlistNotifications(items) {
  return items.slice(0, 5).map((item) => ({
    id: `watchlist-${item.id}`,
    type: "Watchlist",
    title: "Identifier on your watchlist",
    message: `${maskIdentifier(item.identifier)} is being watched for new scam reports.`,
    href: item.reportId ? `/reports/${item.reportId}` : "/watchlist",
    createdAt: item.addedAt || "Recently",
    tone: item.riskLevel || "Watching",
  }));
}

function createRecentlyViewedNotifications(reports) {
  return reports.slice(0, 3).map((report) => ({
    id: `viewed-${report.reportId}`,
    type: "Viewed",
    title: "Recently viewed report",
    message: `${report.title} is ready to review again before you take action.`,
    href: `/reports/${report.reportId}`,
    createdAt: report.viewedAt || "Recently viewed",
    tone: report.riskLevel || "Viewed",
  }));
}

function createRecentSearchNotifications(searches) {
  return searches.slice(0, 3).map((search) => ({
    id: `search-${search.toLowerCase()}`,
    type: "Search",
    title: "Recent check available",
    message: `You recently checked "${search}". Tap to run the check again.`,
    href: `/check?q=${encodeURIComponent(search)}`,
    createdAt: "Recent search",
    tone: "Lookup",
  }));
}

function createHighRiskNotifications(reports) {
  return reports
    .filter((report) => report.riskLevel === "High Risk")
    .slice(0, 3)
    .map((report) => ({
      id: `high-risk-${report.reportId}`,
      type: "Alert",
      title: "High-risk community report",
      message: `${maskIdentifier(getPrimaryIdentifier(report))} was reported as high risk.`,
      href: `/reports/${report.reportId}`,
      createdAt: report.submittedAt || "Recently",
      tone: "High Risk",
    }));
}

function isOwnedByUser(report, user) {
  return report.ownerEmail === user.email || report.reporterEmail === user.email;
}

function normalizeNotificationPreferences(preferences = {}) {
  return Object.keys(defaultNotificationPreferences).reduce(
    (nextPreferences, preferenceKey) => ({
      ...nextPreferences,
      [preferenceKey]:
        typeof preferences[preferenceKey] === "boolean"
          ? preferences[preferenceKey]
          : defaultNotificationPreferences[preferenceKey],
    }),
    {},
  );
}
