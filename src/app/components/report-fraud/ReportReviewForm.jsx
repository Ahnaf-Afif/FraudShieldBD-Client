import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Check, Copy, FileCheck } from "lucide-react";

const MIN_PREVENTION_ADVICE_LENGTH = 20;

export default function ReportReviewForm({
  reportData,
  updateReportData,
  submitStatus,
  reportId,
  statusTime,
  hasSavedDraft,
  hasUnsavedChanges,
  onSaveDraft,
  onResetForm,
  onDiscardDraft,
}) {
  const [copiedReportId, setCopiedReportId] = useState(false);

  function copyReportId() {
    navigator.clipboard.writeText(reportId);
    setCopiedReportId(true);

    setTimeout(() => {
      setCopiedReportId(false);
    }, 1500);
  }

  const confirmations = [
    reportData.confirmsAccuracy,
    reportData.confirmsPrivacy,
    reportData.confirmsReview,
    reportData.confirmsHonesty,
  ];
  const completedConfirmations = confirmations.filter(Boolean).length;
  const totalConfirmations = confirmations.length;
  const canSubmitReport = completedConfirmations === totalConfirmations;

  const draftButtonText = getDraftButtonText(hasSavedDraft, hasUnsavedChanges);
  const identifierCount = getIdentifierCount(reportData);
  const preventionAdviceLength = reportData.preventionAdvice.trim().length;
  const needsPreventionAdvice =
    preventionAdviceLength < MIN_PREVENTION_ADVICE_LENGTH;
  const preventionAdviceMessage = formatPreventionAdviceMessage(
    preventionAdviceLength,
  );

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
            How can others avoid this scam?{" "}
            <span className="text-red-500">*</span>
          </span>

          <textarea
            aria-describedby={
              needsPreventionAdvice ? "prevention-advice-message" : undefined
            }
            className="min-h-32 w-full resize-y rounded-xl border border-[#dbe7f3] bg-white p-4 leading-7 text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
            placeholder="Example: Do not send advance payment before verifying the seller. Check page reviews, call official numbers, and avoid sharing OTP or PIN."
            value={reportData.preventionAdvice}
            onChange={(e) =>
              updateReportData("preventionAdvice", e.target.value)
            }
          />
        </label>

        {needsPreventionAdvice && (
          <p
            id="prevention-advice-message"
            className={`mt-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
              submitStatus === "missing-prevention-advice"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-orange-200 bg-orange-50 text-orange-700"
            }`}
          >
            Write at least {MIN_PREVENTION_ADVICE_LENGTH} characters of safety
            advice. {preventionAdviceMessage}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5">
        <h3 className="font-black text-[#06285c]">Final check</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReviewSummaryItem label="Title" value={reportData.title} />
          <ReviewSummaryItem label="Category" value={reportData.fraudCategory} />
          <ReviewSummaryItem
            label="Identifiers"
            value={formatIdentifierCount(identifierCount)}
          />
          <ReviewSummaryItem
            label="Money"
            value={formatMoneySummary(reportData)}
          />
          <ReviewSummaryItem
            label="Evidence"
            value={formatEvidenceSummary(reportData)}
          />
          <ReviewSummaryItem
            label="Advice"
            value={formatPreventionAdviceSummary(preventionAdviceLength)}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-black text-[#06285c]">Before you submit</h3>

          <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#009879]">
            {completedConfirmations} / {totalConfirmations} confirmed
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#009879] transition-all"
            style={{
              width: `${(completedConfirmations / totalConfirmations) * 100}%`,
            }}
          />
        </div>

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

      {submitStatus === "submitted" && (
        <div className="mt-6 rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5">
          <h3 className="font-black text-[#06285c]">
            Report submitted for review
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Thank you for helping protect others. Your report is ready for
            moderator review.
          </p>

          {reportId && (
            <ReportIdBox
              label="Report ID"
              reportId={reportId}
              statusTime={statusTime}
              copied={copiedReportId}
              onCopy={copyReportId}
            />
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {reportId && (
              <Link
                href={`/reports/${reportId}`}
                className="inline-flex justify-center rounded-xl bg-[#009879] px-5 py-3 text-sm font-black text-white transition hover:bg-[#007f66] active:bg-slate-400"
              >
                View Report
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex justify-center rounded-xl border border-[#bfe8dc] bg-white px-5 py-3 text-sm font-black text-[#009879] transition hover:bg-[#f0fbf7] active:bg-slate-300"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      )}

      {submitStatus === "draft" && (
        <div className="mt-6 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-5">
          <h3 className="font-black text-[#06285c]">Draft saved</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your progress has been saved in this browser. You can come back and
            continue this report later.
          </p>

          {reportId && (
            <ReportIdBox
              label="Draft ID"
              reportId={reportId}
              statusTime={statusTime}
              copied={copiedReportId}
              onCopy={copyReportId}
            />
          )}
        </div>
      )}

      {submitStatus === "draft-loaded" && (
        <div className="mt-6 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-5">
          <h3 className="font-black text-[#06285c]">Draft loaded</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            We restored your saved report draft. Please reselect any evidence
            files before submitting.
          </p>

          {reportId && (
            <ReportIdBox
              label="Draft ID"
              reportId={reportId}
              statusTime={statusTime}
              copied={copiedReportId}
              onCopy={copyReportId}
            />
          )}
        </div>
      )}

      {submitStatus === "draft-discarded" && (
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <h3 className="font-black text-[#06285c]">Draft discarded</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The saved browser draft was removed. The current form fields are
            still visible so you can continue editing if needed.
          </p>

          {statusTime && (
            <p className="mt-3 text-xs font-semibold text-orange-700">
              {statusTime}
            </p>
          )}
        </div>
      )}

      {submitStatus === "missing-amount" && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-black text-[#06285c]">Amount is required</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            You selected that money was lost. Please add the amount in the
            Financial Info section before submitting.
          </p>
        </div>
      )}

      {submitStatus === "missing-payment-method" && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-black text-[#06285c]">
            Payment method is required
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Please select the payment method in the Financial Info section
            before submitting.
          </p>
        </div>
      )}

      {hasSavedDraft && hasUnsavedChanges && (
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <h3 className="font-black text-[#06285c]">Unsaved changes</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            You changed this report after saving the draft. Save again to update
            the browser draft.
          </p>
        </div>
      )}

      {(submitStatus || hasSavedDraft) && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onResetForm}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#06285c] transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:bg-slate-300 active:text-slate-600"
          >
            Start New Report
          </button>

          {hasSavedDraft && (
            <button
              type="button"
              onClick={onDiscardDraft}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 active:bg-slate-300 active:text-slate-600"
            >
              Discard Draft
            </button>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879] active:bg-slate-300 active:text-slate-600"
        >
          {draftButtonText}
        </button>

        <button
          type="submit"
          disabled={!canSubmitReport}
          className="rounded-xl bg-[#009879] px-6 py-3 font-bold text-white transition hover:bg-[#007f66] active:bg-slate-400 active:text-slate-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
        >
          Submit Report
        </button>
      </div>

      {!canSubmitReport && (
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Complete all {totalConfirmations} confirmations to enable submit.
        </p>
      )}
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

function getDraftButtonText(hasSavedDraft, hasUnsavedChanges) {
  if (hasSavedDraft && hasUnsavedChanges) {
    return "Update Draft";
  }

  if (hasSavedDraft) {
    return "Draft Saved";
  }

  return "Save as Draft";
}

function getIdentifierCount(reportData) {
  return [
    reportData.phoneOrPaymentNumber,
    reportData.facebookLink,
    reportData.websiteLink,
    reportData.businessName,
  ].filter((identifier) => identifier.trim()).length;
}

function formatIdentifierCount(identifierCount) {
  if (identifierCount === 0) {
    return "";
  }

  if (identifierCount === 1) {
    return "1 identifier";
  }

  return `${identifierCount} identifiers`;
}

function formatMoneySummary(reportData) {
  if (!reportData.moneyStatus) {
    return "";
  }

  if (reportData.amount) {
    return `${reportData.moneyStatus} - BDT ${reportData.amount}`;
  }

  return reportData.moneyStatus;
}

function formatEvidenceSummary(reportData) {
  if (!reportData.evidenceType && reportData.evidenceFiles.length === 0) {
    return "";
  }

  if (reportData.evidenceFiles.length === 0) {
    return reportData.evidenceType;
  }

  if (reportData.evidenceFiles.length === 1) {
    return `${reportData.evidenceType || "Evidence"} - 1 file`;
  }

  return `${reportData.evidenceType || "Evidence"} - ${
    reportData.evidenceFiles.length
  } files`;
}

function formatPreventionAdviceMessage(currentLength) {
  const remainingCharacters = Math.max(
    MIN_PREVENTION_ADVICE_LENGTH - currentLength,
    0,
  );

  if (remainingCharacters === 1) {
    return "1 more character needed.";
  }

  return `${remainingCharacters} more characters needed.`;
}

function formatPreventionAdviceSummary(currentLength) {
  if (currentLength === 0) {
    return "";
  }

  if (currentLength < MIN_PREVENTION_ADVICE_LENGTH) {
    return "Too short";
  }

  return "Added";
}

function ReviewSummaryItem({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-[#06285c]">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

function ReportIdBox({ label, reportId, statusTime, copied, onCopy }) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="break-words text-sm font-black text-[#06285c]">
          {label}: {reportId}
        </p>

        {statusTime && (
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {statusTime}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-[#06285c] transition hover:border-[#009879] hover:bg-[#f0fbf7] hover:text-[#009879] active:bg-slate-300"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
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
