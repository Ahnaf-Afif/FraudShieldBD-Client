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
import {
  estimateReportRiskLevel,
  saveSubmittedReport,
} from "../../lib/reportFeedData";

const REPORT_DRAFT_KEY = "fraudshield-report-draft";
const MIN_PREVENTION_ADVICE_LENGTH = 20;

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
  const [statusTime, setStatusTime] = useState("");
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(REPORT_DRAFT_KEY);

    if (!savedDraft) {
      const identifierFromUrl = new URLSearchParams(window.location.search).get(
        "identifier",
      );

      if (identifierFromUrl) {
        setReportData((currentData) => ({
          ...currentData,
          ...createIdentifierPrefill(identifierFromUrl),
        }));
        setHasUnsavedChanges(true);
      }

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
      setStatusTime(parsedDraft.savedAt || "");
      setHasSavedDraft(true);
      setHasUnsavedChanges(false);
      setSubmitStatus("draft-loaded");
    } catch (error) {
      console.error("Could not load report draft:", error);
      localStorage.removeItem(REPORT_DRAFT_KEY);
      setHasSavedDraft(false);
    }
  }, []);

  function updateReportData(fieldName, value) {
    setSubmitStatus("");
    setHasUnsavedChanges(true);

    setReportData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationResult = validateReportBeforeSubmit(reportData);

    if (!validationResult.isValid) {
      setSubmitStatus(validationResult.status);
      return;
    }

    const newReportId = reportId || createReportId();
    const submittedAt = new Date().toLocaleString();

    localStorage.removeItem(REPORT_DRAFT_KEY);
    setHasSavedDraft(false);
    setHasUnsavedChanges(false);
    setReportId(newReportId);
    setStatusTime(submittedAt);

    const submittedReportPayload = createReportPayload({
      reportData,
      reportId: newReportId,
      status: "submitted",
      statusTime: submittedAt,
    });

    saveSubmittedReport(submittedReportPayload);
    console.log("Report data:", submittedReportPayload);

    setSubmitStatus("submitted");
  }

  function handleSaveDraft() {
    const draftReportId = reportId || createReportId();
    const savedAt = new Date().toLocaleString();

    const draftData = createReportPayload({
      reportData,
      reportId: draftReportId,
      status: "draft",
      statusTime: savedAt,
    });

    setReportId(draftReportId);
    setStatusTime(savedAt);

    localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(draftData));
    setHasSavedDraft(true);
    setHasUnsavedChanges(false);

    console.log("Draft data:", draftData);
    setSubmitStatus("draft");
  }

  function handleResetForm() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    setHasSavedDraft(false);
    setHasUnsavedChanges(false);
    setReportData(initialReportData);
    setSubmitStatus("");
    setReportId("");
    setStatusTime("");
  }

  function handleDiscardDraft() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    setHasSavedDraft(false);
    setHasUnsavedChanges(true);
    setSubmitStatus("draft-discarded");
    setStatusTime(new Date().toLocaleString());
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
          statusTime={statusTime}
          reportData={reportData}
          updateReportData={updateReportData}
          hasSavedDraft={hasSavedDraft}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveDraft={handleSaveDraft}
          onResetForm={handleResetForm}
          onDiscardDraft={handleDiscardDraft}
        />
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ReportLiveSummary
          reportData={reportData}
          reportId={reportId}
          submitStatus={submitStatus}
          statusTime={statusTime}
          hasSavedDraft={hasSavedDraft}
          hasUnsavedChanges={hasUnsavedChanges}
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

function createReportPayload({ reportData, reportId, status, statusTime }) {
  const payload = {
    ...reportData,
    reportId,
    status,
    evidenceFiles: [],
  };

  if (status === "draft") {
    payload.savedAt = statusTime;
  }

  if (status === "submitted") {
    payload.submittedAt = statusTime;
    payload.riskLevel = estimateReportRiskLevel(reportData);
    payload.reportsCount = 1;
  }

  return payload;
}

function validateReportBeforeSubmit(reportData) {
  const hasIdentifier =
    hasText(reportData.phoneOrPaymentNumber) ||
    hasText(reportData.facebookLink) ||
    hasText(reportData.websiteLink) ||
    hasText(reportData.businessName);

  if (!hasIdentifier) {
    return {
      isValid: false,
      status: "missing-identifier",
    };
  }

  if (reportData.moneyStatus === "Yes, I lost money" && !reportData.amount) {
    return {
      isValid: false,
      status: "missing-amount",
    };
  }
  if (
    (reportData.moneyStatus === "Yes, I lost money" ||
      reportData.moneyStatus === "No, but they asked for money") &&
    !reportData.paymentMethod
  ) {
    return {
      isValid: false,
      status: "missing-payment-method",
    };
  }

  if (
    reportData.preventionAdvice.trim().length < MIN_PREVENTION_ADVICE_LENGTH
  ) {
    return {
      isValid: false,
      status: "missing-prevention-advice",
    };
  }

  return {
    isValid: true,
    status: "",
  };
}

function hasText(value) {
  return value.trim().length > 0;
}

function createIdentifierPrefill(identifier) {
  const cleanIdentifier = identifier.trim();
  const lowerIdentifier = cleanIdentifier.toLowerCase();
  const digitCount = cleanIdentifier.replace(/\D/g, "").length;

  if (lowerIdentifier.includes("facebook.com")) {
    return {
      facebookLink: cleanIdentifier,
    };
  }

  if (lowerIdentifier.includes(".") && !lowerIdentifier.includes(" ")) {
    return {
      websiteLink: cleanIdentifier,
    };
  }

  if (digitCount >= 6) {
    return {
      phoneOrPaymentNumber: cleanIdentifier,
    };
  }

  return {
    businessName: cleanIdentifier,
  };
}
