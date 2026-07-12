import Image from "next/image";
import { Clock } from "lucide-react";

const guides = [
  {
    title: "Common bKash Scam Tricks to Watch Out For",
    category: "Mobile Financial",
    readTime: "6 min read",
    image: "/guide-mobile-scam.png",
    badgeStyle: "bg-[#e9f8f4] text-[#009879]",
  },
  {
    title: "Fake E-commerce Websites",
    category: "Online Shopping",
    readTime: "5 min read",
    image: "/guide-shopping-scam.png",
    badgeStyle: "bg-[#eef6ff] text-[#0b63f6]",
  },
  {
    title: "Job Scam: Fake Recruitment Traps",
    category: "Fake Jobs",
    readTime: "6 min read",
    image: "/guide-social-scam.png",
    badgeStyle: "bg-orange-50 text-orange-600",
  },
  {
    title: "Beware of Fake Facebook Pages & Profiles",
    category: "Fake Pages",
    readTime: "4 min read",
    image: "/guide-shopping-scam.png",
    badgeStyle: "bg-purple-50 text-purple-600",
  },
  {
    title: "Investment Scams: Promised High Returns",
    category: "Investment",
    readTime: "7 min read",
    image: "/guide-mobile-scam.png",
    badgeStyle: "bg-pink-50 text-pink-600",
  },
  {
    title: "OTP & PIN Scams: Don’t Share, Stay Safe",
    category: "OTP/PIN Scams",
    readTime: "5 min read",
    image: "/guide-social-scam.png",
    badgeStyle: "bg-yellow-50 text-yellow-700",
  },
];

export default function GuideGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#06285c]">
            Latest Safety Guides
          </h2>

          <p className="mt-1 text-slate-600">
            Learn the warning signs before scammers reach you.
          </p>
        </div>

        <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#06285c] outline-none">
          <option>Most Recent</option>
          <option>Most Read</option>
          <option>Beginner Friendly</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuideCard key={guide.title} guide={guide} />
        ))}
      </div>
    </section>
  );
}

function GuideCard({ guide }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 bg-slate-100">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          className="object-cover"
        />

        <span
          className={`absolute left-3 top-3 rounded-lg px-3 py-1 text-xs font-black ${guide.badgeStyle}`}
        >
          {guide.category}
        </span>
      </div>

      <div className="p-5">
        <p className="mb-2 inline-flex items-center gap-2 text-sm text-slate-500">
          <Clock size={16} />
          {guide.readTime}
        </p>

        <h3 className="text-lg font-black leading-6 text-[#06285c]">
          {guide.title}
        </h3>

        <button className="mt-4 font-bold text-[#009879]">Read guide →</button>
      </div>
    </article>
  );
}
