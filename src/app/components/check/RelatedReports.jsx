import { ChevronRight, Clock, MapPin } from "lucide-react";

const relatedReports = [
  {
    initials: "HS",
    risk: "High Risk",
    riskStyle: "bg-red-100 text-red-600",
    title: "01812345678 (bKash)",
    description: "Asked for advance payment and blocked after receiving money.",
    time: "2 hours ago",
    location: "Dhaka",
    count: 23,
  },
  {
    initials: "M",
    risk: "Medium Risk",
    riskStyle: "bg-orange-100 text-orange-600",
    title: "facebook.com/fashionhubbd",
    description: "Fake page. Took money but no delivery was made.",
    time: "5 hours ago",
    location: "Chattogram",
    count: 17,
  },
  {
    initials: "LR",
    risk: "Low Risk",
    riskStyle: "bg-green-100 text-green-600",
    title: "01897654321 (Nagad)",
    description: "Promised loan but asked for registration fee first.",
    time: "Yesterday",
    location: "Sylhet",
    count: 11,
  },
];

export default function RelatedReports() {
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
            <ReportItem key={report.title} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportItem({ report }) {
  return (
    <article className="flex min-w-0 items-start gap-4 py-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 font-black text-red-600">
        {report.initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${report.riskStyle}`}
          >
            {report.risk}
          </span>

          <h3 className="min-w-0 break-words font-black text-[#06285c]">
            {report.title}
          </h3>
        </div>

        <p className="mt-1 break-words text-sm text-slate-600">
          {report.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {report.time}
          </span>

          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {report.location}
          </span>
        </div>
      </div>

      <div className="hidden border-l border-slate-200 pl-5 text-center sm:block">
        <p className="text-2xl font-black text-red-500">{report.count}</p>
        <p className="text-xs text-slate-500">Reports</p>
      </div>

      <ChevronRight size={20} className="mt-3 shrink-0 text-[#06285c]" />
    </article>
  );
}
