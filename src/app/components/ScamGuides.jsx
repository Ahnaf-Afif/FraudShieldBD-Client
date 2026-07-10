import Image from "next/image";
import { BookOpen } from "lucide-react";

const guides = [
  {
    title: "How to Identify Mobile Financial Scams",
    readTime: "7 min read",
    image: "/guide-mobile-scam.png",
  },
  {
    title: "Safe Online Shopping: Do's and Don'ts",
    readTime: "6 min read",
    image: "/guide-shopping-scam.png",
  },
  {
    title: "Top 10 Social Media Scams to Avoid",
    readTime: "8 min read",
    image: "/guide-social-scam.png",
  },
];

export default function ScamGuides() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#06285c]">
          Scam Guides & Safety Tips
        </h2>

        <button className="hidden font-bold text-[#009879] sm:block">
          View all guides →
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {guides.map((guide) => (
          <GuideCard key={guide.title} guide={guide} />
        ))}
      </div>
    </section>
  );
}

function GuideCard({ guide }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 bg-slate-100">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-black leading-6 text-[#06285c]">
          {guide.title}
        </h3>

        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#009879]">
          <BookOpen size={16} />
          {guide.readTime}
        </p>
      </div>
    </article>
  );
}
