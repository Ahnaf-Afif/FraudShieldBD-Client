import { CalendarDays, Filter, ShieldAlert, Tags } from "lucide-react";

const categories = [
  ["All Categories", 724],
  ["Mobile Financial", 156],
  ["E-commerce", 132],
  ["Job Scam", 98],
  ["Investment", 86],
  ["Romance", 74],
  ["Fake Page", 61],
];

const riskLevels = [
  ["High Risk", 245],
  ["Medium Risk", 312],
  ["Low Risk", 167],
];

export default function ReportsSidebarFilters() {
  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-black text-[#06285c]">Filters</h2>
          <button className="text-sm font-bold text-[#0b63f6]">Clear All</button>
        </div>

        <FilterGroup icon={Tags} title="Category" items={categories} />
        <FilterGroup icon={ShieldAlert} title="Risk Level" items={riskLevels} />

        <div className="border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center gap-2 font-black text-[#06285c]">
            <CalendarDays size={18} />
            Date Range
          </div>

          {["All Time", "Last 7 Days", "Last 30 Days", "Last 90 Days"].map(
            (item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 py-2 text-sm font-medium text-slate-600"
              >
                <input
                  type="radio"
                  name="date-range"
                  defaultChecked={item === "All Time"}
                  className="h-4 w-4 accent-[#009879]"
                />
                {item}
              </label>
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 text-center">
        <h2 className="font-black text-[#06285c]">Have you been scammed?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Report it to help others make safer decisions.
        </p>
        <button className="mt-4 min-h-11 w-full rounded-xl bg-[#009879] font-bold text-white">
          Report Fraud
        </button>
      </div>
    </aside>
  );
}

function FilterGroup({ icon: Icon, title, items }) {
  return (
    <div className="border-t border-slate-200 py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center gap-2 font-black text-[#06285c]">
        <Icon size={18} />
        {title}
      </div>

      <div className="space-y-2">
        {items.map(([label, count], index) => (
          <label
            key={label}
            className="flex cursor-pointer items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-3 font-medium text-slate-600">
              <input
                type="checkbox"
                defaultChecked={index === 0}
                className="h-4 w-4 rounded accent-[#009879]"
              />
              {label}
            </span>
            <span className="text-slate-400">{count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
