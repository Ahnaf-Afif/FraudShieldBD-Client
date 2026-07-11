import { AlertTriangle, FileText, ShieldCheck, Users } from "lucide-react";

const stats = [
  {
    label: "Published Reports",
    value: "724",
    icon: FileText,
    color: "text-[#009879]",
    bg: "bg-[#e9f8f4]",
  },
  {
    label: "High Risk",
    value: "245",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    label: "Verified Reports",
    value: "418",
    icon: ShieldCheck,
    color: "text-[#0b63f6]",
    bg: "bg-[#eef6ff]",
  },
  {
    label: "Unique Reporters",
    value: "389",
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

export default function ReportsStats() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.bg}`}
        >
          <Icon size={24} className={stat.color} />
        </div>

        <div>
          <p className="text-2xl font-black text-[#06285c]">{stat.value}</p>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
        </div>
      </div>
    </div>
  );
}
