"use client";

import { useState } from "react";
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

  function updateReportData(fieldName, value) {
    setReportData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Report data:", reportData);
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
        />
        <ReportEvidenceForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
        <ReportReviewForm
          reportData={reportData}
          updateReportData={updateReportData}
        />
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
