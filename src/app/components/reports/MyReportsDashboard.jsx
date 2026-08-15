"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
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
} from "../../lib/reportFeedData";
import { getDemoSession } from "../../lib/demoSession";
import { removeWatchlistItemsByReportId } from "../../lib/watchlistData";

const tabs = ["All", "Submitted", "Draft"];
const riskFilters = ["All Risk Levels", "High Risk", "Medium Risk", "Low Risk"];

export default function MyReportsDashboard() {
  const [demoUser, setDemoUser] = useState(null);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [draftReport, setDraftReport] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");

  useEffect(() => {
    setDemoUser(getDemoSession());
    loadReports();
  }, []);

  function loadReports() {
    setSubmittedReports(
      getSubmittedReportsFromBrowser().map(normalizeSubmittedReport),
    );
    setDraftReport(getSavedReportDraftFromBrowser());
  }

  function discardDraft() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    setDraftReport(null);
  }

  function removeSubmittedReport(reportId) {
    const shouldDelete = window.confirm(
      "Delete this report from your local MVP data? This cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    deleteSubmittedReport(reportId);
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
        dashboardStatus: "Submitted",
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
        activeTab === "All" ? true : report.dashboardStatus === activeTab,
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
    return <SignedOutState />;
  }

  const submittedCount = submittedReports.filter((report) =>
    isOwnedByUser(report, demoUser),
  ).length;
  const draftCount =
    draftReport && isOwnedByUser(draftReport, demoUser) ? 1 : 0;
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

function MyReportRow({ report, onDiscardDraft, onDeleteSubmitted }) {
  const isDraft = report.dashboardStatus === "Draft";
  const riskStyle = getRiskStyle(report.riskLevel);
  const identifier = getPrimaryIdentifier(report);
  const href = isDraft ? "/report-fraud" : `/reports/${report.reportId}`;

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
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  isDraft ? "bg-blue-50 text-blue-600" : riskStyle
                }`}
              >
                {isDraft ? "Draft" : report.riskLevel}
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {report.fraudCategory || "Category not selected"} •{" "}
              {report.location || "Location not added"}
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {report.story || "Story not added yet."}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <span>{maskIdentifier(identifier)}</span>
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

      {isDraft && (
        <button
          type="button"
          onClick={onDiscardDraft}
          className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50"
        >
          Discard Draft
        </button>
      )}

      {!isDraft && (
        <button
          type="button"
          onClick={() => onDeleteSubmitted(report.reportId)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={15} />
          Delete Local Copy
        </button>
      )}
    </div>
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

function SignedOutState() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <AlertTriangle size={30} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-[#06285c]">
          Login to see your reports
        </h1>
        <p className="mt-2 leading-7 text-slate-600">
          This MVP uses a local demo session. Login or register first, then your
          submitted reports will appear here.
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

function isOwnedByUser(report, user) {
  return report.ownerEmail === user.email || report.reporterEmail === user.email;
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
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(cleanSearch);
}
