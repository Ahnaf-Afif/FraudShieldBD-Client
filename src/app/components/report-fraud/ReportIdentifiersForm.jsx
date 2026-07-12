import { Building2, Globe, Phone } from "lucide-react";
import { FaFacebookF } from "react-icons/fa6";

export default function ReportIdentifiersForm() {
  return (
    <section className="border-b border-slate-200 p-5 sm:p-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-[#06285c]">4. Identifiers</h2>

          <p className="mt-1 text-slate-600">
            Add numbers, pages, websites or business names connected to the
            incident.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <IdentifierField
            label="Phone or payment number"
            placeholder="Example: 01712345678"
            icon={Phone}
          />

          <IdentifierField
            label="Facebook page/profile link"
            placeholder="Example: facebook.com/fakepage"
            icon={FaFacebookF}
          />

          <IdentifierField
            label="Website link"
            placeholder="Example: scamshop.com"
            icon={Globe}
          />

          <IdentifierField
            label="Business or shop name"
            placeholder="Example: Dream Electronics BD"
            icon={Building2}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5">
          <h3 className="font-black text-[#06285c]">Why identifiers matter</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Identifiers help us connect multiple reports about the same scammer,
            page, website or business. This is how the search feature can warn
            people before they pay.
          </p>
        </div>
    </section>
  );
}

export function ReportIdentifiersTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-[#06285c]">
        Good identifier examples
      </h2>

      <div className="mt-5 space-y-4">
        <Example label="Phone" value="017******78" />
        <Example label="Payment" value="bKash / Nagad number" />
        <Example label="Facebook" value="facebook.com/page-name" />
        <Example label="Website" value="example-shop.com" />
        <Example label="Business" value="Shop or company name" />
      </div>
    </div>
  );
}

function IdentifierField({ label, placeholder, icon: Icon }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#06285c]">
        {label}
      </span>

      <div className="flex overflow-hidden rounded-xl border border-[#dbe7f3] bg-white focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
        <span className="flex min-h-12 items-center border-r border-[#dbe7f3] px-4 text-slate-400">
          <Icon size={18} />
        </span>

        <input
          className="min-h-12 w-full min-w-0 px-4 text-[#06285c] outline-none"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

function Example({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black text-[#06285c]">{value}</p>
    </div>
  );
}
