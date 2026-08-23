"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  ListChecks,
  PencilLine,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  REPORT_DRAFT_KEY,
  deleteSubmittedReport,
  getPrimaryIdentifier,
  getRiskStyle,
  getSavedReportDraftFromBrowser,
  getSubmittedReportsFromBrowser,
  maskIdentifier,
  normalizeSubmittedReport,
  normalizeApiReport,
} from "../../lib/reportFeedData";
import {
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
} from "../../lib/demoSession";
import {
  LOCAL_DATA_UPDATED_EVENT,
  notifyLocalDataUpdated,
} from "../../lib/localDataEvents";
import { removeWatchlistItemsByReportId } from "../../lib/watchlistData";
import AuthRequiredState from "../shared/AuthRequiredState";
import { copyTextToClipboard } from "../../lib/clipboard";
import { apiRequest } from "../../lib/apiClient";

const tabs = ["All", "Under Review", "Published", "Rejected", "Connected", "Draft"];
const riskFilters = ["All Risk Levels", "High Risk", "Medium Risk", "Low Risk"];

export default function MyReportsDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [draftReport, setDraftReport] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [reportPage, setReportPage] = useState(1);
  const [hasMoreReports, setHasMoreReports] = useState(false);
  const [isLoadingMoreReports, setIsLoadingMoreReports] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  useEffect(() => {
    async function refreshDashboard() {
      setDemoUser(getDemoSession());
      await loadReports();
    }

    refreshDashboard();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, refreshDashboard);
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, refreshDashboard);
    window.addEventListener("storage", refreshDashboard);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, refreshDashboard);
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, refreshDashboard);
      window.removeEventListener("storage", refreshDashboard);
    };
  }, []);

  async function loadReports() {
    const localReports = getSubmittedReportsFromBrowser().map(
      normalizeSubmittedReport,
    );
    let nextReports = localReports;

    if (window.localStorage.getItem("fraudshield-token")) {
      try {
        const result = await apiRequest("/reports/mine?page=1&limit=50");
        nextReports = Array.isArray(result.reports)
          ? result.reports.map(normalizeApiReport)
          : localReports;
        setReportPage(Number(result.page) || 1);
        setHasMoreReports(nextReports.length < Number(result.total || 0));
      } catch (_error) {
        nextReports = localReports;
      }
    }

    setSubmittedReports(nextReports);
    setDraftReport(getSavedReportDraftFromBrowser());
  }

  async function loadMoreReports() {
    if (isLoadingMoreReports || !hasMoreReports) return;

    setIsLoadingMoreReports(true);
    setLoadMoreError("");
    try {
      const nextPage = reportPage + 1;
      const result = await apiRequest(`/reports/mine?page=${nextPage}&limit=50`);
      const nextReports = (result.reports || []).map(normalizeApiReport);
      setSubmittedReports((currentReports) => [...currentReports, ...nextReports]);
      setReportPage(nextPage);
      setHasMoreReports(nextPage * 50 < Number(result.total || 0));
    } catch (error) {
      setLoadMoreError(error.message || "Could not load older reports.");
    } finally {
      setIsLoadingMoreReports(false);
    }
  }

  function discardDraft() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    setDraftReport(null);
    notifyLocalDataUpdated();
  }

  async function removeSubmittedReport(reportId) {
    const shouldDelete = window.confirm(
      "Delete this report? This cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    const isApiReport = /^[a-f\d]{24}$/i.test(String(reportId || ""));

    if (isApiReport && window.localStorage.getItem("fraudshield-token")) {
      try {
        await apiRequest(`/reports/${reportId}`, { method: "DELETE" });
      } catch (error) {
        window.alert(error.message || "Could not delete this report.");
        return;
      }
    } else {
      deleteSubmittedReport(reportId);
    }

    removeWatchlistItemsByReportId(reportId);
    loadReports();
  }

  const visibleReports = useMemo(() => {
    const ownedSubmittedReports = demoUser
      ? submittedReports.filter((report) => isOwnedByUser(report, demoUser))
      : [];
    const ownedDraft =
      draftReport && (!demoUser || isOwnedByUser(draftReport, demoUser))
        ? draftReport
        : null;
    const items = [
      ...ownedSubmittedReports.map((report) => ({
        ...report,
        dashboardStatus: getDashboardStatus(report),
      })),
      ...(ownedDraft
        ? [
            {
              ...ownedDraft,
              dashboardStatus: "Draft",
            },
          ]
        : []),
    ];

    return items
      .filter((report) =>
        activeTab === "All"
          ? true
          : activeTab === "Connected"
            ? Boolean(
                report.relatedReportId || (report.followUpCount || 0) > 0,
              )
            : report.dashboardStatus === activeTab,
      )
      .filter((report) =>
        riskFilter === "All Risk Levels" || report.dashboardStatus === "Draft"
          ? true
          : report.riskLevel === riskFilter,
      )
      .filter((report) => reportMatchesSearch(report, searchValue));
  }, [
    activeTab,
    demoUser,
    draftReport,
    riskFilter,
    searchValue,
    submittedReports,
  ]);

  if (!demoUser) {
    return (
      <AuthRequiredState
        title="Login to see your reports"
        description="Login or register first, then reports submitted from your account will appear here."
      />
    );
  }

  const submittedCount = submittedReports.filter((report) =>
    isOwnedByUser(report, demoUser),
  ).length;
  const connectedReportCount = submittedReports.filter(
    (report) =>
      isOwnedByUser(report, demoUser) &&
      (report.relatedReportId || (report.followUpCount || 0) > 0),
  ).length;
  const draftCount =
    draftReport && isOwnedByUser(draftReport, demoUser) ? 1 : 0;
  const latestSubmittedReport = submittedReports.find((report) =>
    isOwnedByUser(report, demoUser),
  );
  const incompleteDraftCount =
    draftCount > 0 && getDraftCompletionPercent(draftReport) < 100 ? 1 : 0;
  const submittedReviewCount = submittedReports.filter(
    (report) => isOwnedByUser(report, demoUser) && getDashboardStatus(report) === "Under Review",
  ).length;
  const hasActiveFilters =
    activeTab !== "All" || riskFilter !== "All Risk Levels" || searchValue.trim();

  function clearFilters() {
    setActiveTab("All");
    setRiskFilter("All Risk Levels");
    setSearchValue("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#009879] text-white">
                <UserRound size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-[#06285c]">
                  {demoUser.name}
                </p>
                <p className="truncate text-sm font-semibold text-slate-500">
                  {demoUser.email}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <DashboardStat
                label="Submitted"
                value={String(submittedCount)}
                icon={<ShieldCheck size={19} />}
              />
              <DashboardStat
                label="Drafts"
                value={String(draftCount)}
                icon={<PencilLine size={19} />}
              />
              <DashboardStat
                label="Total"
                value={String(submittedCount + draftCount)}
                icon={<FileText size={19} />}
              />
              <DashboardStat
                label="Connected"
                value={String(connectedReportCount)}
                icon={<ExternalLink size={19} />}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Keep reporting safe</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Anonymous reports can still appear here because ownership is saved
              privately in this browser.
            </p>
            <Link
              href="/report-fraud"
              className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
            >
              Start New Report
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Latest activity</h2>

            <div className="mt-4 space-y-3">
              {draftCount > 0 && (
                <ActivityLink
                  href="/report-fraud"
                  label="Draft waiting"
                  value={draftReport.savedAt || "Saved recently"}
                />
              )}

              {latestSubmittedReport && (
                <ActivityLink
                  href={`/reports/${latestSubmittedReport.reportId}`}
                  label="Latest submitted"
                  value={
                    latestSubmittedReport.submittedAt || "Submitted recently"
                  }
                />
              )}

              {draftCount === 0 && !latestSubmittedReport && (
                <p className="text-sm leading-6 text-slate-500">
                  Your draft and submitted report activity will appear here.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-black text-[#06285c]">
              <ListChecks size={18} />
              Action queue
            </h2>

            <div className="mt-4 space-y-3">
              <ActionQueueItem
                label="Drafts to finish"
                value={incompleteDraftCount}
                tone={incompleteDraftCount > 0 ? "warning" : "good"}
              />
              <ActionQueueItem
                label="Submitted for review"
                value={submittedReviewCount}
                tone="neutral"
              />
              <ActionQueueItem
                label="Ready public copies"
                value={submittedCount}
                tone="good"
              />
              <ActionQueueItem
                label="Connected warnings"
                value={connectedReportCount}
                tone={connectedReportCount > 0 ? "info" : "neutral"}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                  My Reports
                </p>
                <h1 className="mt-1 text-2xl font-black text-[#06285c]">
                  Reports from this account
                </h1>
              </div>

              <Link
                href="/report-fraud"
                className="inline-flex items-center justify-center rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
              >
                Report Fraud
              </Link>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                    activeTab === tab
                      ? "border-[#009879] bg-[#009879] text-white"
                      : "border-slate-200 text-[#06285c] hover:border-[#009879] hover:text-[#009879]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search your reports..."
                  className="w-full min-w-0 text-sm font-semibold text-[#06285c] outline-none"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#06285c]"
                    aria-label="Clear report search"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>

              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-black text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
              >
                {riskFilters.map((filter) => (
                  <option key={filter}>{filter}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-12 rounded-xl border border-[#bfe8dc] px-4 text-sm font-black text-[#009879] transition hover:bg-[#f0fbf7]"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Showing {visibleReports.length} report
              {visibleReports.length === 1 ? "" : "s"} from this account
            </p>
          </div>

          {visibleReports.length === 0 ? (
            <EmptyMyReports activeTab={activeTab} />
          ) : (
            <div className="divide-y divide-slate-200">
              {visibleReports.map((report) => (
                <MyReportRow
                  key={`${report.dashboardStatus}-${report.reportId}`}
                  report={report}
                  onDiscardDraft={discardDraft}
                  onDeleteSubmitted={removeSubmittedReport}
                />
              ))}
            </div>
          )}

          {(hasMoreReports || loadMoreError) && (
            <div className="border-t border-slate-200 p-4 text-center">
              {loadMoreError && (
                <p className="mb-3 text-sm font-semibold text-red-600">{loadMoreError}</p>
              )}
              <button
                type="button"
                onClick={loadMoreReports}
                disabled={isLoadingMoreReports}
                className="rounded-xl border border-[#bfe8dc] px-4 py-2 text-sm font-black text-[#009879] transition hover:bg-[#f0fbf7] disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMoreReports ? "Loading..." : "Load older reports"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardStat({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <span className="text-[#009879]">{icon}</span>
        {label}
      </div>
      <p className="font-black text-[#06285c]">{value}</p>
    </div>
  );
}

function ActivityLink({ href, label, value }) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-slate-50 p-3 transition hover:bg-[#f0fbf7]"
    >
      <p className="text-sm font-black text-[#06285c]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{value}</p>
    </Link>
  );
}

function ActionQueueItem({ label, value, tone }) {
  const toneClass =
    tone === "warning"
      ? "bg-orange-50 text-orange-600"
      : tone === "good"
        ? "bg-[#e9f8f4] text-[#009879]"
        : tone === "info"
          ? "bg-[#eef6ff] text-[#0b63f6]"
        : "bg-slate-50 text-[#06285c]";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <span
        className={`inline-flex min-w-8 justify-center rounded-full px-3 py-1 text-sm font-black ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function MyReportRow({ report, onDiscardDraft, onDeleteSubmitted }) {
  const [copiedReportId, setCopiedReportId] = useState(false);
  const isDraft = report.dashboardStatus === "Draft";
  const statusStyle = getStatusStyle(report.dashboardStatus);
  const riskStyle = getRiskStyle(report.riskLevel);
  const identifier = getPrimaryIdentifier(report);
  const href = isDraft ? "/report-fraud" : `/reports/${report.reportId}`;
  const draftCompletionPercent = isDraft ? getDraftCompletionPercent(report) : 100;
  const checkHref = `/check?q=${encodeURIComponent(identifier)}`;

  async function copyReportId() {
    await copyTextToClipboard(report.reportId);
    setCopiedReportId(true);

    setTimeout(() => {
      setCopiedReportId(false);
    }, 1600);
  }

  return (
    <div className="p-4 sm:p-5">
      <Link href={href} className="block">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
            {isDraft ? <PencilLine size={23} /> : <ShieldCheck size={23} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-lg font-black text-[#06285c]">
                {report.title || "Untitled report draft"}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${isDraft ? "bg-blue-50 text-blue-600" : statusStyle}`}
              >
                {report.dashboardStatus}
              </span>
              {!isDraft && (
                <span className={`rounded-full px-3 py-1 text-xs font-black ${riskStyle}`}>
                  {report.riskLevel}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {report.fraudCategory || "Category not selected"} •{" "}
              {report.location || "Location not added"}
            </p>

            {report.relatedReportId && (
              <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#0b63f6]">
                <ExternalLink size={13} />
                <span className="truncate">
                  Related to {report.relatedReportTitle || "another report"}
                </span>
              </div>
            )}

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {report.story || "Story not added yet."}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <span>{maskIdentifier(identifier)}</span>
              <span>{report.reportId}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {isDraft
                  ? report.savedAt || "Saved recently"
                  : report.submittedAt || "Submitted recently"}
              </span>
            </div>
          </div>

          <ChevronRight size={20} className="mt-3 shrink-0 text-[#06285c]" />
        </div>
      </Link>

      {isDraft ? (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-black text-[#06285c]">
              <AlertCircle size={17} className="text-blue-600" />
              Draft completion
            </p>
            <span className="text-sm font-black text-blue-600">
              {draftCompletionPercent}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#0b63f6]"
              style={{ width: `${draftCompletionPercent}%` }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {draftCompletionPercent === 100
              ? "This draft has the main fields ready. Review it before submitting."
              : "Continue editing to complete the missing report details."}
          </p>
        </div>
      ) : (
        <StatusTimeline report={report} />
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={href}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
            isDraft
              ? "bg-[#0b63f6] text-white hover:bg-[#084fc5]"
              : "bg-[#009879] text-white hover:bg-[#007f66]"
          }`}
        >
          {isDraft ? <PencilLine size={15} /> : <ExternalLink size={15} />}
          {isDraft ? "Continue Editing" : "View Public Report"}
        </Link>

        <Link
          href={checkHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          <Search size={15} />
          Check Identifier
        </Link>

        <button
          type="button"
          onClick={copyReportId}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          {copiedReportId ? <Check size={15} /> : <Copy size={15} />}
          {copiedReportId ? "Copied ID" : "Copy ID"}
        </button>

        {isDraft ? (
          <button
            type="button"
            onClick={onDiscardDraft}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Discard Draft
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDeleteSubmitted(report.reportId)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Delete Report
          </button>
        )}
      </div>
    </div>
  );
}

function StatusTimeline({ report }) {
  const isPublished = report.dashboardStatus === "Published";
  const isRejected = report.dashboardStatus === "Rejected";
  const steps = [
    {
      label: "Submitted",
      text: report.submittedAt || "Submitted locally",
      isComplete: true,
    },
    {
      label: "Review queue",
      text: isRejected
        ? `Moderation finished with a rejection${report.reviewerName ? ` by ${report.reviewerName}` : ""}.`
        : report.reviewerName
          ? `Reviewed by ${report.reviewerName}.`
          : "Waiting for moderator review.",
      isComplete: isPublished || isRejected,
    },
    {
      label: "Public warning",
      text: isPublished
        ? "Published for the community to read."
        : isRejected
          ? report.moderationNote || "This report was not published."
          : "It will appear publicly after approval.",
      isComplete: isPublished,
    },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-4">
      <p className="text-sm font-black text-[#06285c]">Report status</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-xl bg-white p-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon isComplete={step.isComplete} />
              <p className="text-sm font-black text-[#06285c]">{step.label}</p>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDashboardStatus(report) {
  if (report?.status === "Published") return "Published";
  if (report?.status === "Rejected") return "Rejected";
  if (report?.status === "Under Review") return "Under Review";
  return "Under Review";
}

function getStatusStyle(status) {
  if (status === "Published") return "bg-[#e9f8f4] text-[#009879]";
  if (status === "Rejected") return "bg-red-50 text-red-600";
  return "bg-orange-50 text-orange-600";
}

function CheckCircleIcon({ isComplete }) {
  return isComplete ? (
    <Check size={16} className="text-[#009879]" />
  ) : (
    <Clock size={16} className="text-slate-300" />
  );
}

function EmptyMyReports({ activeTab }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <FileText size={30} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#06285c]">
        No {activeTab.toLowerCase()} reports yet
      </h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        Reports submitted from this demo account will appear here.
      </p>
      <Link
        href="/report-fraud"
        className="mt-5 inline-flex rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
      >
        Create Report
      </Link>
    </div>
  );
}

function isOwnedByUser(report, user) {
  return (
    report.ownerId === user.id ||
    report.ownerEmail === user.email ||
    report.reporterEmail === user.email
  );
}

function reportMatchesSearch(report, searchValue) {
  const cleanSearch = searchValue.trim().toLowerCase();

  if (!cleanSearch) {
    return true;
  }

  return [
    report.title,
    report.fraudCategory,
    report.location,
    report.story,
    report.phoneOrPaymentNumber,
    report.facebookLink,
    report.websiteLink,
    report.businessName,
    report.reportId,
    report.relatedReportId,
    report.relatedReportTitle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(cleanSearch);
}

function getDraftCompletionPercent(report) {
  if (!report) {
    return 0;
  }

  const readinessChecks = [
    report.fraudCategory,
    report.platform,
    report.incidentDate,
    report.location,
    report.title,
    report.story && report.story.trim().length >= 20 ? report.story : "",
    report.moneyStatus,
    getPrimaryIdentifier(report) !== "Identifier not available"
      ? getPrimaryIdentifier(report)
      : "",
    report.evidenceType ||
      report.evidenceDetails ||
      (report.evidenceFileSummaries || []).length > 0
      ? "Evidence added"
      : "",
    report.preventionAdvice && report.preventionAdvice.trim().length >= 20
      ? report.preventionAdvice
      : "",
  ];
  const completedChecks = readinessChecks.filter((check) =>
    String(check || "").trim(),
  ).length;

  return Math.round((completedChecks / readinessChecks.length) * 100);
}
