"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeAlert,
  Bell,
  Check,
  Clock,
  ExternalLink,
  FilePlus2,
  MessageCircle,
  Pencil,
  Search,
  Share2,
  ShieldAlert,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import {
  clearRecentlyViewedReports,
  demoReports,
  getAllReportsForBrowser,
  getDigitsOnly,
  getEntityType,
  getPrimaryIdentifier,
  getRecentlyViewedReportsFromBrowser,
  getRiskStyle,
  getSavedReportComments,
  getSavedReportReactions,
  getSavedReportShares,
  maskIdentifier,
  normalizeApiReport,
  saveReportComments,
  saveReportReactions,
  saveReportShares,
} from "../../lib/reportFeedData";
import {
  createDemoAuthor,
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
} from "../../lib/demoSession";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";
import {
  addToWatchlist,
  getWatchlistFromBrowser,
  normalizeIdentifier,
  removeFromWatchlist,
  WATCHLIST_UPDATED_EVENT,
} from "../../lib/watchlistData";
import { shareOrCopyLink } from "../../lib/clipboard";
import {
  FEED_SORT_OPTIONS,
  getFeedPreferences,
  saveFeedPreferences,
} from "../../lib/feedPreferences";
import {
  clearRecentSearches,
  getRecentSearchesFromBrowser,
  RECENT_SEARCHES_UPDATED_EVENT,
  saveRecentSearch,
} from "../../lib/recentSearches";
import {
  apiRequest,
  deleteReportComment,
  syncReportComment,
  syncReportLike,
  syncWatchlistItem,
  updateReportComment,
} from "../../lib/apiClient";

const INITIAL_VISIBLE_REPORTS = 3;
const REPORTS_PER_LOAD = 3;
const MIN_COMMENT_LENGTH = 3;

function isApiReportId(reportId) {
  return /^[a-f\d]{24}$/i.test(String(reportId || ""));
}

function normalizeHomeComment(comment) {
  return {
    ...comment,
    id: comment._id || comment.id,
    createdAt: comment.createdAt || "Recently",
    authorName: comment.author?.name || comment.authorName || "Community member",
    authorEmail: comment.author?.email || comment.authorEmail || "",
    authorRole: comment.author?.role || comment.authorRole || "Reporter",
    authorInitials: String(comment.author?.name || comment.authorName || "U").slice(0, 1),
    canManage: Boolean(comment.canManage),
  };
}

export default function HomeNewsFeed() {
  const [reports, setReports] = useState(demoReports);
  const [activeFilter, setActiveFilter] = useState("All");
  const [feedSearch, setFeedSearch] = useState("");
  const [recentFeedSearches, setRecentFeedSearches] = useState([]);
  const [sortMode, setSortMode] = useState("Latest");
  const [currentAuthor, setCurrentAuthor] = useState(createDemoAuthor(null));
  const [reportReactions, setReportReactions] = useState({});
  const [reportComments, setReportComments] = useState({});
  const [reportShares, setReportShares] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [activeCommentReportId, setActiveCommentReportId] = useState("");
  const [copiedReportId, setCopiedReportId] = useState("");
  const [watchedIdentifiers, setWatchedIdentifiers] = useState({});
  const [recentlyViewedReports, setRecentlyViewedReports] = useState([]);
  const [apiPage, setApiPage] = useState(1);
  const [apiTotal, setApiTotal] = useState(0);
  const [isLoadingApiPage, setIsLoadingApiPage] = useState(false);
  const [feedLoadError, setFeedLoadError] = useState("");
  const [isUsingApiFeed, setIsUsingApiFeed] = useState(false);
  const [visibleReportCount, setVisibleReportCount] = useState(
    INITIAL_VISIBLE_REPORTS,
  );
  const loadMoreRef = useRef(null);

  async function refreshFeedState() {
    const localReports = getAllReportsForBrowser();

    try {
      const result = await apiRequest("/reports?page=1&limit=20");
      const apiReports = Array.isArray(result.reports)
        ? result.reports.map((report) => ({
            ...normalizeApiReport(report),
            _fromApi: true,
          }))
        : [];

      setApiPage(1);
      setApiTotal(Number(result.total) || apiReports.length);
      setIsUsingApiFeed(apiReports.length > 0);
      setReports(
        apiReports.length > 0
          ? mergeFeedReports(apiReports, demoReports)
          : localReports,
      );
    } catch (_error) {
      setApiPage(1);
      setApiTotal(0);
      setIsUsingApiFeed(false);
      setReports(localReports);
    }

    setCurrentAuthor(createDemoAuthor(getDemoSession()));
    setReportReactions(getSavedReportReactions());
    setReportComments(getSavedReportComments());
    setReportShares(getSavedReportShares());
    setWatchedIdentifiers(createWatchedIdentifierMap());
    setRecentlyViewedReports(getRecentlyViewedReportsFromBrowser());
  }

  function refreshRecentFeedSearches() {
    setRecentFeedSearches(getRecentSearchesFromBrowser());
  }

  useEffect(() => {
    // Synchronize browser storage and the feed API with the mounted page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshFeedState();
    refreshRecentFeedSearches();

    const savedPreferences = getFeedPreferences();

    setActiveFilter(savedPreferences.activeFilter);
    setSortMode(savedPreferences.sortMode);

    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, refreshFeedState);
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, refreshFeedState);
    window.addEventListener(WATCHLIST_UPDATED_EVENT, refreshFeedState);
    window.addEventListener(
      RECENT_SEARCHES_UPDATED_EVENT,
      refreshRecentFeedSearches,
    );
    window.addEventListener("storage", refreshFeedState);
    window.addEventListener("storage", refreshRecentFeedSearches);

    return () => {
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, refreshFeedState);
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, refreshFeedState);
      window.removeEventListener(WATCHLIST_UPDATED_EVENT, refreshFeedState);
      window.removeEventListener(
        RECENT_SEARCHES_UPDATED_EVENT,
        refreshRecentFeedSearches,
      );
      window.removeEventListener("storage", refreshFeedState);
      window.removeEventListener("storage", refreshRecentFeedSearches);
    };
  }, []);

  const feedStats = useMemo(() => createFeedStats(reports), [reports]);
  const followUpCounts = useMemo(() => createFollowUpCounts(reports), [reports]);
  const filterOptions = useMemo(
    () => createFeedFilterOptions(reports, activeFilter),
    [activeFilter, reports],
  );
  const categoryFilteredReports = useMemo(
    () =>
      activeFilter === "All"
        ? reports
        : reports.filter((report) => matchesFeedFilter(report, activeFilter)),
    [activeFilter, reports],
  );
  const searchedReports = useMemo(
    () =>
      categoryFilteredReports.filter((report) =>
        reportMatchesFeedSearch(report, feedSearch),
      ),
    [categoryFilteredReports, feedSearch],
  );
  const filteredReports = useMemo(
    () =>
      sortFeedReports({
        reports: searchedReports,
        sortMode,
        reportComments,
        reportShares,
      }),
    [reportComments, reportShares, searchedReports, sortMode],
  );
  const searchInsightReport = filteredReports[0] || null;
  const trendingReport = filteredReports[0] || reports[0] || null;
  const feedReports = useMemo(
    () => createScrollableFeedReports(filteredReports),
    [filteredReports],
  );
  const visibleReports = feedReports.slice(0, visibleReportCount);
  const visibleFeedCount = visibleReports.length;
  const totalFeedCount = feedReports.length;
  const hasMoreReports = visibleReportCount < feedReports.length;
  const hasActiveFeedFilters =
    activeFilter !== "All" || feedSearch.trim() || sortMode !== "Latest";
  const feedViewSummary = createFeedViewSummary({
    activeFilter,
    feedSearch,
    filteredCount: filteredReports.length,
    sortMode,
  });

  useEffect(() => {
    // Reset infinite-scroll position when the visible feed changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleReportCount(INITIAL_VISIBLE_REPORTS);
  }, [activeFilter, feedSearch, reports, sortMode]);

  useEffect(() => {
    const cleanSearch = feedSearch.trim();

    if (cleanSearch.length < 3) {
      return;
    }

    const saveSearchTimer = setTimeout(() => {
      saveRecentSearch(cleanSearch);
    }, 700);

    return () => {
      clearTimeout(saveSearchTimer);
    };
  }, [feedSearch]);

  useEffect(() => {
    if (activeFilter === "All" || reports.length === 0) {
      return;
    }

    const activeFilterStillExists = reports.some((report) =>
      matchesFeedFilter(report, activeFilter),
    );

    if (activeFilterStillExists) {
      return;
    }

    // Keep a removed filter from leaving the feed in an invalid state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveFilter("All");
    saveFeedPreferences({
      activeFilter: "All",
      sortMode,
    });
  }, [activeFilter, reports, sortMode]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreReports) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry.isIntersecting) {
          return;
        }

        loadMoreReports();
      },
      {
        rootMargin: "240px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  // loadMoreReports is intentionally called by the observer callback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedReports.length, hasMoreReports]);

  async function loadMoreReports() {
    if (isLoadingApiPage || !isUsingApiFeed || apiPage * 20 >= apiTotal) {
      setVisibleReportCount((currentCount) =>
        Math.min(currentCount + REPORTS_PER_LOAD, feedReports.length),
      );
      return;
    }

    setIsLoadingApiPage(true);
    setFeedLoadError("");

    try {
      const nextPage = apiPage + 1;
      const result = await apiRequest(`/reports?page=${nextPage}&limit=20`);
      const nextReports = Array.isArray(result.reports)
        ? result.reports.map((report) => ({
            ...normalizeApiReport(report),
            _fromApi: true,
          }))
        : [];

      setReports((currentReports) =>
        mergeFeedReports(currentReports, nextReports),
      );
      setApiPage(nextPage);
      setApiTotal(Number(result.total) || apiTotal);
      setVisibleReportCount((currentCount) => currentCount + REPORTS_PER_LOAD);
    } catch (_error) {
      setFeedLoadError("Could not load more reports. Please try again.");
      setVisibleReportCount((currentCount) =>
        Math.min(currentCount + REPORTS_PER_LOAD, feedReports.length),
      );
    } finally {
      setIsLoadingApiPage(false);
    }
  }

  function toggleReportLike(reportId) {
    const currentReportReaction = reportReactions[reportId] || {
      liked: false,
      likes: 0,
    };
    const optimisticReaction = {
      liked: !currentReportReaction.liked,
      likes: Math.max(
        currentReportReaction.likes + (currentReportReaction.liked ? -1 : 1),
        0,
      ),
    };
    const optimisticReactions = {
      ...reportReactions,
      [reportId]: optimisticReaction,
    };

    setReportReactions(optimisticReactions);
    saveReportReactions(optimisticReactions);

    if (!isApiReportId(reportId) || !window.localStorage.getItem("fraudshield-token")) {
      return;
    }

    syncReportLike(reportId)
      .then((result) => {
        setReportReactions((currentReactions) => {
          const nextReactions = {
            ...currentReactions,
            [reportId]: {
              liked: Boolean(result.liked),
              likes: Number(result.likes) || 0,
            },
          };

          saveReportReactions(nextReactions);
          return nextReactions;
        });
      })
      .catch(() => {
        setReportReactions((currentReactions) => {
          if (currentReactions[reportId]?.liked !== optimisticReaction.liked) {
            return currentReactions;
          }

          const rolledBackReactions = {
            ...currentReactions,
            [reportId]: currentReportReaction,
          };

          saveReportReactions(rolledBackReactions);
          return rolledBackReactions;
        });
      });
  }

  async function copyReportLink(reportId) {
    const selectedReport = reports.find((report) => report.reportId === reportId);
    const reportUrl = `${window.location.origin}/reports/${reportId}`;
    const shareResult = await shareOrCopyLink({
      title: selectedReport?.title || "FraudShield BD report",
      text:
        selectedReport?.preventionAdvice ||
        "Check this community fraud report before you pay.",
      url: reportUrl,
    });

    if (shareResult === "cancelled" || shareResult === "failed") {
      return;
    }

    setReportShares((currentShares) => {
      const nextShareCount = Number(currentShares[reportId] || 0) + 1;
      const updatedShares = {
        ...currentShares,
        [reportId]: nextShareCount,
      };

      saveReportShares(updatedShares);

      return updatedShares;
    });
    setCopiedReportId(reportId);

    setTimeout(() => {
      setCopiedReportId("");
    }, 1600);
  }

  function toggleCommentBox(reportId) {
    setActiveCommentReportId((currentReportId) =>
      currentReportId === reportId ? "" : reportId,
    );
  }

  function updateCommentDraft(reportId, value) {
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [reportId]: "",
    }));
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reportId]: value,
    }));
  }

  async function submitComment(reportId) {
    const commentText = (commentDrafts[reportId] || "").trim();

    if (commentText.length < MIN_COMMENT_LENGTH) {
      setCommentErrors((currentErrors) => ({
        ...currentErrors,
        [reportId]: `Write at least ${MIN_COMMENT_LENGTH} characters.`,
      }));
      return;
    }

    const localComment = {
      id: `${reportId}-${Date.now()}`,
      text: commentText,
      createdAt: "Just now",
      authorName: currentAuthor.name,
      authorEmail: currentAuthor.email,
      authorRole: currentAuthor.role,
      authorInitials: currentAuthor.initials,
    };
    let newComment = localComment;
    let syncError = "";

    if (isApiReportId(reportId) && window.localStorage.getItem("fraudshield-token")) {
      try {
        const result = await syncReportComment(reportId, commentText);
        newComment = normalizeHomeComment(result.comment);
      } catch (error) {
        syncError = error.message || "Could not sync this comment with the server.";
        setCommentErrors((currentErrors) => ({
          ...currentErrors,
          [reportId]: syncError,
        }));
        return;
      }
    }

    setReportComments((currentComments) => {
      const currentReportComments = currentComments[reportId] || [];
      const updatedComments = {
        ...currentComments,
        [reportId]: [...currentReportComments, newComment],
      };

      saveReportComments(updatedComments);
      return updatedComments;
    });

    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reportId]: "",
    }));
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [reportId]: syncError,
    }));
  }

  function deleteComment(reportId, commentId) {
    const existingComment = (reportComments[reportId] || []).find(
      (comment) => comment.id === commentId,
    );
    setReportComments((currentComments) => {
      const currentReportComments = currentComments[reportId] || [];
      const updatedReportComments = currentReportComments.filter(
        (comment) => comment.id !== commentId,
      );
      const updatedComments = {
        ...currentComments,
        [reportId]: updatedReportComments,
      };

      saveReportComments(updatedComments);

      return updatedComments;
    });

    if (
      isApiReportId(reportId) &&
      window.localStorage.getItem("fraudshield-token") &&
      /^[a-f\d]{24}$/i.test(String(commentId || ""))
    ) {
      deleteReportComment(reportId, commentId).catch((error) => {
        setCommentErrors((currentErrors) => ({
          ...currentErrors,
          [reportId]: error.message || "Could not delete this comment on the server.",
        }));
        if (existingComment) {
          setReportComments((currentComments) => {
            const restoredComments = {
              ...currentComments,
              [reportId]: [...(currentComments[reportId] || []), existingComment],
            };

            saveReportComments(restoredComments);
            return restoredComments;
          });
        }
      });
    }
  }

  function editComment(reportId, commentId, nextText) {
    const cleanText = nextText.trim();

    if (cleanText.length < MIN_COMMENT_LENGTH) {
      return false;
    }

    setReportComments((currentComments) => {
      const currentReportComments = currentComments[reportId] || [];
      const updatedReportComments = currentReportComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        return {
          ...comment,
          text: cleanText,
          editedAt: "Edited just now",
        };
      });
      const updatedComments = {
        ...currentComments,
        [reportId]: updatedReportComments,
      };

      saveReportComments(updatedComments);

      return updatedComments;
    });

    if (
      isApiReportId(reportId) &&
      window.localStorage.getItem("fraudshield-token") &&
      /^[a-f\d]{24}$/i.test(String(commentId || ""))
    ) {
      updateReportComment(reportId, commentId, cleanText).catch((error) => {
        setCommentErrors((currentErrors) => ({
          ...currentErrors,
          [reportId]: error.message || "Could not edit this comment on the server.",
        }));
      });
    }

    return true;
  }

  function clearFeedFilters() {
    setActiveFilter("All");
    setFeedSearch("");
    setSortMode("Latest");
    saveFeedPreferences({
      activeFilter: "All",
      sortMode: "Latest",
    });
  }

  function changeFeedFilter(nextFilter) {
    setActiveFilter(nextFilter);
    saveFeedPreferences({
      activeFilter: nextFilter,
      sortMode,
    });
  }

  function changeFeedSort(nextSortMode) {
    setSortMode(nextSortMode);
    saveFeedPreferences({
      activeFilter,
      sortMode: nextSortMode,
    });
  }

  function handleRecentFeedSearch(searchValue) {
    setFeedSearch(searchValue);
  }

  function toggleFeedWatch(report) {
    const identifier = getPrimaryIdentifier(report);
    const cleanIdentifier = normalizeIdentifier(identifier);

    if (!cleanIdentifier || identifier === "Identifier not available") {
      return;
    }

    if (watchedIdentifiers[cleanIdentifier]) {
      removeFromWatchlist(identifier);
      setWatchedIdentifiers(createWatchedIdentifierMap());
      return;
    }

    const item = addToWatchlist({
      identifier,
      type: getEntityType(report),
      riskLevel: report.riskLevel,
      reportId: report.reportId,
      title: report.title,
    });
    syncWatchlistItem(item).catch(() => {});
    setWatchedIdentifiers(createWatchedIdentifierMap());
  }

  function clearRecentlyViewedHistory() {
    clearRecentlyViewedReports();
    setRecentlyViewedReports([]);
  }

  return (
    <section
      id="community-feed"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
    >
      <HomeFeedComposer />

      <FeedOverview stats={feedStats} trendingReport={trendingReport} />

      <RecentlyViewedStrip
        reports={recentlyViewedReports}
        onClear={clearRecentlyViewedHistory}
      />

      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
          Community Feed
        </p>

        <h2 className="mt-2 text-2xl font-black text-[#06285c] sm:text-3xl">
          Recent Scam Reports
        </h2>

        <p className="mt-2 leading-7 text-slate-600">
          Latest reports shared by the community so people can check before
          they pay.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-4 focus-within:ring-4 focus-within:ring-[#009879]/10">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={feedSearch}
              onChange={(event) => setFeedSearch(event.target.value)}
              placeholder="Search reports by title, number, page, location..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-[#06285c] outline-none"
            />
            {feedSearch && (
              <button
                type="button"
                onClick={() => setFeedSearch("")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-[#06285c]"
                aria-label="Clear feed search"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <select
            value={sortMode}
            onChange={(event) => changeFeedSort(event.target.value)}
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
          >
            {FEED_SORT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {filteredReports.length} matching report
            {filteredReports.length === 1 ? "" : "s"}
          </p>

          {hasActiveFeedFilters && (
            <button
              type="button"
              onClick={clearFeedFilters}
              className="text-left font-black text-[#009879] hover:text-[#007f66] sm:text-right"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {feedViewSummary.map((item) => (
            <span
              key={item.label}
              className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500"
            >
              {item.label}:{" "}
              <span className="text-[#06285c]">{item.value}</span>
            </span>
          ))}
        </div>

        {recentFeedSearches.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Recent searches
              </p>

              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs font-black text-slate-400 transition hover:text-red-500"
              >
                Clear
              </button>
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {recentFeedSearches.slice(0, 5).map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => handleRecentFeedSearch(search)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {feedSearch.trim() && (
        <FeedSearchInsight
          query={feedSearch}
          matchedReport={searchInsightReport}
          matchCount={filteredReports.length}
        />
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => changeFeedFilter(filter.label)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
              activeFilter === filter.label
                ? "border-[#009879] bg-[#009879] text-white"
                : "border-slate-200 bg-white text-[#06285c] hover:border-[#009879] hover:text-[#009879]"
            }`}
          >
            {filter.label}
            <span className="ml-2 text-xs opacity-70">{filter.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibleReports.length === 0 ? (
          <EmptyFeedState
            activeFilter={activeFilter}
            feedSearch={feedSearch}
            hasActiveFeedFilters={Boolean(hasActiveFeedFilters)}
            onClear={clearFeedFilters}
          />
        ) : (
          visibleReports.map((report) => (
            <HomeReportPost
            key={report.feedId || getFeedIdentity(report)}
              report={report}
              reaction={reportReactions[report.reportId]}
              comments={reportComments[report.reportId] || []}
              followUpCount={followUpCounts[report.reportId] || 0}
              shares={Number(reportShares[report.reportId] || 0)}
              commentDraft={commentDrafts[report.reportId] || ""}
              commentError={commentErrors[report.reportId] || ""}
              commentsOpen={activeCommentReportId === report.reportId}
              copied={copiedReportId === report.reportId}
              watched={
                watchedIdentifiers[
                  normalizeIdentifier(getPrimaryIdentifier(report))
                ]
              }
              currentAuthor={currentAuthor}
              onLike={toggleReportLike}
              onToggleComments={toggleCommentBox}
              onCommentChange={updateCommentDraft}
              onCommentSubmit={submitComment}
              onCommentEdit={editComment}
              onCommentDelete={deleteComment}
              onShare={copyReportLink}
              onToggleWatch={toggleFeedWatch}
            />
          ))
        )}
      </div>

      {visibleFeedCount > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Showing {visibleFeedCount} of {totalFeedCount} feed posts
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#009879] transition-all"
              style={{
                width: `${Math.min(
                  (visibleFeedCount / totalFeedCount) * 100,
                  100,
                )}%`,
              }}
            />
          </div>

          {hasMoreReports && (
            <>
              {feedLoadError && (
                <p className="mt-4 text-sm font-bold text-red-600" role="alert">
                  {feedLoadError}
                </p>
              )}
              <button
                type="button"
                ref={loadMoreRef}
                onClick={loadMoreReports}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              >
                {feedLoadError ? "Try loading again" : "Load more reports"}
              </button>
            </>
          )}

          {!hasMoreReports && (
            <p className="mt-4 text-sm font-bold text-slate-500">
              You are caught up for now.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function RecentlyViewedStrip({ reports, onClear }) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#06285c]">
          <Clock size={17} className="text-[#009879]" />
          Recently viewed
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-black text-slate-400 transition hover:text-red-500"
          >
            Clear
          </button>

          <Link
            href="/reports"
            className="text-xs font-black text-[#009879] hover:text-[#007f66]"
          >
            Browse all
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {reports.map((report) => (
          <Link
            key={report.reportId}
            href={`/reports/${report.reportId}`}
            className="w-64 shrink-0 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-[#009879] hover:bg-[#f0fbf7]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-black leading-5 text-[#06285c]">
                {report.title}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${getRiskStyle(
                  report.riskLevel,
                )}`}
              >
                {report.riskLevel}
              </span>
            </div>

            <p className="mt-2 break-words text-xs font-semibold text-slate-500">
              {maskIdentifier(getPrimaryIdentifier(report))}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Viewed {report.viewedAt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FeedSearchInsight({ query, matchedReport, matchCount }) {
  const cleanQuery = query.trim();

  if (!matchedReport) {
    return (
      <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
        <p className="text-sm font-black text-orange-800">
          No feed posts matched &quot;{cleanQuery}&quot;.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/check?q=${encodeURIComponent(cleanQuery)}`}
            className="inline-flex justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-black text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
          >
            Check This Identifier
          </Link>
          <Link
            href="/report-fraud"
            className="inline-flex justify-center rounded-xl bg-[#009879] px-4 py-2 text-sm font-black text-white transition hover:bg-[#007f66]"
          >
            Report It
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-[#bfe7dc] bg-[#f0fbf7] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-[#009879]">
            Best match
          </p>
          <Link
            href={`/reports/${matchedReport.reportId}`}
            className="mt-1 block break-words text-base font-black text-[#06285c] transition hover:text-[#009879]"
          >
            {matchedReport.title}
          </Link>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {matchCount} result{matchCount === 1 ? "" : "s"} found for &quot;
            {cleanQuery}&quot; •{" "}
            {maskIdentifier(getPrimaryIdentifier(matchedReport))}
          </p>
        </div>

        <Link
          href={`/reports/${matchedReport.reportId}`}
          className="inline-flex shrink-0 justify-center rounded-xl bg-[#009879] px-4 py-2 text-sm font-black text-white transition hover:bg-[#007f66]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function FeedOverview({ stats, trendingReport }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
        <FeedStatCard
          label="Reports"
          value={stats.totalReports}
          icon={ShieldAlert}
          tone="green"
        />
        <FeedStatCard
          label="High Risk"
          value={stats.highRiskReports}
          icon={BadgeAlert}
          tone="red"
        />
        <FeedStatCard
          label="Categories"
          value={stats.totalCategories}
          icon={Bell}
          tone="blue"
        />
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-orange-500">
            <AlertTriangle size={23} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">
              Trending warning
            </p>
            {trendingReport ? (
              <>
                <Link
                  href={`/reports/${trendingReport.reportId}`}
                  className="mt-1 block break-words text-lg font-black leading-snug text-[#06285c] transition hover:text-[#009879]"
                >
                  {trendingReport.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-orange-800">
                  {maskIdentifier(getPrimaryIdentifier(trendingReport))} has{" "}
                  {trendingReport.reportsCount || 1} community report
                  {(trendingReport.reportsCount || 1) === 1 ? "" : "s"}.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-orange-800">
                Community warnings will appear here after reports are available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedStatCard({ label, value, icon: Icon, tone }) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-500"
      : tone === "blue"
        ? "bg-[#eef6ff] text-[#0b63f6]"
        : "bg-[#e9f8f4] text-[#009879]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClass}`}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-black text-[#06285c]">{value}</p>
          <p className="text-sm font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HomeFeedComposer() {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <ShieldAlert size={23} />
        </div>

        <Link
          href="/report-fraud"
          className="flex min-h-12 flex-1 items-center rounded-full bg-slate-50 px-4 text-sm font-semibold text-slate-500 transition hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          Seen a suspicious number, page, website or business?
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <Link
          href="/report-fraud"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          <FilePlus2 size={18} />
          Report Fraud
        </Link>

        <Link
          href="/check"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        >
          <Search size={18} />
          Check First
        </Link>
      </div>
    </div>
  );
}

function EmptyFeedState({
  activeFilter,
  feedSearch,
  hasActiveFeedFilters,
  onClear,
}) {
  const cleanSearch = feedSearch.trim();
  const title = cleanSearch
    ? `No reports found for "${cleanSearch}"`
    : `No ${activeFilter.toLowerCase()} reports yet`;
  const message = hasActiveFeedFilters
    ? "Try clearing the current feed view or search another identifier."
    : "When the community submits reports in this category, they will appear here.";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <ShieldAlert size={28} />
      </div>

      <h3 className="mt-4 text-xl font-black text-[#06285c]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        {message}
      </p>

      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        {hasActiveFeedFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
          >
            Clear Feed View
          </button>
        )}

        <Link
          href="/report-fraud"
          className="inline-flex justify-center rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
        >
          Submit a Report
        </Link>
      </div>
    </div>
  );
}

function HomeReportPost({
  report,
  reaction,
  comments,
  followUpCount,
  shares,
  commentDraft,
  commentError,
  commentsOpen,
  copied,
  watched,
  currentAuthor,
  onLike,
  onToggleComments,
  onCommentChange,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  onShare,
  onToggleWatch,
}) {
  const riskStyle = getRiskStyle(report.riskLevel);
  const liked = reaction?.liked || false;
  const likes = reaction?.likes || 0;
  const commentCount = comments.length;
  const latestComment = comments[comments.length - 1] || null;
  const reporterTrust = getReporterTrustBadge(report);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/reports/${report.reportId}`} className="block p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
            <ShieldAlert size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-black text-[#06285c] sm:text-lg">
                {report.title}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${riskStyle}`}
              >
                {report.riskLevel}
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {report.fraudCategory} • {report.location || "Bangladesh"} •{" "}
              {report.submittedAt || "Recently"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
              <span>Reported by {report.reporterName || "Community member"}</span>
              <span
                className={`rounded-full px-2 py-1 font-black ${reporterTrust.className}`}
              >
                {reporterTrust.label}
              </span>
            </div>

            {report.relatedReportId && (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#0b63f6]">
                <ExternalLink size={13} />
                <span className="truncate">
                  Related to {report.relatedReportTitle || "another report"}
                </span>
              </div>
            )}

            {followUpCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f0fbf7] px-3 py-1 text-xs font-black text-[#009879]">
                <MessageCircle size={13} />
                {followUpCount} follow-up report
                {followUpCount === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 leading-7 text-slate-700">{report.story}</p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-slate-400">
            Reported Identifier
          </p>

          <p className="mt-1 break-words text-base font-black text-[#06285c]">
            {maskIdentifier(getPrimaryIdentifier(report))}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
          <div className="flex gap-2">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <p className="leading-7 text-orange-800">
              {report.preventionAdvice}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-xs font-bold text-slate-500 sm:px-5">
        <span>{likes} likes</span>
        <button
          type="button"
          onClick={() => onToggleComments(report.reportId)}
          className="transition hover:text-[#009879]"
        >
          {commentCount} comments
        </button>
        {shares > 0 && (
          <span>
            {shares} share{shares === 1 ? "" : "s"}
          </span>
        )}
        {watched && <span className="text-[#009879]">Watching</span>}
      </div>

      <div className="flex snap-x overflow-x-auto border-t border-slate-200 px-1 text-sm font-bold text-slate-600">
        <FeedAction
          active={liked}
          ariaLabel={liked ? "Unlike this report" : "Like this report"}
          icon={<ThumbsUp size={18} />}
          label={liked ? "Liked" : "Like"}
          onClick={() => onLike(report.reportId)}
        />
        <FeedAction
          active={commentsOpen}
          ariaLabel={
            commentsOpen ? "Hide report comments" : "Show report comments"
          }
          icon={<MessageCircle size={18} />}
          label="Comment"
          onClick={() => onToggleComments(report.reportId)}
        />
        <FeedAction
          active={copied}
          ariaLabel="Share this report"
          icon={<Share2 size={18} />}
          label={copied ? "Copied" : "Share"}
          onClick={() => onShare(report.reportId)}
        />
        <FeedAction
          active={watched}
          ariaLabel={
            watched ? "Remove report from watchlist" : "Add report to watchlist"
          }
          icon={<Bell size={18} />}
          label={watched ? "Watching" : "Watch"}
          onClick={() => onToggleWatch(report)}
        />
        <FeedLinkAction
          href={`/reports/${report.reportId}`}
          icon={<ExternalLink size={18} />}
          label="Details"
        />
      </div>

      {commentsOpen && (
        <CommentPanel
          comments={comments}
          draft={commentDraft}
          error={commentError}
          currentAuthor={currentAuthor}
          onChange={(value) => onCommentChange(report.reportId, value)}
          onSubmit={() => onCommentSubmit(report.reportId)}
          onEdit={(commentId, nextText) =>
            onCommentEdit(report.reportId, commentId, nextText)
          }
          onDelete={(commentId) => onCommentDelete(report.reportId, commentId)}
        />
      )}

      {!commentsOpen && latestComment && (
        <button
          type="button"
          onClick={() => onToggleComments(report.reportId)}
          className="block w-full border-t border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:bg-[#f0fbf7] sm:px-5"
        >
          <div className="flex items-start gap-2">
            <CommentAvatar comment={latestComment} />
            <div className="min-w-0">
              <p className="text-xs font-black text-[#06285c]">
                Latest comment
              </p>
              <p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-slate-600">
                {latestComment.text}
              </p>
            </div>
          </div>
        </button>
      )}
    </article>
  );
}

function CommentPanel({
  comments,
  draft,
  error,
  currentAuthor,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
}) {
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingDraft, setEditingDraft] = useState("");
  const [editingError, setEditingError] = useState("");
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState("");
  const cleanDraftLength = draft.trim().length;
  const missingCharacterCount = Math.max(
    MIN_COMMENT_LENGTH - cleanDraftLength,
    0,
  );

  function startEditingComment(comment) {
    setEditingCommentId(comment.id);
    setEditingDraft(comment.text);
    setEditingError("");
    setPendingDeleteCommentId("");
  }

  function cancelEditingComment() {
    setEditingCommentId("");
    setEditingDraft("");
    setEditingError("");
  }

  function askToDeleteComment(commentId) {
    cancelEditingComment();
    setPendingDeleteCommentId(commentId);
  }

  function cancelDeleteComment() {
    setPendingDeleteCommentId("");
  }

  function confirmDeleteComment(commentId) {
    onDelete(commentId);
    setPendingDeleteCommentId("");
  }

  function saveEditingComment() {
    const cleanEditingDraft = editingDraft.trim();

    if (cleanEditingDraft.length < MIN_COMMENT_LENGTH) {
      setEditingError(`Write at least ${MIN_COMMENT_LENGTH} characters.`);
      return;
    }

    const saved = onEdit(editingCommentId, cleanEditingDraft);

    if (!saved) {
      setEditingError(`Write at least ${MIN_COMMENT_LENGTH} characters.`);
      return;
    }

    cancelEditingComment();
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">
            No comments yet. Be the first to add useful context.
          </p>
        ) : (
          comments.map((comment) => {
            const canDeleteComment = comment.authorEmail === currentAuthor.email;
            const isEditingComment = editingCommentId === comment.id;
            const isConfirmingDelete = pendingDeleteCommentId === comment.id;

            return (
              <div key={comment.id} className="rounded-xl bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <CommentAvatar comment={comment} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#06285c]">
                        {comment.authorName || "Community member"}
                      </p>
                      <p className="truncate text-xs font-semibold text-slate-400">
                        {comment.authorRole || "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="text-xs font-semibold text-slate-400">
                      {comment.createdAt}
                    </p>

                    {canDeleteComment && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditingComment(comment)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#f0fbf7] hover:text-[#009879]"
                          aria-label="Edit comment"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => askToDeleteComment(comment.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isConfirmingDelete && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-sm font-bold text-red-700">
                      Delete this comment?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => confirmDeleteComment(comment.id)}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white transition hover:bg-red-600"
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={cancelDeleteComment}
                        className="rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-black text-red-600 transition hover:border-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isEditingComment ? (
                  <div className="mt-3">
                    <textarea
                      value={editingDraft}
                      onChange={(event) => {
                        setEditingDraft(event.target.value);
                        setEditingError("");
                      }}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                    />

                    {editingError && (
                      <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                        {editingError}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={saveEditingComment}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#009879] px-4 py-2 text-sm font-black text-white transition hover:bg-[#007f66]"
                      >
                        <Check size={16} />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditingComment}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-[#06285c]"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                      {comment.text}
                    </p>
                    {comment.editedAt && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {comment.editedAt}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#009879] text-xs font-black text-white">
            {currentAuthor.initials}
          </div>
          <input
            value={draft}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`Comment as ${currentAuthor.name}`}
            className="w-full min-w-0 text-sm font-semibold text-[#06285c] outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={cleanDraftLength < MIN_COMMENT_LENGTH}
          className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Post
        </button>
      </div>

      {cleanDraftLength > 0 && cleanDraftLength < MIN_COMMENT_LENGTH && (
        <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
          Write {missingCharacterCount} more character
          {missingCharacterCount === 1 ? "" : "s"} to post.
        </p>
      )}

      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function CommentAvatar({ comment }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#009879] text-xs font-black text-white">
      {comment.authorInitials || "CM"}
    </div>
  );
}

function FeedAction({ active = false, ariaLabel, icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 py-3 outline-none transition hover:bg-slate-50 hover:text-[#009879] focus-visible:ring-4 focus-visible:ring-[#009879]/15 active:bg-slate-100 ${
        active ? "text-[#009879]" : ""
      } min-w-28 flex-1 shrink-0 snap-start rounded-xl`}
    >
      {icon}
      {label}
    </button>
  );
}

function FeedLinkAction({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="inline-flex min-w-28 flex-1 shrink-0 snap-start items-center justify-center gap-2 rounded-xl py-3 outline-none transition hover:bg-slate-50 hover:text-[#009879] focus-visible:ring-4 focus-visible:ring-[#009879]/15 active:bg-slate-100"
    >
      {icon}
      {label}
    </Link>
  );
}

function getReporterTrustBadge(report) {
  if (report.isAnonymous) {
    return {
      label: "Anonymous",
      className: "bg-slate-100 text-slate-500",
    };
  }

  if (report.reporterRole === "Top contributor") {
    return {
      label: "Top contributor",
      className: "bg-orange-100 text-orange-600",
    };
  }

  if (report.reporterRole === "Verified reporter") {
    return {
      label: "Verified",
      className: "bg-[#e9f8f4] text-[#009879]",
    };
  }

  return {
    label: report.reporterRole || "Reporter",
    className: "bg-[#eef6ff] text-[#0b63f6]",
  };
}

function createScrollableFeedReports(filteredReports) {
  if (filteredReports.length === 0) {
    return [];
  }

  return filteredReports.map((report) => ({
    ...report,
    feedId: getFeedIdentity(report),
    submittedAt: formatFeedTime(report.submittedAt, 0),
  }));
}

function getFeedIdentity(report) {
  return (
    report.reportId ||
    report.id ||
    `${report.title || "report"}-${getPrimaryIdentifier(report)}`
  );
}

function mergeFeedReports(currentReports, nextReports) {
  const seenIds = new Set();

  return [...currentReports, ...nextReports].filter((report) => {
    const reportId = getFeedIdentity(report);

    if (!reportId || seenIds.has(reportId)) {
      return false;
    }

    seenIds.add(reportId);
    return true;
  });
}

function createWatchedIdentifierMap() {
  return getWatchlistFromBrowser().reduce((watchedMap, item) => {
    return {
      ...watchedMap,
      [item.normalizedIdentifier || normalizeIdentifier(item.identifier)]: true,
    };
  }, {});
}

function formatFeedTime(submittedAt, loopIndex) {
  if (loopIndex === 0) {
    return submittedAt || "Recently";
  }

  return `${loopIndex + 1} days ago`;
}

function reportMatchesFeedSearch(report, searchValue) {
  const cleanSearch = searchValue.trim().toLowerCase();
  const searchDigits = getDigitsOnly(cleanSearch);
  const searchTokens = cleanSearch
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  if (!cleanSearch) {
    return true;
  }

  const searchableText = [
    report.title,
    report.fraudCategory,
    report.location,
    report.story,
    report.preventionAdvice,
    report.phoneOrPaymentNumber,
    report.facebookLink,
    report.websiteLink,
    report.businessName,
    report.reporterName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const searchableDigits = getDigitsOnly(searchableText);
  const directTextMatch = searchableText.includes(cleanSearch);
  const digitMatch =
    searchDigits.length >= 5 && searchableDigits.includes(searchDigits);
  const tokenMatch =
    searchTokens.length > 0 &&
    searchTokens.every((token) => searchableText.includes(token));

  return directTextMatch || digitMatch || tokenMatch;
}

function sortFeedReports({ reports, sortMode, reportComments, reportShares }) {
  const sortedReports = [...reports];

  if (sortMode === "Highest Risk") {
    return sortedReports.sort(
      (firstReport, secondReport) =>
        getRiskSortValue(secondReport.riskLevel) -
        getRiskSortValue(firstReport.riskLevel),
    );
  }

  if (sortMode === "Most Reports") {
    return sortedReports.sort(
      (firstReport, secondReport) =>
        (secondReport.reportsCount || 1) - (firstReport.reportsCount || 1),
    );
  }

  if (sortMode === "Most Discussed") {
    return sortedReports.sort(
      (firstReport, secondReport) =>
        getCommentCount(secondReport, reportComments) -
        getCommentCount(firstReport, reportComments),
    );
  }

  if (sortMode === "Most Shared") {
    return sortedReports.sort(
      (firstReport, secondReport) =>
        getShareCount(secondReport, reportShares) -
        getShareCount(firstReport, reportShares),
    );
  }

  return sortedReports;
}

function getCommentCount(report, reportComments) {
  return (reportComments[report.reportId] || []).length;
}

function getShareCount(report, reportShares) {
  return Number(reportShares[report.reportId] || 0);
}

function createFeedViewSummary({
  activeFilter,
  feedSearch,
  filteredCount,
  sortMode,
}) {
  const cleanSearch = feedSearch.trim();
  const summaryItems = [
    {
      label: "Category",
      value: activeFilter,
    },
    {
      label: "Sort",
      value: sortMode,
    },
    {
      label: "Results",
      value: filteredCount,
    },
  ];

  if (!cleanSearch) {
    return summaryItems;
  }

  return [
    ...summaryItems,
    {
      label: "Search",
      value: cleanSearch,
    },
  ];
}

function createFeedStats(reports) {
  return {
    totalReports: reports.length,
    highRiskReports: reports.filter((report) => report.riskLevel === "High Risk")
      .length,
    totalCategories: new Set(
      reports.map((report) => report.fraudCategory).filter(Boolean),
    ).size,
  };
}

function createFollowUpCounts(reports) {
  return reports.reduce((counts, report) => {
    if (!report.relatedReportId) {
      return counts;
    }

    return {
      ...counts,
      [report.relatedReportId]: (counts[report.relatedReportId] || 0) + 1,
    };
  }, {});
}

function createFeedFilterOptions(reports, activeFilter) {
  const categoryCounts = reports.reduce((counts, report) => {
    const category = report.fraudCategory || "Other";

    return {
      ...counts,
      [category]: (counts[category] || 0) + 1,
    };
  }, {});
  const popularCategories = Object.entries(categoryCounts)
    .sort((firstCategory, secondCategory) => secondCategory[1] - firstCategory[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
  const connectedCount = reports.filter(
    (report) => report.relatedReportId || (report.followUpCount || 0) > 0,
  ).length;
  const activeFilterAlreadyVisible = popularCategories.some(
    (category) => category.label === activeFilter,
  );
  const activeFilterOption =
    activeFilter !== "All" &&
    categoryCounts[activeFilter] &&
    !activeFilterAlreadyVisible
      ? [{ label: activeFilter, count: categoryCounts[activeFilter] }]
      : [];

  return [
    { label: "All", count: reports.length },
    { label: "Connected", count: connectedCount },
    ...activeFilterOption,
    ...popularCategories,
  ];
}

function matchesFeedFilter(report, activeFilter) {
  if (activeFilter === "Connected") {
    return Boolean(
      report.relatedReportId || (report.followUpCount || 0) > 0,
    );
  }

  return report.fraudCategory === activeFilter;
}

function getRiskSortValue(riskLevel) {
  if (riskLevel === "High Risk") {
    return 3;
  }

  if (riskLevel === "Medium Risk") {
    return 2;
  }

  return 1;
}
