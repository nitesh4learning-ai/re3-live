// API route middleware: auth + rate-limit + validation in one wrapper.
// Eliminates boilerplate repeated across all POST API routes.
//
// Usage:
//   import { createHandler } from "../../../../lib/api-handler";
//   import { SelectInputSchema } from "../../../../lib/schemas";
//
//   export const POST = createHandler(SelectInputSchema, async (body, user) => {
//     // ... business logic only
//     return NextResponse.json({ result });
//   });

import { getAuthUser } from "./auth";
import { llmRateLimit } from "./rate-limit";
import { validateInput } from "./schemas";
import { NextResponse } from "next/server";

export function createHandler(schema, handler, options = {}) {
  const { allowGuest = false, rateLimit = true } = options;

  return async function POST(req) {
    try {
      const { user, error, status } = await getAuthUser(req, { allowGuest });
      if (error) return NextResponse.json({ error }, { status });

      if (rateLimit) {
        const { allowed } = await llmRateLimit.check(user.uid);
        if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }

      let body = {};
      if (schema) {
        const raw = await req.json();
        const { data, error: inputError, status: inputStatus } = validateInput(raw, schema);
        if (inputError) return NextResponse.json({ error: inputError }, { status: inputStatus });
        body = data;
      }

      return await handler(body, user);
    } catch (e) {
      console.error("API error:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  };
}
