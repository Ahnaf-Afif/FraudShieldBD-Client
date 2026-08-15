"use client";

import Image from "next/image";
import {
  Bell,
  ChevronDown,
  Eye,
  FileText,
  ListChecks,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldPlus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  clearDemoSession,
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
  getInitials,
} from "../../lib/demoSession";
import {
  getUnreadNotificationCount,
  NOTIFICATION_UPDATED_EVENT,
} from "../../lib/notificationData";
import { LOCAL_DATA_UPDATED_EVENT } from "../../lib/localDataEvents";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Check Before You Pay", href: "/check" },
  { label: "Browse Reports", href: "/reports" },
  { label: "Report Fraud", href: "/report-fraud" },
];
const accountLinks = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "My Reports", href: "/my-reports", icon: FileText },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "MVP Roadmap", href: "/roadmap", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [demoUser, setDemoUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    function updateDemoUser() {
      const currentUser = getDemoSession();

      setDemoUser(currentUser);
      setUnreadCount(getUnreadNotificationCount(currentUser));
    }

    updateDemoUser();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, updateDemoUser);
    window.addEventListener(NOTIFICATION_UPDATED_EVENT, updateDemoUser);
    window.addEventListener("storage", updateDemoUser);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, updateDemoUser);
      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, updateDemoUser);
      window.removeEventListener("storage", updateDemoUser);
    };
  }, []);

  function isActive(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const loginHref = createAuthHref("/login", pathname);
  const registerHref = createAuthHref("/register", pathname);

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
            <DesktopUserMenu
              user={demoUser}
              unreadCount={unreadCount}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <Link
                href={loginHref}
                className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition ${
                  isActive("/login")
                    ? "border-[#06285c] bg-[#06285c] text-white"
                    : "border-[#0b63f6] text-[#0b63f6] hover:bg-[#eef6ff]"
                }`}
              >
                Login
              </Link>

              <Link
                href={registerHref}
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

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MobileQuickAction
              href="/check"
              icon={<Search size={17} />}
              label="Check"
              onClick={closeMenu}
            />
            <MobileQuickAction
              href="/report-fraud"
              icon={<ShieldPlus size={17} />}
              label="Report"
              onClick={closeMenu}
            />
          </div>

          {demoUser ? (
            <MobileUserMenu
              user={demoUser}
              unreadCount={unreadCount}
              onLogout={handleLogout}
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href={loginHref}
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
                href={registerHref}
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

function DesktopUserMenu({ user, unreadCount, onLogout }) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function handleDocumentClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isAccountMenuOpen]);

  function closeAccountMenu() {
    setIsAccountMenuOpen(false);
  }

  function handleLogoutClick() {
    closeAccountMenu();
    onLogout();
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-3">
      <Link
        href="/notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879]"
        aria-label="Notifications"
      >
        <Bell size={19} />
        <NotificationBadge unreadCount={unreadCount} />
      </Link>

      <button
        type="button"
        onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-left transition hover:border-[#009879] hover:bg-[#f0fbf7]"
        aria-expanded={isAccountMenuOpen}
        aria-haspopup="menu"
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
        <ChevronDown
          size={17}
          className={`text-slate-400 transition ${
            isAccountMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isAccountMenuOpen && (
        <div
          className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          role="menu"
        >
          <div className="border-b border-slate-100 p-4">
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
          </div>

          <div className="p-2">
            {accountLinks.map((link) => (
              <AccountMenuLink
                key={link.href}
                link={link}
                unreadCount={unreadCount}
                onClick={closeAccountMenu}
              />
            ))}

            <button
              type="button"
              onClick={handleLogoutClick}
              className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-black text-red-500 transition hover:bg-red-50"
              role="menuitem"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileQuickAction({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f0fbf7] text-sm font-black text-[#009879]"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileUserMenu({ user, unreadCount, onLogout }) {
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
        href="/profile"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c]"
      >
        <UserRound size={17} />
        Profile
      </Link>

      <Link
        href="/my-reports"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#009879] text-sm font-black text-white"
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

      <Link
        href="/notifications"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c]"
      >
        <Bell size={17} />
        Notifications
        <InlineNotificationBadge unreadCount={unreadCount} />
      </Link>

      <Link
        href="/settings"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c]"
      >
        <Settings size={17} />
        Settings
      </Link>

      <Link
        href="/roadmap"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#06285c]"
      >
        <ListChecks size={17} />
        MVP Roadmap
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

function AccountMenuLink({ link, unreadCount, onClick }) {
  const Icon = link.icon;
  const isNotificationsLink = link.href === "/notifications";

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm font-black text-[#06285c] transition hover:bg-[#f0fbf7] hover:text-[#009879]"
      role="menuitem"
    >
      <span className="inline-flex items-center gap-3">
        <Icon size={17} />
        {link.label}
      </span>
      {isNotificationsLink && (
        <InlineNotificationBadge unreadCount={unreadCount} />
      )}
    </Link>
  );
}

function UserAvatar({ user }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009879] text-sm font-black text-white">
      {getInitials(user.name || user.email)}
    </div>
  );
}

function NotificationBadge({ unreadCount }) {
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

function InlineNotificationBadge({ unreadCount }) {
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

function createAuthHref(authPath, returnPath) {
  const safeReturnPath =
    returnPath && returnPath !== authPath && returnPath !== "/login" && returnPath !== "/register"
      ? returnPath
      : "/";

  return `${authPath}?next=${encodeURIComponent(safeReturnPath)}`;
}
