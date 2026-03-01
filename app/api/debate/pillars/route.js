import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

// Default color palette for dynamic pillars (up to 4)
const PILLAR_COLORS = [
  { color: "#3B6B9B", gradient: "linear-gradient(135deg,#3B6B9B,#6B9FCE)", lightBg: "#E3F2FD" },
  { color: "#E8734A", gradient: "linear-gradient(135deg,#E8734A,#F4A261)", lightBg: "#FFF3E0" },
  { color: "#2D8A6E", gradient: "linear-gradient(135deg,#2D8A6E,#5CC4A0)", lightBg: "#E8F5E9" },
  { color: "#8B5CF6", gradient: "linear-gradient(135deg,#8B5CF6,#A78BFA)", lightBg: "#F5F3FF" },
];

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { topic, context } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const response = await callLLM(
      "anthropic",
      "You are Sage, the intellectual architect of Re³. Given a topic, you identify the 3 most meaningful lenses through which to explore it. Each lens should represent a genuinely distinct dimension of the topic — not just relabeling, but fundamentally different ways of seeing.",
      `Topic: "${topic}"
${context ? `Context: ${context.slice(0, 1500)}` : ""}

Generate exactly 3 pillars (lenses) for exploring this topic. Each pillar should:
1. Represent a distinct intellectual dimension (not just a subtopic)
2. Create productive tension with the other pillars
3. Have a short, memorable label (1-2 words)
4. Have a brief tagline explaining the lens (under 10 words)

Also generate a through-line question that connects all 3 pillars.

Respond in JSON only:
{
  "pillars": [
    { "label": "Pillar Name", "tagline": "Brief description of this lens" },
    { "label": "Pillar Name", "tagline": "Brief description of this lens" },
    { "label": "Pillar Name", "tagline": "Brief description of this lens" }
  ],
  "throughLine": "The unifying question connecting all three lenses?"
}`,
      { maxTokens: 500, timeout: 20000, tier: "light" }
    );

    // Parse response
    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch { /* fallback below */ }

    if (!parsed?.pillars?.length) {
      // Fallback to classic pillars
      return NextResponse.json({
        pillars: [
          { key: "pillar_1", label: "Rethink", tagline: "Deconstruct assumptions. See what others miss.", ...PILLAR_COLORS[0], number: "01" },
          { key: "pillar_2", label: "Rediscover", tagline: "Find hidden patterns across domains.", ...PILLAR_COLORS[1], number: "02" },
          { key: "pillar_3", label: "Reinvent", tagline: "Prototype the future. Build what's next.", ...PILLAR_COLORS[2], number: "03" },
        ],
        throughLine: `What does "${topic}" reveal about how we think?`,
      });
    }

    // Assign colors and keys to generated pillars
    const pillars = parsed.pillars.slice(0, 4).map((p, i) => ({
      key: `pillar_${i + 1}`,
      label: p.label,
      tagline: p.tagline,
      ...PILLAR_COLORS[i % PILLAR_COLORS.length],
      number: String(i + 1).padStart(2, "0"),
    }));

    return NextResponse.json({
      pillars,
      throughLine: parsed.throughLine || `How do these perspectives reshape our understanding of "${topic}"?`,
    });
  } catch (e) {
    console.error("Pillar generation error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
