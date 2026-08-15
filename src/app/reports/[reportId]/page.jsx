"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MessageCircle,
  MapPin,
  Share2,
  ShieldAlert,
  ThumbsUp,
} from "lucide-react";
import Navbar from "../../components/shared/Navbar";
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

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reaction, setReaction] = useState({ liked: false, likes: 0 });
  const [comments, setComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedReports = getSubmittedReportsFromBrowser().map(
      normalizeSubmittedReport,
    );
    const allReports = [...savedReports, ...demoReports];
    const matchedReport = allReports.find(
      (currentReport) => currentReport.reportId === reportId,
    );

    setReport(matchedReport || null);
    setReaction(getSavedReportReactions()[reportId] || { liked: false, likes: 0 });
    setComments(getSavedReportComments()[reportId] || []);
    setIsLoading(false);
  }, [reportId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center font-bold text-slate-500 shadow-sm">
            Loading report...
          </div>
        </section>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#009879]"
          >
            <ArrowLeft size={18} />
            Back to feed
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-black text-[#06285c]">
              Report not found
            </h1>
            <p className="mt-3 leading-7 text-slate-600">
              This report may not exist in this browser yet.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const riskStyle = getRiskStyle(report.riskLevel);
  const identifier = getPrimaryIdentifier(report);

  function toggleLike() {
    const nextLiked = !reaction.liked;
    const nextReaction = {
      liked: nextLiked,
      likes: Math.max(reaction.likes + (nextLiked ? 1 : -1), 0),
    };
    const updatedReactions = {
      ...getSavedReportReactions(),
      [report.reportId]: nextReaction,
    };

    saveReportReactions(updatedReactions);
    setReaction(nextReaction);
  }

  async function copyReportLink() {
    const reportUrl = `${window.location.origin}/reports/${report.reportId}`;

    await navigator.clipboard.writeText(reportUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  function submitComment() {
    const commentText = commentDraft.trim();

    if (!commentText) {
      return;
    }

    const newComment = {
      id: `${report.reportId}-${Date.now()}`,
      text: commentText,
      createdAt: "Just now",
    };
    const nextComments = [...comments, newComment];
    const updatedComments = {
      ...getSavedReportComments(),
      [report.reportId]: nextComments,
    };

    saveReportComments(updatedComments);
    setComments(nextComments);
    setCommentDraft("");
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#009879]"
        >
          <ArrowLeft size={18} />
          Back to feed
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                <ShieldAlert size={30} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${riskStyle}`}
                  >
                    {report.riskLevel}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#06285c]">
                    {report.fraudCategory}
                  </span>
                </div>

                <h1 className="mt-3 break-words text-3xl font-black leading-tight text-[#06285c]">
                  {report.title}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={16} />
                    {report.location || "Bangladesh"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={16} />
                    {report.submittedAt || "Recently"}
                  </span>
                </div>
              </div>
            </div>

            <section className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-black text-[#06285c]">
                Incident summary
              </h2>
              <p className="mt-3 leading-8 text-slate-700">{report.story}</p>
            </section>

            <section className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase text-slate-400">
                Reported identifier
              </p>
              <p className="mt-2 break-words text-xl font-black text-[#06285c]">
                {maskIdentifier(identifier)}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle
                  size={22}
                  className="mt-1 shrink-0 text-orange-500"
                />
                <div>
                  <h2 className="font-black text-[#06285c]">
                    How to avoid this scam
                  </h2>
                  <p className="mt-2 leading-8 text-orange-800">
                    {report.preventionAdvice}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                <span>{reaction.likes} likes</span>
                <span>{comments.length} comments</span>
              </div>

              <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 text-sm font-bold text-slate-600">
                <DetailAction
                  active={reaction.liked}
                  icon={<ThumbsUp size={18} />}
                  label={reaction.liked ? "Liked" : "Like"}
                  onClick={toggleLike}
                />
                <DetailAction
                  icon={<MessageCircle size={18} />}
                  label="Comment"
                  onClick={() => document.getElementById("detail-comment-input")?.focus()}
                />
                <DetailAction
                  active={copied}
                  icon={<Share2 size={18} />}
                  label={copied ? "Copied" : "Share"}
                  onClick={copyReportLink}
                />
              </div>
            </section>

            <section className="mt-6 rounded-2xl bg-slate-50 p-5">
              <h2 className="text-xl font-black text-[#06285c]">Comments</h2>

              <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">
                    No comments yet. Add useful context for the community.
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
                  id="detail-comment-input"
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Write a helpful comment..."
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400"
                >
                  Post
                </button>
              </div>
            </section>
          </article>

          <aside className="space-y-4">
            <DetailStat label="Report ID" value={report.reportId} />
            <DetailStat
              label="Community reports"
              value={String(report.reportsCount || 1)}
            />
            <DetailStat label="Status" value="Published warning" />
          </aside>
        </div>
      </section>
    </main>
  );
}

function DetailAction({ active = false, icon, label, onClick }) {
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

function DetailStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-[#06285c]">
        {value}
      </p>
    </div>
  );
}
