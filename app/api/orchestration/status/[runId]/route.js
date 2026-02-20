// GET /api/orchestration/status/[runId]
// Poll the status of an orchestration run.
// Returns current Blackboard snapshot, budget, and status.

import { getRunStatus, listRuns } from "../../../../../lib/orchestration/engine.js";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { runId } = params;

    // Special case: list all runs
    if (runId === "list") {
      return NextResponse.json({ runs: listRuns() });
    }

    const status = getRunStatus(runId);
    if (!status) {
      return NextResponse.json(
        { error: `Run ${runId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (err) {
    console.error("Status check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
