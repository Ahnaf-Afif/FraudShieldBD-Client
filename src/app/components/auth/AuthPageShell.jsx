"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { getDemoSession, saveDemoSession } from "../../lib/demoSession";

const trustPoints = [
  "Report scams and track review status",
  "Save suspicious identifiers to your watchlist",
  "Help others check before they pay",
];

export default function AuthPageShell({ mode }) {
  const isRegisterMode = mode === "register";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Community Member",
    agreeToTerms: false,
  });
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    setExistingSession(getDemoSession());
    setRedirectPath(getRedirectPathFromUrl());
  }, []);

  function updateField(fieldName, value) {
    setFormStatus("");
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isRegisterMode && !formData.name.trim()) {
      setFormStatus("missing-name");
      return;
    }

    if (!formData.email.trim()) {
      setFormStatus("missing-email");
      return;
    }

    if (formData.password.length < 8) {
      setFormStatus("short-password");
      return;
    }

    if (isRegisterMode && !formData.agreeToTerms) {
      setFormStatus("missing-terms");
      return;
    }

    saveDemoSession({
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });
    setFormStatus(isRegisterMode ? "register-ready" : "login-ready");

    setTimeout(() => {
      router.push(redirectPath);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/favicon_rounded.ico"
              alt="FraudShield BD logo"
              width={54}
              height={54}
              className="h-14 w-14 object-contain"
            />
            <span className="text-2xl font-black text-[#06285c]">
              FraudShield <span className="text-[#009879]">BD</span>
            </span>
          </Link>

          <div className="mt-16 max-w-xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
              Safer community access
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight text-[#06285c]">
              {isRegisterMode
                ? "Join the fraud reporting community"
                : "Welcome back to your safety dashboard"}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              FraudShield BD helps people report suspicious activity, check
              before paying, and share warnings that protect others.
            </p>
          </div>

          <div className="mt-8 grid max-w-xl gap-3">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
                  <ShieldCheck size={21} />
                </div>
                <p className="font-bold text-[#06285c]">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <Image
                src="/favicon_rounded.ico"
                alt="FraudShield BD logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="font-black text-[#06285c]">
                FraudShield <span className="text-[#009879]">BD</span>
              </span>
            </Link>

            <Link
              href="/"
              className="ml-auto text-sm font-black text-[#009879]"
            >
              Home
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-black text-[#06285c]">
              {isRegisterMode ? "Create account" : "Login"}
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              {isRegisterMode
                ? "Start reporting scams and helping the community stay safe."
                : "Continue checking reports, comments, drafts and watchlists."}
            </p>
          </div>

          {existingSession && (
            <div className="mt-5 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-4">
              <p className="text-sm font-black text-[#06285c]">
                Signed in as {existingSession.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                You can continue to your requested page or submit a report
                using this demo session.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={redirectPath}
                  className="inline-flex justify-center rounded-xl bg-[#009879] px-4 py-2.5 text-sm font-black text-white"
                >
                  Continue
                </Link>
                <Link
                  href="/report-fraud"
                  className="inline-flex justify-center rounded-xl border border-[#bfe8dc] bg-white px-4 py-2.5 text-sm font-black text-[#009879]"
                >
                  Report Fraud
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isRegisterMode && (
              <AuthField
                label="Full name"
                icon={<User size={19} />}
                value={formData.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Your full name"
              />
            )}

            <AuthField
              label="Email address"
              icon={<Mail size={19} />}
              type="email"
              value={formData.email}
              onChange={(value) => updateField("email", value)}
              placeholder="you@example.com"
            />

            <AuthField
              label="Password"
              icon={<LockKeyhole size={19} />}
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(value) => updateField("password", value)}
              placeholder="At least 8 characters"
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#06285c]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {isRegisterMode && (
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#06285c]">
                  Account type
                </span>
                <select
                  value={formData.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#06285c] outline-none transition focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
                >
                  <option>Community Member</option>
                  <option>Business Owner</option>
                  <option>Moderator Applicant</option>
                </select>
              </label>
            )}

            {isRegisterMode && (
              <label className="flex cursor-pointer gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(event) =>
                    updateField("agreeToTerms", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#009879]"
                />
                <span>
                  I agree to submit truthful reports and respect community
                  safety guidelines.
                </span>
              </label>
            )}

            <AuthStatusMessage status={formStatus} mode={mode} />

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#009879] px-5 font-black text-white transition hover:bg-[#007f66] active:bg-slate-400"
            >
              {isRegisterMode ? "Create Account" : "Login"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            {isRegisterMode
              ? "Already have an account?"
              : "New to FraudShield BD?"}{" "}
            <Link
              href={createModeSwitchHref(isRegisterMode, redirectPath)}
              className="font-black text-[#009879]"
            >
              {isRegisterMode ? "Login" : "Create an account"}
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}

function getRedirectPathFromUrl() {
  const nextPath = new URLSearchParams(window.location.search).get("next");

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  if (nextPath.startsWith("/login") || nextPath.startsWith("/register")) {
    return "/";
  }

  return nextPath;
}

function createModeSwitchHref(isRegisterMode, redirectPath) {
  const targetPath = isRegisterMode ? "/login" : "/register";

  return `${targetPath}?next=${encodeURIComponent(redirectPath)}`;
}

function AuthField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  rightAction,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#06285c]">
        {label}
      </span>
      <span className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 text-sm font-semibold text-[#06285c] outline-none"
        />
        {rightAction}
      </span>
    </label>
  );
}

function AuthStatusMessage({ status, mode }) {
  if (!status) {
    return null;
  }

  const messages = {
    "missing-name": "Please enter your full name.",
    "missing-email": "Please enter your email address.",
    "short-password": "Password should be at least 8 characters.",
    "missing-terms": "Please agree to the community safety guidelines.",
    "login-ready":
      "Logged in for this MVP demo. Redirecting...",
    "register-ready":
      "Account created for this MVP demo. Redirecting...",
  };
  const isSuccess = status === "login-ready" || status === "register-ready";

  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-semibold ${
        isSuccess
          ? "border-[#bfe8dc] bg-[#f0fbf7] text-[#007f66]"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {messages[status] ||
        `The ${mode === "register" ? "registration" : "login"} form needs attention.`}
    </div>
  );
}
