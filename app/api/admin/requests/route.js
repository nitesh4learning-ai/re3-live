// API: GET/POST /api/admin/requests — admin manages access requests
import { getAuthUser } from "../../../../lib/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "nitesh4learning@gmail.com";

export async function GET(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const snapshot = await db.collection("access_requests")
      .orderBy("requestedAt", "desc")
      .limit(100)
      .get();

    const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Also fetch registered users
    const usersSnapshot = await db.collection("users").limit(100).get();
    const users = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ requests, users });
  } catch (e) {
    console.error("Admin requests error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId, action } = await req.json();
    if (!requestId || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    await db.collection("access_requests").doc(requestId).update({
      status: action === "approve" ? "approved" : "denied",
      resolvedAt: new Date().toISOString(),
      resolvedBy: user.email,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin action error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
