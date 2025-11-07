/**
 * Admin token management for frontend
 * Stores token in sessionStorage after successful admin login
 */

const ADMIN_TOKEN_KEY = "admin_api_token";

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  }
  return null;
}

export function clearAdminToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminHeaders(): HeadersInit {
  const token = getAdminToken();
  if (!token) {
    return {};
  }
  return {
    "x-admin-token": token,
  };
}

