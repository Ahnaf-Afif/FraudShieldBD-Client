"use client";

import { useEffect, useState } from "react";
import ReportCategoryForm, { ReportCategoryTips } from "./ReportCategoryForm";
import ReportEvidenceForm, { ReportEvidenceTips } from "./ReportEvidenceForm";
import ReportFinancialForm, {
  ReportFinancialTips,
} from "./ReportFinancialForm";
import ReportIdentifiersForm, {
  ReportIdentifiersTips,
} from "./ReportIdentifiersForm";
import ReportReviewForm, { ReportReviewTips } from "./ReportReviewForm";
import ReportStoryForm, { ReportStoryTips } from "./ReportStoryForm";
import ReportLiveSummary from "./ReportLiveSummary";
const REPORT_DRAFT_KEY = "fraudshield-report-draft";

const initialReportData = {
  fraudCategory: "",
  platform: "",
  incidentDate: "",
  location: "",
  title: "",
  story: "",
  contactMethod: "",
  promisedItem: "",
  anonymous: false,
  moneyStatus: "",
  amount: "",
  paymentMethod: "",
  transactionDate: "",
  transactionId: "",
  paymentAccountName: "",
  phoneOrPaymentNumber: "",
  facebookLink: "",
  websiteLink: "",
  businessName: "",
  evidenceType: "",
  evidenceFiles: [],
  evidenceDetails: "",
  preventionAdvice: "",
  confirmsAccuracy: false,
  confirmsPrivacy: false,
  confirmsReview: false,
  confirmsHonesty: false,
};

export default function ReportFormShell() {
  const [reportData, setReportData] = useState(initialReportData);
  const [submitStatus, setSubmitStatus] = useState("");
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    const savedDraft = localStorage.getItem(REPORT_DRAFT_KEY);

    if (!savedDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft);

      setReportData({
        ...initialReportData,
        ...parsedDraft,
        evidenceFiles: [],
      });

      setReportId(parsedDraft.reportId || "");
      setSubmitStatus("draft-loaded");
    } catch (error) {
      console.error("Could not load report draft:", error);
      localStorage.removeItem(REPORT_DRAFT_KEY);
    }
  }, []);

  function updateReportData(fieldName, value) {
    setSubmitStatus("");
    setReportData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const hasIdentifier =
      reportData.phoneOrPaymentNumber ||
      reportData.facebookLink ||
      reportData.websiteLink ||
      reportData.businessName;

    if (!hasIdentifier) {
      setSubmitStatus("missing-identifier");
      return;
    }

    const newReportId = reportId || createReportId();

    localStorage.removeItem(REPORT_DRAFT_KEY);
    setReportId(newReportId);

    console.log("Report data:", {
      ...reportData,
      reportId: newReportId,
      status: "submitted",
    });

    setSubmitStatus("submitted");
  }

  function handleSaveDraft() {
    const draftReportId = reportId || createReportId();

    const draftData = {
      ...reportData,
      reportId: draftReportId,
      status: "draft",
      evidenceFiles: [],
    };

    setReportId(draftReportId);

    localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(draftData));

    console.log("Draft data:", draftData);
    setSubmitStatus("draft");
  }

  function handleResetForm() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    setReportData(initialReportData);
    setSubmitStatus("");
    setReportId("");
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_330px]">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <ReportCategoryForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
        <ReportStoryForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
        <ReportFinancialForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
        <ReportIdentifiersForm
          reportData={reportData}
          updateReportData={updateReportData}
          submitStatus={submitStatus}
        />
        <ReportEvidenceForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
        <ReportReviewForm
          submitStatus={submitStatus}
          reportId={reportId}
          reportData={reportData}
          updateReportData={updateReportData}
          onSaveDraft={handleSaveDraft}
          onResetForm={handleResetForm}
        />
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ReportLiveSummary
          reportData={reportData}
          reportId={reportId}
          submitStatus={submitStatus}
        />
        <ReportCategoryTips />
        <ReportStoryTips />
        <ReportFinancialTips />
        <ReportIdentifiersTips />
        <ReportEvidenceTips />
        <ReportReviewTips />
      </aside>
    </section>
  );
}

function createReportId() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `FR-${year}-${month}${day}-${randomNumber}`;
}
