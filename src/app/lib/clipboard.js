export async function copyTextToClipboard(text) {
  const safeText = String(text || "");

  if (!safeText) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(safeText);
    return true;
  }

  const temporaryInput = document.createElement("textarea");

  temporaryInput.value = safeText;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();
  document.execCommand("copy");
  document.body.removeChild(temporaryInput);

  return true;
}

export async function shareOrCopyLink({ title, text, url }) {
  const safeUrl = String(url || "");

  if (!safeUrl) {
    return "failed";
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title || "FraudShield BD report",
        text: text || "Check this FraudShield BD report.",
        url: safeUrl,
      });

      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyTextToClipboard(safeUrl);

  return "copied";
}
