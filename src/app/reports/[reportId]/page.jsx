"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeAlert,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  Clock3,
  Eye,
  ExternalLink,
  FileText,
  Lock,
  MessageCircle,
  MapPin,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import Navbar from "../../components/shared/Navbar";
import {
  getAllReportsForBrowser,
  getReportByIdFromBrowser,
  getPrimaryIdentifier,
  getRiskStyle,
  getSavedReportComments,
  getSavedReportReactions,
  maskIdentifier,
  saveRecentlyViewedReport,
  saveReportComments,
  saveReportReactions,
} from "../../lib/reportFeedData";
import {
  createDemoAuthor,
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
} from "../../lib/demoSession";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";
import {
  addToWatchlist,
  isIdentifierWatched,
  removeFromWatchlist,
} from "../../lib/watchlistData";

const MIN_COMMENT_LENGTH = 3;

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reaction, setReaction] = useState({ liked: false, likes: 0 });
  const [comments, setComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedIdentifier, setCopiedIdentifier] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [currentAuthor, setCurrentAuthor] = useState(createDemoAuthor(null));
  const [isWatched, setIsWatched] = useState(false);
  const [commentError, setCommentError] = useState("");

  function refreshReportDetails() {
    const browserReports = getAllReportsForBrowser();
    const matchedReport = getReportByIdFromBrowser(reportId);

    setAllReports(browserReports);
    setReport(matchedReport || null);

    if (matchedReport) {
      saveRecentlyViewedReport(matchedReport);
    }

    setIsWatched(
      matchedReport
        ? isIdentifierWatched(getPrimaryIdentifier(matchedReport))
        : false,
    );
    setReaction(
      getSavedReportReactions()[reportId] || { liked: false, likes: 0 },
    );
    setComments(getSavedReportComments()[reportId] || []);
    setCurrentAuthor(createDemoAuthor(getDemoSession()));
    setIsLoading(false);
  }

  useEffect(() => {
    refreshReportDetails();

    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, refreshReportDetails);
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, refreshReportDetails);
    window.addEventListener("storage", refreshReportDetails);

    return () => {
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, refreshReportDetails);
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, refreshReportDetails);
      window.removeEventListener("storage", refreshReportDetails);
    };
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
  const relatedReports = getRelatedReports(allReports, report).slice(0, 3);
  const riskScore = calculateDetailRiskScore(report, relatedReports);
  const checkIdentifierHref = `/check?q=${encodeURIComponent(identifier)}`;
  const cleanCommentLength = commentDraft.trim().length;
  const missingCommentCharacters = Math.max(
    MIN_COMMENT_LENGTH - cleanCommentLength,
    0,
  );

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

  async function copyIdentifier() {
    await navigator.clipboard.writeText(identifier);
    setCopiedIdentifier(true);

    setTimeout(() => {
      setCopiedIdentifier(false);
    }, 1600);
  }

  function submitComment() {
    const commentText = commentDraft.trim();

    if (commentText.length < MIN_COMMENT_LENGTH) {
      setCommentError(
        `Write at least ${MIN_COMMENT_LENGTH} characters before posting.`,
      );
      return;
    }

    const newComment = {
      id: `${report.reportId}-${Date.now()}`,
      text: commentText,
      createdAt: "Just now",
      authorName: currentAuthor.name,
      authorEmail: currentAuthor.email,
      authorRole: currentAuthor.role,
      authorInitials: currentAuthor.initials,
    };
    const nextComments = [...comments, newComment];
    const updatedComments = {
      ...getSavedReportComments(),
      [report.reportId]: nextComments,
    };

    saveReportComments(updatedComments);
    setComments(nextComments);
    setCommentDraft("");
    setCommentError("");
  }

  function toggleWatchIdentifier() {
    if (isWatched) {
      removeFromWatchlist(identifier);
      setIsWatched(false);
      return;
    }

    addToWatchlist({
      identifier,
      type: getIdentifierLabel(report),
      riskLevel: report.riskLevel,
      reportId: report.reportId,
      title: report.title,
    });
    setIsWatched(true);
  }

  function focusCommentInput() {
    const commentInput = document.getElementById("detail-comment-input");

    commentInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    commentInput?.focus();
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
                  <span className="inline-flex items-center gap-1">
                    Submitted by {report.reporterName || "Community member"}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-slate-400">
                    Reported identifier
                  </p>
                  <p className="mt-2 break-words text-xl font-black text-[#06285c]">
                    {maskIdentifier(identifier)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Type: {getIdentifierLabel(report)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyIdentifier}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879] active:bg-slate-300"
                >
                  <Copy size={17} />
                  {copiedIdentifier ? "Copied" : "Copy"}
                </button>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailInfoPanel
                icon={<ClipboardCheck size={20} />}
                title="Incident details"
                items={[
                  ["Platform", report.platform],
                  ["Contact method", report.contactMethod],
                  ["Promised item", report.promisedItem],
                  ["Incident date", report.incidentDate],
                ]}
              />

              <DetailInfoPanel
                icon={<CreditCard size={20} />}
                title="Money details"
                items={[
                  ["Money status", report.moneyStatus],
                  ["Amount", formatMoneyAmount(report)],
                  ["Payment method", report.paymentMethod],
                  ["Transaction date", report.transactionDate],
                ]}
              />
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 p-5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                  <FileText size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-[#06285c]">
                    Evidence summary
                  </h2>
                  <p className="mt-2 leading-7 text-slate-600">
                    {formatEvidenceSummary(report)}
                  </p>

                  {report.evidenceDetails && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Reporter notes
                      </p>
                      <p className="mt-2 leading-7 text-slate-700">
                        {report.evidenceDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <EvidenceFilesPanel report={report} />

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
                  onClick={focusCommentInput}
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
                <div className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#009879] text-xs font-black text-white">
                    {currentAuthor.initials}
                  </div>
                  <input
                    id="detail-comment-input"
                    value={commentDraft}
                    onChange={(event) => {
                      setCommentDraft(event.target.value);
                      setCommentError("");
                    }}
                    placeholder={`Comment as ${currentAuthor.name}`}
                    className="w-full min-w-0 text-sm font-semibold text-[#06285c] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={cleanCommentLength < MIN_COMMENT_LENGTH}
                  className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  Post
                </button>
              </div>

              {cleanCommentLength > 0 &&
                cleanCommentLength < MIN_COMMENT_LENGTH && (
                  <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
                    Write {missingCommentCharacters} more character
                    {missingCommentCharacters === 1 ? "" : "s"} to post.
                  </p>
                )}

              {commentError && (
                <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                  {commentError}
                </p>
              )}
            </section>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <DetailRiskCard report={report} />

            <ReportStatusCard report={report} />

            <DetailRiskScoreCard
              riskScore={riskScore}
              report={report}
              relatedCount={relatedReports.length}
            />

            <button
              type="button"
              onClick={toggleWatchIdentifier}
              className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black shadow-sm transition ${
                isWatched
                  ? "border-[#009879] bg-[#f0fbf7] text-[#009879]"
                  : "border-slate-200 bg-white text-[#06285c] hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              }`}
            >
              <Eye size={18} />
              {isWatched ? "Watching Identifier" : "Add to Watchlist"}
            </button>

            <Link
              href={checkIdentifierHref}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#06285c] shadow-sm transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
            >
              <Search size={18} />
              Check This Identifier
            </Link>

            <DetailStat
              icon={<FileText size={20} />}
              label="Report ID"
              value={report.reportId}
            />
            <DetailStat
              icon={<Users size={20} />}
              label="Community reports"
              value={String(report.reportsCount || 1)}
            />
            <DetailStat
              icon={<Users size={20} />}
              label="Submitted by"
              value={report.reporterName || "Community member"}
            />
            <DetailStat
              icon={report.isAnonymous ? <Lock size={20} /> : <UserRound size={20} />}
              label="Reporter privacy"
              value={report.isAnonymous ? "Anonymous public report" : "Public reporter"}
            />
            <DetailStat
              icon={<ShieldCheck size={20} />}
              label="Status"
              value="Published warning"
            />

            <RelatedReports reports={relatedReports} />

            <SafetyActionPlan report={report} />

            <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm">
              <h2 className="font-black text-[#06285c]">
                Help the community
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Found another number, page, or website connected to this scam?
                Add a new report so others can check before they pay.
              </p>
              <Link
                href="/report-fraud"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#009879] px-4 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
              >
                Report Another Scam
                <ExternalLink size={16} />
              </Link>
            </div>
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

function CommentAvatar({ comment }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#009879] text-xs font-black text-white">
      {comment.authorInitials || "CM"}
    </div>
  );
}

function DetailInfoPanel({ icon, title, items }) {
  const visibleItems = items.map(([label, value]) => [
    label,
    formatDetailValue(value),
  ]);

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          {icon}
        </div>
        <h2 className="font-black text-[#06285c]">{title}</h2>
      </div>

      <div className="mt-4 space-y-3">
        {visibleItems.map(([label, value]) => (
          <div key={label} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
            <p className="text-xs font-black uppercase text-slate-400">
              {label}
            </p>
            <p className="mt-1 break-words text-sm font-black text-[#06285c]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRiskCard({ report }) {
  const riskStyle = getRiskStyle(report.riskLevel);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <ShieldAlert size={25} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">Risk level</p>
          <span
            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${riskStyle}`}
          >
            {report.riskLevel}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <RiskFact label="Category" value={report.fraudCategory} />
        <RiskFact label="Location" value={report.location || "Bangladesh"} />
        <RiskFact label="Identifier" value={getIdentifierLabel(report)} />
      </div>
    </div>
  );
}

function ReportStatusCard({ report }) {
  const timelineItems = createReportTimeline(report);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <CheckCircle2 size={25} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">Public status</p>
          <p className="font-black text-[#06285c]">
            {formatReportStatus(report.status)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {timelineItems.map((item) => (
          <div key={item.label} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[#009879]">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-black text-[#06285c]">{item.label}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRiskScoreCard({ riskScore, report, relatedCount }) {
  const riskTone =
    report.riskLevel === "High Risk"
      ? "text-red-500"
      : report.riskLevel === "Medium Risk"
        ? "text-orange-500"
        : "text-[#009879]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">Risk score</p>
          <p className={`mt-1 text-4xl font-black ${riskTone}`}>
            {riskScore}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <BadgeAlert size={29} />
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            report.riskLevel === "High Risk"
              ? "bg-red-500"
              : report.riskLevel === "Medium Risk"
                ? "bg-orange-500"
                : "bg-[#009879]"
          }`}
          style={{ width: `${riskScore}%` }}
        />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <RiskFact label="Risk label" value={report.riskLevel} />
        <RiskFact label="Related reports" value={String(relatedCount)} />
        <RiskFact
          label="Report volume"
          value={String(report.reportsCount || 1)}
        />
      </div>
    </div>
  );
}

function EvidenceFilesPanel({ report }) {
  const fileSummaries = report.evidenceFileSummaries || [];

  if (fileSummaries.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#0b63f6]">
          <Upload size={21} />
        </div>

        <div>
          <h2 className="font-black text-[#06285c]">Evidence files</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            File previews stay in the browser during upload. This report keeps
            the file metadata for review.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fileSummaries.map((file) => (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}`}
            className="rounded-xl bg-slate-50 p-4"
          >
            <p className="break-words text-sm font-black text-[#06285c]">
              {file.name}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {formatFileSize(file.size)} • {formatFileType(file.type)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskFact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-[#06285c]">{value}</span>
    </div>
  );
}

function RelatedReports({ reports }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-[#06285c]">Related reports</h2>
        <Link href="/reports" className="text-xs font-black text-[#009879]">
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {reports.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500">
            No closely related reports yet.
          </p>
        ) : (
          reports.map((relatedReport) => (
            <Link
              key={relatedReport.reportId}
              href={`/reports/${relatedReport.reportId}`}
              className="block rounded-xl border border-slate-100 p-3 transition hover:border-[#009879] hover:bg-[#f0fbf7]"
            >
              <p className="line-clamp-2 text-sm font-black text-[#06285c]">
                {relatedReport.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {relatedReport.fraudCategory} •{" "}
                {relatedReport.submittedAt || "Recently"}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function SafetyActionPlan({ report }) {
  const actions = createSafetyActions(report);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#06285c]">Action plan</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use these steps before sending money or sharing private information.
      </p>

      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <div key={action.title} className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-black text-[#06285c]">{action.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {action.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[#009879]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 break-words text-xl font-black text-[#06285c]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function getIdentifierLabel(report) {
  if (report.phoneOrPaymentNumber) {
    return "Phone or payment number";
  }

  if (report.facebookLink) {
    return "Facebook page";
  }

  if (report.websiteLink) {
    return "Website";
  }

  if (report.businessName) {
    return "Business";
  }

  return "Unknown";
}

function formatDetailValue(value) {
  if (!value || String(value).trim().length === 0) {
    return "Not provided";
  }

  return value;
}

function formatMoneyAmount(report) {
  if (!report.amount) {
    return "";
  }

  return `BDT ${report.amount}`;
}

function formatEvidenceSummary(report) {
  const fileCount = report.evidenceFileSummaries?.length || 0;

  if (report.evidenceType) {
    const fileText =
      fileCount > 0
        ? ` ${fileCount} evidence file${fileCount === 1 ? "" : "s"} were attached.`
        : "";

    return `${report.evidenceType} was reported.${fileText} Uploaded file previews are not stored in this local MVP after browser refresh.`;
  }

  return "No evidence type was added. Treat this report as community-submitted information and verify before taking action.";
}

function formatReportStatus(status) {
  if (status === "submitted") {
    return "Published warning";
  }

  if (status === "draft") {
    return "Draft report";
  }

  return "Community report";
}

function createReportTimeline(report) {
  const submittedTime = report.submittedAt || report.savedAt || "Recently";

  return [
    {
      label: "Report submitted",
      time: submittedTime,
      icon: <FileText size={15} />,
    },
    {
      label: "Risk estimated",
      time: report.riskLevel || "Pending",
      icon: <ShieldCheck size={15} />,
    },
    {
      label: "Visible in community feed",
      time: report.status === "submitted" ? "Now public" : "Not published yet",
      icon: <Clock3 size={15} />,
    },
  ];
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) {
    return "Unknown size";
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(type) {
  if (!type) {
    return "Unknown type";
  }

  if (type === "application/pdf") {
    return "PDF";
  }

  return type.replace("image/", "").toUpperCase();
}

function getRelatedReports(reports, currentReport) {
  return reports.filter((report) => {
    if (report.reportId === currentReport.reportId) {
      return false;
    }

    const sameCategory = report.fraudCategory === currentReport.fraudCategory;
    const sameRisk = report.riskLevel === currentReport.riskLevel;
    const sameLocation =
      report.location &&
      currentReport.location &&
      report.location === currentReport.location;

    return sameCategory || sameRisk || sameLocation;
  });
}

function calculateDetailRiskScore(report, relatedReports) {
  const riskBase =
    report.riskLevel === "High Risk"
      ? 58
      : report.riskLevel === "Medium Risk"
        ? 38
        : 20;
  const reportVolumeScore = Math.min((report.reportsCount || 1) * 2, 20);
  const relatedReportScore = Math.min(relatedReports.length * 6, 18);
  const evidenceScore =
    report.evidenceType ||
    report.evidenceDetails ||
    (report.evidenceFileSummaries || []).length > 0
      ? 4
      : 0;

  return Math.min(
    riskBase + reportVolumeScore + relatedReportScore + evidenceScore,
    100,
  );
}

function createSafetyActions(report) {
  const identifierType = getIdentifierLabel(report);

  return [
    {
      title: "Do not pay from this report alone",
      text: "Treat the report as a warning signal and verify through official channels.",
    },
    {
      title: `Verify the ${identifierType.toLowerCase()}`,
      text: "Check official pages, support numbers, business registration, reviews and trusted contacts.",
    },
    {
      title: "Keep proof before reporting more",
      text: "Save screenshots, transaction IDs and conversation evidence while hiding OTP, PIN and passwords.",
    },
  ];
}
