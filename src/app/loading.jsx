import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#06285c]">
            Loading FraudShield BD
          </h1>
          <p className="mt-2 leading-7 text-slate-600">
            Preparing the safety tools for this page.
          </p>

          <div className="mt-6 grid gap-3">
            <LoadingBar width="w-full" />
            <LoadingBar width="w-5/6" />
            <LoadingBar width="w-2/3" />
          </div>
        </div>
      </section>
    </main>
  );
}

function LoadingBar({ width }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full bg-[#009879]/40 ${width}`} />
    </div>
  );
}
