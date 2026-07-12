import Image from "next/image";
import { BookOpen, Clock, Users } from "lucide-react";

export default function FeaturedGuide() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[1fr_320px]">
      <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fbff] shadow-sm md:grid-cols-[360px_1fr]">
        <div className="relative min-h-64">
          <Image
            src="/guide-mobile-scam.png"
            alt="Mobile financial scam guide"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-6">
          <span className="w-fit rounded-full bg-[#e9f8f4] px-3 py-1 text-xs font-black text-[#009879]">
            FEATURED GUIDE
          </span>

          <h2 className="mt-4 text-3xl font-black leading-tight text-[#06285c]">
            How to Identify Mobile Financial Scams
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Mobile financial scams are rising fast. Learn the common tricks
            fraudsters use and how you can protect your money and personal
            information.
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Clock size={16} />7 min read
            </span>

            <span className="inline-flex items-center gap-2">
              <BookOpen size={16} />
              Mobile Financial
            </span>
          </div>

          <button className="mt-6 w-fit rounded-xl bg-[#009879] px-6 py-3 font-bold text-white">
            Read Full Guide →
          </button>
        </div>
      </article>

      <aside className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-6 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#009879] text-white">
          <Users size={28} />
        </div>

        <h2 className="mt-5 text-2xl font-black text-[#06285c]">
          Help Others Stay Safe
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          Seen a new scam pattern that’s not listed here? Report it to help
          protect others in the community.
        </p>

        <button className="mt-6 w-full rounded-xl bg-[#009879] px-5 py-3 font-bold text-white">
          Report a Scam
        </button>

        <button className="mt-3 font-bold text-[#009879]">
          How reporting helps →
        </button>
      </aside>
    </section>
  );
}
