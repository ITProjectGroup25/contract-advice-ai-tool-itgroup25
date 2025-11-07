/**
 * Simple API authentication for admin endpoints
 * Checks for X-Admin-Token header
 */
import { NextRequest, NextResponse } from "next/server";

export function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  const validToken = process.env.ADMIN_API_TOKEN;

  if (!validToken) {
    console.warn("⚠️ ADMIN_API_TOKEN not set - API endpoints are unprotected!");
    return false;
  }

  return token === validToken;
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing admin token" },
      { status: 401 }
    );
  }
  return null; // No error, proceed
}

