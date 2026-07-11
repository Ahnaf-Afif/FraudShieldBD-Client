import { ShieldCheck } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#002b63] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#16c79a]">
              <ShieldCheck size={30} />
            </div>

            <h2 className="text-xl font-black">
              FraudShield <span className="text-[#16c79a]">BD</span>
            </h2>
          </div>

          <p className="mt-4 max-w-xs leading-7 text-white/75">
            A community-driven platform to report fraud, check before you pay,
            and build a safer Bangladesh together.
          </p>

          <div className="mt-5 flex gap-3">
            <SocialIcon icon={<FaFacebookF size={16} />} />
            <SocialIcon icon={<FaWhatsapp size={17} />} />
            <SocialIcon icon={<FaYoutube size={18} />} />
            <SocialIcon icon={<FaXTwitter size={16} />} />
            <SocialIcon icon={<FaInstagram size={17} />} />
          </div>
        </div>

        <FooterLinks
          title="Quick Links"
          links={[
            "Check Before You Pay",
            "Browse Reports",
            "Report Fraud",
            "Scam Library",
            "Safety Tips",
          ]}
        />

        <FooterLinks
          title="Support"
          links={[
            "How It Works",
            "Guidelines",
            "Privacy Policy",
            "Terms of Service",
            "Contact Us",
          ]}
        />

        <div>
          <h3 className="font-black">Stay Updated</h3>

          <p className="mt-4 leading-7 text-white/75">
            Subscribe for scam alerts and safety tips.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <input
              className="min-h-12 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm text-[#06285c] outline-none"
              placeholder="Enter your email"
            />

            <button className="min-h-12 rounded-xl bg-[#009879] px-5 font-bold text-white">
              Subscribe
            </button>
          </div>

          <p className="mt-3 text-sm text-white/65">
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2025 FraudShield BD. All rights reserved.</p>
          <p>Made with ❤️ for a safer Bangladesh</p>
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
          <li key={link}>
            <a href="#" className="hover:text-white">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon }) {
  return (
    <a
      href="#"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
    >
      {icon}
    </a>
  );
}
