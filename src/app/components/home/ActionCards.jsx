import { ClipboardList, Search, ShieldCheck } from "lucide-react";

const actions = [
  {
    title: "Report",
    description:
      "Seen a scam? Report it in seconds and help protect others from being victimized.",
    buttonText: "Report Now",
    icon: ClipboardList,
    bg: "bg-[#eaf8f4]",
    iconColor: "text-[#009879]",
  },
  {
    title: "Search",
    description:
      "Check any number, page, website or business before you pay or trust.",
    buttonText: "Search Now",
    icon: Search,
    bg: "bg-[#eef6ff]",
    iconColor: "text-[#0b63f6]",
  },
  {
    title: "Stay Safe",
    description:
      "Get alerts, read guides and stay informed about the latest scams.",
    buttonText: "Learn More",
    icon: ShieldCheck,
    bg: "bg-[#eaf8f4]",
    iconColor: "text-[#009879]",
  },
];

export default function ActionCards() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-8 sm:px-6 md:grid-cols-3">
      {actions.map((action) => (
        <ActionCard key={action.title} action={action} />
      ))}
    </section>
  );
}

function ActionCard({ action }) {
  const Icon = action.icon;

  return (
    <div
      className={`rounded-2xl border border-slate-200 ${action.bg} p-6 shadow-sm`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={34} className={action.iconColor} />
        </div>

        <div>
          <h3 className="text-2xl font-black text-[#06285c]">{action.title}</h3>

          <p className="mt-2 leading-7 text-slate-700">{action.description}</p>

          <button className="mt-4 font-bold text-[#009879]">
            {action.buttonText} →
          </button>
        </div>
      </div>
    </div>
  );
}
