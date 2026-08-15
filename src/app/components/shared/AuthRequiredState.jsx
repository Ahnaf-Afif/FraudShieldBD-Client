"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, UserRound } from "lucide-react";

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
  const loginHref = createAuthHref("/login", pathname);
  const registerHref = createAuthHref("/register", pathname);

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
      </div>
    </section>
  );
}

function createAuthHref(authPath, returnPath) {
  const safeReturnPath = returnPath && returnPath !== authPath ? returnPath : "/";

  return `${authPath}?next=${encodeURIComponent(safeReturnPath)}`;
}
