"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  MessageCircle,
  Share2,
  ShieldAlert,
  ThumbsUp,
} from "lucide-react";
import {
  demoReports,
  getPrimaryIdentifier,
  getRiskStyle,
  getSavedReportComments,
  getSavedReportReactions,
  getSubmittedReportsFromBrowser,
  maskIdentifier,
  normalizeSubmittedReport,
  saveReportComments,
  saveReportReactions,
} from "../../lib/reportFeedData";

const INITIAL_VISIBLE_REPORTS = 3;
const REPORTS_PER_LOAD = 3;
const FEED_REPEAT_COUNT = 8;

const filters = [
  "All",
  "Mobile Financial",
  "Facebook Page",
  "Website",
  "Investment",
];

export default function HomeNewsFeed() {
  const [reports, setReports] = useState(demoReports);
  const [activeFilter, setActiveFilter] = useState("All");
  const [reportReactions, setReportReactions] = useState({});
  const [reportComments, setReportComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [activeCommentReportId, setActiveCommentReportId] = useState("");
  const [copiedReportId, setCopiedReportId] = useState("");
  const [visibleReportCount, setVisibleReportCount] = useState(
    INITIAL_VISIBLE_REPORTS,
  );
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const savedReports = getSubmittedReportsFromBrowser();

    if (savedReports.length === 0) {
      return;
    }

    setReports(savedReports.map(normalizeSubmittedReport));
  }, []);

  useEffect(() => {
    setReportReactions(getSavedReportReactions());
    setReportComments(getSavedReportComments());
  }, []);

  const filteredReports =
    activeFilter === "All"
      ? reports
      : reports.filter((report) => report.fraudCategory === activeFilter);
  const feedReports = createScrollableFeedReports(filteredReports);
  const visibleReports = feedReports.slice(0, visibleReportCount);
  const hasMoreReports = visibleReportCount < feedReports.length;

  useEffect(() => {
    setVisibleReportCount(INITIAL_VISIBLE_REPORTS);
  }, [activeFilter, reports]);

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

        setVisibleReportCount((currentCount) =>
          Math.min(currentCount + REPORTS_PER_LOAD, feedReports.length),
        );
      },
      {
        rootMargin: "240px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [feedReports.length, hasMoreReports]);

  function toggleReportLike(reportId) {
    setReportReactions((currentReactions) => {
      const currentReportReaction = currentReactions[reportId] || {
        liked: false,
        likes: 0,
      };
      const nextLiked = !currentReportReaction.liked;
      const nextLikes = Math.max(
        currentReportReaction.likes + (nextLiked ? 1 : -1),
        0,
      );
      const updatedReactions = {
        ...currentReactions,
        [reportId]: {
          liked: nextLiked,
          likes: nextLikes,
        },
      };

      saveReportReactions(updatedReactions);

      return updatedReactions;
    });
  }

  async function copyReportLink(reportId) {
    const reportUrl = `${window.location.origin}/reports/${reportId}`;

    await navigator.clipboard.writeText(reportUrl);
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
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reportId]: value,
    }));
  }

  function submitComment(reportId) {
    const commentText = (commentDrafts[reportId] || "").trim();

    if (!commentText) {
      return;
    }

    setReportComments((currentComments) => {
      const currentReportComments = currentComments[reportId] || [];
      const newComment = {
        id: `${reportId}-${Date.now()}`,
        text: commentText,
        createdAt: "Just now",
      };
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
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
              activeFilter === filter
                ? "border-[#009879] bg-[#009879] text-white"
                : "border-slate-200 bg-white text-[#06285c] hover:border-[#009879] hover:text-[#009879]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibleReports.map((report) => (
          <HomeReportPost
            key={report.feedId}
            report={report}
            reaction={reportReactions[report.reportId]}
            comments={reportComments[report.reportId] || []}
            commentDraft={commentDrafts[report.reportId] || ""}
            commentsOpen={activeCommentReportId === report.reportId}
            copied={copiedReportId === report.reportId}
            onLike={toggleReportLike}
            onToggleComments={toggleCommentBox}
            onCommentChange={updateCommentDraft}
            onCommentSubmit={submitComment}
            onShare={copyReportLink}
          />
        ))}
      </div>

      {hasMoreReports && (
        <div
          ref={loadMoreRef}
          className="mt-6 rounded-2xl border border-slate-200 bg-white py-4 text-center text-sm font-bold text-slate-500"
        >
          Loading more reports...
        </div>
      )}
    </section>
  );
}

function HomeReportPost({
  report,
  reaction,
  comments,
  commentDraft,
  commentsOpen,
  copied,
  onLike,
  onToggleComments,
  onCommentChange,
  onCommentSubmit,
  onShare,
}) {
  const riskStyle = getRiskStyle(report.riskLevel);
  const liked = reaction?.liked || false;
  const likes = reaction?.likes || 0;
  const commentCount = comments.length;

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

      <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2 text-xs font-bold text-slate-500 sm:px-5">
        <span>{likes} likes</span>
        <span>{commentCount} comments</span>
      </div>

      <div className="grid grid-cols-3 border-t border-slate-200 text-sm font-bold text-slate-600">
        <FeedAction
          active={liked}
          icon={<ThumbsUp size={18} />}
          label={liked ? "Liked" : "Like"}
          onClick={() => onLike(report.reportId)}
        />
        <FeedAction
          active={commentsOpen}
          icon={<MessageCircle size={18} />}
          label="Comment"
          onClick={() => onToggleComments(report.reportId)}
        />
        <FeedAction
          active={copied}
          icon={<Share2 size={18} />}
          label={copied ? "Copied" : "Share"}
          onClick={() => onShare(report.reportId)}
        />
      </div>

      {commentsOpen && (
        <CommentPanel
          comments={comments}
          draft={commentDraft}
          onChange={(value) => onCommentChange(report.reportId, value)}
          onSubmit={() => onCommentSubmit(report.reportId)}
        />
      )}
    </article>
  );
}

function CommentPanel({ comments, draft, onChange, onSubmit }) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">
            No comments yet. Be the first to add useful context.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-xl bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[#06285c]">
                  Community member
                </p>
                <p className="shrink-0 text-xs font-semibold text-slate-400">
                  {comment.createdAt}
                </p>
              </div>
              <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write a helpful comment..."
          className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400"
        >
          Post
        </button>
      </div>
    </div>
  );
}

function FeedAction({ active = false, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 py-3 transition hover:bg-slate-50 hover:text-[#009879] active:bg-slate-100 ${
        active ? "text-[#009879]" : ""
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function createScrollableFeedReports(filteredReports) {
  if (filteredReports.length === 0) {
    return [];
  }

  return Array.from({ length: FEED_REPEAT_COUNT }).flatMap((_, loopIndex) =>
    filteredReports.map((report) => ({
      ...report,
      feedId: `${report.reportId}-${loopIndex}`,
      submittedAt: formatFeedTime(report.submittedAt, loopIndex),
    })),
  );
}

function formatFeedTime(submittedAt, loopIndex) {
  if (loopIndex === 0) {
    return submittedAt || "Recently";
  }

  return `${loopIndex + 1} days ago`;
}
