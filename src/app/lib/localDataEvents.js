export const LOCAL_DATA_UPDATED_EVENT = "fraudshield-local-data-updated";

export function notifyLocalDataUpdated() {
  window.dispatchEvent(new Event(LOCAL_DATA_UPDATED_EVENT));
}
