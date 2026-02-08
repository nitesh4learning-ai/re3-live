import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const hasFirebase = !!process.env.FIREBASE_PROJECT_ID;
  const hasFirebaseClient = !!process.env.REACT_APP_FIREBASE_API_KEY;
  
  return NextResponse.json({
    status: "ok",
    env: {
      anthropic_key: hasKey ? "set (" + process.env.ANTHROPIC_API_KEY.slice(0, 8) + "...)" : "MISSING",
      firebase_project: hasFirebase ? process.env.FIREBASE_PROJECT_ID : "MISSING",
      firebase_client: hasFirebaseClient ? "set" : "MISSING",
    },
  });
}
