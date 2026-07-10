import { Menu, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <Image
              src="/favicon_rounded.ico"
              alt="Website hero section"
              width={1200}
              height={700}
            />
          </div>

          <h1 className="text-2xl font-bold text-[#06285c]">
            FraudShield <span className="text-[#009879]">BD</span>
          </h1>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#06285c] lg:flex">
          <a className="border-b-2 border-[#06285c] py-2" href="#">
            Home
          </a>
          <a href="#">Check Before You Pay</a>
          <a href="#">Browse Reports</a>
          <a href="#">Scam Library</a>
          <a href="#">Report Fraud</a>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="rounded-xl border border-[#0b63f6] px-5 py-2.5 text-sm font-bold text-[#0b63f6]">
            Login
          </button>

          <button className="rounded-xl bg-[#009879] px-5 py-2.5 text-sm font-bold text-white">
            Register
          </button>
        </div>

        <button className="lg:hidden">
          <Menu className="text-[#06285c]" />
        </button>
      </div>
    </header>
  );
}
