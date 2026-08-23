"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Funnel,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
} from "../../lib/demoSession";
import {
  clearReadNotifications,
  defaultNotificationPreferences,
  getNotificationPreferences,
  getNotificationsForBrowser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  NOTIFICATION_UPDATED_EVENT,
  saveNotificationPreferences,
} from "../../lib/notificationData";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";
import AuthRequiredState from "../shared/AuthRequiredState";
import { apiRequest } from "../../lib/apiClient";

const filters = [
  "All",
  "Unread",
  "Report",
  "Watchlist",
  "Viewed",
  "Alert",
  "Search",
];
const preferenceLabels = [
  {
    key: "Report",
    label: "My reports",
    description: "Submitted reports saved to your account.",
  },
  {
    key: "Draft",
    label: "Drafts",
    description: "Saved or auto-saved report drafts.",
  },
  {
    key: "Watchlist",
    label: "Watchlist",
    description: "Identifiers you are watching.",
  },
  {
    key: "Viewed",
    label: "Viewed reports",
    description: "Reports you recently opened for detail review.",
  },
  {
    key: "Search",
    label: "Recent checks",
    description: "Recent Check Before You Pay searches.",
  },
  {
    key: "Alert",
    label: "High-risk alerts",
    description: "High-risk reports from the community feed.",
  },
];

function normalizeServerNotification(notification) {
  return {
    ...notification,
    id: notification._id,
    createdAt: notification.createdAt || "Recently",
    href: notification.href || "/notifications",
    tone: notification.tone || "Info",
    isRead: Boolean(notification.isRead),
  };
}

function mergeNotifications(serverNotifications, localNotifications) {
  const seenIds = new Set();

  return [...serverNotifications, ...localNotifications].filter((notification) => {
    if (!notification.id || seenIds.has(notification.id)) {
      return false;
    }

    seenIds.add(notification.id);
    return true;
  });
}

export default function NotificationsDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [preferences, setPreferences] = useState(defaultNotificationPreferences);
  const [serverPage, setServerPage] = useState(1);
  const [serverTotal, setServerTotal] = useState(0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      const currentUser = getDemoSession();

      setDemoUser(currentUser);
      setPreferences(getNotificationPreferences());
      const localNotifications = getNotificationsForBrowser(currentUser);
      setNotifications(localNotifications);

      if (window.localStorage.getItem("fraudshield-token")) {
        try {
          const result = await apiRequest("/notifications");
          const serverNotifications = (result.notifications || []).map(
            normalizeServerNotification,
          );
          setServerPage(Number(result.page) || 1);
          setServerTotal(Number(result.total) || serverNotifications.length);
          setNotifications(mergeNotifications(serverNotifications, localNotifications));
        } catch (_error) {
          // Keep browser notifications when the API is unavailable.
        }
      }
    }

    loadNotifications();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, loadNotifications);
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, loadNotifications);
    window.addEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
    window.addEventListener("storage", loadNotifications);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, loadNotifications);
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, loadNotifications);
      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
      window.removeEventListener("storage", loadNotifications);
    };
  }, []);

  async function loadOlderNotifications() {
    if (isLoadingOlder || serverPage * 50 >= serverTotal) {
      return;
    }

    setIsLoadingOlder(true);

    try {
      const nextPage = serverPage + 1;
      const result = await apiRequest(`/notifications?page=${nextPage}&limit=50`);
      const olderNotifications = (result.notifications || []).map(
        normalizeServerNotification,
      );

      setNotifications((currentNotifications) => {
        const existingIds = new Set(currentNotifications.map((item) => item.id));
        return [
          ...currentNotifications,
          ...olderNotifications.filter((item) => !existingIds.has(item.id)),
        ];
      });
      setServerPage(Number(result.page) || nextPage);
      setServerTotal(Number(result.total) || serverTotal);
    } catch (_error) {
      // Keep already-loaded notifications when older items cannot be fetched.
    } finally {
      setIsLoadingOlder(false);
    }
  }

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const typeFilteredNotifications =
      activeFilter === "All"
        ? notifications
        : activeFilter === "Unread"
          ? notifications.filter((notification) => !notification.isRead)
          : notifications.filter(
              (notification) => notification.type === activeFilter,
            );

    if (!normalizedSearch) {
      return typeFilteredNotifications;
    }

    return typeFilteredNotifications.filter((notification) =>
      [
        notification.title,
        notification.message,
        notification.type,
        notification.tone,
        notification.createdAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [activeFilter, notifications, searchValue]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const priorityNotification =
    notifications.find(
      (notification) =>
        !notification.isRead &&
        (notification.type === "Alert" || notification.tone === "High Risk"),
    ) ||
    notifications.find((notification) => !notification.isRead) ||
    notifications[0] ||
    null;
  const hasActiveSearch = Boolean(searchValue.trim());

  async function markAllRead() {
    setActionError("");
    const previousNotifications = notifications;
    markAllNotificationsAsRead(notifications);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
    if (window.localStorage.getItem("fraudshield-token")) {
      try {
        await apiRequest("/notifications/read-all", { method: "PATCH" });
      } catch (error) {
        previousNotifications.forEach((notification) => {
          if (!notification.isRead) {
            markNotificationAsUnread(notification.id);
          }
        });
        setNotifications(previousNotifications);
        setActionError(error.message || "Could not mark notifications as read.");
      }
    }
  }

  async function markOneRead(notificationId) {
    setActionError("");
    const previousNotifications = notifications;
    markNotificationAsRead(notificationId);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    if (!String(notificationId).startsWith("local-")) {
      try {
        await apiRequest(`/notifications/${notificationId}/read`, {
          method: "PATCH",
        });
      } catch (error) {
        markNotificationAsUnread(notificationId);
        setNotifications(previousNotifications);
        setActionError(error.message || "Could not mark this notification as read.");
      }
    }
  }

  function resetReadState() {
    clearReadNotifications();
    setNotifications(getNotificationsForBrowser(demoUser));
  }

  function updatePreference(preferenceKey, checked) {
    const nextPreferences = {
      ...preferences,
      [preferenceKey]: checked,
    };

    saveNotificationPreferences(nextPreferences);
    setPreferences(nextPreferences);
    setNotifications(getNotificationsForBrowser(demoUser));
  }

  if (!demoUser) {
    return (
      <AuthRequiredState
        title="Login to see notifications"
        description="Notifications are personal to your local demo account. Login or register first to see report, watchlist, and search alerts."
      />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
              <Bell size={24} />
            </div>

            <h1 className="mt-4 text-2xl font-black text-[#06285c]">
              Notifications
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Report, watchlist, draft, security, and recent-check alerts.
            </p>

            <div className="mt-5 grid gap-3">
              <NotificationStat label="Total" value={notifications.length} />
              <NotificationStat label="Unread" value={unreadCount} />
              <NotificationStat
                label="Watchlist"
                value={
                  notifications.filter(
                    (notification) => notification.type === "Watchlist",
                  ).length
                }
              />
              <NotificationStat
                label="Viewed"
                value={
                  notifications.filter(
                    (notification) => notification.type === "Viewed",
                  ).length
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">MVP note</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Report status, comment, like, and moderation alerts are synced
              from the server. Local activity alerts remain available as a
              fallback when the API is unavailable.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Priority
                </p>
                <h2 className="font-black text-[#06285c]">Next alert to check</h2>
              </div>
            </div>

            {priorityNotification ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-[#06285c]">
                  {priorityNotification.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {priorityNotification.message}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#06285c]">
                    {priorityNotification.type}
                  </span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600">
                    {priorityNotification.tone}
                  </span>
                </div>
                <Link
                  href={priorityNotification.href}
                  onClick={() => markOneRead(priorityNotification.id)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#06285c] px-4 py-3 text-sm font-black text-white transition hover:bg-[#041b3f]"
                >
                  Open Alert
                </Link>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No alerts yet. Report, watchlist and search activity will appear
                here.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">
              Notification preferences
            </h2>
            <div className="mt-4 space-y-4">
              {preferenceLabels.map((preference) => (
                <NotificationPreference
                  key={preference.key}
                  preference={preference}
                  checked={preferences[preference.key]}
                  onChange={updatePreference}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                  Activity center
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#06285c]">
                  Recent alerts
                </h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={resetReadState}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
                >
                  Reset
                </button>
              </div>
            </div>

            {actionError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {actionError}
              </p>
            )}

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                    activeFilter === filter
                      ? "border-[#009879] bg-[#009879] text-white"
                      : "border-slate-200 text-[#06285c] hover:border-[#009879] hover:text-[#009879]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="sr-only" htmlFor="notification-search">
                Search notifications
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
                <Search size={20} className="shrink-0 text-slate-400" />
                <input
                  id="notification-search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by report, identifier, alert type..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#06285c] outline-none placeholder:text-slate-400"
                />
                {hasActiveSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#06285c]"
                    aria-label="Clear notification search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {(activeFilter !== "All" || hasActiveSearch) && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Funnel size={16} />
                  Showing {filteredNotifications.length} of{" "}
                  {notifications.length} notification
                  {notifications.length === 1 ? "" : "s"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchValue("");
                  }}
                  className="text-left text-sm font-black text-[#009879] hover:text-[#007f66] sm:text-right"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {filteredNotifications.length === 0 ? (
            <EmptyNotifications
              activeFilter={activeFilter}
              hasActiveSearch={hasActiveSearch}
              onClear={() => {
                setActiveFilter("All");
                setSearchValue("");
              }}
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={markOneRead}
                />
              ))}
            </div>
          )}

          {serverTotal > serverPage * 50 && (
            <button
              type="button"
              onClick={loadOlderNotifications}
              disabled={isLoadingOlder}
              className="mt-4 min-h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingOlder ? "Loading older notifications..." : "Load older notifications"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NotificationStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="font-black text-[#06285c]">{value}</p>
    </div>
  );
}

function NotificationPreference({ preference, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-slate-50 p-3">
      <span>
        <span className="block text-sm font-black text-[#06285c]">
          {preference.label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {preference.description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(preference.key, event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#009879]"
      />
    </label>
  );
}

function NotificationRow({ notification, onRead }) {
  return (
    <Link
      href={notification.href}
      onClick={() => onRead(notification.id)}
      className={`flex min-w-0 items-start gap-4 p-4 transition hover:bg-slate-50 sm:p-5 ${
        notification.isRead ? "bg-white" : "bg-[#f8fffc]"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        {renderNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-lg font-black text-[#06285c]">
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-black text-red-600">
              New
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-[#06285c]">
            {notification.type}
          </span>
        </div>

        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
          {notification.message}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {notification.createdAt}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${getToneBadgeClass(
              notification.tone,
            )}`}
          >
            {notification.tone}
          </span>
        </div>
      </div>

      <CheckCircle2
        size={20}
        className={`mt-3 shrink-0 ${
          notification.isRead ? "text-slate-300" : "text-[#009879]"
        }`}
      />
    </Link>
  );
}

function EmptyNotifications({ activeFilter, hasActiveSearch, onClear }) {
  const isFiltered = activeFilter !== "All" || hasActiveSearch;

  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Bell size={30} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#06285c]">
        {isFiltered
          ? "No notifications match"
          : `No ${activeFilter.toLowerCase()} notifications`}
      </h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        {isFiltered
          ? "Try another search or clear your filters to see all notifications."
          : "Activity from your reports, watchlist and checks will appear here."}
      </p>
      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

function renderNotificationIcon(type) {
  if (type === "Report") {
    return <FileText size={23} />;
  }

  if (type === "Watchlist") {
    return <Eye size={23} />;
  }

  if (type === "Search") {
    return <Search size={23} />;
  }

  if (type === "Viewed") {
    return <Clock size={23} />;
  }

  if (type === "Draft") {
    return <Bell size={23} />;
  }

  return <ShieldAlert size={23} />;
}

function getToneBadgeClass(tone) {
  if (tone === "High Risk") {
    return "bg-red-100 text-red-600";
  }

  if (tone === "Medium Risk") {
    return "bg-orange-100 text-orange-600";
  }

  if (tone === "Low Risk") {
    return "bg-[#e9f8f4] text-[#009879]";
  }

  if (tone === "Follow-up") {
    return "bg-[#eef6ff] text-[#0b63f6]";
  }

  if (tone === "Draft") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-slate-100 text-[#06285c]";
}
