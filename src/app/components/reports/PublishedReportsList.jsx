import {
  BriefcaseBusiness,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  MapPin,
  Search,
  ShoppingCart,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const reports = [
  {
    title: "01912-345678 (bKash)",
    category: "Mobile Financial",
    description: "Fraudulent transaction after advance payment for a mobile phone.",
    identifier: "bKash: 01***345678",
    risk: "High Risk",
    reports: 23,
    location: "Dhaka",
    time: "2 hours ago",
    icon: Smartphone,
    iconStyle: "bg-red-100 text-red-500",
    riskStyle: "bg-red-100 text-red-600",
  },
  {
    title: "facebook.com/fashionhubbd",
    category: "E-commerce",
    description: "Fake page took money but no delivery was made.",
    identifier: "Page: facebook.com/fashionhubbd",
    risk: "Medium Risk",
    reports: 17,
    location: "Chattogram",
    time: "5 hours ago",
    icon: ShoppingCart,
    iconStyle: "bg-blue-100 text-blue-600",
    riskStyle: "bg-orange-100 text-orange-600",
  },
  {
    title: "Dream Career BD",
    category: "Job Scam",
    description: "Job offer scam asking for registration fees.",
    identifier: "Phone: 017***789012",
    risk: "High Risk",
    reports: 15,
    location: "Dhaka",
    time: "Yesterday",
    icon: BriefcaseBusiness,
    iconStyle: "bg-purple-100 text-purple-600",
    riskStyle: "bg-red-100 text-red-600",
  },
  {
    title: "Crypto Profit BD",
    category: "Investment",
    description: "Investment scam promising high returns.",
    identifier: "Phone: 018***654321",
    risk: "Medium Risk",
    reports: 12,
    location: "Sylhet",
    time: "Yesterday",
    icon: TrendingUp,
    iconStyle: "bg-emerald-100 text-emerald-600",
    riskStyle: "bg-orange-100 text-orange-600",
  },
  {
    title: "LovelyMita",
    category: "Romance",
    description: "Romance scam and money request.",
    identifier: "Profile: LovelyMita_20",
    risk: "High Risk",
    reports: 11,
    location: "Rajshahi",
    time: "May 18, 2025",
    icon: Heart,
    iconStyle: "bg-pink-100 text-pink-500",
    riskStyle: "bg-red-100 text-red-600",
  },
  {
    title: "Lucky Draw Winner",
    category: "Lottery",
    description: "Lottery scam claiming you won a prize.",
    identifier: "Phone: 016***112233",
    risk: "Low Risk",
    reports: 7,
    location: "Barishal",
    time: "May 17, 2025",
    icon: Flag,
    iconStyle: "bg-yellow-100 text-yellow-600",
    riskStyle: "bg-green-100 text-green-600",
  },
];

export default function PublishedReportsList() {
  return (
    <section className="min-w-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px]">
            <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-4">
              <Search size={19} className="shrink-0 text-slate-400" />
              <input
                className="w-full min-w-0 text-sm text-[#06285c] outline-none"
                placeholder="Search reports by keyword..."
              />
            </label>

            <select className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#06285c] outline-none">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>

            <button className="min-h-12 rounded-xl bg-[#06285c] px-5 text-sm font-bold text-white">
              List View
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {reports.map((report) => (
            <ReportRow key={report.title} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportRow({ report }) {
  const Icon = report.icon;

  return (
    <article className="flex min-w-0 items-start gap-4 p-4 sm:p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${report.iconStyle}`}
      >
        <Icon size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-lg font-black text-[#06285c]">
            {report.title}
          </h2>
          <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${report.riskStyle}`}>
            {report.risk}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-[#009879]">
          {report.category}
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
          {report.description}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#06285c]">
          {report.identifier}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {report.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {report.time}
          </span>
        </div>
      </div>

      <div className="hidden border-l border-slate-200 px-5 text-center sm:block">
        <p className="text-2xl font-black text-red-500">{report.reports}</p>
        <p className="text-xs text-slate-500">Reports</p>
      </div>

      <ChevronRight className="mt-3 shrink-0 text-[#06285c]" size={20} />
    </article>
  );
}
