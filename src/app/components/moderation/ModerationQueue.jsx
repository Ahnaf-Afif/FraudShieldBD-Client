"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../lib/apiClient";
import { normalizeApiReport } from "../../lib/reportFeedData";
import { getDemoSession } from "../../lib/demoSession";

const statuses = ["Under Review", "Published", "Rejected"];

export default function ModerationQueue() {
  const [status, setStatus] = useState("Under Review");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState({});
  const [canAccessQueue, setCanAccessQueue] = useState(null);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const loadReports = useCallback(async () => {
    const session = getDemoSession();
    const hasAccess = ["Moderator", "Admin"].includes(session?.role);
    setCanAccessQueue(hasAccess);

    if (!hasAccess) {
      setReports([]);
      setError("Only moderators and administrators can access the moderation queue.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        `/reports/moderation?status=${encodeURIComponent(status)}&page=1&limit=50`,
      );
      setReports((data.reports || []).map(normalizeApiReport));
      setPage(Number(data.page) || 1);
      setTotalReports(Number(data.total) || data.reports?.length || 0);
    } catch (requestError) {
      setReports([]);
      setError(requestError.message || "Could not load the moderation queue.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  async function loadOlderReports() {
    if (isLoadingOlder || reports.length >= totalReports) {
      return;
    }

    setIsLoadingOlder(true);

    try {
      const nextPage = page + 1;
      const data = await apiRequest(
        `/reports/moderation?status=${encodeURIComponent(status)}&page=${nextPage}&limit=50`,
      );
      const olderReports = (data.reports || []).map(normalizeApiReport);

      setReports((currentReports) => {
        const existingIds = new Set(currentReports.map((report) => report.reportId));
        return [
          ...currentReports,
          ...olderReports.filter((report) => !existingIds.has(report.reportId)),
        ];
      });
      setPage(Number(data.page) || nextPage);
      setTotalReports(Number(data.total) || totalReports);
    } catch (requestError) {
      setError(requestError.message || "Could not load older reports.");
    } finally {
      setIsLoadingOlder(false);
    }
  }

  useEffect(() => {
    // Load and periodically refresh remote moderation data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
    const queueRefreshTimer = window.setInterval(loadReports, 30000);

    return () => {
      window.clearInterval(queueRefreshTimer);
    };
  }, [loadReports]);

  async function changeStatus(reportId, nextStatus) {
    setBusyId(reportId);
    setError("");

    try {
      await apiRequest(`/reports/${reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, moderationNote: notes[reportId] || "" }),
      });
      await loadReports();
    } catch (requestError) {
      setError(requestError.message || "Could not update this report.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {canAccessQueue === false && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-xl font-bold">Moderator access required</h1>
          <p className="mt-2 text-sm">
            Sign in with a moderator or administrator account to review reports.
          </p>
        </div>
      )}

      {canAccessQueue !== false && (
        <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Moderator workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Moderation queue</h1>
          <p className="mt-2 text-slate-600">
            Review community reports before they appear in the public feed.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh queue
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              status === item
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600">
          Loading moderation queue...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600">
          No reports found in {status.toLowerCase()}.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportId = report.reportId;
            const isBusy = busyId === reportId;

            return (
              <article key={reportId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {report.riskLevel || "Unclassified"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {report.fraudCategory || "Other"} · {report.platform || "Unknown platform"} · {report.location || "Location not provided"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      Reported by {report.ownerName || "Community member"}
                      {report.ownerEmail ? ` (${report.ownerEmail})` : ""}
                    </p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">{report.story}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Report ID: {reportId}
                    </p>
                    {report.reviewedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Reviewed by {report.reviewerName || "moderator"} on {new Date(report.reviewedAt).toLocaleString()}
                      </p>
                    )}
                    {report.moderationNote && (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Note: {report.moderationNote}
                      </p>
                    )}
                    {report.evidenceFileSummaries?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.evidenceFileSummaries.map((file) => (
                          <a
                            key={file.url || file.name}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                          >
                            Open evidence: {file.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {status === "Under Review" && (
                    <div className="flex shrink-0 flex-col items-stretch gap-2 md:w-64">
                      <label className="text-xs font-semibold text-slate-600" htmlFor={`moderation-note-${reportId}`}>
                        Review note (optional)
                      </label>
                      <textarea
                        id={`moderation-note-${reportId}`}
                        value={notes[reportId] || ""}
                        onChange={(event) =>
                          setNotes((currentNotes) => ({
                            ...currentNotes,
                            [reportId]: event.target.value,
                          }))
                        }
                        maxLength={1000}
                        rows={3}
                        placeholder="Explain the decision..."
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => changeStatus(reportId, "Published")}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {isBusy ? "Saving..." : "Publish"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => changeStatus(reportId, "Rejected")}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        Reject
                      </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {reports.length < totalReports && (
            <button
              type="button"
              onClick={loadOlderReports}
              disabled={isLoadingOlder}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingOlder ? "Loading older reports..." : "Load older reports"}
            </button>
          )}
        </div>
      )}
        </>
      )}
    </main>
  );
}
