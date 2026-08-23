const configuredApiUrl =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_URL = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

export async function apiRequest(path, options = {}) {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("fraudshield-token") || "";

  let response;
  const requestController = options.signal ? null : new AbortController();
  let didTimeout = false;
  const timeoutId = requestController
    ? setTimeout(() => {
        didTimeout = true;
        requestController.abort();
      }, 30000)
    : null;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal || requestController.signal,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (didTimeout) {
      throw new Error("The request timed out. Please try again shortly.");
    }

    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error("The FraudShield server is unavailable. Please try again shortly.");
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (_error) {
    data = responseText.trim() ? { message: responseText.trim() } : {};
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("fraudshield-token");
      window.dispatchEvent(new Event("fraudshield-auth-invalid"));
    }

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

export function deleteWatchlistItem(itemId) {
  if (!/^[a-f\d]{24}$/i.test(String(itemId || ""))) {
    return Promise.resolve(null);
  }

  return apiRequest(`/watchlist/${itemId}`, { method: "DELETE" });
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

export function updateReportComment(reportId, commentId, text) {
  return apiRequest(`/reports/${reportId}/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ text }),
  });
}

export function deleteReportComment(reportId, commentId) {
  return apiRequest(`/reports/${reportId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export function uploadEvidenceFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/uploads", {
    method: "POST",
    body: formData,
  });
}
