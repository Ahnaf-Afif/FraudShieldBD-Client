"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  getAllReportsForBrowser,
  getPrimaryIdentifier,
  getRiskStyle,
  maskIdentifier,
  searchReports,
} from "../../lib/reportFeedData";

const categoryOptions = [
  "All Categories",
  "Mobile Financial",
  "Facebook Page",
  "Website",
  "Investment",
  "E-commerce",
  "Job Scam",
];

const riskOptions = ["All Risk Levels", "High Risk", "Medium Risk", "Low Risk"];

export default function ReportsExplorer() {
  const [reports, setReports] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [sortMode, setSortMode] = useState("Newest First");

  useEffect(() => {
    setReports(getAllReportsForBrowser());
  }, []);

  const filteredReports = useMemo(() => {
    const searchedReports = searchValue.trim()
      ? searchReports(reports, searchValue)
      : reports;

    return searchedReports
      .filter((report) =>
        categoryFilter === "All Categories"
          ? true
          : report.fraudCategory === categoryFilter,
      )
      .filter((report) =>
        riskFilter === "All Risk Levels" ? true : report.riskLevel === riskFilter,
      )
      .sort((firstReport, secondReport) => {
        if (sortMode === "Most Reports") {
          return (secondReport.reportsCount || 1) - (firstReport.reportsCount || 1);
        }

        if (sortMode === "Highest Risk") {
          return getRiskRank(secondReport.riskLevel) - getRiskRank(firstReport.riskLevel);
        }

        return 0;
      });
  }, [categoryFilter, reports, riskFilter, searchValue, sortMode]);

  const stats = createReportStats(reports);
  const categoryCounts = createCountMap(reports, "fraudCategory");
  const riskCounts = createCountMap(reports, "riskLevel");

  function clearFilters() {
    setSearchValue("");
    setCategoryFilter("All Categories");
    setRiskFilter("All Risk Levels");
    setSortMode("Newest First");
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Published Reports"
            value={String(stats.totalReports)}
            icon={FileText}
            color="text-[#009879]"
            bg="bg-[#e9f8f4]"
          />
          <StatCard
            label="High Risk"
            value={String(stats.highRisk)}
            icon={AlertTriangle}
            color="text-red-500"
            bg="bg-red-50"
          />
          <StatCard
            label="Verified Reports"
            value={String(stats.verifiedReports)}
            icon={ShieldCheck}
            color="text-[#0b63f6]"
            bg="bg-[#eef6ff]"
          />
          <StatCard
            label="Unique Reporters"
            value={String(stats.uniqueReporters)}
            icon={Users}
            color="text-orange-500"
            bg="bg-orange-50"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-[#06285c]">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-[#0b63f6]"
              >
                Clear All
              </button>
            </div>

            <FilterGroup
              title="Category"
              value={categoryFilter}
              options={categoryOptions}
              counts={categoryCounts}
              totalCount={reports.length}
              onChange={setCategoryFilter}
            />

            <FilterGroup
              title="Risk Level"
              value={riskFilter}
              options={riskOptions}
              counts={riskCounts}
              totalCount={reports.length}
              onChange={setRiskFilter}
            />
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 text-center">
            <h2 className="font-black text-[#06285c]">Have you been scammed?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Report it to help others make safer decisions.
            </p>
            <Link
              href="/report-fraud"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#009879] font-bold text-white"
            >
              Report Fraud
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px]">
                <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-4">
                  <Search size={19} className="shrink-0 text-slate-400" />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full min-w-0 text-sm text-[#06285c] outline-none"
                    placeholder="Search reports by keyword..."
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => setSearchValue("")}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                      aria-label="Clear report search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>

                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                  className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none"
                >
                  <option>Newest First</option>
                  <option>Most Reports</option>
                  <option>Highest Risk</option>
                </select>

                <div className="flex min-h-12 items-center justify-center rounded-xl bg-[#06285c] px-5 text-sm font-bold text-white">
                  {filteredReports.length} shown
                </div>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <EmptyReportsState onClear={clearFilters} />
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <ReportRow key={report.reportId} report={report} />
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 p-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-[#06285c]">
                {filteredReports.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#06285c]">{reports.length}</span>{" "}
              reports
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}
        >
          <Icon size={24} className={color} />
        </div>

        <div>
          <p className="text-2xl font-black text-[#06285c]">{value}</p>
          <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, value, options, counts, totalCount, onChange }) {
  return (
    <div className="border-t border-slate-200 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-black text-[#06285c]">{title}</h3>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-3 font-medium text-slate-600">
              <input
                type="radio"
                checked={value === option}
                onChange={() => onChange(option)}
                className="h-4 w-4 accent-[#009879]"
              />
              {option}
            </span>
            <span className="text-slate-400">
              {option.startsWith("All") ? totalCount : counts[option] || 0}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ReportRow({ report }) {
  const identifier = getPrimaryIdentifier(report);
  const riskStyle = getRiskStyle(report.riskLevel);

  return (
    <Link
      href={`/reports/${report.reportId}`}
      className="flex min-w-0 items-start gap-4 p-4 transition hover:bg-slate-50 sm:p-5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <ShieldAlert size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-lg font-black text-[#06285c]">
            {report.title}
          </h2>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${riskStyle}`}
          >
            {report.riskLevel}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-[#009879]">
          {report.fraudCategory}
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
          {report.story}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#06285c]">
          {maskIdentifier(identifier)}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {report.location || "Bangladesh"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {report.submittedAt || "Recently"}
          </span>
        </div>
      </div>

      <div className="hidden border-l border-slate-200 px-5 text-center sm:block">
        <p className="text-2xl font-black text-red-500">
          {report.reportsCount || 1}
        </p>
        <p className="text-xs text-slate-500">Reports</p>
      </div>

      <ChevronRight className="mt-3 shrink-0 text-[#06285c]" size={20} />
    </Link>
  );
}

function EmptyReportsState({ onClear }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <Search size={30} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#06285c]">
        No reports match these filters
      </h2>
      <p className="mt-2 text-slate-600">
        Try clearing filters or searching a broader keyword.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white"
      >
        Clear Filters
      </button>
    </div>
  );
}

function createReportStats(reports) {
  return {
    totalReports: reports.length,
    highRisk: reports.filter((report) => report.riskLevel === "High Risk").length,
    verifiedReports: reports.length,
    uniqueReporters: Math.max(reports.length, 1),
  };
}

function createCountMap(reports, fieldName) {
  return reports.reduce((countMap, report) => {
    const fieldValue = report[fieldName] || "Unknown";

    return {
      ...countMap,
      [fieldValue]: (countMap[fieldValue] || 0) + 1,
    };
  }, {});
}

function getRiskRank(riskLevel) {
  if (riskLevel === "High Risk") {
    return 3;
  }

  if (riskLevel === "Medium Risk") {
    return 2;
  }

  return 1;
}
