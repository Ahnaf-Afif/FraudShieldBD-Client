import { ChevronRight, Clock, MapPin } from "lucide-react";

const reports = [
  {
    title: "01812345678 (bKash)",
    description: "Asked for advance payment and blocked after receiving money.",
    risk: "High Risk",
    riskColor: "bg-red-100 text-red-600",
    reports: 23,
    location: "Dhaka",
    time: "2 hours ago",
  },
  {
    title: "facebook.com/fashionhubbd",
    description: "Fake page. Took money but no delivery was made.",
    risk: "Medium Risk",
    riskColor: "bg-orange-100 text-orange-600",
    reports: 17,
    location: "Chattogram",
    time: "5 hours ago",
  },
  {
    title: "01897654321 (Nagad)",
    description: "Promised loan but asked for registration fee first.",
    risk: "Low Risk",
    riskColor: "bg-green-100 text-green-600",
    reports: 11,
    location: "Sylhet",
    time: "Yesterday",
  },
];

export default function RecentReports() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
            <h2 className="min-w-0 text-xl font-black text-[#06285c] sm:text-2xl">
              Recent Published Reports
            </h2>

            <button className="hidden font-bold text-[#009879] sm:block">
              View all reports →
            </button>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <ReportRow key={report.title} report={report} />
            ))}
          </div>

          <button className="mt-5 font-bold text-[#009879]">
            Browse all reports →
          </button>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-[#06285c] sm:text-2xl">
            Why this matters
          </h2>

          <p className="mt-3 leading-7 text-slate-700">
            Fraud reports help people check suspicious numbers, pages, and
            businesses before sending money. Every approved report adds one more
            warning signal for the community.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniStat number="724" label="Published reports" />
            <MiniStat number="156" label="Mobile scams" />
            <MiniStat number="98" label="Job scams" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportRow({ report }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:items-center sm:gap-4 sm:p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-sm font-black text-[#0b63f6] sm:h-12 sm:w-12 sm:text-base">
        {report.title.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${report.riskColor}`}
          >
            {report.risk}
          </span>

          <h3 className="min-w-0 break-words text-sm font-black text-[#06285c] sm:text-base">
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
        <p className="text-2xl font-black text-red-500">{report.reports}</p>
        <p className="text-xs text-slate-500">Reports</p>
      </div>

      <ChevronRight
        size={20}
        className="mt-2 shrink-0 text-[#06285c] sm:mt-0"
      />
    </div>
  );
}

function MiniStat({ number, label }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-black text-[#06285c]">{number}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
