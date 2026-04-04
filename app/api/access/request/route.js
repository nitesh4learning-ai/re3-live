// API: POST /api/access/request — logged-in user requests access to a feature
import { getAuthUser } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const { feature } = await req.json();
    if (!["arena", "loom_extras"].includes(feature)) {
      return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    // Check for existing pending request
    const existing = await db.collection("access_requests")
      .where("userId", "==", user.uid)
      .where("feature", "==", feature)
      .where("status", "==", "pending")
      .get();

    if (!existing.empty) {
      return NextResponse.json({ message: "Request already pending", requestId: existing.docs[0].id });
    }

    const docRef = await db.collection("access_requests").add({
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.email,
      feature,
      status: "pending",
      requestedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
    });

    return NextResponse.json({ requestId: docRef.id, status: "pending" });
  } catch (e) {
    console.error("Access request error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
