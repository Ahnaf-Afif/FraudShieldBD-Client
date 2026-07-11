import { Bell, FileText, ShieldCheck, Users } from "lucide-react";

const stats = [
  {
    icon: FileText,
    number: "128,547",
    label: "Reports Found",
    text: "Real reports from the community",
  },
  {
    icon: Users,
    number: "2,345,789",
    label: "Numbers Checked",
    text: "People searched before they paid",
  },
  {
    icon: Bell,
    number: "64,892",
    label: "Alerts Sent",
    text: "Warned the community in time",
  },
  {
    icon: ShieldCheck,
    number: "98.6%",
    label: "Community Trust",
    text: "Your safety, our priority",
  },
];

export default function StatsSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-8 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <Icon size={28} />
        </div>

        <div>
          <h3 className="text-3xl font-black text-[#06285c]">{stat.number}</h3>
          <p className="font-bold text-[#06285c]">{stat.label}</p>
          <p className="text-sm text-slate-500">{stat.text}</p>
        </div>
      </div>
    </div>
  );
}
