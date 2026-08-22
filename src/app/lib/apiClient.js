const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

export async function apiRequest(path, options = {}) {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("fraudshield-token") || "";

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The server request failed.");
  }

  return data;
}

export function getApiUrl() {
  return API_URL;
}

export async function syncWatchlistItem(item) {
  if (typeof window === "undefined" || !window.localStorage.getItem("fraudshield-token")) {
    return null;
  }

  return apiRequest("/watchlist", {
    method: "POST",
    body: JSON.stringify({
      identifier: item.identifier,
      type: item.type,
      riskLevel: item.riskLevel,
      reportId: item.reportId,
      title: item.title,
    }),
  });
}

function isApiReportId(reportId) {
  return /^[a-f\d]{24}$/i.test(String(reportId || ""));
}

export function syncReportLike(reportId) {
  if (!isApiReportId(reportId)) {
    return Promise.resolve(null);
  }

  return apiRequest(`/reports/${reportId}/like`, { method: "POST" });
}

export function syncReportComment(reportId, text) {
  if (!isApiReportId(reportId)) {
    return Promise.resolve(null);
  }

  return apiRequest(`/reports/${reportId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
