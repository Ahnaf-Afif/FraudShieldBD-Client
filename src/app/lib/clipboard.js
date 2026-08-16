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
