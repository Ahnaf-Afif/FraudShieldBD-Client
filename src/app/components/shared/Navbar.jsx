"use client";

import Image from "next/image";
import { Eye, FileText, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  clearDemoSession,
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
  getInitials,
} from "../../lib/demoSession";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Check Before You Pay", href: "/check" },
  { label: "Browse Reports", href: "/reports" },
  { label: "Report Fraud", href: "/report-fraud" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [demoUser, setDemoUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    function updateDemoUser() {
      setDemoUser(getDemoSession());
    }

    updateDemoUser();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
    window.addEventListener("storage", updateDemoUser);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
      window.removeEventListener("storage", updateDemoUser);
    };
  }, []);

  function isActive(href) {
    return pathname === href;
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    clearDemoSession();
    closeMenu();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <Image
              src="/favicon_rounded.ico"
              alt="FraudShield BD logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>

          <h1 className="text-xl font-black text-[#06285c] sm:text-2xl">
            FraudShield <span className="text-[#009879]">BD</span>
          </h1>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#06285c] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-2 transition hover:text-[#009879] ${
                isActive(link.href)
                  ? "border-b-2 border-[#06285c] text-[#06285c]"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {demoUser ? (
            <DesktopUserMenu user={demoUser} onLogout={handleLogout} />
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition ${
                  isActive("/login")
                    ? "border-[#06285c] bg-[#06285c] text-white"
                    : "border-[#0b63f6] text-[#0b63f6] hover:bg-[#eef6ff]"
                }`}
              >
                Login
              </Link>

              <Link
                href="/register"
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  isActive("/register")
                    ? "bg-[#06285c] text-white"
                    : "bg-[#009879] text-white hover:bg-[#007f66]"
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#06285c] lg:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-xl px-4 py-3 text-sm font-bold ${
                  isActive(link.href)
                    ? "bg-[#e9f8f4] text-[#009879]"
                    : "text-[#06285c]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {demoUser ? (
            <MobileUserMenu user={demoUser} onLogout={handleLogout} />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className={`rounded-xl border px-5 py-3 text-center text-sm font-bold ${
                  isActive("/login")
                    ? "border-[#06285c] bg-[#06285c] text-white"
                    : "border-[#0b63f6] text-[#0b63f6]"
                }`}
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMenu}
                className={`rounded-xl px-5 py-3 text-center text-sm font-bold ${
                  isActive("/register")
                    ? "bg-[#06285c] text-white"
                    : "bg-[#009879] text-white"
                }`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DesktopUserMenu({ user, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/my-reports"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 transition hover:border-[#009879] hover:bg-[#f0fbf7]"
      >
        <UserAvatar user={user} />
        <div>
          <p className="max-w-32 truncate text-sm font-black text-[#06285c]">
            {user.name}
          </p>
          <p className="max-w-32 truncate text-xs font-semibold text-slate-500">
            {user.role}
          </p>
        </div>
      </Link>

      <Link
        href="/watchlist"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        aria-label="Watchlist"
      >
        <Eye size={19} />
      </Link>

      <button
        type="button"
        onClick={onLogout}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#06285c] transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        aria-label="Logout"
      >
        <LogOut size={19} />
      </button>
    </div>
  );
}

function MobileUserMenu({ user, onLogout }) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#06285c]">
            {user.name}
          </p>
          <p className="truncate text-xs font-semibold text-slate-500">
            {user.email}
          </p>
        </div>
      </div>

      <Link
        href="/my-reports"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#009879] text-sm font-black text-white"
      >
        <FileText size={17} />
        My Reports
      </Link>

      <Link
        href="/watchlist"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c]"
      >
        <Eye size={17} />
        Watchlist
      </Link>

      <button
        type="button"
        onClick={onLogout}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-black text-red-500"
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );
}

function UserAvatar({ user }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009879] text-sm font-black text-white">
      {getInitials(user.name || user.email)}
    </div>
  );
}
