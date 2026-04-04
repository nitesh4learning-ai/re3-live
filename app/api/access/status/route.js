// API: GET /api/access/status — check current user's access permissions
import { getAuthUser } from "../../../../lib/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "nitesh4learning@gmail.com";

export async function GET(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });

    // Admin has full access
    if (user.email === ADMIN_EMAIL) {
      return NextResponse.json({
        access: { arena: true, loom_extras: true },
        requests: [],
        isAdmin: true,
      });
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const snapshot = await db.collection("access_requests")
      .where("userId", "==", user.uid)
      .get();

    const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const access = {
      arena: requests.some(r => r.feature === "arena" && r.status === "approved"),
      loom_extras: requests.some(r => r.feature === "loom_extras" && r.status === "approved"),
    };

    return NextResponse.json({ access, requests, isAdmin: false });
  } catch (e) {
    console.error("Access status error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
