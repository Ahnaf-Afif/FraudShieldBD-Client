"use client";

import { AlertCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearRecentSearches,
  getRecentSearchesFromBrowser,
  RECENT_SEARCHES_UPDATED_EVENT,
  saveRecentSearch,
} from "../../lib/recentSearches";

const examples = [
  "01712345678",
  "bKash 01812345678",
  "facebook.com/fakepage",
  "scamshop.com",
];

export default function CheckSearchPanel() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const queryValue = new URLSearchParams(window.location.search).get("q");

    if (queryValue) {
      // Hydrate the search field from the browser URL after SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchValue(queryValue);
    }
  }, []);

  useEffect(() => {
    function updateRecentSearches() {
      setRecentSearches(getRecentSearchesFromBrowser());
    }

    updateRecentSearches();
    window.addEventListener(RECENT_SEARCHES_UPDATED_EVENT, updateRecentSearches);
    window.addEventListener("storage", updateRecentSearches);

    return () => {
      window.removeEventListener(
        RECENT_SEARCHES_UPDATED_EVENT,
        updateRecentSearches,
      );
      window.removeEventListener("storage", updateRecentSearches);
    };
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    runSearch(searchValue);
  }

  function runSearch(value) {
    const cleanSearchValue = value.trim();

    if (!cleanSearchValue) {
      setSearchError("Type a phone number, page, website or business name first.");
      return;
    }

    if (cleanSearchValue.length < 3) {
      setSearchError("Search must be at least 3 characters.");
      return;
    }

    setSearchError("");
    saveRecentSearch(cleanSearchValue);
    router.push(`/check?q=${encodeURIComponent(cleanSearchValue)}`);

    setTimeout(() => {
      window.dispatchEvent(new Event("fraudshield-search-updated"));
    }, 0);
  }

  function handleExampleClick(example) {
    setSearchValue(example);
    setSearchError("");
    runSearch(example);
  }

  function clearSearch() {
    setSearchValue("");
    setSearchError("");
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
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchError("");
              }}
              className="w-full min-w-0 border-none text-base text-[#06285c] outline-none"
              placeholder="Search phone number, payment number, Facebook page, website or business name..."
            />

            {searchValue && (
              <button
                type="button"
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

        {searchError && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-red-600">
            <AlertCircle size={17} />
            {searchError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-white">
          <span>Try searching:</span>

          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="rounded-full bg-white/15 px-4 py-1 hover:bg-white/25"
            >
              {example}
            </button>
          ))}
        </div>

        {recentSearches.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black">Recent searches</h2>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs font-black text-white/75 transition hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((recentSearch) => (
                <button
                  key={recentSearch}
                  type="button"
                  onClick={() => handleExampleClick(recentSearch)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#06285c] transition hover:bg-[#f0fbf7] hover:text-[#009879]"
                >
                  {recentSearch}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
