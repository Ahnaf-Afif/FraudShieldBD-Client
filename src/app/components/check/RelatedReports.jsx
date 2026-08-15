"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import {
  getAllReportsForBrowser,
  getPrimaryIdentifier,
  getRiskStyle,
  maskIdentifier,
  searchReports,
} from "../../lib/reportFeedData";

export default function RelatedReports() {
  const [relatedReports, setRelatedReports] = useState([]);

  useEffect(() => {
    function updateRelatedReports() {
      const queryValue = new URLSearchParams(window.location.search).get("q") || "";
      const allReports = getAllReportsForBrowser();
      const reports = queryValue
        ? searchReports(allReports, queryValue)
        : allReports.slice(0, 3);

      setRelatedReports(reports.slice(0, 3));
    }

    updateRelatedReports();
    window.addEventListener("popstate", updateRelatedReports);
    window.addEventListener("fraudshield-search-updated", updateRelatedReports);

    return () => {
      window.removeEventListener("popstate", updateRelatedReports);
      window.removeEventListener("fraudshield-search-updated", updateRelatedReports);
    };
  }, []);

  if (relatedReports.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-[#06285c]">
            Recent related reports
          </h2>

          <button className="hidden font-bold text-[#009879] sm:block">
            View all reports →
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {relatedReports.map((report) => (
            <ReportItem key={report.reportId} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportItem({ report }) {
  const identifier = getPrimaryIdentifier(report);
  const riskStyle = getRiskStyle(report.riskLevel);

  return (
    <Link
      href={`/reports/${report.reportId}`}
      className="flex min-w-0 items-start gap-4 py-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 font-black text-red-600">
        {report.title.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${riskStyle}`}
          >
            {report.riskLevel}
          </span>

          <h3 className="min-w-0 break-words font-black text-[#06285c]">
            {maskIdentifier(identifier)}
          </h3>
        </div>

        <p className="mt-1 break-words text-sm text-slate-600">
          {report.story}
        </p>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {report.submittedAt || "Recently"}
          </span>

          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {report.location || "Bangladesh"}
          </span>
        </div>
      </div>

      <div className="hidden border-l border-slate-200 pl-5 text-center sm:block">
        <p className="text-2xl font-black text-red-500">
          {report.reportsCount || 1}
        </p>
        <p className="text-xs text-slate-500">Reports</p>
      </div>

      <ChevronRight size={20} className="mt-3 shrink-0 text-[#06285c]" />
    </Link>
  );
}
