import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  Cloud,
  Database,
  KeyRound,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

const completedItems = [
  "Homepage community newsfeed with infinite scroll",
  "Report Fraud multi-section form with draft saving",
  "Check Before You Pay search flow",
  "Browse Reports filtering and CSV export",
  "Watchlist, notifications, profile and my reports pages",
  "Local MVP auth and browser storage controls",
];

const upcomingItems = [
  {
    title: "Real authentication",
    text: "Replace local demo auth with Better Auth, real sessions and protected API calls.",
    icon: KeyRound,
  },
  {
    title: "MongoDB Atlas persistence",
    text: "Move reports, users, watchlists, comments and notifications from localStorage to MongoDB.",
    icon: Database,
  },
  {
    title: "Evidence file storage",
    text: "Upload screenshots and files to Cloudinary, then store only URLs and metadata in the database.",
    icon: UploadCloud,
  },
  {
    title: "Production hosting",
    text: "Deploy the client and server separately with real environment variables and practical uptime planning.",
    icon: Cloud,
  },
];

const skippedForMvp = [
  "Full admin/moderator dashboard",
  "Scam library publishing system",
  "Real-time notifications",
  "Payment or subscription features",
  "Advanced abuse detection",
];

export default function MvpRoadmap() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
              Project status
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#06285c] sm:text-4xl">
              FraudShield BD MVP roadmap
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              This page keeps the project direction clear while we build. The
              current app is a frontend MVP using browser data. Backend work
              starts when the core flows are stable.
            </p>
          </div>

          <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#009879]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-[#06285c]">
                  Current phase
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  Client MVP polish
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <RoadmapPanel title="Done so far">
            <div className="space-y-3">
              {completedItems.map((item) => (
                <RoadmapListItem
                  key={item}
                  icon={<CheckCircle2 size={18} />}
                  text={item}
                  tone="done"
                />
              ))}
            </div>
          </RoadmapPanel>

          <RoadmapPanel title="Backend later">
            <div className="grid gap-3">
              {upcomingItems.map((item) => (
                <UpcomingCard key={item.title} item={item} />
              ))}
            </div>
          </RoadmapPanel>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <RoadmapPanel title="Skipped for MVP">
            <div className="grid gap-3 sm:grid-cols-2">
              {skippedForMvp.map((item) => (
                <RoadmapListItem
                  key={item}
                  icon={<CircleDashed size={18} />}
                  text={item}
                  tone="skip"
                />
              ))}
            </div>
          </RoadmapPanel>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-black text-[#06285c]">Next decision point</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Before backend starts, we will confirm the stack and collect env
              credentials for Better Auth, MongoDB Atlas and Cloudinary.
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/report-fraud"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#009879] px-4 text-sm font-black text-white transition hover:bg-[#007f66]"
              >
                Test Report Flow
              </Link>
              <Link
                href="/settings"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
              >
                Manage Demo Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-[#06285c]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function RoadmapListItem({ icon, text, tone }) {
  const toneClass =
    tone === "done"
      ? "bg-[#f0fbf7] text-[#009879]"
      : "bg-slate-50 text-slate-400";

  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClass}`}
      >
        {icon}
      </span>
      <p className="text-sm font-bold leading-6 text-[#06285c]">{text}</p>
    </div>
  );
}

function UpcomingCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#009879]">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-black text-[#06285c]">{item.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
        </div>
      </div>
    </div>
  );
}
