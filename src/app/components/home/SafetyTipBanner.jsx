import { Lightbulb } from "lucide-react";

export default function SafetyTipBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#009879] shadow-sm">
            <Lightbulb size={24} />
          </div>

          <div>
            <h2 className="font-black text-[#06285c]">
              Tip: Check before you pay
            </h2>

            <p className="mt-1 leading-6 text-slate-600">
              Always verify numbers, pages, websites and business names before
              sending money online.
            </p>
          </div>
        </div>

        <button className="min-h-11 rounded-xl border border-[#009879] px-5 font-bold text-[#009879]">
          Read Safety Tips
        </button>
      </div>
    </section>
  );
}
