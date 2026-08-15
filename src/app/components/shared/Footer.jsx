"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const quickLinks = [
  { label: "Check Before You Pay", href: "/check" },
  { label: "Browse Reports", href: "/reports" },
  { label: "Report Fraud", href: "/report-fraud" },
  { label: "My Reports", href: "/my-reports" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Notifications", href: "/notifications" },
];

const supportLinks = [
  { label: "Community Feed", href: "/#community-feed" },
  { label: "Safety Actions", href: "/check" },
  { label: "Report Guidelines", href: "/report-fraud" },
  { label: "Browse Warnings", href: "/reports" },
  { label: "Create Account", href: "/register" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FaFacebookF size={16} />,
  },
  {
    label: "WhatsApp",
    href: "https://whatsapp.com",
    icon: <FaWhatsapp size={17} />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <FaYoutube size={18} />,
  },
  {
    label: "X",
    href: "https://x.com",
    icon: <FaXTwitter size={16} />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: <FaInstagram size={17} />,
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setSubscribeStatus("error");
      return;
    }

    setSubscribeStatus("success");
    setEmail("");
  }

  return (
    <footer className="bg-[#002b63] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/favicon_rounded.ico"
              alt="FraudShield BD logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />

            <h2 className="text-xl font-black">
              FraudShield <span className="text-[#16c79a]">BD</span>
            </h2>
          </Link>

          <p className="mt-4 max-w-xs leading-7 text-white/75">
            A community-driven platform to report fraud, check before you pay,
            and build a safer Bangladesh together.
          </p>

          <div className="mt-5 flex gap-3">
            {socialLinks.map((socialLink) => (
              <SocialIcon key={socialLink.label} link={socialLink} />
            ))}
          </div>
        </div>

        <FooterLinks title="Quick Links" links={quickLinks} />

        <FooterLinks title="Support" links={supportLinks} />

        <div>
          <h3 className="font-black">Stay Updated</h3>

          <p className="mt-4 leading-7 text-white/75">
            Subscribe for scam alerts and safety tips.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
          >
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubscribeStatus("");
              }}
              className="min-h-12 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm text-[#06285c] outline-none"
              placeholder="Enter your email"
            />

            <button className="min-h-12 rounded-xl bg-[#009879] px-5 font-bold text-white transition hover:bg-[#007f66]">
              Subscribe
            </button>
          </form>

          <p
            className={`mt-3 text-sm ${
              subscribeStatus === "error" ? "text-red-200" : "text-white/65"
            }`}
          >
            {subscribeStatus === "success"
              ? "Subscribed locally for the MVP demo."
              : subscribeStatus === "error"
                ? "Please enter a valid email address."
                : "We respect your privacy. No spam, ever."}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2025 FraudShield BD. All rights reserved.</p>
          <p>Made for a safer Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>

      <ul className="mt-4 space-y-2 text-white/75">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ link }) {
  return (
    <a
      href={link.href}
      aria-label={link.label}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
    >
      {link.icon}
    </a>
  );
}
