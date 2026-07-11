import Link from "next/link";
import { Search } from "lucide-react";

export default function ReportsHeader() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="font-bold text-[#009879]">Community reports</p>

          <h1 className="mt-2 text-4xl font-black text-[#06285c] sm:text-5xl">
            Published Fraud Reports
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Browse approved reports from the community. Filter by category,
            risk level, date, and location to understand common scam patterns.
          </p>
        </div>

        <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#009879] shadow-sm">
              <Search size={23} />
            </div>

            <div>
              <h2 className="font-black text-[#06285c]">
                Checking one number or page?
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Use the focused lookup tool if you want a direct risk result
                for one identifier.
              </p>

              <Link
                href="/check"
                className="mt-3 inline-flex rounded-xl bg-[#009879] px-4 py-2 text-sm font-bold text-white"
              >
                Check Before You Pay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
