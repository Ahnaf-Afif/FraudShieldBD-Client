"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileImage, Upload, X, XCircle } from "lucide-react";

const evidenceTypes = [
  "Chat screenshot",
  "Transaction receipt",
  "Facebook page screenshot",
  "Product/order screenshot",
  "Website screenshot",
  "Other evidence",
];

const MAX_EVIDENCE_FILES = 5;

export default function ReportEvidenceForm({ reportData, updateReportData }) {
  const fileInputRef = useRef(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(null);

  const previewFiles = useMemo(
    () =>
      reportData.evidenceFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isImage: file.type.startsWith("image/"),
        isPdf: file.type === "application/pdf",
      })),
    [reportData.evidenceFiles],
  );

  const selectedPreview =
    selectedPreviewIndex === null ? null : previewFiles[selectedPreviewIndex];

  useEffect(() => {
    return () => {
      previewFiles.forEach((previewFile) => {
        URL.revokeObjectURL(previewFile.previewUrl);
      });
    };
  }, [previewFiles]);

  useEffect(() => {
    function closePreviewWithEscape(event) {
      if (event.key === "Escape") {
        setSelectedPreviewIndex(null);
      }
    }

    if (selectedPreview) {
      document.addEventListener("keydown", closePreviewWithEscape);
    }

    return () => {
      document.removeEventListener("keydown", closePreviewWithEscape);
    };
  }, [selectedPreview]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextFiles = [...reportData.evidenceFiles, ...selectedFiles].slice(
      0,
      MAX_EVIDENCE_FILES,
    );

    updateReportData("evidenceFiles", nextFiles);
    event.target.value = "";
  }

  function removeEvidenceFile(fileIndex) {
    const nextFiles = reportData.evidenceFiles.filter(
      (file, index) => index !== fileIndex,
    );

    updateReportData("evidenceFiles", nextFiles);
    setSelectedPreviewIndex(null);
  }

  const selectedFileCount = reportData.evidenceFiles.length;
  const hasReachedFileLimit = selectedFileCount >= MAX_EVIDENCE_FILES;

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
          disabled={hasReachedFileLimit}
          className="mt-5 rounded-xl bg-[#009879] px-6 py-3 font-bold text-white transition hover:bg-[#007f66] disabled:cursor-not-allowed disabled:bg-slate-300"
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
          PNG, JPG, WEBP or PDF. Maximum {MAX_EVIDENCE_FILES} files.
        </p>
      </div>

      {selectedFileCount > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-black text-[#06285c]">Selected files</h3>

            <p className="text-xs font-bold text-slate-500">
              {selectedFileCount} / {MAX_EVIDENCE_FILES} files
            </p>
          </div>

          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {previewFiles.map((previewFile, index) => (
              <li
                key={`${previewFile.file.name}-${previewFile.file.size}-${previewFile.file.lastModified}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPreviewIndex(index)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <PreviewThumb previewFile={previewFile} />

                  <span className="min-w-0">
                    <span className="block break-words font-bold text-[#06285c]">
                      {previewFile.file.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatFileSize(previewFile.file.size)}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => removeEvidenceFile(index)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${previewFile.file.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>

          {hasReachedFileLimit && (
            <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
              You reached the file limit. Remove a file before adding another.
            </p>
          )}
        </div>
      )}

      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06285c]/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${selectedPreview.file.name}`}
          onClick={() => setSelectedPreviewIndex(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-black text-[#06285c]">
                  {selectedPreview.file.name}
                </h3>

                <p className="text-xs font-semibold text-slate-500">
                  {formatFileSize(selectedPreview.file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPreviewIndex(null)}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-auto bg-slate-100 p-4">
              {selectedPreview.isImage && (
                <img
                  src={selectedPreview.previewUrl}
                  alt={selectedPreview.file.name}
                  className="mx-auto max-h-[72vh] max-w-full rounded-xl object-contain"
                />
              )}

              {selectedPreview.isPdf && (
                <iframe
                  src={selectedPreview.previewUrl}
                  title={selectedPreview.file.name}
                  className="h-[72vh] w-full rounded-xl bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#06285c]">
            Evidence type <span className="text-red-500">*</span>
          </span>

          <select
            required
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

function formatFileSize(sizeInBytes) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PreviewThumb({ previewFile }) {
  if (previewFile.isImage) {
    return (
      <img
        src={previewFile.previewUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eef6ff] text-[#0b63f6]">
      <FileImage size={22} />
    </span>
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
