import { NextResponse } from "next/server";

const COLLECTION = "counters";
const DOC_ID = "site_visits";
const INITIAL_COUNT = 1000;

export async function POST() {
  try {
    const { adminDb } = await import("../../../lib/firebase-admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const ref = adminDb.collection(COLLECTION).doc(DOC_ID);
    const snap = await ref.get();

    if (!snap.exists) {
      const count = INITIAL_COUNT + 1;
      await ref.set({ count });
      return NextResponse.json({ count });
    }

    await ref.update({ count: FieldValue.increment(1) });
    const updated = await ref.get();
    return NextResponse.json({ count: updated.data().count });
  } catch (error) {
    console.error("Visit counter error:", error);
    return NextResponse.json({ error: "Failed to update visit count" }, { status: 500 });
  }
}
