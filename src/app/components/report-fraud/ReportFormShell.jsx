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

  useEffect(() => {
    const savedDraft = localStorage.getItem("fraudshield-report-draft");

    if (!savedDraft) {
      return;
    }

    const parsedDraft = JSON.parse(savedDraft);

    setReportData({
      ...initialReportData,
      ...parsedDraft,
      evidenceFiles: [],
    });

    setSubmitStatus("draft-loaded");
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

    console.log("Report data:", reportData);
    setSubmitStatus("submitted");
  }

  function handleSaveDraft() {
    const draftData = {
      ...reportData,
      evidenceFiles: [],
    };

    localStorage.setItem("fraudshield-report-draft", JSON.stringify(draftData));

    console.log("Draft data:", draftData);
    setSubmitStatus("draft");
  }

  function handleResetForm() {
    localStorage.removeItem("fraudshield-report-draft");
    setReportData(initialReportData);
    setSubmitStatus("");
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
          reportData={reportData}
          updateReportData={updateReportData}
          onSaveDraft={handleSaveDraft}
          onResetForm={handleResetForm}
        />
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ReportLiveSummary reportData={reportData} />
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
