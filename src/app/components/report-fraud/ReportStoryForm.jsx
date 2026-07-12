export default function ReportStoryForm({ reportData, updateReportData }) {
  return (
    <section className="border-b border-slate-200 p-5 sm:p-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black text-[#06285c]">
          2. Tell us what happened
        </h2>

        <p className="mt-1 text-slate-600">
          Provide a detailed description to help us understand the fraud.
        </p>
      </div>

      <div className="mt-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#06285c]">
            Your story <span className="text-red-500">*</span>
          </span>

          <textarea
            value={reportData.story}
            onChange={(event) => updateReportData("story", event.target.value)}
            maxLength={2000}
            className="min-h-40 w-full resize-y rounded-xl border border-[#dbe7f3] bg-white p-4 leading-7 text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
            placeholder="Describe what happened in your own words. Include how you were contacted, what was promised, what you did, and what happened next..."
          />

          <span className="mt-2 block text-right text-sm text-slate-500">
            {reportData.story.length} / 2000
          </span>
        </label>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <FormField label="How did the fraud start?">
          <select
            value={reportData.contactMethod}
            onChange={(event) =>
              updateReportData("contactMethod", event.target.value)
            }
            className="form-input"
          >
            <option value="">Select how the contact started</option>
            <option>Facebook message</option>
            <option>Phone call</option>
            <option>SMS</option>
            <option>WhatsApp</option>
            <option>Website</option>
            <option>Friend referral</option>
          </select>
        </FormField>

        <FormField label="Were you promised something?">
          <select
            value={reportData.promisedItem}
            onChange={(event) =>
              updateReportData("promisedItem", event.target.value)
            }
            className="form-input"
          >
            <option value="">Select what was promised</option>
            <option>Product delivery</option>
            <option>Job opportunity</option>
            <option>Investment return</option>
            <option>Loan approval</option>
            <option>Account recovery</option>
            <option>Prize or lottery</option>
          </select>
        </FormField>
      </div>

      <div className="mt-6 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-[#06285c]">Report anonymously</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your identity will be hidden publicly. We still need your account
              internally to prevent abuse.
            </p>
          </div>

          <input
            type="checkbox"
            checked={reportData.anonymous}
            onChange={(event) =>
              updateReportData("anonymous", event.target.checked)
            }
            className="h-5 w-5 accent-[#009879]"
          />
        </label>
      </div>
    </section>
  );
}

export function ReportStoryTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-[#06285c]">
        Good report writing tips
      </h2>

      <div className="mt-5 space-y-5">
        <Tip
          title="Write in order"
          text="Explain what happened first, then what happened next."
        />

        <Tip
          title="Include important details"
          text="Mention dates, amounts, account names, links, numbers and promises."
        />

        <Tip
          title="Avoid private secrets"
          text="Never include OTP, PIN, passwords, NID numbers or full addresses."
        />
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#06285c]">
        {label}
      </span>

      {children}
    </label>
  );
}

function Tip({ title, text }) {
  return (
    <div>
      <h3 className="font-black text-[#009879]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
