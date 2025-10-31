const EMAIL_REGEX =
  // Basic email validation; matches most common addresses without being overly strict.
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const USER_EMAIL_KEYS = [
  "email",
  "Email",
  "Email Address",
  "emailAddress",
  "contactEmail",
  "contact email",
  "your email",
  "your email address",
  "user email",
  "userEmail",
  "primary email",
  "primaryEmail",
] as const;

export const USER_NAME_KEYS = [
  "name",
  "Name",
  "full name",
  "fullName",
  "contact name",
  "contactName",
  "your name",
  "yourName",
  "user name",
  "userName",
] as const;

export const GRANT_TEAM_EMAIL_KEYS = [
  "grant team email",
  "grant team emails",
  "grant-team-email",
  "grant-team-emails",
  "grant contact email",
  "grant contact emails",
  "grant-team contact email",
  "grants team email",
  "grant escalation email",
  "grant escalation emails",
  "escalation email",
  "escalation emails",
  "notification email",
  "notification emails",
] as const;

export const GRANT_TEAM_SELECTION_KEYS = [
  "grant team",
  "grant teams",
  "grants team",
  "selected grant team",
  "selected grant teams",
] as const;

type FormLikeData = Record<string, unknown>;

const normaliseKey = (key: string): string => key.trim().toLowerCase();

const createNormalisedLookup = (formData?: FormLikeData | null): Map<string, unknown> => {
  const map = new Map<string, unknown>();
  if (!formData || typeof formData !== "object") {
    return map;
  }

  Object.entries(formData).forEach(([key, value]) => {
    if (typeof key !== "string") {
      return;
    }
    const normalised = normaliseKey(key);
    if (!map.has(normalised)) {
      map.set(normalised, value);
    }
  });

  return map;
};

const extractStrings = (value: unknown): string[] => {
  if (!value && value !== 0) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    const results: string[] = [];
    for (const item of value) {
      results.push(...extractStrings(item));
    }
    return results;
  }

  return [];
};

export const resolveFieldStrings = (
  formData: FormLikeData | null | undefined,
  keys: readonly string[]
): string[] => {
  if (!formData) {
    return [];
  }

  const normalised = createNormalisedLookup(formData);
  const results: string[] = [];
  const seen = new Set<string>();

  for (const key of keys) {
    const trimmedKey = key.trim();
    if (!trimmedKey) continue;

    const exactValue = (formData as FormLikeData)[trimmedKey];
    const fallbackValue = normalised.get(normaliseKey(trimmedKey));
    const candidates = exactValue !== undefined ? exactValue : fallbackValue;

    for (const entry of extractStrings(candidates)) {
      if (!seen.has(entry)) {
        seen.add(entry);
        results.push(entry);
      }
    }
  }

  return results;
};

export const resolveFieldString = (
  formData: FormLikeData | null | undefined,
  keys: readonly string[]
): string | undefined => {
  const [first] = resolveFieldStrings(formData, keys);
  return first;
};

export const resolveEmailList = (
  formData: FormLikeData | null | undefined,
  keys: readonly string[]
): string[] => {
  const rawValues = resolveFieldStrings(formData, keys);
  const emails = new Set<string>();

  for (const raw of rawValues) {
    const parts = raw
      .split(/[,;]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (EMAIL_REGEX.test(part)) {
        emails.add(part);
      }
    }
  }

  return Array.from(emails);
};

export const mergeUniqueStrings = (...valueSets: Array<string[] | undefined>): string[] => {
  const seen = new Set<string>();
  for (const valueSet of valueSets) {
    if (!valueSet) continue;
    for (const value of valueSet) {
      if (value && !seen.has(value)) {
        seen.add(value);
      }
    }
  }
  return Array.from(seen);
};
