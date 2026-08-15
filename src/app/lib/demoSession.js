export const DEMO_SESSION_KEY = "fraudshield-demo-session";
export const DEMO_SESSION_UPDATED_EVENT = "fraudshield-demo-session-updated";

export function getDemoSession() {
  const savedSession = localStorage.getItem(DEMO_SESSION_KEY);

  if (!savedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(savedSession);

    if (!parsedSession || !parsedSession.email) {
      return null;
    }

    return parsedSession;
  } catch (error) {
    console.error("Could not load demo session:", error);
    localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

export function saveDemoSession(user) {
  const session = {
    name: user.name || getNameFromEmail(user.email),
    email: user.email,
    role: user.role || "Community Member",
    signedInAt: new Date().toLocaleString(),
  };

  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(DEMO_SESSION_UPDATED_EVENT));

  return session;
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
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

function getNameFromEmail(email) {
  return String(email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((namePart) => `${namePart[0].toUpperCase()}${namePart.slice(1)}`)
    .join(" ");
}
