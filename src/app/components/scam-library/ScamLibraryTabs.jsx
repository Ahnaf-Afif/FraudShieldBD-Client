import {
  BriefcaseBusiness,
  Grid2X2,
  LockKeyhole,
  ShoppingCart,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const tabs = [
  { label: "All Guides", icon: Grid2X2, active: true },
  { label: "Mobile Financial", icon: Smartphone },
  { label: "Online Shopping", icon: ShoppingCart },
  { label: "Fake Jobs", icon: BriefcaseBusiness },
  { label: "Investment", icon: TrendingUp },
  { label: "OTP/PIN Scams", icon: LockKeyhole },
];

export default function ScamLibraryTabs() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
      <div className="flex gap-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {tabs.map((tab) => (
          <TabButton key={tab.label} tab={tab} />
        ))}
      </div>
    </section>
  );
}

function TabButton({ tab }) {
  const Icon = tab.icon;

  return (
    <button
      className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
        tab.active
          ? "bg-[#06285c] text-white"
          : "border border-slate-200 bg-white text-[#06285c]"
      }`}
    >
      <Icon size={18} />
      {tab.label}
    </button>
  );
}
