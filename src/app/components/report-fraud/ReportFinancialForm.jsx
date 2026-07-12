import { BadgeDollarSign, Info } from "lucide-react";

export default function ReportFinancialForm() {
  return (
    <section className="border-b border-slate-200 p-5 sm:p-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-[#06285c]">
            3. Financial Info
          </h2>

          <p className="mt-1 text-slate-600">
            Tell us if money was requested, sent, or lost during the incident.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Did you lose money?" required>
            <select className="form-input">
              <option>Select an answer</option>
              <option>Yes, I lost money</option>
              <option>No, but they asked for money</option>
              <option>No money was involved</option>
              <option>I am not sure</option>
            </select>
          </FormField>

          <FormField label="Amount lost/requested">
            <div className="flex overflow-hidden rounded-xl border border-[#dbe7f3] bg-white focus-within:border-[#009879] focus-within:ring-4 focus-within:ring-[#009879]/10">
              <span className="flex min-h-12 items-center border-r border-[#dbe7f3] px-4 text-sm font-bold text-slate-500">
                BDT
              </span>

              <input
                type="number"
                min="0"
                className="min-h-12 w-full min-w-0 px-4 text-[#06285c] outline-none"
                placeholder="Example: 5000"
              />
            </div>
          </FormField>

          <FormField label="Payment method">
            <select className="form-input">
              <option>Select payment method</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Rocket</option>
              <option>Bank transfer</option>
              <option>Card payment</option>
              <option>Cash</option>
              <option>No payment made</option>
            </select>
          </FormField>

          <FormField label="Transaction date">
            <input type="date" className="form-input" />
          </FormField>

          <FormField label="Transaction ID">
            <input className="form-input" placeholder="Example: TXN123456789" />
          </FormField>

          <FormField label="Payment account name">
            <input
              className="form-input"
              placeholder="Name shown in payment app or bank"
            />
          </FormField>
        </div>

        <div className="mt-6 rounded-2xl bg-orange-50 p-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Info size={24} />
            </div>

            <div>
              <h3 className="font-black text-[#06285c]">
                Do not include private credentials
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Never share your PIN, OTP, password, full card number, or
                account login details. Only provide transaction information that
                helps verify the fraud.
              </p>
            </div>
          </div>
        </div>
    </section>
  );
}

export function ReportFinancialTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <BadgeDollarSign size={30} />
      </div>

      <h2 className="mt-5 text-xl font-black text-[#06285c]">
        Why financial details help
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Payment method, amount, and transaction timing help moderators connect
        similar reports and identify repeated scam patterns.
      </p>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#06285c]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      {children}
    </label>
  );
}
