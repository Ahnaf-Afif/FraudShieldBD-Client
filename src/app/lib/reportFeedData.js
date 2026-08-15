import { notifyLocalDataUpdated } from "./localDataEvents";
import { readJsonArray, readJsonObject, readJsonValue } from "./browserStorage";

export const REPORT_SUBMISSIONS_KEY = "fraudshield-submitted-reports";
export const REPORT_REACTIONS_KEY = "fraudshield-report-reactions";
export const REPORT_COMMENTS_KEY = "fraudshield-report-comments";
export const REPORT_DRAFT_KEY = "fraudshield-report-draft";

export const demoReports = [
  {
    reportId: "FR-DEMO-001",
    title: "Fake investment app promising high returns",
    fraudCategory: "Investment",
    location: "Dhaka",
    story:
      "A page promised daily profit after installing their app. They asked for advance payment and stopped replying after receiving money.",
    preventionAdvice:
      "Do not send advance payments for investment offers. Verify the company and avoid apps shared through random links.",
    phoneOrPaymentNumber: "01812345678",
    riskLevel: "High Risk",
    submittedAt: "2 hours ago",
    reportsCount: 23,
    reporterName: "Community member",
    reporterRole: "Verified reporter",
    isAnonymous: false,
  },
  {
    reportId: "FR-DEMO-002",
    title: "Facebook shop took payment but did not deliver",
    fraudCategory: "Facebook Page",
    location: "Chattogram",
    story:
      "The seller showed product photos and requested full payment through mobile banking. After payment, the page blocked the buyer.",
    preventionAdvice:
      "Check page reviews, comments, and business history before paying. Prefer cash on delivery when possible.",
    facebookLink: "facebook.com/fashionhubbd",
    riskLevel: "Medium Risk",
    submittedAt: "5 hours ago",
    reportsCount: 17,
    reporterName: "Anonymous reporter",
    reporterRole: "Hidden",
    isAnonymous: true,
  },
  {
    reportId: "FR-DEMO-003",
    title: "Loan offer asked for registration fee first",
    fraudCategory: "Mobile Financial",
    location: "Sylhet",
    story:
      "A caller promised instant loan approval but asked for a fee before processing. After the fee was sent, the number became unreachable.",
    preventionAdvice:
      "Avoid loan offers that ask for fees before approval. Contact official support channels directly.",
    phoneOrPaymentNumber: "01897654321",
    riskLevel: "Low Risk",
    submittedAt: "Yesterday",
    reportsCount: 11,
    reporterName: "Community member",
    reporterRole: "Verified reporter",
    isAnonymous: false,
  },
  {
    reportId: "FR-DEMO-004",
    title: "Fake courier delivery fee message",
    fraudCategory: "Mobile Financial",
    location: "Rajshahi",
    story:
      "A text message claimed a parcel was waiting and asked for a small delivery fee through a mobile payment number. The tracking link was not from the courier company.",
    preventionAdvice:
      "Open the courier company's official website or app instead of tapping payment links from SMS messages.",
    phoneOrPaymentNumber: "01688551234",
    riskLevel: "Medium Risk",
    submittedAt: "1 day ago",
    reportsCount: 9,
    reporterName: "Nusrat Jahan",
    reporterRole: "Verified reporter",
    isAnonymous: false,
  },
  {
    reportId: "FR-DEMO-005",
    title: "Online job asked for training payment",
    fraudCategory: "Job Scam",
    location: "Khulna",
    story:
      "The page advertised part-time work and promised daily earnings. Before sharing any real job details, they asked for a training and registration payment.",
    preventionAdvice:
      "Be careful with jobs that ask for money before interview, contract, or official company verification.",
    facebookLink: "facebook.com/dreamjobsbd",
    riskLevel: "High Risk",
    submittedAt: "1 day ago",
    reportsCount: 15,
    reporterName: "Community member",
    reporterRole: "Verified reporter",
    isAnonymous: false,
  },
  {
    reportId: "FR-DEMO-006",
    title: "Prize winner call requested OTP",
    fraudCategory: "Lottery",
    location: "Barishal",
    story:
      "A caller said the user won a campaign prize and needed an OTP to confirm identity. The caller became aggressive when the OTP was refused.",
    preventionAdvice:
      "Never share OTP, PIN, or verification codes. Real support teams will not ask for secret codes by phone.",
    phoneOrPaymentNumber: "01345678901",
    riskLevel: "High Risk",
    submittedAt: "2 days ago",
    reportsCount: 21,
    reporterName: "Anonymous reporter",
    reporterRole: "Hidden",
    isAnonymous: true,
  },
  {
    reportId: "FR-DEMO-007",
    title: "Shopping website copied a known brand",
    fraudCategory: "Website",
    location: "Dhaka",
    story:
      "The website used a familiar brand name and discount banner, but the domain was different. It asked customers to pay before order confirmation.",
    preventionAdvice:
      "Check the website domain carefully, search for real customer reviews, and avoid paying before verifying the store.",
    websiteLink: "bestofferbd.store",
    riskLevel: "Medium Risk",
    submittedAt: "3 days ago",
    reportsCount: 13,
    reporterName: "Ahsan Kabir",
    reporterRole: "Top contributor",
    isAnonymous: false,
  },
  {
    reportId: "FR-DEMO-008",
    title: "Business page used copied product photos",
    fraudCategory: "E-commerce",
    location: "Rangpur",
    story:
      "A seller posted copied product photos and offered a big discount for full advance payment. The same photos appeared on multiple unrelated pages.",
    preventionAdvice:
      "Reverse-search product photos when possible and choose cash on delivery or verified marketplaces for expensive purchases.",
    businessName: "Trendy Gadget BD",
    riskLevel: "Low Risk",
    submittedAt: "4 days ago",
    reportsCount: 6,
    reporterName: "Community member",
    reporterRole: "Reporter",
    isAnonymous: false,
  },
];

export function getSubmittedReportsFromBrowser() {
  return readJsonArray(REPORT_SUBMISSIONS_KEY).filter(isValidReportShape);
}

export function getSavedReportDraftFromBrowser() {
  const parsedDraft = readJsonValue(REPORT_DRAFT_KEY);

  if (!isValidReportShape(parsedDraft)) {
    return null;
  }

  return normalizeSubmittedReport(parsedDraft);
}

export function getAllReportsForBrowser() {
  const submittedReports = getSubmittedReportsFromBrowser().map(
    normalizeSubmittedReport,
  );

  return [...submittedReports, ...demoReports];
}

export function getReportByIdFromBrowser(reportId) {
  return (
    getAllReportsForBrowser().find((report) => report.reportId === reportId) ||
    null
  );
}

export function saveSubmittedReport(newReport) {
  if (!isValidReportShape(newReport)) {
    return;
  }

  const savedReports = getSubmittedReportsFromBrowser();
  const reportsWithoutCurrentReport = savedReports.filter(
    (savedReport) => savedReport.reportId !== newReport.reportId,
  );
  const updatedReports = [newReport, ...reportsWithoutCurrentReport];

  localStorage.setItem(REPORT_SUBMISSIONS_KEY, JSON.stringify(updatedReports));
  notifyLocalDataUpdated();
}

export function deleteSubmittedReport(reportId) {
  const savedReports = getSubmittedReportsFromBrowser();
  const remainingReports = savedReports.filter(
    (savedReport) => savedReport.reportId !== reportId,
  );

  localStorage.setItem(REPORT_SUBMISSIONS_KEY, JSON.stringify(remainingReports));
  deleteReportEngagement(reportId);
  notifyLocalDataUpdated();
}

export function deleteReportEngagement(reportId) {
  const savedReactions = getSavedReportReactions();
  const savedComments = getSavedReportComments();

  delete savedReactions[reportId];
  delete savedComments[reportId];

  saveReportReactions(savedReactions);
  saveReportComments(savedComments);
}

export function searchReports(reports, query) {
  const cleanQuery = query.trim().toLowerCase();
  const queryDigits = getDigitsOnly(cleanQuery);
  const queryTokens = cleanQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  if (!cleanQuery) {
    return [];
  }

  return reports.filter((report) => {
    const searchableValues = [
      report.title,
      report.fraudCategory,
      report.location,
      report.story,
      report.preventionAdvice,
      report.phoneOrPaymentNumber,
      report.facebookLink,
      report.websiteLink,
      report.businessName,
      report.paymentMethod,
    ].filter(Boolean);
    const searchableText = searchableValues.join(" ").toLowerCase();
    const searchableDigits = getDigitsOnly(searchableText);
    const directMatch = searchableText.includes(cleanQuery);
    const digitMatch =
      queryDigits.length >= 6 && searchableDigits.includes(queryDigits);
    const tokenMatch =
      queryTokens.length > 0 &&
      queryTokens.every((token) => searchableText.includes(token));

    return directMatch || digitMatch || tokenMatch;
  });
}

export function getEntityType(report) {
  if (report.phoneOrPaymentNumber) {
    return "Phone or Payment Number";
  }

  if (report.facebookLink) {
    return "Facebook Page";
  }

  if (report.websiteLink) {
    return "Website";
  }

  if (report.businessName) {
    return "Business";
  }

  return "Unknown";
}

export function getSavedReportReactions() {
  return readJsonObject(REPORT_REACTIONS_KEY);
}

export function saveReportReactions(reactions) {
  localStorage.setItem(REPORT_REACTIONS_KEY, JSON.stringify(reactions));
  notifyLocalDataUpdated();
}

export function getSavedReportComments() {
  return readJsonObject(REPORT_COMMENTS_KEY);
}

export function saveReportComments(comments) {
  localStorage.setItem(REPORT_COMMENTS_KEY, JSON.stringify(comments));
  notifyLocalDataUpdated();
}

export function normalizeSubmittedReport(report) {
  const safeReport = report || {};

  return {
    ...safeReport,
    riskLevel: safeReport.riskLevel || estimateReportRiskLevel(safeReport),
    reportsCount: Number(safeReport.reportsCount) || 1,
    reporterName: safeReport.reporterName || "Community member",
    reporterRole: safeReport.reporterRole || "Reporter",
    reporterEmail: safeReport.reporterEmail || "",
    ownerName: safeReport.ownerName || safeReport.reporterName || "",
    ownerEmail: safeReport.ownerEmail || safeReport.reporterEmail || "",
    isAnonymous: Boolean(safeReport.isAnonymous),
  };
}

export function getRiskStyle(riskLevel) {
  if (riskLevel === "High Risk") {
    return "bg-red-100 text-red-600";
  }

  if (riskLevel === "Medium Risk") {
    return "bg-orange-100 text-orange-600";
  }

  return "bg-green-100 text-green-600";
}

export function getRiskRank(riskLevel) {
  if (riskLevel === "High Risk") {
    return 3;
  }

  if (riskLevel === "Medium Risk") {
    return 2;
  }

  return 1;
}

export function getPrimaryIdentifier(report) {
  return (
    report.phoneOrPaymentNumber ||
    report.facebookLink ||
    report.websiteLink ||
    report.businessName ||
    "Identifier not available"
  );
}

export function maskIdentifier(identifier) {
  const cleanIdentifier = String(identifier || "");

  if (cleanIdentifier.length < 8 || cleanIdentifier.includes(".")) {
    return cleanIdentifier;
  }

  return `${cleanIdentifier.slice(0, 5)}****${cleanIdentifier.slice(-3)}`;
}

export function getDigitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function estimateReportRiskLevel(report) {
  if (report.moneyStatus === "Yes, I lost money") {
    return "High Risk";
  }

  if (report.moneyStatus === "No, but they asked for money") {
    return "Medium Risk";
  }

  return "Low Risk";
}

function isValidReportShape(report) {
  return Boolean(report && typeof report === "object" && report.reportId);
}
