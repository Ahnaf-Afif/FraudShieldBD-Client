"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
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
const identifierOptions = [
  "All Identifier Types",
  "Phone or Payment Number",
  "Facebook Page",
  "Website",
  "Business",
];

export default function ReportsExplorer() {
  const [reports, setReports] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [identifierFilter, setIdentifierFilter] = useState(
    "All Identifier Types",
  );
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [sortMode, setSortMode] = useState("Newest First");
  const [viewMode, setViewMode] = useState("List");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        riskFilter === "All Risk Levels"
          ? true
          : report.riskLevel === riskFilter,
      )
      .filter((report) =>
        identifierFilter === "All Identifier Types"
          ? true
          : getEntityType(report) === identifierFilter,
      )
      .filter((report) =>
        locationFilter === "All Locations"
          ? true
          : (report.location || "Bangladesh") === locationFilter,
      )
      .sort((firstReport, secondReport) => {
        if (sortMode === "Most Reports") {
          return (
            (secondReport.reportsCount || 1) -
            (firstReport.reportsCount || 1)
          );
        }

        if (sortMode === "Highest Risk") {
          return (
            getRiskRank(secondReport.riskLevel) -
            getRiskRank(firstReport.riskLevel)
          );
        }

        return 0;
      });
  }, [
    categoryFilter,
    identifierFilter,
    locationFilter,
    reports,
    riskFilter,
    searchValue,
    sortMode,
  ]);

  const stats = createReportStats(reports);
  const categoryCounts = createCountMap(reports, "fraudCategory");
  const riskCounts = createCountMap(reports, "riskLevel");
  const identifierCounts = createIdentifierCountMap(reports);
  const locationCounts = createLocationCountMap(reports);
  const dynamicCategoryOptions = createCategoryOptions(reports);
  const locationOptions = createLocationOptions(reports);
  const activeFilters = createActiveFilters({
    searchValue,
    categoryFilter,
    riskFilter,
    identifierFilter,
    locationFilter,
    sortMode,
  });

  function clearFilters() {
    setSearchValue("");
    setCategoryFilter("All Categories");
    setRiskFilter("All Risk Levels");
    setIdentifierFilter("All Identifier Types");
    setLocationFilter("All Locations");
    setSortMode("Newest First");
  }

  function removeFilter(filterKey) {
    if (filterKey === "search") {
      setSearchValue("");
    }

    if (filterKey === "category") {
      setCategoryFilter("All Categories");
    }

    if (filterKey === "risk") {
      setRiskFilter("All Risk Levels");
    }

    if (filterKey === "identifier") {
      setIdentifierFilter("All Identifier Types");
    }

    if (filterKey === "location") {
      setLocationFilter("All Locations");
    }

    if (filterKey === "sort") {
      setSortMode("Newest First");
    }
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
            icon={BadgeCheck}
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
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-[#06285c] shadow-sm lg:hidden"
          >
            <SlidersHorizontal size={18} />
            {mobileFiltersOpen ? "Hide filters" : "Show filters"}
          </button>

          <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
            <FiltersPanel
              reports={reports}
              categoryFilter={categoryFilter}
              riskFilter={riskFilter}
              identifierFilter={identifierFilter}
              locationFilter={locationFilter}
              dynamicCategoryOptions={dynamicCategoryOptions}
              categoryCounts={categoryCounts}
              riskCounts={riskCounts}
              identifierCounts={identifierCounts}
              locationOptions={locationOptions}
              locationCounts={locationCounts}
              onCategoryChange={setCategoryFilter}
              onRiskChange={setRiskFilter}
              onIdentifierChange={setIdentifierFilter}
              onLocationChange={setLocationFilter}
              onClearFilters={clearFilters}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#06285c]">Quick searches</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["bKash", "Facebook", "investment", "loan", "advance"].map(
                (keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => setSearchValue(keyword)}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
                  >
                    {keyword}
                  </button>
                ),
              )}
            </div>
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
              <div className="grid gap-3 xl:grid-cols-[1fr_180px_160px_120px]">
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

                <div className="grid min-h-12 grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
                  <ViewModeButton
                    label="List"
                    icon={List}
                    active={viewMode === "List"}
                    onClick={() => setViewMode("List")}
                  />
                  <ViewModeButton
                    label="Grid"
                    icon={LayoutGrid}
                    active={viewMode === "Grid"}
                    onClick={() => setViewMode("Grid")}
                  />
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => removeFilter(filter.key)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#bfe8dc] bg-[#f0fbf7] px-3 py-2 text-xs font-black text-[#009879] transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      {filter.label}
                      <X size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredReports.length === 0 ? (
              <EmptyReportsState onClear={clearFilters} />
            ) : viewMode === "Grid" ? (
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {filteredReports.map((report) => (
                  <ReportCard key={report.reportId} report={report} />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <ReportRow key={report.reportId} report={report} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-bold text-[#06285c]">
                  {filteredReports.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#06285c]">
                  {reports.length}
                </span>{" "}
                reports
              </p>

              <Link
                href="/report-fraud"
                className="inline-flex items-center gap-2 font-black text-[#009879]"
              >
                Submit missing report
                <ChevronRight size={16} />
              </Link>
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

function FiltersPanel({
  reports,
  categoryFilter,
  riskFilter,
  identifierFilter,
  locationFilter,
  dynamicCategoryOptions,
  categoryCounts,
  riskCounts,
  identifierCounts,
  locationOptions,
  locationCounts,
  onCategoryChange,
  onRiskChange,
  onIdentifierChange,
  onLocationChange,
  onClearFilters,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 font-black text-[#06285c]">
          <SlidersHorizontal size={18} />
          Filters
        </h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-bold text-[#0b63f6] transition hover:text-[#009879]"
        >
          Clear All
        </button>
      </div>

      <FilterGroup
        title="Category"
        value={categoryFilter}
        options={dynamicCategoryOptions}
        counts={categoryCounts}
        totalCount={reports.length}
        onChange={onCategoryChange}
      />

      <FilterGroup
        title="Risk Level"
        value={riskFilter}
        options={riskOptions}
        counts={riskCounts}
        totalCount={reports.length}
        onChange={onRiskChange}
      />

      <FilterGroup
        title="Identifier Type"
        value={identifierFilter}
        options={identifierOptions}
        counts={identifierCounts}
        totalCount={reports.length}
        onChange={onIdentifierChange}
      />

      <FilterGroup
        title="Location"
        value={locationFilter}
        options={locationOptions}
        counts={locationCounts}
        totalCount={reports.length}
        onChange={onLocationChange}
      />
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

function ViewModeButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 text-sm font-black transition ${
        active
          ? "bg-[#009879] text-white"
          : "bg-white text-[#06285c] hover:bg-[#f0fbf7] hover:text-[#009879]"
      }`}
      aria-label={`${label} view`}
    >
      <Icon size={17} />
      <span className="hidden sm:inline xl:hidden">{label}</span>
    </button>
  );
}

function ReportRow({ report }) {
  const identifier = getPrimaryIdentifier(report);
  const riskStyle = getRiskStyle(report.riskLevel);
  const identifierType = getEntityType(report);

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
          {report.fraudCategory} • {identifierType}
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
          {report.story}
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-black uppercase text-slate-400">
              Identifier
            </p>
            <p className="mt-1 break-words text-sm font-black text-[#06285c]">
              {maskIdentifier(identifier)}
            </p>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
            <p className="text-xs font-black uppercase text-orange-400">
              Safety advice
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-orange-800">
              {report.preventionAdvice || "Verify before sending money."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {report.location || "Bangladesh"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {report.submittedAt || "Recently"}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={14} />
            Published warning
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

function ReportCard({ report }) {
  const identifier = getPrimaryIdentifier(report);
  const riskStyle = getRiskStyle(report.riskLevel);
  const identifierType = getEntityType(report);

  return (
    <Link
      href={`/reports/${report.reportId}`}
      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-[#009879] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <ShieldAlert size={24} />
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${riskStyle}`}
        >
          {report.riskLevel}
        </span>
      </div>

      <h2 className="mt-4 line-clamp-2 text-lg font-black leading-snug text-[#06285c]">
        {report.title}
      </h2>

      <p className="mt-2 text-sm font-semibold text-[#009879]">
        {report.fraudCategory} • {identifierType}
      </p>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {report.story}
      </p>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-black uppercase text-slate-400">
          Identifier
        </p>
        <p className="mt-1 break-words text-sm font-black text-[#06285c]">
          {maskIdentifier(identifier)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} />
          {report.location || "Bangladesh"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={14} />
          {report.submittedAt || "Recently"}
        </span>
        <span className="ml-auto font-black text-red-500">
          {report.reportsCount || 1} reports
        </span>
      </div>
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
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
      >
        <Filter size={17} />
        Clear Filters
      </button>
    </div>
  );
}

function createReportStats(reports) {
  return {
    totalReports: reports.length,
    highRisk: reports.filter((report) => report.riskLevel === "High Risk")
      .length,
    verifiedReports: reports.length,
    uniqueReporters: Math.max(
      new Set(reports.map((report) => report.reportId)).size,
      1,
    ),
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

function createIdentifierCountMap(reports) {
  return reports.reduce((countMap, report) => {
    const identifierType = getEntityType(report);

    return {
      ...countMap,
      [identifierType]: (countMap[identifierType] || 0) + 1,
    };
  }, {});
}

function createLocationCountMap(reports) {
  return reports.reduce((countMap, report) => {
    const location = report.location || "Bangladesh";

    return {
      ...countMap,
      [location]: (countMap[location] || 0) + 1,
    };
  }, {});
}

function createCategoryOptions(reports) {
  const reportCategories = reports
    .map((report) => report.fraudCategory)
    .filter(Boolean);
  const categories = new Set([
    ...categoryOptions.slice(1),
    ...reportCategories,
  ]);

  return ["All Categories", ...categories];
}

function createLocationOptions(reports) {
  const locations = reports
    .map((report) => report.location || "Bangladesh")
    .filter(Boolean);

  return ["All Locations", ...new Set(locations)];
}

function createActiveFilters({
  searchValue,
  categoryFilter,
  riskFilter,
  identifierFilter,
  locationFilter,
  sortMode,
}) {
  return [
    searchValue.trim()
      ? {
          key: "search",
          label: `Search: ${searchValue.trim()}`,
        }
      : null,
    categoryFilter !== "All Categories"
      ? {
          key: "category",
          label: categoryFilter,
        }
      : null,
    riskFilter !== "All Risk Levels"
      ? {
          key: "risk",
          label: riskFilter,
        }
      : null,
    identifierFilter !== "All Identifier Types"
      ? {
          key: "identifier",
          label: identifierFilter,
        }
      : null,
    locationFilter !== "All Locations"
      ? {
          key: "location",
          label: locationFilter,
        }
      : null,
    sortMode !== "Newest First"
      ? {
          key: "sort",
          label: sortMode,
        }
      : null,
  ].filter(Boolean);
}
