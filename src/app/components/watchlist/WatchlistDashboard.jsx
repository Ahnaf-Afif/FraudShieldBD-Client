"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  ChevronRight,
  Eye,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { getDemoSession } from "../../lib/demoSession";
import {
  getWatchlistFromBrowser,
  removeFromWatchlist,
  toggleWatchlistAlerts,
} from "../../lib/watchlistData";
import { getRiskStyle, maskIdentifier } from "../../lib/reportFeedData";

const filters = ["All", "High Risk", "Medium Risk", "Low Risk"];

export default function WatchlistDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setDemoUser(getDemoSession());
    setWatchlistItems(getWatchlistFromBrowser());
  }, []);

  const filteredItems = useMemo(() => {
    return watchlistItems
      .filter((item) =>
        activeFilter === "All" ? true : item.riskLevel === activeFilter,
      )
      .filter((item) => {
        const cleanSearch = searchValue.trim().toLowerCase();

        if (!cleanSearch) {
          return true;
        }

        return [item.identifier, item.type, item.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(cleanSearch);
      });
  }, [activeFilter, searchValue, watchlistItems]);

  function handleRemove(identifier) {
    removeFromWatchlist(identifier);
    setWatchlistItems(getWatchlistFromBrowser());
  }

  function handleToggleAlerts(identifier) {
    toggleWatchlistAlerts(identifier);
    setWatchlistItems(getWatchlistFromBrowser());
  }

  if (!demoUser) {
    return <SignedOutState />;
  }

  const alertCount = watchlistItems.filter((item) => item.alertsEnabled).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
              <Eye size={24} />
            </div>

            <h2 className="mt-4 text-xl font-black text-[#06285c]">
              Watchlist
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Saved identifiers from this browser appear here for quick checks.
            </p>

            <div className="mt-5 grid gap-3">
              <WatchStat label="Watching" value={String(watchlistItems.length)} />
              <WatchStat label="Alerts On" value={String(alertCount)} />
              <WatchStat
                label="High Risk"
                value={String(
                  watchlistItems.filter((item) => item.riskLevel === "High Risk")
                    .length,
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Add from checks</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search an identifier, then add risky matches to your watchlist.
            </p>
            <Link
              href="/check"
              className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
            >
              Check Identifier
            </Link>
          </div>
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                  Saved identifiers
                </p>
                <h1 className="mt-1 text-2xl font-black text-[#06285c]">
                  My Watchlist
                </h1>
              </div>

              <Link
                href="/check"
                className="inline-flex items-center justify-center rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
              >
                Search More
              </Link>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
                <Search size={18} className="text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search watched identifiers..."
                  className="w-full min-w-0 text-sm font-semibold text-[#06285c] outline-none"
                />
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1">
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
          </div>

          {filteredItems.length === 0 ? (
            <EmptyWatchlist />
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <WatchlistRow
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onToggleAlerts={handleToggleAlerts}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WatchStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="font-black text-[#06285c]">{value}</p>
    </div>
  );
}

function WatchlistRow({ item, onRemove, onToggleAlerts }) {
  const riskStyle = getRiskStyle(item.riskLevel);
  const detailHref = item.reportId ? `/reports/${item.reportId}` : "/reports";

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <ShieldAlert size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-lg font-black text-[#06285c]">
              {maskIdentifier(item.identifier)}
            </h2>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${riskStyle}`}>
              {item.riskLevel}
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {item.type} • Added {item.addedAt}
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
            {item.title || "Watched from a community report."}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={detailHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
            >
              View Source
              <ChevronRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => onToggleAlerts(item.identifier)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
            >
              {item.alertsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              {item.alertsEnabled ? "Alerts On" : "Alerts Off"}
            </button>

            <button
              type="button"
              onClick={() => onRemove(item.identifier)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyWatchlist() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Eye size={30} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#06285c]">
        Nothing watched yet
      </h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        Add suspicious identifiers from check results or report details.
      </p>
      <Link
        href="/check"
        className="mt-5 inline-flex rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
      >
        Check Identifier
      </Link>
    </div>
  );
}

function SignedOutState() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <AlertTriangle size={30} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-[#06285c]">
          Login to use your watchlist
        </h1>
        <p className="mt-2 leading-7 text-slate-600">
          This MVP saves watched identifiers to your local demo account.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl border border-[#0b63f6] px-5 py-3 text-sm font-black text-[#0b63f6]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}
