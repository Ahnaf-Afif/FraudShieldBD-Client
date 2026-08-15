"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import Navbar from "../../components/shared/Navbar";
import {
  demoReports,
  getPrimaryIdentifier,
  getRiskStyle,
  getSubmittedReportsFromBrowser,
  maskIdentifier,
  normalizeSubmittedReport,
} from "../../lib/reportFeedData";

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedReports = getSubmittedReportsFromBrowser().map(
      normalizeSubmittedReport,
    );
    const allReports = [...savedReports, ...demoReports];
    const matchedReport = allReports.find(
      (currentReport) => currentReport.reportId === reportId,
    );

    setReport(matchedReport || null);
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
