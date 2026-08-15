"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const examples = [
  "01712345678",
  "bKash 01812345678",
  "facebook.com/fakepage",
  "scamshop.com",
];

export default function CheckSearchPanel() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const queryValue = new URLSearchParams(window.location.search).get("q");

    if (queryValue) {
      setSearchValue(queryValue);
    }
  }, []);

  function submitSearch(event) {
    event.preventDefault();

    const cleanSearchValue = searchValue.trim();

    if (!cleanSearchValue) {
      return;
    }

    router.push(`/check?q=${encodeURIComponent(cleanSearchValue)}`);
  }

  function handleExampleClick(example) {
    setSearchValue(example);
  }

  function clearSearch() {
    setSearchValue("");
  }

  return (
    <section className="bg-[#002b63] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <form
          onSubmit={submitSearch}
          className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg lg:flex-row"
        >
          <div className="flex min-h-14 flex-1 items-center gap-3 px-3">
            <Search className="shrink-0 text-slate-400" size={24} />

            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full min-w-0 border-none text-base text-[#06285c] outline-none"
              placeholder="Search phone number, payment number, Facebook page, website or business name..."
            />

            {searchValue && (
              <button
                onClick={clearSearch}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#009879] px-8 py-3 font-bold text-white transition hover:bg-[#007f66] active:bg-slate-400"
          >
            Search Now
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-white">
          <span>Try searching:</span>

          {examples.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              className="rounded-full bg-white/15 px-4 py-1 hover:bg-white/25"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
