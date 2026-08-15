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
];

export function getSubmittedReportsFromBrowser() {
  const savedReports = localStorage.getItem(REPORT_SUBMISSIONS_KEY);

  if (!savedReports) {
    return [];
  }

  try {
    const parsedReports = JSON.parse(savedReports);

    if (!Array.isArray(parsedReports)) {
      return [];
    }

    return parsedReports;
  } catch (error) {
    console.error("Could not load submitted reports:", error);
    return [];
  }
}

export function getSavedReportDraftFromBrowser() {
  const savedDraft = localStorage.getItem(REPORT_DRAFT_KEY);

  if (!savedDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(savedDraft);

    if (!parsedDraft || !parsedDraft.reportId) {
      return null;
    }

    return normalizeSubmittedReport(parsedDraft);
  } catch (error) {
    console.error("Could not load report draft:", error);
    return null;
  }
}

export function getAllReportsForBrowser() {
  const submittedReports = getSubmittedReportsFromBrowser().map(
    normalizeSubmittedReport,
  );

  return [...submittedReports, ...demoReports];
}

export function saveSubmittedReport(newReport) {
  const savedReports = getSubmittedReportsFromBrowser();
  const reportsWithoutCurrentReport = savedReports.filter(
    (savedReport) => savedReport.reportId !== newReport.reportId,
  );
  const updatedReports = [newReport, ...reportsWithoutCurrentReport];

  localStorage.setItem(REPORT_SUBMISSIONS_KEY, JSON.stringify(updatedReports));
}

export function deleteSubmittedReport(reportId) {
  const savedReports = getSubmittedReportsFromBrowser();
  const remainingReports = savedReports.filter(
    (savedReport) => savedReport.reportId !== reportId,
  );

  localStorage.setItem(REPORT_SUBMISSIONS_KEY, JSON.stringify(remainingReports));
  deleteReportEngagement(reportId);
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
  const savedReactions = localStorage.getItem(REPORT_REACTIONS_KEY);

  if (!savedReactions) {
    return {};
  }

  try {
    const parsedReactions = JSON.parse(savedReactions);

    if (!parsedReactions || Array.isArray(parsedReactions)) {
      return {};
    }

    return parsedReactions;
  } catch (error) {
    console.error("Could not load report reactions:", error);
    return {};
  }
}

export function saveReportReactions(reactions) {
  localStorage.setItem(REPORT_REACTIONS_KEY, JSON.stringify(reactions));
}

export function getSavedReportComments() {
  const savedComments = localStorage.getItem(REPORT_COMMENTS_KEY);

  if (!savedComments) {
    return {};
  }

  try {
    const parsedComments = JSON.parse(savedComments);

    if (!parsedComments || Array.isArray(parsedComments)) {
      return {};
    }

    return parsedComments;
  } catch (error) {
    console.error("Could not load report comments:", error);
    return {};
  }
}

export function saveReportComments(comments) {
  localStorage.setItem(REPORT_COMMENTS_KEY, JSON.stringify(comments));
}

export function normalizeSubmittedReport(report) {
  return {
    ...report,
    riskLevel: report.riskLevel || estimateReportRiskLevel(report),
    reportsCount: report.reportsCount || 1,
    reporterName: report.reporterName || "Community member",
    reporterRole: report.reporterRole || "Reporter",
    reporterEmail: report.reporterEmail || "",
    ownerName: report.ownerName || report.reporterName || "",
    ownerEmail: report.ownerEmail || report.reporterEmail || "",
    isAnonymous: Boolean(report.isAnonymous),
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
  if (identifier.length < 8 || identifier.includes(".")) {
    return identifier;
  }

  return `${identifier.slice(0, 5)}****${identifier.slice(-3)}`;
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
