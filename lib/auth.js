// Server-side Firebase auth verification for API routes
// Verifies ID tokens from Authorization: Bearer <token> header
// Lazy-loads firebase-admin to avoid build-time initialization errors

let _adminInitialized = false;

async function ensureAdminInit() {
  if (_adminInitialized) return;
  try {
    // Dynamic import to avoid build-time side effects
    await import("./firebase-admin");
    _adminInitialized = true;
  } catch (e) {
    console.warn("Firebase Admin init failed:", e.message);
  }
}

/**
 * Extract and verify Firebase ID token from request.
 * @param {Request} request - Next.js API request
 * @returns {Promise<{user: {uid: string, email: string, name: string}|null, error: string|null, status: number}>}
 */
export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "Missing or invalid Authorization header", status: 401 };
    }

    const token = authHeader.slice(7); // Remove "Bearer "
    if (!token) {
      return { user: null, error: "Empty token", status: 401 };
    }

    // Ensure firebase-admin is initialized (lazy)
    await ensureAdminInit();

    const { getAuth } = await import("firebase-admin/auth");
    const { getApps } = await import("firebase-admin/app");

    if (!getApps().length) {
      return { user: null, error: "Firebase Admin not initialized", status: 500 };
    }

    const decoded = await getAuth().verifyIdToken(token);
    return {
      user: {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
      },
      error: null,
      status: 200,
    };
  } catch (e) {
    // Token expired, invalid, or revoked
    if (e.code === "auth/id-token-expired") {
      return { user: null, error: "Token expired", status: 401 };
    }
    if (e.code === "auth/id-token-revoked") {
      return { user: null, error: "Token revoked", status: 401 };
    }
    if (e.code === "auth/argument-error") {
      return { user: null, error: "Invalid token format", status: 401 };
    }
    console.error("Auth verification error:", e.message);
    return { user: null, error: "Authentication failed", status: 401 };
  }
}
