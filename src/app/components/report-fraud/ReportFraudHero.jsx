import Image from "next/image";
import { ShieldCheck, Users, Lock } from "lucide-react";

export default function ReportFraudHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#f3f8ff] px-6 py-10 sm:px-10 lg:px-14">
        <Image
          src="/hero-image.png"
          alt="Report fraud illustration"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1280px"
          className="object-cover object-[65%_center] opacity-35"
        />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black text-[#06285c] sm:text-6xl">
            Report a Fraud
          </h1>

          <p className="mt-5 max-w-xl leading-8 text-slate-700">
            Your report helps protect thousands of people in Bangladesh. Provide
            accurate details to help us investigate and prevent others from
            becoming victims.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#009879]" />
              100% Free
            </span>

            <span className="inline-flex items-center gap-2">
              <Lock size={18} className="text-[#009879]" />
              Confidential & Secure
            </span>

            <span className="inline-flex items-center gap-2">
              <Users size={18} className="text-[#009879]" />
              Community Driven
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
