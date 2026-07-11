import Image from "next/image";

export default function ScamLibraryHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#f3f8ff] px-6 py-10 sm:px-10 lg:px-14">
        <Image
          src="/hero-image.png"
          alt="FraudShield BD scam library illustration"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1280px"
          className="object-cover object-[65%_center] opacity-35"
        />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black text-[#06285c] sm:text-6xl">
            Scam Library
          </h1>

          <p className="mt-3 text-2xl font-black text-[#009879]">
            Learn. Stay Aware. Stay Protected.
          </p>

          <p className="mt-5 max-w-xl leading-8 text-slate-700">
            Explore real scam examples, learn how they work, and follow
            practical tips to protect yourself and your community.
          </p>
        </div>
      </div>
    </section>
  );
}
