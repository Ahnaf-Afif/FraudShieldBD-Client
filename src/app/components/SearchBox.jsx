import { Search } from "lucide-react";

const examples = [
  "01712345678",
  "bKash 01812345678",
  "facebook.com/fakepage",
  "scamshop.com",
];

export default function SearchBox() {
  return (
    <div className="bg-[#002b63] px-6 py-5 md:px-10">
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg lg:flex-row">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="text-slate-400" size={24} />

          <input
            className="w-full border-none text-base text-[#06285c] outline-none"
            placeholder="Search phone number, payment number, Facebook page, website or business name..."
          />
        </div>

        <button className="rounded-xl bg-[#009879] px-8 py-3 font-bold text-white">
          Search Now
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-white">
        <span className="mt-1">Try searching:</span>

        {examples.map((example) => (
          <span key={example} className="rounded-full bg-white/15 px-4 py-1">
            {example}
          </span>
        ))}
      </div>
    </div>
  );
}
