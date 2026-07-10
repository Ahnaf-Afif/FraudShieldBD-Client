import {
  BriefcaseBusiness,
  CreditCard,
  Flag,
  Heart,
  MoreHorizontal,
  ShoppingCart,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const categories = [
  {
    name: "Mobile Financial",
    icon: Smartphone,
    color: "text-[#009879]",
    bg: "bg-[#e9f8f4]",
  },
  {
    name: "E-commerce",
    icon: ShoppingCart,
    color: "text-[#0b63f6]",
    bg: "bg-[#eef6ff]",
  },
  {
    name: "Job Scam",
    icon: BriefcaseBusiness,
    color: "text-[#ff6b1a]",
    bg: "bg-[#fff3e7]",
  },
  {
    name: "Investment",
    icon: TrendingUp,
    color: "text-[#8b5cf6]",
    bg: "bg-[#f3edff]",
  },
  {
    name: "Romance",
    icon: Heart,
    color: "text-[#ff3b7f]",
    bg: "bg-[#fff0f5]",
  },
  {
    name: "Fake Page",
    icon: Flag,
    color: "text-[#3b82f6]",
    bg: "bg-[#eef6ff]",
  },
  {
    name: "Lottery",
    icon: CreditCard,
    color: "text-[#f5a400]",
    bg: "bg-[#fff7df]",
  },
  {
    name: "Others",
    icon: MoreHorizontal,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
];

export default function ScamCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#06285c]">
          Popular Scam Categories
        </h2>

        <button className="hidden font-bold text-[#009879] sm:block">
          View all categories →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ category }) {
  const Icon = category.icon;

  return (
    <button className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${category.bg}`}
      >
        <Icon size={30} className={category.color} />
      </div>

      <h3 className="font-black text-[#06285c]">{category.name}</h3>
    </button>
  );
}
