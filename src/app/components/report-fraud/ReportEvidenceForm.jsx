"use client";

import { useRef } from "react";
import { FileImage, Upload, XCircle } from "lucide-react";

const evidenceTypes = [
  "Chat screenshot",
  "Transaction receipt",
  "Facebook page screenshot",
  "Product/order screenshot",
  "Website screenshot",
  "Other evidence",
];

export default function ReportEvidenceForm({ reportData, updateReportData }) {
  const fileInputRef = useRef(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    updateReportData("evidenceFiles", selectedFiles);
  }

  return (
    <section className="border-b border-slate-200 p-5 sm:p-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-[#06285c]">5. Evidence</h2>

          <p className="mt-1 text-slate-600">
            Upload screenshots or files that support your report.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[#009879] bg-[#f0fbf7] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#009879] shadow-sm">
            <Upload size={30} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#06285c]">
            Upload evidence files
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Drag and drop screenshots here, or click to browse from your device.
          </p>

          <button
            type="button"
            onClick={openFilePicker}
            className="mt-5 rounded-xl bg-[#009879] px-6 py-3 font-bold text-white"
          >
            Choose Files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="mt-3 text-xs text-slate-500">
            PNG, JPG, WEBP or PDF. Maximum 5 files.
          </p>
        </div>

        {reportData.evidenceFiles.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-black text-[#06285c]">
              Selected files
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {reportData.evidenceFiles.map((file) => (
                <li key={`${file.name}-${file.size}`} className="break-words">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#06285c]">
              Evidence type
            </span>

            <select
              value={reportData.evidenceType}
              onChange={(event) =>
                updateReportData("evidenceType", event.target.value)
              }
              className="form-input"
            >
              <option value="">Select evidence type</option>
              {evidenceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#06285c]">
              Evidence notes
            </span>

            <textarea
              value={reportData.evidenceDetails}
              onChange={(event) =>
                updateReportData("evidenceDetails", event.target.value)
              }
              className="min-h-28 w-full resize-y rounded-xl border border-[#dbe7f3] bg-white p-4 leading-7 text-[#06285c] outline-none focus:border-[#009879] focus:ring-4 focus:ring-[#009879]/10"
              placeholder="Example: The first screenshot shows the payment request. The second screenshot shows the transaction receipt."
            />
          </label>
        </div>

        <div className="mt-6 rounded-2xl bg-red-50 p-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
              <XCircle size={24} />
            </div>

            <div>
              <h3 className="font-black text-[#06285c]">
                Protect your privacy before uploading
              </h3>

              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                <li>Hide OTP and verification codes.</li>
                <li>Hide PIN, password and account numbers.</li>
                <li>Hide NID, full address and private personal details.</li>
                <li>Blur faces if they are not related to the report.</li>
              </ul>
            </div>
          </div>
        </div>
    </section>
  );
}

export function ReportEvidenceTips() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ff] text-[#0b63f6]">
        <FileImage size={30} />
      </div>

      <h2 className="mt-5 text-xl font-black text-[#06285c]">
        What evidence helps?
      </h2>

      <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
        <p>Clear screenshots of conversations.</p>
        <p>Transaction receipts with private data hidden.</p>
        <p>Links or screenshots of fake pages/websites.</p>
        <p>Any message showing promises, threats or payment requests.</p>
      </div>
    </div>
  );
}
