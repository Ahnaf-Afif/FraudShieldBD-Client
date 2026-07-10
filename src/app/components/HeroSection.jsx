import Image from "next/image";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";
import SearchBox from "./SearchBox";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="overflow-hidden rounded-2xl bg-[#f3f8ff] sm:rounded-3xl">
        <div className="relative min-h-[560px] overflow-hidden px-5 py-10 sm:min-h-[520px] sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-16 lg:py-16">
          <Image
            src="/hero-image.png"
            alt="FraudShield BD protection illustration"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover object-[62%_center] sm:object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/82 to-white/30 sm:bg-gradient-to-r sm:from-[#f3f8ff] sm:via-[#f3f8ff]/88 sm:to-[#f3f8ff]/20" />

          <div className="relative z-10 flex min-h-[480px] max-w-xl flex-col justify-start pt-4 sm:min-h-[420px] sm:justify-center sm:pt-0">
            <h2 className="max-w-xl text-4xl font-black leading-[1.05] text-[#06285c] sm:text-5xl md:text-6xl">
              Check Before
              <span className="block text-[#009879]">You Pay</span>
            </h2>

            <p className="mt-4 max-w-lg text-base leading-7 text-slate-700 sm:mt-5 sm:text-lg sm:leading-8">
              Report fraud, search suspicious numbers, pages, websites or
              businesses, and help build a safer Bangladesh for everyone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 py-3 text-sm font-bold text-white sm:px-6 sm:text-base">
                <Search size={20} />
                Search Now
              </button>

              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#06285c] px-5 py-3 text-sm font-bold text-white sm:px-6 sm:text-base">
                <ShieldCheck size={20} />
                Report a Fraud
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-slate-600 sm:mt-6">
              <HeroPoint text="100% Free" />
              <HeroPoint text="Community Driven" />
              <HeroPoint text="Safer Together" />
            </div>
          </div>
        </div>

        <SearchBox />
      </div>
    </section>
  );
}

function HeroPoint({ text }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2 size={16} className="text-[#009879]" />
      {text}
    </span>
  );
}
