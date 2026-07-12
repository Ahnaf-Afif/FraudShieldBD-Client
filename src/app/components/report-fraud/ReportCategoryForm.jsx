import { CalendarDays, HelpCircle } from "lucide-react";

export default function ReportCategoryForm() {
  return (
    <section className="border-b border-slate-200 p-5 sm:p-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-[#06285c]">
            1. What happened?
          </h2>

          <p className="mt-1 text-slate-600">
            Select the best category and tell us the basic incident details.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Fraud Category" required>
            <select className="form-input">
              <option>Select fraud category</option>
              <option>Mobile Financial Scam</option>
              <option>Fake Online Shop</option>
              <option>Fake Job Offer</option>
              <option>Investment Scam</option>
              <option>Phishing Website</option>
            </select>
          </FormField>

          <FormField label="Platform / Channel" required>
            <select className="form-input">
              <option>Select platform or channel</option>
              <option>Facebook</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Website</option>
              <option>Phone Call</option>
            </select>
          </FormField>

          <FormField label="When did it happen?" required>
            <div className="relative">
              <input type="date" className="form-input pr-10" />
              <CalendarDays
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </FormField>

          <FormField label="Where did it happen?" required>
            <select className="form-input">
              <option>Select where it happened</option>
              <option>Dhaka</option>
              <option>Chattogram</option>
              <option>Sylhet</option>
              <option>Rajshahi</option>
              <option>Online only</option>
            </select>
          </FormField>
        </div>

        <div className="mt-5">
          <FormField label="Brief Title" required>
            <input
              className="form-input"
              placeholder="Example: Fake investment scheme on Facebook"
            />
          </FormField>
        </div>

        <div className="mt-6 rounded-2xl bg-[#eef6ff] p-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b63f6] text-white">
              <HelpCircle size={24} />
            </div>

            <div>
              <h3 className="font-black text-[#06285c]">
                Not sure which category to choose?
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Select the option that best matches the primary nature of the
                fraud. Moderators can adjust it later.
              </p>
            </div>
          </div>
        </div>
    </section>
  );
}

export function ReportCategoryTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-[#06285c]">
        Why structured reports matter
      </h2>

      <div className="mt-5 space-y-5">
        <InfoPoint
          title="Faster investigations"
          text="Well-structured reports help moderators review cases quickly."
        />

        <InfoPoint
          title="Stronger evidence"
          text="Detailed information increases the chance of action."
        />

        <InfoPoint
          title="Community protection"
          text="Your report helps warn and protect other people."
        />
      </div>
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

function InfoPoint({ title, text }) {
  return (
    <div>
      <h3 className="font-black text-[#009879]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
