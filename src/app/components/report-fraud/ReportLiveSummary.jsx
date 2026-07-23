import { ClipboardList } from "lucide-react";

export default function ReportLiveSummary({
  reportData,
  reportId,
  submitStatus,
}) {
  const identifiers = [
    reportData.phoneOrPaymentNumber,
    reportData.facebookLink,
    reportData.websiteLink,
    reportData.businessName,
  ].filter(Boolean);

  const requiredFields = [
    reportData.fraudCategory,
    reportData.platform,
    reportData.incidentDate,
    reportData.location,
    reportData.title,
    reportData.story,
    reportData.moneyStatus,
    identifiers.length > 0,
    reportData.evidenceType,
    reportData.preventionAdvice,
  ];

  const completedFields = requiredFields.filter(Boolean).length;
  const completionPercent = Math.round(
    (completedFields / requiredFields.length) * 100,
  );

  const statusLabel = getStatusLabel(submitStatus);

  return (
    <div className="rounded-2xl border border-[#bfe8dc] bg-[#f0fbf7] p-5 shadow-sm sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#009879] shadow-sm">
        <ClipboardList size={24} />
      </div>

      <h2 className="mt-4 text-xl font-black text-[#06285c]">Report Summary</h2>

      <div className="mt-4 rounded-xl bg-white p-4">
        <p className="text-sm font-bold text-slate-500">Report ID</p>
        <p className="mt-1 break-words font-black text-[#06285c]">
          {reportId || "Not created yet"}
        </p>

        <p className="mt-3 text-sm font-bold text-slate-500">Status</p>
        <span className="mt-1 inline-flex rounded-full bg-[#e9f8f4] px-3 py-1 text-xs font-black text-[#009879]">
          {statusLabel}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">Completion</p>
          <p className="text-sm font-black text-[#009879]">
            {completionPercent}%
          </p>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#009879] transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <SummaryItem label="Category" value={reportData.fraudCategory} />
        <SummaryItem label="Platform" value={reportData.platform} />
        <SummaryItem label="Title" value={reportData.title} />
        <SummaryItem label="Money status" value={reportData.moneyStatus} />
        <SummaryItem label="Amount" value={reportData.amount} />

        <div>
          <p className="font-bold text-slate-500">Identifiers</p>

          {identifiers.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {identifiers.map((identifier) => (
                <li
                  key={identifier}
                  className="break-words font-black text-[#06285c]"
                >
                  {identifier}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-slate-400">Not added yet</p>
          )}
        </div>

        <SummaryItem
          label="Evidence files"
          value={
            reportData.evidenceFiles.length > 0
              ? `${reportData.evidenceFiles.length} file selected`
              : ""
          }
        />
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black text-[#06285c]">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

function getStatusLabel(submitStatus) {
  if (submitStatus === "submitted") {
    return "Submitted";
  }

  if (submitStatus === "draft") {
    return "Draft saved";
  }

  if (submitStatus === "draft-loaded") {
    return "Draft restored";
  }

  if (submitStatus === "missing-identifier") {
    return "Needs identifier";
  }

  return "In progress";
}
