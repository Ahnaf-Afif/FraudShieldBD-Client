"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, UserRound } from "lucide-react";

const iconMap = {
  alert: AlertTriangle,
  user: UserRound,
};

export default function AuthRequiredState({
  title,
  description,
  icon = "alert",
}) {
  const Icon = iconMap[icon] || AlertTriangle;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = createReturnPath(pathname, searchParams);
  const loginHref = createAuthHref("/login", returnPath);
  const registerHref = createAuthHref("/register", returnPath);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <Icon size={30} />
        </div>

        <h1 className="mt-4 text-2xl font-black text-[#06285c]">{title}</h1>

        <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
          {description}
        </p>

        <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-500">
          After login, you will return to this page automatically.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={loginHref}
            className="rounded-xl border border-[#0b63f6] px-5 py-3 text-sm font-black text-[#0b63f6] transition hover:bg-[#eef6ff]"
          >
            Login
          </Link>
          <Link
            href={registerHref}
            className="rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66]"
          >
            Register
          </Link>
        </div>

        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#009879]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </section>
  );
}

function createReturnPath(pathname, searchParams) {
  const queryString = searchParams?.toString();

  if (!queryString) {
    return pathname || "/";
  }

  return `${pathname}?${queryString}`;
}

function createAuthHref(authPath, returnPath) {
  const safeReturnPath =
    returnPath &&
    !returnPath.startsWith(authPath) &&
    !returnPath.startsWith("/login") &&
    !returnPath.startsWith("/register")
      ? returnPath
      : "/";

  return `${authPath}?next=${encodeURIComponent(safeReturnPath)}`;
}
