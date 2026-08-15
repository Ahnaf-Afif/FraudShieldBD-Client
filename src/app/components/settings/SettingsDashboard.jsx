"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Database,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  clearAllLocalMvpData,
  clearLocalMvpActivity,
  getLocalMvpStorageSummary,
} from "../../lib/localMvpData";

export default function SettingsDashboard() {
  const [storageSummary, setStorageSummary] = useState([]);
  const [status, setStatus] = useState("");
  const [confirmMode, setConfirmMode] = useState("");

  useEffect(() => {
    refreshStorageSummary();
  }, []);

  function refreshStorageSummary() {
    setStorageSummary(getLocalMvpStorageSummary());
  }

  function clearActivity() {
    if (confirmMode !== "activity") {
      setConfirmMode("activity");
      setStatus("");
      return;
    }

    clearLocalMvpActivity();
    setConfirmMode("");
    setStatus("activity-cleared");
    refreshStorageSummary();
  }

  function clearEverything() {
    if (confirmMode !== "all") {
      setConfirmMode("all");
      setStatus("");
      return;
    }

    clearAllLocalMvpData();
    setConfirmMode("");
    setStatus("all-cleared");
    refreshStorageSummary();
  }

  const storedItemCount = storageSummary.filter((item) => item.isStored).length;
  const totalStorageSize = storageSummary.reduce(
    (totalSize, item) => totalSize + item.size,
    0,
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
              <ShieldCheck size={25} />
            </div>

            <h1 className="mt-4 text-2xl font-black text-[#06285c]">
              Settings
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage local MVP data saved in this browser. Backend account
              settings will replace this later.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Storage summary</h2>
            <div className="mt-4 grid gap-3">
              <SettingsStat label="Stored groups" value={storedItemCount} />
              <SettingsStat
                label="Approx. size"
                value={`${totalStorageSize.toLocaleString()} chars`}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6ff] text-[#0b63f6]">
                <Database size={22} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                  Local MVP data
                </p>
                <h2 className="text-2xl font-black text-[#06285c]">
                  Browser storage controls
                </h2>
              </div>
            </div>

            <p className="mt-4 leading-7 text-slate-600">
              During the frontend MVP, reports, drafts, watchlist items,
              comments, notifications and demo login state are saved locally in
              your browser. These controls help reset that data safely.
            </p>

            <StatusMessage status={status} />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DangerAction
                icon={<RefreshCcw size={22} />}
                title="Clear activity only"
                text="Removes reports, drafts, comments, reactions, watchlist, recent searches and read notifications. Keeps demo login and preferences."
                buttonLabel={
                  confirmMode === "activity"
                    ? "Confirm Clear Activity"
                    : "Clear Activity"
                }
                tone="warning"
                onClick={clearActivity}
              />

              <DangerAction
                icon={<Trash2 size={22} />}
                title="Clear everything"
                text="Removes all local MVP data, including demo login session and notification preferences."
                buttonLabel={
                  confirmMode === "all"
                    ? "Confirm Clear Everything"
                    : "Clear Everything"
                }
                tone="danger"
                onClick={clearEverything}
              />
            </div>

            {confirmMode && (
              <p className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold leading-6 text-orange-800">
                Click the same button again to confirm. This only affects this
                browser.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-black text-[#06285c]">Stored data groups</h2>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {storageSummary.map((item) => (
                <StorageRow key={item.key} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsStat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-sm font-black text-[#06285c]">{value}</p>
    </div>
  );
}

function StatusMessage({ status }) {
  if (!status) {
    return null;
  }

  const message =
    status === "activity-cleared"
      ? "Local activity data was cleared."
      : "All local MVP data was cleared.";

  return (
    <div className="mt-5 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-4 text-sm font-black text-[#007f66]">
      {message}
    </div>
  );
}

function DangerAction({ icon, title, text, buttonLabel, tone, onClick }) {
  const buttonClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[#06285c]">
          {icon}
        </div>
        <div>
          <h3 className="font-black text-[#06285c]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition ${buttonClass}`}
      >
        <AlertTriangle size={17} />
        {buttonLabel}
      </button>
    </div>
  );
}

function StorageRow({ item }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="break-words text-sm font-black text-[#06285c]">
          {item.key}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {item.isStored ? "Stored in this browser" : "Not stored"}
        </p>
      </div>

      <span className="w-fit rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
        {item.size.toLocaleString()} chars
      </span>
    </div>
  );
}
