"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  FileText,
  PencilLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getDemoSession,
  getInitials,
  updateDemoSession,
} from "../../lib/demoSession";
import {
  getSavedReportDraftFromBrowser,
  getSubmittedReportsFromBrowser,
  normalizeSubmittedReport,
} from "../../lib/reportFeedData";
import { getWatchlistFromBrowser } from "../../lib/watchlistData";
import { getUnreadNotificationCount } from "../../lib/notificationData";

const roleOptions = [
  "Community Member",
  "Verified Reporter",
  "Safety Volunteer",
  "Moderator Trainee",
];

export default function ProfileDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "" });
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const currentUser = getDemoSession();

    setDemoUser(currentUser);
    setFormData({
      name: currentUser?.name || "",
      role: currentUser?.role || "Community Member",
    });
  }, []);

  const activityStats = useMemo(() => createProfileStats(demoUser), [demoUser]);

  function updateField(fieldName, value) {
    setSaveStatus("");
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  function saveProfile(event) {
    event.preventDefault();

    const nextSession = updateDemoSession({
      name: formData.name.trim(),
      role: formData.role,
    });

    setDemoUser(nextSession);
    setSaveStatus("saved");
  }

  if (!demoUser) {
    return <SignedOutProfileState />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#009879] text-2xl font-black text-white">
              {getInitials(demoUser.name || demoUser.email)}
            </div>

            <h1 className="mt-4 break-words text-2xl font-black text-[#06285c]">
              {demoUser.name}
            </h1>
            <p className="mt-1 break-words text-sm font-semibold text-slate-500">
              {demoUser.email}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-[#e9f8f4] px-3 py-1 text-xs font-black text-[#009879]">
              {demoUser.role}
            </span>

            <div className="mt-5 rounded-xl bg-slate-50 p-3 text-left">
              <p className="text-xs font-black uppercase text-slate-400">
                Signed in
              </p>
              <p className="mt-1 text-sm font-bold text-[#06285c]">
                {demoUser.signedInAt || "Current session"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Profile purpose</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is a local MVP profile. Real identity verification and trust
              scores will come from the backend later.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                <UserRound size={22} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                  Local profile
                </p>
                <h2 className="text-2xl font-black text-[#06285c]">
                  Edit account details
                </h2>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-6 grid gap-4">
              <label>
                <span className="mb-2 block text-sm font-bold text-[#06285c]">
                  Display name
                </span>
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                  placeholder="Your display name"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#06285c]">
                  Role label
                </span>
                <select
                  value={formData.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                >
                  {roleOptions.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400"
                >
                  <CheckCircle2 size={18} />
                  Save Profile
                </button>

                {saveStatus === "saved" && (
                  <p className="text-sm font-black text-[#009879]">
                    Profile updated locally.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileStat
              icon={<FileText size={21} />}
              label="Submitted reports"
              value={activityStats.submittedReports}
              href="/my-reports"
            />
            <ProfileStat
              icon={<PencilLine size={21} />}
              label="Saved drafts"
              value={activityStats.drafts}
              href="/report-fraud"
            />
            <ProfileStat
              icon={<ShieldCheck size={21} />}
              label="Watchlist items"
              value={activityStats.watchlistItems}
              href="/watchlist"
            />
            <ProfileStat
              icon={<Bell size={21} />}
              label="Unread alerts"
              value={activityStats.unreadNotifications}
              href="/notifications"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ icon, label, value, href }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#009879] hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-black text-[#06285c]">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </Link>
  );
}

function SignedOutProfileState() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <UserRound size={30} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-[#06285c]">
          Login to edit your profile
        </h1>
        <p className="mt-2 leading-7 text-slate-600">
          This MVP uses a local demo account. Login or register first.
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

function createProfileStats(demoUser) {
  if (!demoUser) {
    return {
      submittedReports: 0,
      drafts: 0,
      watchlistItems: 0,
      unreadNotifications: 0,
    };
  }

  const submittedReports = getSubmittedReportsFromBrowser()
    .map(normalizeSubmittedReport)
    .filter((report) => isOwnedByUser(report, demoUser));
  const draftReport = getSavedReportDraftFromBrowser();

  return {
    submittedReports: submittedReports.length,
    drafts: draftReport && isOwnedByUser(draftReport, demoUser) ? 1 : 0,
    watchlistItems: getWatchlistFromBrowser().length,
    unreadNotifications: getUnreadNotificationCount(demoUser),
  };
}

function isOwnedByUser(report, user) {
  return report.ownerEmail === user.email || report.reporterEmail === user.email;
}
