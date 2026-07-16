import { CheckCircle2, FileCheck } from "lucide-react";

export default function ReportReviewForm({ reportData, updateReportData }) {
  const canSubmitReport =
    reportData.confirmsAccuracy &&
    reportData.confirmsPrivacy &&
    reportData.confirmsReview &&
    reportData.confirmsHonesty;

  return (
    <section className="p-5 sm:p-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black text-[#06285c]">
          6. Prevention & Review
        </h2>

        <p className="mt-1 text-slate-600">
          Add advice for others and confirm your report before submitting.
        </p>
      </div>

      <div className="mt-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#06285c]">
            How can others avoid this scam?
          </span>

          <textarea
            className="min-h-32 w-full resize-y rounded-xl border border-[#dbe7f3] bg-white p-4 leading-7 text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
            placeholder="Example: Do not send advance payment before verifying the seller. Check page reviews, call official numbers, and avoid sharing OTP or PIN."
            value={reportData.preventionAdvice}
            onChange={(e) =>
              updateReportData("preventionAdvice", e.target.value)
            }
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-black text-[#06285c]">Before you submit</h3>

        <div className="mt-4 space-y-3">
          <ChecklistItem
            text="The information I provided is accurate."
            checked={reportData.confirmsAccuracy}
            onChange={(checked) =>
              updateReportData("confirmsAccuracy", checked)
            }
          />

          <ChecklistItem
            text="I removed or hid OTP, PIN, password and private information from evidence."
            checked={reportData.confirmsPrivacy}
            onChange={(checked) => updateReportData("confirmsPrivacy", checked)}
          />

          <ChecklistItem
            text="I understand that moderators will review this report before it becomes public."
            checked={reportData.confirmsReview}
            onChange={(checked) => updateReportData("confirmsReview", checked)}
          />

          <ChecklistItem
            text="I understand false or abusive reports may be removed."
            checked={reportData.confirmsHonesty}
            onChange={(checked) => updateReportData("confirmsHonesty", checked)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-[#06285c]"
        >
          Save as Draft
        </button>

        <button
          type="submit"
          disabled={!canSubmitReport}
          className="rounded-xl bg-[#009879] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          Submit Report
        </button>
      </div>
    </section>
  );
}

export function ReportReviewTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
        <FileCheck size={30} />
      </div>

      <h2 className="mt-5 text-xl font-black text-[#06285c]">
        What happens next?
      </h2>

      <div className="mt-5 space-y-5">
        <NextStep
          title="Moderators review"
          text="Your report will be checked before it becomes public."
        />

        <NextStep
          title="Sensitive data hidden"
          text="Full numbers and private details should not be shown publicly."
        />

        <NextStep
          title="Community warning"
          text="If approved, your report can help warn others before they pay."
        />
      </div>
    </div>
  );
}

function ChecklistItem({ text, checked, onChange }) {
  return (
    <label className="flex cursor-pointer gap-3 text-sm leading-6 text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#009879]"
      />
      <span>{text}</span>
    </label>
  );
}

function NextStep({ title, text }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#009879]" />

      <div>
        <h3 className="font-black text-[#06285c]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
