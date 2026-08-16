"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  REPORT_DRAFT_KEY,
  estimateReportRiskLevel,
  getPrimaryIdentifier,
  getReportByIdFromBrowser,
  saveSubmittedReport,
} from "../../lib/reportFeedData";
import {
  DEMO_SESSION_UPDATED_EVENT,
  getDemoSession,
} from "../../lib/demoSession";
import { notifyLocalDataUpdated } from "../../lib/localDataEvents";

const MIN_PREVENTION_ADVICE_LENGTH = 20;
const AUTO_SAVE_DELAY = 900;

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
  relatedReportId: "",
  relatedReportTitle: "",
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
  const [demoUser, setDemoUser] = useState(null);
  const [relatedReportSummary, setRelatedReportSummary] = useState(null);
  const didLoadInitialData = useRef(false);

  useEffect(() => {
    function updateDemoUser() {
      setDemoUser(getDemoSession());
    }

    updateDemoUser();
    window.addEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
    window.addEventListener("storage", updateDemoUser);

    return () => {
      window.removeEventListener(DEMO_SESSION_UPDATED_EVENT, updateDemoUser);
      window.removeEventListener("storage", updateDemoUser);
    };
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem(REPORT_DRAFT_KEY);

    if (!savedDraft) {
      const searchParams = new URLSearchParams(window.location.search);
      const identifierFromUrl = searchParams.get("identifier");
      const relatedReportIdFromUrl = searchParams.get("relatedReportId");
      const relatedReport = relatedReportIdFromUrl
        ? getReportByIdFromBrowser(relatedReportIdFromUrl)
        : null;
      const relatedReportPrefill = relatedReport
        ? createRelatedReportPrefill(relatedReport)
        : {};
      const identifierPrefill = identifierFromUrl
        ? createIdentifierPrefill(identifierFromUrl)
        : {};
      const nextPrefillData = {
        ...relatedReportPrefill,
        ...identifierPrefill,
      };

      if (Object.keys(nextPrefillData).length > 0) {
        setReportData((currentData) => ({
          ...currentData,
          ...nextPrefillData,
        }));
        setHasUnsavedChanges(true);
      }

      if (relatedReport) {
        setRelatedReportSummary(
          createRelatedReportSummary(relatedReport, nextPrefillData),
        );
      }

      didLoadInitialData.current = true;
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
      setRelatedReportSummary(null);
    } catch (error) {
      console.error("Could not load report draft:", error);
      localStorage.removeItem(REPORT_DRAFT_KEY);
      setHasSavedDraft(false);
    } finally {
      didLoadInitialData.current = true;
    }
  }, []);

  useEffect(() => {
    if (
      !didLoadInitialData.current ||
      !hasUnsavedChanges ||
      submitStatus === "submitted" ||
      !hasReportProgress(reportData)
    ) {
      return;
    }

    const autoSaveTimer = setTimeout(() => {
      saveDraftToBrowser("draft-auto-saved");
    }, AUTO_SAVE_DELAY);

    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [hasUnsavedChanges, reportData, submitStatus]);

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
    notifyLocalDataUpdated();
    setHasSavedDraft(false);
    setHasUnsavedChanges(false);
    setReportId(newReportId);
    setStatusTime(submittedAt);

    const submittedReportPayload = createReportPayload({
      reportData,
      reportId: newReportId,
      status: "submitted",
      statusTime: submittedAt,
      demoUser,
    });

    saveSubmittedReport(submittedReportPayload);
    console.log("Report data:", submittedReportPayload);

    setSubmitStatus("submitted");
  }

  function saveDraftToBrowser(nextSubmitStatus) {
    const draftReportId = reportId || createReportId();
    const savedAt = new Date().toLocaleString();

    const draftData = createReportPayload({
      reportData,
      reportId: draftReportId,
      status: "draft",
      statusTime: savedAt,
      demoUser,
    });

    setReportId(draftReportId);
    setStatusTime(savedAt);

    localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(draftData));
    notifyLocalDataUpdated();
    setHasSavedDraft(true);
    setHasUnsavedChanges(false);

    console.log("Draft data:", draftData);
    setSubmitStatus(nextSubmitStatus);
  }

  function handleSaveDraft() {
    saveDraftToBrowser("draft");
  }

  function handleResetForm() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    notifyLocalDataUpdated();
    setHasSavedDraft(false);
    setHasUnsavedChanges(false);
    setReportData(initialReportData);
    setSubmitStatus("");
    setReportId("");
    setStatusTime("");
  }

  function handleDiscardDraft() {
    localStorage.removeItem(REPORT_DRAFT_KEY);
    notifyLocalDataUpdated();
    setHasSavedDraft(false);
    setHasUnsavedChanges(true);
    setSubmitStatus("draft-discarded");
    setStatusTime(new Date().toLocaleString());
  }

  function clearRelatedReportContext() {
    if (!relatedReportSummary) {
      return;
    }

    setReportData((currentData) =>
      removeUnchangedPrefillValues(
        currentData,
        relatedReportSummary.prefillData,
      ),
    );
    setRelatedReportSummary(null);
    setHasUnsavedChanges(true);
    setSubmitStatus("");

    window.history.replaceState({}, "", "/report-fraud");
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_330px]">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {relatedReportSummary && (
          <RelatedReportPrefillNotice
            relatedReport={relatedReportSummary}
            onClearContext={clearRelatedReportContext}
          />
        )}

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
          relatedReport={relatedReportSummary}
          submitStatus={submitStatus}
          statusTime={statusTime}
          hasSavedDraft={hasSavedDraft}
          hasUnsavedChanges={hasUnsavedChanges}
          demoUser={demoUser}
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

function RelatedReportPrefillNotice({ relatedReport, onClearContext }) {
  return (
    <div className="border-b border-[#bfdbfe] bg-[#eff6ff] p-5 sm:p-6">
      <p className="text-xs font-black uppercase text-[#0b63f6]">
        Related report context
      </p>

      <h2 className="mt-2 break-words text-xl font-black text-[#06285c]">
        Reporting another case connected to "{relatedReport.title}"
      </h2>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        We prefilled the category, platform, location and identifier when they
        were available. Add your own story, evidence and safety advice before
        submitting.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/reports/${relatedReport.reportId}`}
          className="inline-flex justify-center rounded-xl border border-[#bfdbfe] bg-white px-4 py-3 text-sm font-black text-[#0b63f6] transition hover:bg-[#f8fbff]"
        >
          View Original Report
        </Link>

        <a
          href="#report-category"
          className="inline-flex justify-center rounded-xl bg-[#0b63f6] px-4 py-3 text-sm font-black text-white transition hover:bg-[#084fc5]"
        >
          Review Prefilled Fields
        </a>

        <button
          type="button"
          onClick={onClearContext}
          className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Start Blank Instead
        </button>
      </div>
    </div>
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

function createReportPayload({
  reportData,
  reportId,
  status,
  statusTime,
  demoUser,
}) {
  const reporter = createReporterDetails(reportData, demoUser);
  const payload = {
    ...reportData,
    reportId,
    status,
    evidenceFiles: [],
    evidenceFileSummaries: createEvidenceFileSummaries(reportData.evidenceFiles),
    ...reporter,
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

function createEvidenceFileSummaries(files) {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }));
}

function createReporterDetails(reportData, demoUser) {
  if (reportData.anonymous) {
    return {
      reporterName: "Anonymous reporter",
      reporterEmail: "",
      reporterRole: "Hidden",
      ownerName: demoUser?.name || "",
      ownerEmail: demoUser?.email || "",
      isAnonymous: true,
    };
  }

  if (demoUser) {
    return {
      reporterName: demoUser.name,
      reporterEmail: demoUser.email,
      reporterRole: demoUser.role,
      ownerName: demoUser.name,
      ownerEmail: demoUser.email,
      isAnonymous: false,
    };
  }

  return {
    reporterName: "Guest reporter",
    reporterEmail: "",
    reporterRole: "Guest",
    ownerName: "",
    ownerEmail: "",
    isAnonymous: false,
  };
}

function validateReportBeforeSubmit(reportData) {
  const missingBasicDetails =
    !hasText(reportData.fraudCategory) ||
    !hasText(reportData.platform) ||
    !hasText(reportData.incidentDate) ||
    !hasText(reportData.location) ||
    !hasText(reportData.title);

  if (missingBasicDetails) {
    return {
      isValid: false,
      status: "missing-basic-details",
    };
  }

  if (reportData.story.trim().length < 20) {
    return {
      isValid: false,
      status: "missing-story",
    };
  }

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

  if (
    !hasText(reportData.evidenceType) &&
    !hasText(reportData.evidenceDetails) &&
    reportData.evidenceFiles.length === 0
  ) {
    return {
      isValid: false,
      status: "missing-evidence",
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

function hasReportProgress(reportData) {
  return [
    reportData.fraudCategory,
    reportData.platform,
    reportData.incidentDate,
    reportData.location,
    reportData.title,
    reportData.story,
    reportData.contactMethod,
    reportData.promisedItem,
    reportData.moneyStatus,
    reportData.amount,
    reportData.paymentMethod,
    reportData.phoneOrPaymentNumber,
    reportData.facebookLink,
    reportData.websiteLink,
    reportData.businessName,
    reportData.evidenceType,
    reportData.evidenceDetails,
    reportData.preventionAdvice,
  ].some((value) => String(value || "").trim().length > 0);
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

function createRelatedReportPrefill(relatedReport) {
  const relatedIdentifier = getPrimaryIdentifier(relatedReport);

  return {
    relatedReportId: relatedReport.reportId,
    relatedReportTitle: relatedReport.title || "",
    fraudCategory: mapRelatedCategoryToFormCategory(
      relatedReport.fraudCategory,
    ),
    platform: mapRelatedReportToFormPlatform(relatedReport),
    location: mapRelatedLocationToFormLocation(relatedReport.location),
    ...createIdentifierPrefill(relatedIdentifier),
  };
}

function createRelatedReportSummary(relatedReport, prefillData) {
  return {
    reportId: relatedReport.reportId,
    title: relatedReport.title || "this report",
    prefillData,
  };
}

function removeUnchangedPrefillValues(reportData, prefillData) {
  return Object.entries(prefillData).reduce(
    (nextReportData, [fieldName, prefilledValue]) => {
      if (nextReportData[fieldName] !== prefilledValue) {
        return nextReportData;
      }

      return {
        ...nextReportData,
        [fieldName]: initialReportData[fieldName],
      };
    },
    reportData,
  );
}

function mapRelatedCategoryToFormCategory(category) {
  const categoryMap = {
    "Mobile Financial": "Mobile Financial Scam",
    "Mobile Financial Scam": "Mobile Financial Scam",
    "Facebook Page": "Fake Online Shop",
    "E-commerce": "Fake Online Shop",
    Website: "Phishing Website",
    "Phishing Website": "Phishing Website",
    Investment: "Investment Scam",
    "Investment Scam": "Investment Scam",
    "Job Scam": "Fake Job Offer",
    "Fake Job Offer": "Fake Job Offer",
  };

  return categoryMap[category] || "";
}

function mapRelatedReportToFormPlatform(relatedReport) {
  if (relatedReport.facebookLink || relatedReport.fraudCategory === "Facebook Page") {
    return "Facebook";
  }

  if (relatedReport.websiteLink || relatedReport.fraudCategory === "Website") {
    return "Website";
  }

  if (relatedReport.phoneOrPaymentNumber) {
    return "Phone Call";
  }

  return "";
}

function mapRelatedLocationToFormLocation(location) {
  const allowedLocations = [
    "Dhaka",
    "Chattogram",
    "Sylhet",
    "Rajshahi",
    "Online only",
  ];

  if (allowedLocations.includes(location)) {
    return location;
  }

  return location ? "Online only" : "";
}
