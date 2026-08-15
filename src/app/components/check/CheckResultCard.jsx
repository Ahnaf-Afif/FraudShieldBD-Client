"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeAlert,
  BadgeCheck,
  Clock,
  Copy,
  Eye,
  ExternalLink,
  FilePlus2,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getAllReportsForBrowser,
  getEntityType,
  getPrimaryIdentifier,
  getRiskRank,
  getRiskStyle,
  maskIdentifier,
  searchReports,
} from "../../lib/reportFeedData";
import {
  addToWatchlist,
  isIdentifierWatched,
  removeFromWatchlist,
} from "../../lib/watchlistData";

export default function CheckResultCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedReports, setMatchedReports] = useState([]);
  const [copiedReportId, setCopiedReportId] = useState("");
  const [copiedIdentifier, setCopiedIdentifier] = useState(false);
  const [watchedIdentifier, setWatchedIdentifier] = useState("");

  useEffect(() => {
    function updateSearchResults() {
      const queryValue = new URLSearchParams(window.location.search).get("q") || "";
      const allReports = getAllReportsForBrowser();
      const reports = searchReports(allReports, queryValue).sort(
        (firstReport, secondReport) =>
          getRiskRank(secondReport.riskLevel) - getRiskRank(firstReport.riskLevel),
      );

      setSearchQuery(queryValue);
      setMatchedReports(reports);

      const primaryReport = reports[0];

      if (!primaryReport) {
        setWatchedIdentifier(isIdentifierWatched(queryValue) ? queryValue : "");
        return;
      }

      const primaryIdentifier = getPrimaryIdentifier(primaryReport);
      setWatchedIdentifier(
        isIdentifierWatched(primaryIdentifier) ? primaryIdentifier : "",
      );
    }

    updateSearchResults();
    window.addEventListener("popstate", updateSearchResults);
    window.addEventListener("fraudshield-search-updated", updateSearchResults);

    return () => {
      window.removeEventListener("popstate", updateSearchResults);
      window.removeEventListener(
        "fraudshield-search-updated",
        updateSearchResults,
      );
    };
  }, []);

  async function copyReportLink(reportId) {
    const reportUrl = `${window.location.origin}/reports/${reportId}`;

    await navigator.clipboard.writeText(reportUrl);
    setCopiedReportId(reportId);

    setTimeout(() => {
      setCopiedReportId("");
    }, 1600);
  }

  async function copyIdentifier(identifier) {
    await navigator.clipboard.writeText(identifier);
    setCopiedIdentifier(true);

    setTimeout(() => {
      setCopiedIdentifier(false);
    }, 1600);
  }

  function toggleWatchSearchQuery() {
    if (isIdentifierWatched(searchQuery)) {
      removeFromWatchlist(searchQuery);
      setWatchedIdentifier("");
      return;
    }

    addToWatchlist({
      identifier: searchQuery,
      type: detectIdentifierType(searchQuery),
      riskLevel: "Unknown",
      reportId: "",
      title: "Watched search with no matching report yet",
    });
    setWatchedIdentifier(searchQuery);
  }

  function toggleWatchIdentifier(report) {
    const primaryIdentifier = getPrimaryIdentifier(report);

    if (isIdentifierWatched(primaryIdentifier)) {
      removeFromWatchlist(primaryIdentifier);
      setWatchedIdentifier("");
      return;
    }

    addToWatchlist({
      identifier: primaryIdentifier,
      type: getEntityType(report),
      riskLevel: report.riskLevel,
      reportId: report.reportId,
      title: report.title,
    });
    setWatchedIdentifier(primaryIdentifier);
  }

  if (!searchQuery) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
            <Search size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#06285c]">
            Search an identifier to check risk
          </h2>
          <p className="mt-2 text-slate-600">
            Enter a number, page, website or business name to see matching
            community reports.
          </p>
        </div>
      </section>
    );
  }

  if (matchedReports.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#06285c]">
            No reports found for <span className="text-[#009879]">{searchQuery}</span>
          </h2>
          <p className="mt-2 text-slate-600">
            No result does not guarantee safety. Verify carefully before
            sending money.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={toggleWatchSearchQuery}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${
                watchedIdentifier
                  ? "border-[#009879] bg-[#f0fbf7] text-[#009879]"
                  : "border-slate-200 text-[#06285c] hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              }`}
            >
              <Eye size={18} />
              {watchedIdentifier ? "Watching This Search" : "Watch This Search"}
            </button>

            <Link
              href={`/report-fraud?identifier=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
            >
              <FilePlus2 size={18} />
              Report This Identifier
            </Link>

            <Link
              href={`/reports?q=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
            >
              Browse Reports
              <ExternalLink size={17} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const mainReport = matchedReports[0];
  const riskStyle = getRiskStyle(mainReport.riskLevel);
  const identifier = getPrimaryIdentifier(mainReport);
  const totalCommunityReports = matchedReports.reduce(
    (total, report) => total + (report.reportsCount || 1),
    0,
  );
  const riskScore = calculateRiskScore(matchedReports);
  const riskSummary = getRiskSummary(mainReport.riskLevel, matchedReports.length);
  const matchBreakdown = createMatchBreakdown(matchedReports);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.5fr_0.8fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
          <div className="flex flex-col items-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-red-50 text-red-500">
              <ShieldAlert size={90} />
            </div>

            <div className={`mt-4 rounded-xl px-5 py-2 font-black ${riskStyle}`}>
              {mainReport.riskLevel}
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-black uppercase text-slate-400">
                Risk score
              </p>
              <p className="mt-1 text-3xl font-black text-[#06285c]">
                {riskScore}/100
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black leading-tight text-[#06285c]">
              {matchedReports.length} report
              {matchedReports.length === 1 ? "" : "s"} found for{" "}
              <span className="text-[#009879]">{searchQuery}</span>
            </h2>

            <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Clock size={17} />
                Last reported {mainReport.submittedAt || "recently"}
              </span>

              <span className="inline-flex items-center gap-2">
                <Users size={17} />
                {totalCommunityReports} community report
                {totalCommunityReports === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
              <p className="flex gap-3 font-semibold">
                <AlertTriangle className="shrink-0" size={20} />
                {riskSummary}
              </p>

              <p className="mt-2 text-sm text-red-600">
                No result here guarantees safety. Always verify before you pay.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/reports/${mainReport.reportId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
              >
                View Full Report
                <ExternalLink size={17} />
              </Link>

              <button
                type="button"
                onClick={() => copyReportLink(mainReport.reportId)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              >
                <Copy size={17} />
                {copiedReportId === mainReport.reportId
                  ? "Copied Link"
                  : "Copy Report Link"}
              </button>

              <button
                type="button"
                onClick={() => copyIdentifier(identifier)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              >
                <Copy size={17} />
                {copiedIdentifier ? "Copied Identifier" : "Copy Identifier"}
              </button>

              <button
                type="button"
                onClick={() => toggleWatchIdentifier(mainReport)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${
                  watchedIdentifier
                    ? "border-[#009879] bg-[#f0fbf7] text-[#009879]"
                    : "border-slate-200 text-[#06285c] hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
                }`}
              >
                <Eye size={17} />
                {watchedIdentifier ? "Watching" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Entity Type" value={getEntityType(mainReport)} />
          <InfoItem label="Identifier" value={maskIdentifier(identifier)} />
          <InfoItem
            label="Recent Activity"
            value={mainReport.submittedAt || "Recently"}
          />
          <InfoItem label="Common Category" value={mainReport.fraudCategory} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {matchBreakdown.map((item) => (
            <RiskSignal key={item.label} item={item} />
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#06285c]">Safety guidance</h2>

        <div className="mt-5 space-y-5">
          <SafetyTip
            icon={AlertTriangle}
            title="Do not send advance payment"
            text="Scammers often ask for upfront payment and then block you."
          />

          <SafetyTip
            icon={ShieldCheck}
            title="Verify page identity"
            text="Check page creation date, follower count, reviews and real customer feedback."
          />

          <SafetyTip
            icon={MapPin}
            title="Call official support"
            text="If in doubt, call the company’s official support number to verify information."
          />
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-[#06285c]">Why this result matters</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            FraudShield checks the identifier against local community reports.
            More reports, higher risk labels and repeated categories make the
            warning stronger.
          </p>
        </div>
      </aside>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-black text-[#06285c]">{value}</p>
    </div>
  );
}

function SafetyTip({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Icon size={20} />
      </div>

      <div>
        <h3 className="font-black text-[#06285c]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function RiskSignal({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg}`}>
          <Icon size={19} className={item.color} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-400">
            {item.label}
          </p>
          <p className="font-black text-[#06285c]">{item.value}</p>
        </div>
      </div>
    </div>
  );
}

function calculateRiskScore(reports) {
  const highestRiskRank = reports.reduce(
    (highestRank, report) => Math.max(highestRank, getRiskRank(report.riskLevel)),
    0,
  );
  const reportVolume = reports.reduce(
    (total, report) => total + (report.reportsCount || 1),
    0,
  );
  const categoryCount = new Set(
    reports.map((report) => report.fraudCategory).filter(Boolean),
  ).size;
  const score =
    highestRiskRank * 24 +
    Math.min(reportVolume * 2, 20) +
    Math.min(reports.length * 5, 15) +
    Math.min(categoryCount * 4, 12);

  return Math.min(score, 100);
}

function getRiskSummary(riskLevel, matchCount) {
  if (riskLevel === "High Risk") {
    return `This search matches ${matchCount} high-priority community warning${
      matchCount === 1 ? "" : "s"
    }. Treat it as unsafe until verified through official channels.`;
  }

  if (riskLevel === "Medium Risk") {
    return `This search has suspicious community activity. Verify carefully before sending money or sharing private information.`;
  }

  return `This search has a low-risk match, but you should still verify identity before paying.`;
}

function createMatchBreakdown(reports) {
  const highRiskCount = reports.filter(
    (report) => report.riskLevel === "High Risk",
  ).length;
  const totalReports = reports.reduce(
    (total, report) => total + (report.reportsCount || 1),
    0,
  );
  const locations = new Set(
    reports.map((report) => report.location || "Bangladesh"),
  );

  return [
    {
      label: "High risk matches",
      value: highRiskCount,
      icon: BadgeAlert,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Report volume",
      value: totalReports,
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Locations",
      value: locations.size,
      icon: BadgeCheck,
      color: "text-[#009879]",
      bg: "bg-[#e9f8f4]",
    },
  ];
}

function detectIdentifierType(value) {
  const cleanValue = String(value || "").trim().toLowerCase();

  if (/^\+?\d[\d\s-]{5,}$/.test(cleanValue) || cleanValue.includes("bkash")) {
    return "Phone or Payment Number";
  }

  if (cleanValue.includes("facebook.com") || cleanValue.includes("fb.com")) {
    return "Facebook Page";
  }

  if (cleanValue.includes(".") || cleanValue.startsWith("http")) {
    return "Website";
  }

  return "Business";
}
