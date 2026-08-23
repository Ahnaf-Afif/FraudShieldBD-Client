"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { apiRequest } from "../lib/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const result = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus(result.message);
    } catch (error) {
      setStatus(error.message || "Could not request a password reset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-wide text-[#009879]">Account recovery</p>
        <h1 className="mt-3 text-3xl font-black text-[#06285c]">Forgot your password?</h1>
        <p className="mt-3 leading-7 text-slate-600">Enter your email and we will send a secure reset link if an account exists.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#06285c]">Email address</span>
            <span className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#009879]">
              <Mail size={19} className="text-slate-400" />
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full outline-none" placeholder="you@example.com" />
            </span>
          </label>

          {status && <p className="rounded-2xl bg-[#f0fbf7] p-4 text-sm font-semibold text-[#007f66]">{status}</p>}

          <button disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#009879] font-black text-white transition hover:bg-[#007f66] disabled:cursor-wait disabled:bg-slate-400">
            {isSubmitting ? "Sending..." : "Send reset link"}
            <ArrowRight size={18} />
          </button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm font-black text-[#009879]">Back to login</Link>
      </section>
    </main>
  );
}
