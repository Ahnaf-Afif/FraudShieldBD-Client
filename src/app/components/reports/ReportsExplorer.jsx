"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookmarkPlus,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  clearRecentlyViewedReports,
  getAllReportsForBrowser,
  getEntityType,
  getPrimaryIdentifier,
  getRecentlyViewedReportsFromBrowser,
  getRiskRank,
  getRiskStyle,
  maskIdentifier,
  normalizeApiReport,
  searchReports,
} from "../../lib/reportFeedData";
import { copyTextToClipboard } from "../../lib/clipboard";
import { apiRequest } from "../../lib/apiClient";

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
const connectionOptions = [
  "All Report Connections",
  "Standalone Reports",
  "Related Reports",
  "Reports With Follow-ups",
];
const REPORT_FILTER_PRESETS_KEY = "fraudshield-report-filter-presets";

export default function ReportsExplorer() {
  const [reports, setReports] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [identifierFilter, setIdentifierFilter] = useState(
    "All Identifier Types",
  );
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [connectionFilter, setConnectionFilter] = useState(
    "All Report Connections",
  );
  const [sortMode, setSortMode] = useState("Newest First");
  const [viewMode, setViewMode] = useState("List");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterPresets, setFilterPresets] = useState([]);
  const [presetName, setPresetName] = useState("");
  const [presetStatus, setPresetStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [hasLoadedUrlFilters, setHasLoadedUrlFilters] = useState(false);
  const [recentlyViewedReports, setRecentlyViewedReports] = useState([]);

  useEffect(() => {
    const browserReports = getAllReportsForBrowser();

    apiRequest("/reports?limit=50")
      .then((result) => {
        const apiReports = Array.isArray(result.reports)
          ? result.reports.map(normalizeApiReport)
          : [];

        setReports(apiReports.length > 0 ? apiReports : browserReports);
      })
      .catch(() => {
        setReports(browserReports);
      });
    setRecentlyViewedReports(getRecentlyViewedReportsFromBrowser());
    setFilterPresets(getSavedFilterPresets());
    applyUrlFilters();
    setHasLoadedUrlFilters(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedUrlFilters) {
      return;
    }

    const nextUrl = createFilterUrl({
      searchValue,
      categoryFilter,
      riskFilter,
      identifierFilter,
      locationFilter,
      connectionFilter,
      sortMode,
    });

    window.history.replaceState(null, "", nextUrl);
  }, [
    categoryFilter,
    hasLoadedUrlFilters,
    identifierFilter,
    locationFilter,
    connectionFilter,
    riskFilter,
    searchValue,
    sortMode,
  ]);

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
      .filter((report) => matchesConnectionFilter(report, connectionFilter))
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
    connectionFilter,
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
    connectionFilter,
    sortMode,
  });
  const highestRiskMatch = getHighestRiskReport(filteredReports);

  function clearFilters() {
    setSearchValue("");
    setCategoryFilter("All Categories");
    setRiskFilter("All Risk Levels");
    setIdentifierFilter("All Identifier Types");
    setLocationFilter("All Locations");
    setConnectionFilter("All Report Connections");
    setSortMode("Newest First");
    setPresetStatus("");
    setShareStatus("");
    setExportStatus("");
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

    if (filterKey === "connection") {
      setConnectionFilter("All Report Connections");
    }

    if (filterKey === "sort") {
      setSortMode("Newest First");
    }

    setPresetStatus("");
    setShareStatus("");
    setExportStatus("");
  }

  function applyUrlFilters() {
    const searchParams = new URLSearchParams(window.location.search);

    setSearchValue(searchParams.get("q") || searchParams.get("search") || "");
    setCategoryFilter(searchParams.get("category") || "All Categories");
    setRiskFilter(searchParams.get("risk") || "All Risk Levels");
    setIdentifierFilter(searchParams.get("type") || "All Identifier Types");
    setLocationFilter(searchParams.get("location") || "All Locations");
    setConnectionFilter(
      searchParams.get("connection") || "All Report Connections",
    );
    setSortMode(searchParams.get("sort") || "Newest First");
  }

  async function copyFilterLink() {
    const filterUrl = `${window.location.origin}${createFilterUrl({
      searchValue,
      categoryFilter,
      riskFilter,
      identifierFilter,
      locationFilter,
      connectionFilter,
      sortMode,
    })}`;

    await copyTextToClipboard(filterUrl);
    setShareStatus("copied");

    setTimeout(() => {
      setShareStatus("");
    }, 1800);
  }

  function exportFilteredReports() {
    if (filteredReports.length === 0) {
      setExportStatus("empty");
      return;
    }

    const csvContent = createReportsCsv(filteredReports);
    const csvBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = `fraudshield-reports-${Date.now()}.csv`;
    downloadLink.click();

    URL.revokeObjectURL(downloadUrl);
    setExportStatus("downloaded");

    setTimeout(() => {
      setExportStatus("");
    }, 1800);
  }

  function saveCurrentPreset() {
    const cleanPresetName = presetName.trim();

    if (!cleanPresetName) {
      setPresetStatus("missing-name");
      return;
    }

    const newPreset = {
      id: `${cleanPresetName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: cleanPresetName,
      searchValue,
      categoryFilter,
      riskFilter,
      identifierFilter,
      locationFilter,
      connectionFilter,
      sortMode,
      createdAt: new Date().toLocaleString(),
    };
    const nextPresets = [newPreset, ...filterPresets].slice(0, 6);

    saveFilterPresets(nextPresets);
    setFilterPresets(nextPresets);
    setPresetName("");
    setPresetStatus("saved");
  }

  function applyPreset(preset) {
    setSearchValue(preset.searchValue);
    setCategoryFilter(preset.categoryFilter);
    setRiskFilter(preset.riskFilter);
    setIdentifierFilter(preset.identifierFilter);
    setLocationFilter(preset.locationFilter);
    setConnectionFilter(preset.connectionFilter || "All Report Connections");
    setConnectionFilter(
      preset.connectionFilter || "All Report Connections",
    );
    setSortMode(preset.sortMode);
    setPresetStatus(`applied:${preset.name}`);
    setMobileFiltersOpen(false);
  }

  function deletePreset(presetId) {
    const nextPresets = filterPresets.filter((preset) => preset.id !== presetId);

    saveFilterPresets(nextPresets);
    setFilterPresets(nextPresets);
    setPresetStatus("deleted");
  }

  function clearRecentlyViewedHistory() {
    clearRecentlyViewedReports();
    setRecentlyViewedReports([]);
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
              connectionFilter={connectionFilter}
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
              onConnectionChange={setConnectionFilter}
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

          <SavedFiltersPanel
            presets={filterPresets}
            presetName={presetName}
            presetStatus={presetStatus}
            activeFilters={activeFilters}
            onPresetNameChange={setPresetName}
            onSavePreset={saveCurrentPreset}
            onApplyPreset={applyPreset}
            onDeletePreset={deletePreset}
          />

          <InvestigationPanel
            highestRiskMatch={highestRiskMatch}
            filteredCount={filteredReports.length}
            totalCount={reports.length}
            shareStatus={shareStatus}
            exportStatus={exportStatus}
            onCopyFilterLink={copyFilterLink}
            onExportReports={exportFilteredReports}
          />

          <RecentlyViewedPanel
            reports={recentlyViewedReports}
            onClear={clearRecentlyViewedHistory}
          />

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
                <div className="mt-4">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Active filters
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-left text-xs font-black text-[#009879] hover:text-[#007f66] sm:text-right"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
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

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={copyFilterLink}
                  className="inline-flex items-center gap-2 font-black text-[#06285c] transition hover:text-[#009879]"
                >
                  <Copy size={16} />
                  Copy filter link
                </button>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <Link
                  href="/report-fraud"
                  className="inline-flex items-center gap-2 font-black text-[#009879]"
                >
                  Submit missing report
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

function RecentlyViewedPanel({ reports, onClear }) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-black text-[#06285c]">
          <Clock size={18} />
          Recently viewed
        </h2>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-black text-slate-400 transition hover:text-red-500"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {reports.map((report) => (
          <Link
            key={report.reportId}
            href={`/reports/${report.reportId}`}
            className="block rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-[#009879] hover:bg-[#f0fbf7]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-black text-[#06285c]">
                  {report.title}
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-500">
                  {maskIdentifier(getPrimaryIdentifier(report))}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${getRiskStyle(
                  report.riskLevel,
                )}`}
              >
                {report.riskLevel}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Viewed {report.viewedAt}
            </p>
          </Link>
        ))}
      </div>
    </div>
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
  connectionFilter,
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
  onConnectionChange,
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

      <FilterGroup
        title="Report Connection"
        value={connectionFilter}
        options={connectionOptions}
        counts={createConnectionCountMap(reports)}
        totalCount={reports.length}
        onChange={onConnectionChange}
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

function SavedFiltersPanel({
  presets,
  presetName,
  presetStatus,
  activeFilters,
  onPresetNameChange,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) {
  const hasCustomFilters = activeFilters.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="inline-flex items-center gap-2 font-black text-[#06285c]">
        <BookmarkPlus size={18} />
        Saved filters
      </h2>

      <div className="mt-4 space-y-3">
        <input
          value={presetName}
          onChange={(event) => onPresetNameChange(event.target.value)}
          placeholder="Example: High risk pages"
          className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
        />

        <button
          type="button"
          onClick={onSavePreset}
          disabled={!hasCustomFilters}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#009879] px-4 text-sm font-black text-white transition hover:bg-[#007f66] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <BookmarkPlus size={17} />
          Save Current Filters
        </button>

        <PresetStatusMessage status={presetStatus} />
      </div>

      {presets.length > 0 && (
        <div className="mt-5 space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className="min-w-0 text-left"
                >
                  <p className="break-words text-sm font-black text-[#06285c]">
                    {preset.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatPresetSummary(preset)}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePreset(preset.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Delete ${preset.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvestigationPanel({
  highestRiskMatch,
  filteredCount,
  totalCount,
  shareStatus,
  exportStatus,
  onCopyFilterLink,
  onExportReports,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="inline-flex items-center gap-2 font-black text-[#06285c]">
        <ShieldAlert size={18} />
        Investigation tools
      </h2>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-slate-400">
          Highest risk match
        </p>
        {highestRiskMatch ? (
          <>
            <Link
              href={`/reports/${highestRiskMatch.reportId}`}
              className="mt-2 block text-sm font-black leading-6 text-[#06285c] transition hover:text-[#009879]"
            >
              {highestRiskMatch.title}
            </Link>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${getRiskStyle(
                  highestRiskMatch.riskLevel,
                )}`}
              >
                {highestRiskMatch.riskLevel}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#06285c]">
                {highestRiskMatch.reportsCount || 1} reports
              </span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No matching report is visible with the current filters.
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={onCopyFilterLink}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          <Copy size={17} />
          Copy Search Link
        </button>
        <button
          type="button"
          onClick={onExportReports}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#06285c] px-4 text-sm font-black text-white transition hover:bg-[#041b3f]"
        >
          <Download size={17} />
          Export Visible Reports
        </button>
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {filteredCount} of {totalCount} reports are included.
      </p>

      {shareStatus === "copied" && (
        <p className="mt-3 text-sm font-black text-[#009879]">
          Filter link copied.
        </p>
      )}

      {exportStatus === "downloaded" && (
        <p className="mt-3 text-sm font-black text-[#009879]">
          CSV export started.
        </p>
      )}

      {exportStatus === "empty" && (
        <p className="mt-3 text-sm font-black text-red-500">
          No visible reports to export.
        </p>
      )}
    </div>
  );
}

function PresetStatusMessage({ status }) {
  if (!status) {
    return null;
  }

  if (status === "missing-name") {
    return (
      <p className="text-sm font-semibold text-red-500">
        Add a name before saving this filter.
      </p>
    );
  }

  if (status === "saved") {
    return (
      <p className="text-sm font-semibold text-[#009879]">
        Filter saved locally.
      </p>
    );
  }

  if (status === "deleted") {
    return (
      <p className="text-sm font-semibold text-slate-500">Filter deleted.</p>
    );
  }

  if (status.startsWith("applied:")) {
    return (
      <p className="text-sm font-semibold text-[#009879]">
        Applied {status.replace("applied:", "")}.
      </p>
    );
  }

  return null;
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

        {report.relatedReportId && (
          <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#0b63f6]">
            <ExternalLink size={13} />
            <span className="truncate">
              Related to {report.relatedReportTitle || "another report"}
            </span>
          </div>
        )}

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

      {report.relatedReportId && (
        <div className="mt-3 inline-flex max-w-full items-center gap-2 self-start rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#0b63f6]">
          <ExternalLink size={13} />
          <span className="truncate">
            Related to {report.relatedReportTitle || "another report"}
          </span>
        </div>
      )}

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

function createConnectionCountMap(reports) {
  return {
    "Standalone Reports": reports.filter((report) => !report.relatedReportId)
      .length,
    "Related Reports": reports.filter((report) => report.relatedReportId).length,
    "Reports With Follow-ups": reports.filter(
      (report) => (report.followUpCount || 0) > 0,
    ).length,
  };
}

function matchesConnectionFilter(report, connectionFilter) {
  if (connectionFilter === "Standalone Reports") {
    return !report.relatedReportId;
  }

  if (connectionFilter === "Related Reports") {
    return Boolean(report.relatedReportId);
  }

  if (connectionFilter === "Reports With Follow-ups") {
    return (report.followUpCount || 0) > 0;
  }

  return true;
}

function createActiveFilters({
  searchValue,
  categoryFilter,
  riskFilter,
  identifierFilter,
  locationFilter,
  connectionFilter,
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
    connectionFilter !== "All Report Connections"
      ? {
          key: "connection",
          label: connectionFilter,
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

function getSavedFilterPresets() {
  const savedPresets = localStorage.getItem(REPORT_FILTER_PRESETS_KEY);

  if (!savedPresets) {
    return [];
  }

  try {
    const parsedPresets = JSON.parse(savedPresets);

    if (!Array.isArray(parsedPresets)) {
      return [];
    }

    return parsedPresets;
  } catch (error) {
    console.error("Could not load report filter presets:", error);
    return [];
  }
}

function saveFilterPresets(presets) {
  localStorage.setItem(REPORT_FILTER_PRESETS_KEY, JSON.stringify(presets));
}

function formatPresetSummary(preset) {
  return [
    preset.searchValue ? `Search: ${preset.searchValue}` : null,
    preset.categoryFilter !== "All Categories" ? preset.categoryFilter : null,
    preset.riskFilter !== "All Risk Levels" ? preset.riskFilter : null,
    preset.identifierFilter !== "All Identifier Types"
      ? preset.identifierFilter
      : null,
    preset.locationFilter !== "All Locations" ? preset.locationFilter : null,
    preset.connectionFilter &&
    preset.connectionFilter !== "All Report Connections"
      ? preset.connectionFilter
      : null,
    preset.sortMode !== "Newest First" ? preset.sortMode : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getHighestRiskReport(reports) {
  return [...reports].sort((firstReport, secondReport) => {
    const riskDifference =
      getRiskRank(secondReport.riskLevel) - getRiskRank(firstReport.riskLevel);

    if (riskDifference !== 0) {
      return riskDifference;
    }

    return (secondReport.reportsCount || 1) - (firstReport.reportsCount || 1);
  })[0];
}

function createFilterUrl({
  searchValue,
  categoryFilter,
  riskFilter,
  identifierFilter,
  locationFilter,
  connectionFilter,
  sortMode,
}) {
  const searchParams = new URLSearchParams();

  if (searchValue.trim()) {
    searchParams.set("q", searchValue.trim());
  }

  if (categoryFilter !== "All Categories") {
    searchParams.set("category", categoryFilter);
  }

  if (riskFilter !== "All Risk Levels") {
    searchParams.set("risk", riskFilter);
  }

  if (identifierFilter !== "All Identifier Types") {
    searchParams.set("type", identifierFilter);
  }

  if (locationFilter !== "All Locations") {
    searchParams.set("location", locationFilter);
  }

  if (connectionFilter !== "All Report Connections") {
    searchParams.set("connection", connectionFilter);
  }

  if (sortMode !== "Newest First") {
    searchParams.set("sort", sortMode);
  }

  const queryString = searchParams.toString();

  return queryString ? `/reports?${queryString}` : "/reports";
}

function createReportsCsv(reports) {
  const rows = reports.map((report) => [
    report.reportId,
    report.title,
    report.relatedReportId || "",
    report.relatedReportTitle || "",
    report.fraudCategory,
    getEntityType(report),
    getPrimaryIdentifier(report),
    report.riskLevel,
    report.location || "Bangladesh",
    report.reportsCount || 1,
    report.submittedAt || "Recently",
    report.preventionAdvice || "",
  ]);

  return [
    [
      "Report ID",
      "Title",
      "Related Report ID",
      "Related Report Title",
      "Category",
      "Identifier Type",
      "Identifier",
      "Risk Level",
      "Location",
      "Reports Count",
      "Submitted",
      "Safety Advice",
    ],
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}
