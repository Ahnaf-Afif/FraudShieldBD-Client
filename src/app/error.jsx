"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw, Search, ShieldAlert } from "lucide-react";
import Navbar from "./components/shared/Navbar";

export default function AppError({ error, reset }) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={38} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-wide text-red-500">
            Something went wrong
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#06285c] sm:text-4xl">
            FraudShield could not load this view
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            This can happen if local MVP data becomes inconsistent or a page
            action fails. Try again, or return to a core safety tool.
          </p>

          {error?.message && (
            <p className="mx-auto mt-5 max-w-2xl break-words rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-500">
              {error.message}
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 text-sm font-black text-white transition hover:bg-[#007f66]"
            >
              <RefreshCcw size={18} />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
            >
              <Home size={18} />
              Home Feed
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <RecoveryLink
              href="/check"
              icon={<Search size={19} />}
              title="Check an identifier"
              text="Search a number, page, website or business."
            />
            <RecoveryLink
              href="/reports"
              icon={<ShieldAlert size={19} />}
              title="Browse reports"
              text="Open the report explorer and filters."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function RecoveryLink({ href, icon, title, text }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#009879] hover:bg-[#f0fbf7]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#009879]">
        {icon}
      </div>
      <h2 className="mt-3 font-black text-[#06285c]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
