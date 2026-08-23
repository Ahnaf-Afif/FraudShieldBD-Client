"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiClient";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";

    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((result) => setStatus(result.message))
      .catch((error) => setStatus(error.message || "Could not verify your email."));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fbff] px-4">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-[#009879]">Email verification</p>
        <h1 className="mt-3 text-3xl font-black text-[#06285c]">{status}</h1>
        <Link href="/login" className="mt-6 inline-flex rounded-xl bg-[#009879] px-5 py-3 font-black text-white">Go to login</Link>
      </section>
    </main>
  );
}
