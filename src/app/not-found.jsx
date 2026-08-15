import Link from "next/link";
import { AlertTriangle, FilePlus2, Home, Search, ShieldAlert } from "lucide-react";
import Navbar from "./components/shared/Navbar";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <AlertTriangle size={38} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-wide text-[#009879]">
            Page not found
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#06285c] sm:text-4xl">
            This FraudShield page does not exist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            The link may be broken, moved, or only available after the backend is
            connected. You can still use the main MVP tools below.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <NotFoundAction
              href="/"
              icon={<Home size={20} />}
              title="Home Feed"
              text="Return to the community newsfeed."
            />
            <NotFoundAction
              href="/check"
              icon={<Search size={20} />}
              title="Check"
              text="Search a suspicious identifier."
            />
            <NotFoundAction
              href="/reports"
              icon={<ShieldAlert size={20} />}
              title="Reports"
              text="Browse filtered fraud reports."
            />
            <NotFoundAction
              href="/report-fraud"
              icon={<FilePlus2 size={20} />}
              title="Report"
              text="Submit a new fraud report."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function NotFoundAction({ href, icon, title, text }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#009879] hover:bg-[#f0fbf7]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#009879]">
        {icon}
      </div>
      <h2 className="mt-4 font-black text-[#06285c]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
