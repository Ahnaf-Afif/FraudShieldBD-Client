"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Search,
  ShieldAlert,
} from "lucide-react";
import { getDemoSession } from "../../lib/demoSession";
import {
  clearReadNotifications,
  getNotificationsForBrowser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATION_UPDATED_EVENT,
} from "../../lib/notificationData";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";

const filters = ["All", "Unread", "Report", "Watchlist", "Alert", "Search"];

export default function NotificationsDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    function loadNotifications() {
      const currentUser = getDemoSession();

      setDemoUser(currentUser);
      setNotifications(getNotificationsForBrowser(currentUser));
    }

    loadNotifications();
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, loadNotifications);
    window.addEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
    window.addEventListener("storage", loadNotifications);

    return () => {
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, loadNotifications);
      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
      window.removeEventListener("storage", loadNotifications);
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") {
      return notifications;
    }

    if (activeFilter === "Unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications.filter(
      (notification) => notification.type === activeFilter,
    );
  }, [activeFilter, notifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  function markAllRead() {
    markAllNotificationsAsRead(notifications);
    setNotifications(getNotificationsForBrowser(demoUser));
  }

  function resetReadState() {
    clearReadNotifications();
    setNotifications(getNotificationsForBrowser(demoUser));
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
              Local MVP alerts from reports, watchlist items, drafts and recent
              checks.
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
            </div>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">MVP note</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These are generated from browser data. Backend notifications will
              replace this later.
            </p>
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
          </div>

          {filteredNotifications.length === 0 ? (
            <EmptyNotifications activeFilter={activeFilter} />
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={markNotificationAsRead}
                />
              ))}
            </div>
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

function NotificationRow({ notification, onRead }) {
  const Icon = getNotificationIcon(notification.type);

  return (
    <Link
      href={notification.href}
      onClick={() => onRead(notification.id)}
      className={`flex min-w-0 items-start gap-4 p-4 transition hover:bg-slate-50 sm:p-5 ${
        notification.isRead ? "bg-white" : "bg-[#f8fffc]"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Icon size={23} />
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
          <span>{notification.tone}</span>
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

function EmptyNotifications({ activeFilter }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Bell size={30} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#06285c]">
        No {activeFilter.toLowerCase()} notifications
      </h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        Activity from your reports, watchlist and checks will appear here.
      </p>
    </div>
  );
}

function getNotificationIcon(type) {
  if (type === "Report") {
    return FileText;
  }

  if (type === "Watchlist") {
    return Eye;
  }

  if (type === "Search") {
    return Search;
  }

  if (type === "Draft") {
    return AlertTriangle;
  }

  return ShieldAlert;
}
