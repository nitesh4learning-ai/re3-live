// Single server-authoritative source of truth for admin identity.
// This is the REAL gate: the admin API routes (and any other server code) decide
// admin access via isAdminEmail() here. Configure via the ADMIN_EMAILS env var
// (comma-separated). ADMIN_EMAILS is NOT a NEXT_PUBLIC var, so it is never shipped
// to the browser. Falls back to the built-in defaults below when unset.
//
// Client UI uses a separate, client-safe check (NEXT_PUBLIC_ADMIN_EMAILS) in
// app/constants/ui.js — that one is UX only and is NOT a security boundary.
const DEFAULT_ADMIN_EMAILS = ["nitesh4learning@gmail.com", "einsteinrethink@gmail.com"];

export const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : DEFAULT_ADMIN_EMAILS
)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  return typeof email === "string" && ADMIN_EMAILS.includes(email.toLowerCase());
}
