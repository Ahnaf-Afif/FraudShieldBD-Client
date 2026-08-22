import { readJsonObject } from "./browserStorage";

export const DEMO_SESSION_KEY = "fraudshield-demo-session";
export const DEMO_SESSION_UPDATED_EVENT = "fraudshield-demo-session-updated";

export function getDemoSession() {
  const parsedSession = readJsonObject(DEMO_SESSION_KEY, null);

  if (!isValidDemoSession(parsedSession)) {
    return null;
  }

  return normalizeDemoSession(parsedSession);
}

export function saveDemoSession(user) {
  if (!user?.email) {
    return null;
  }

  const session = {
    id: user.id || user._id || "",
    name: user.name || getNameFromEmail(user.email),
    email: user.email.trim().toLowerCase(),
    role: user.role || "Community Member",
    signedInAt: new Date().toLocaleString(),
  };

  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(DEMO_SESSION_UPDATED_EVENT));

  return session;
}

export function updateDemoSession(updates) {
  const currentSession = getDemoSession();

  if (!currentSession) {
    return null;
  }

  const nextSession = {
    ...currentSession,
    ...updates,
    name: updates.name || currentSession.name,
    role: updates.role || currentSession.role,
    email: currentSession.email,
    updatedAt: new Date().toLocaleString(),
  };

  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(nextSession));
  window.dispatchEvent(new Event(DEMO_SESSION_UPDATED_EVENT));

  return nextSession;
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem("fraudshield-token");
  window.dispatchEvent(new Event(DEMO_SESSION_UPDATED_EVENT));
}

export function getInitials(nameOrEmail) {
  const cleanValue = String(nameOrEmail || "").trim();

  if (!cleanValue) {
    return "U";
  }

  const nameParts = cleanValue
    .replace(/@.*/, "")
    .split(/\s+|[._-]+/)
    .filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
}

export function createDemoAuthor(session) {
  if (!session) {
    return {
      name: "Guest member",
      email: "",
      role: "Guest",
      initials: "G",
    };
  }

  return {
    name: session.name,
    email: session.email,
    role: session.role,
    initials: getInitials(session.name || session.email),
  };
}

function getNameFromEmail(email) {
  return String(email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((namePart) => `${namePart[0].toUpperCase()}${namePart.slice(1)}`)
    .join(" ");
}

function isValidDemoSession(session) {
  return Boolean(session && typeof session.email === "string" && session.email.trim());
}

function normalizeDemoSession(session) {
  return {
    ...session,
    name: session.name || getNameFromEmail(session.email),
    email: session.email.trim().toLowerCase(),
    role: session.role || "Community Member",
  };
}
