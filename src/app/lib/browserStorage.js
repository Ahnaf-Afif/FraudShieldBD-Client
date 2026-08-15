export function readJsonArray(key, fallback = []) {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      localStorage.removeItem(key);
      return fallback;
    }

    return parsedValue;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function readJsonObject(key, fallback = {}) {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    if (
      !parsedValue ||
      Array.isArray(parsedValue) ||
      typeof parsedValue !== "object"
    ) {
      localStorage.removeItem(key);
      return fallback;
    }

    return parsedValue;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function readJsonValue(key, fallback = null) {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallback;
  }

  try {
    return JSON.parse(savedValue);
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    localStorage.removeItem(key);
    return fallback;
  }
}
