"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PencilLine,
  ShieldCheck,
  Star,
  Users,
  UserRound,
} from "lucide-react";
import {
  getDemoSession,
  DEMO_SESSION_UPDATED_EVENT,
  getInitials,
  updateDemoSession,
} from "../../lib/demoSession";
import {
  getSavedReportComments,
  getSavedReportReactions,
  getSavedReportDraftFromBrowser,
  getRecentlyViewedReportsFromBrowser,
  getSubmittedReportsFromBrowser,
  normalizeSubmittedReport,
} from "../../lib/reportFeedData";
import { getWatchlistFromBrowser } from "../../lib/watchlistData";
import { getUnreadNotificationCount } from "../../lib/notificationData";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";
import { apiRequest } from "../../lib/apiClient";
import AuthRequiredState from "../shared/AuthRequiredState";

export default function ProfileDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    bio: "",
  });
  const [saveStatus, setSaveStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function refreshProfile() {
      const currentUser = getDemoSession();
      setLoadError("");

      if (currentUser && window.localStorage.getItem("fraudshield-token")) {
        try {
          const result = await apiRequest("/auth/me");
          const hasSessionChanged = [
            "name",
            "role",
            "location",
            "bio",
            "emailVerified",
          ].some(
            (field) =>
              String(currentUser[field] ?? "") !==
              String(result.user[field] ?? ""),
          );

          if (hasSessionChanged) {
            updateDemoSession(result.user);
          }

          setDemoUser(hasSessionChanged ? getDemoSession() : currentUser);
          setFormData({
            name: result.user.name || "",
            role: result.user.role || "Community Member",
            location: result.user.location || "",
            bio: result.user.bio || "",
          });
          return;
        } catch (error) {
          setLoadError(
            error.message ||
              "The live profile could not be loaded. Showing saved details instead.",
          );
        }
      }

      setDemoUser(currentUser);
      setFormData({
        name: currentUser?.name || "",
        role: currentUser?.role || "Community Member",
        location: currentUser?.location || "",
        bio: currentUser?.bio || "",
      });
    }

    refreshProfile();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, refreshProfile);
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, refreshProfile);
    window.addEventListener("storage", refreshProfile);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, refreshProfile);
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
  }, [reloadKey]);

  async function resendVerificationEmail() {
    setVerificationStatus("sending");

    try {
      const result = await apiRequest("/auth/resend-verification", { method: "POST" });
      setVerificationStatus(result.message);
    } catch (error) {
      setVerificationStatus(error.message || "Could not send a verification email.");
    }
  }

  const activityStats = useMemo(() => createProfileStats(demoUser), [demoUser]);
  const profileCompletion = useMemo(
    () => calculateProfileCompletion(demoUser),
    [demoUser],
  );
  const trustScore = useMemo(
    () => calculateTrustScore(activityStats, profileCompletion),
    [activityStats, profileCompletion],
  );
  const verificationItems = useMemo(
    () => createVerificationItems(demoUser, activityStats),
    [demoUser, activityStats],
  );

  function updateField(fieldName, value) {
    setSaveStatus("");
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setSaveStatus("name-error");
      return;
    }

    if (formData.name.trim().length > 80) {
      setSaveStatus("Name must contain 80 characters or fewer.");
      return;
    }

    try {
      const hasApiSession = Boolean(
        window.localStorage.getItem("fraudshield-token"),
      );
      const profileResult = hasApiSession
        ? await apiRequest("/auth/me", {
            method: "PATCH",
            body: JSON.stringify({
              name: formData.name.trim(),
              location: formData.location.trim(),
              bio: formData.bio.trim(),
            }),
          })
        : { user: formData };
      const nextSession = updateDemoSession({
        ...profileResult.user,
        role: profileResult.user.role || demoUser.role || "Community Member",
      });

      setDemoUser(nextSession);
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus(error.message || "profile-error");
    }
  }

  if (!demoUser) {
    return (
      <AuthRequiredState
        title="Login to edit your profile"
        description="Login or register to edit your profile and see your personal activity summary."
        icon="user"
      />
    );
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

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">
                    Trust score
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#06285c]">
                    {trustScore}%
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                  <ShieldCheck size={28} />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#009879]"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-left">
              <p className="text-xs font-black uppercase text-slate-400">
                Signed in
              </p>
              <p className="mt-1 text-sm font-bold text-[#06285c]">
                {demoUser.signedInAt || "Current session"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-[#06285c]">Profile completion</h2>
              <span className="text-sm font-black text-[#009879]">
                {profileCompletion}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#009879]"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A complete profile helps moderators understand who is reporting
              and makes community reports easier to trust.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-[#06285c]">Email verification</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${demoUser.emailVerified ? "bg-[#e9f8f4] text-[#009879]" : "bg-orange-50 text-orange-600"}`}>
                {demoUser.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {demoUser.emailVerified
                ? "Your email address is verified and can be used for account recovery."
                : "Verify your email to make password recovery and account ownership safer."}
            </p>
            {!demoUser.emailVerified && (
              <button
                type="button"
                onClick={resendVerificationEmail}
                disabled={verificationStatus === "sending"}
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#bfe8dc] px-4 text-sm font-black text-[#009879] transition hover:bg-[#f0fbf7] disabled:cursor-wait disabled:opacity-60"
              >
                {verificationStatus === "sending" ? "Sending..." : "Resend verification email"}
              </button>
            )}
            {verificationStatus && verificationStatus !== "sending" && (
              <p className="mt-3 text-sm font-semibold text-[#007f66]">{verificationStatus}</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Profile purpose</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your profile details are synced to the server. Identity verification
              and advanced trust scoring will be added as the platform grows.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {loadError && (
            <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm font-semibold text-orange-800 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p>{loadError} Saved profile details may be incomplete.</p>
              <button
                type="button"
                onClick={() => setReloadKey((currentKey) => currentKey + 1)}
                className="shrink-0 rounded-lg border border-orange-300 px-3 py-2 font-black transition hover:bg-orange-100"
              >
                Retry
              </button>
            </div>
          )}

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
                  maxLength={80}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                  placeholder="Your display name"
                />
              </label>

              {saveStatus === "name-error" && (
                <p className="-mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  Display name is required.
                </p>
              )}

              <div>
                <span className="mb-2 block text-sm font-bold text-[#06285c]">
                  Account role
                </span>
                <div className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-[#06285c]">
                  <span>{formData.role || "Community Member"}</span>
                  <span className="text-xs font-bold text-slate-400">Managed by Admin</span>
                </div>
              </div>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#06285c]">
                  Location
                </span>
                <input
                  value={formData.location}
                  maxLength={120}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                  placeholder="Example: Dhaka, Bangladesh"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#06285c]">
                  Short bio
                </span>
                <textarea
                  value={formData.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  rows={4}
                  maxLength={180}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                  placeholder="Tell the community why you report scams."
                />
                <span className="mt-2 block text-right text-xs font-bold text-slate-400">
                  {formData.bio.length}/180
                </span>
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
                    Profile updated successfully.
                  </p>
                )}
                {saveStatus &&
                  saveStatus !== "saved" &&
                  saveStatus !== "name-error" && (
                    <p className="text-sm font-black text-red-600">
                      {saveStatus}
                    </p>
                  )}
              </div>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
              icon={<Clock size={21} />}
              label="Viewed reports"
              value={activityStats.recentlyViewedReports}
              href="/reports"
            />
            <ProfileStat
              icon={<Bell size={21} />}
              label="Unread alerts"
              value={activityStats.unreadNotifications}
              href="/notifications"
            />
            <ProfileStat
              icon={<Users size={21} />}
              label="Connected reports"
              value={activityStats.connectedReports}
              href="/my-reports"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                  <Award size={22} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                    Trust progress
                  </p>
                  <h2 className="text-2xl font-black text-[#06285c]">
                    How your score is built
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {verificationItems.map((item) => (
                  <VerificationItem key={item.label} item={item} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7e8] text-orange-500">
                <Star size={22} />
              </div>
              <h2 className="mt-4 text-2xl font-black text-[#06285c]">
                Next best action
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {getNextProfileAction(demoUser, activityStats)}
              </p>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/report-fraud"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#009879] px-4 text-sm font-black text-white transition hover:bg-[#007f66]"
                >
                  Report a Fraud
                </Link>
                <Link
                  href="/check"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
                >
                  Check an Identifier
                </Link>
              </div>
            </div>
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

function VerificationItem({ item }) {
  const Icon = item.isComplete ? CheckCircle2 : Circle;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <Icon
        size={21}
        className={`mt-0.5 shrink-0 ${
          item.isComplete ? "text-[#009879]" : "text-slate-300"
        }`}
      />
      <div>
        <p className="font-black text-[#06285c]">{item.label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function createProfileStats(demoUser) {
  if (!demoUser) {
    return {
      submittedReports: 0,
      drafts: 0,
      watchlistItems: 0,
      recentlyViewedReports: 0,
      unreadNotifications: 0,
      connectedReports: 0,
      commentsReceived: 0,
      helpfulVotes: 0,
    };
  }

  const submittedReports = getSubmittedReportsFromBrowser()
    .map(normalizeSubmittedReport)
    .filter((report) => isOwnedByUser(report, demoUser));
  const draftReport = getSavedReportDraftFromBrowser();
  const savedComments = getSavedReportComments();
  const savedReactions = getSavedReportReactions();
  const ownedReportIds = submittedReports.map((report) => report.reportId);

  return {
    submittedReports: submittedReports.length,
    drafts: draftReport && isOwnedByUser(draftReport, demoUser) ? 1 : 0,
    watchlistItems: getWatchlistFromBrowser().length,
    recentlyViewedReports: getRecentlyViewedReportsFromBrowser().length,
    unreadNotifications: getUnreadNotificationCount(demoUser),
    connectedReports: submittedReports.filter(
      (report) => report.relatedReportId || (report.followUpCount || 0) > 0,
    ).length,
    commentsReceived: ownedReportIds.reduce(
      (totalComments, reportId) =>
        totalComments + (savedComments[reportId] || []).length,
      0,
    ),
    helpfulVotes: ownedReportIds.reduce(
      (totalVotes, reportId) =>
        totalVotes + (savedReactions[reportId]?.likes || 0),
      0,
    ),
  };
}

function calculateProfileCompletion(user) {
  if (!user) {
    return 0;
  }

  const fields = [user.name, user.email, user.role, user.location, user.bio];
  const completedFields = fields.filter((field) => String(field || "").trim());

  return Math.round((completedFields.length / fields.length) * 100);
}

function calculateTrustScore(stats, completion) {
  const score =
    35 +
    Math.min(stats.submittedReports * 10, 25) +
    Math.min(stats.watchlistItems * 4, 12) +
    Math.min(stats.recentlyViewedReports * 2, 6) +
    Math.min(stats.commentsReceived * 3, 9) +
    Math.min(stats.helpfulVotes * 2, 8) +
    Math.round(completion * 0.11);

  return Math.min(score, 100);
}

function createVerificationItems(user, stats) {
  return [
    {
      label: "Email address verified",
      description: user?.email
        ? user.emailVerified
          ? `${user.email} is verified for this account.`
          : `${user.email} is attached, but still needs verification.`
        : "Login or register to attach an email.",
      isComplete: Boolean(user?.email && user.emailVerified),
    },
    {
      label: "Profile details added",
      description: "Name, role, location and bio make the profile easier to trust.",
      isComplete: calculateProfileCompletion(user) >= 80,
    },
    {
      label: "First report submitted",
      description: "Submitting reports is the main way this community stays useful.",
      isComplete: stats.submittedReports > 0,
    },
    {
      label: "Watchlist started",
      description: "Watching identifiers helps you track risky numbers, pages and sites.",
      isComplete: stats.watchlistItems > 0,
    },
    {
      label: "Reports reviewed",
      description: "Opening report details helps you compare identifiers before taking action.",
      isComplete: stats.recentlyViewedReports > 0,
    },
  ];
}

function getNextProfileAction(user, stats) {
  if (!user?.location || !user?.bio) {
    return "Complete your location and bio so this profile feels more credible to other users.";
  }

  if (stats.submittedReports === 0) {
    return "Submit your first fraud report so your profile starts building real safety activity.";
  }

  if (stats.watchlistItems === 0) {
    return "Add suspicious identifiers to your watchlist so you can monitor them later.";
  }

  if (stats.recentlyViewedReports === 0) {
    return "Open a few report details from the feed or Browse Reports to learn repeated scam patterns.";
  }

  return "Keep checking identifiers and sharing useful reports. Your profile is ready for the MVP flow.";
}

function isOwnedByUser(report, user) {
  return report.ownerEmail === user.email || report.reporterEmail === user.email;
}
