// Academy Review Board API
// Ada orchestrates a 3-agent review board for a course.
// Selects relevant agents from the registry, generates pre-baked reviews.

import { NextResponse } from "next/server";
import { callLLM } from "../../../../lib/llm-router";
import registryData from "../../../../public/agents-registry.json";

/**
 * Select 3 diverse reviewers from the agent registry based on course content.
 * Picks agents with high critique/research scores and diverse cognitive styles.
 */
function selectReviewers(courseId, courseTitle) {
  const allAgents = [];
  for (const domain of registryData.domains || []) {
    for (const spec of domain.specializations || []) {
      for (const agent of spec.agents || []) {
        allAgents.push({ ...agent, domain: domain.name, specialization: spec.name });
      }
    }
  }

  // Score agents by relevance to the course topic + critique/research capability
  const courseTerms = (courseId + " " + courseTitle).toLowerCase().split(/[\s\-_]+/);
  const scored = allAgents.map((agent) => {
    let score = 0;
    const name = (agent.name || "").toLowerCase();
    const persona = (agent.persona || "").toLowerCase();
    const domain = (agent.domain || "").toLowerCase();
    const spec = (agent.specialization || "").toLowerCase();

    // Topic relevance
    for (const term of courseTerms) {
      if (term.length < 3) continue;
      if (name.includes(term)) score += 10;
      if (domain.includes(term)) score += 8;
      if (spec.includes(term)) score += 8;
      if (persona.includes(term)) score += 4;
    }

    // Critique and research capability boost
    const caps = agent.capabilities || {};
    score += (caps.critique || 0) * 3;
    score += (caps.research || 0) * 2;
    score += (caps.synthesize || 0) * 1;

    return { agent, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick top 3 with diverse cognitive styles (avoid all same disposition)
  const selected = [];
  const dispositionCounts = {};
  for (const { agent } of scored) {
    if (selected.length >= 3) break;
    const disp = agent.cognitiveStyle?.disposition || "neutral";
    // Allow at most 2 of the same disposition
    if ((dispositionCounts[disp] || 0) >= 2) continue;
    selected.push(agent);
    dispositionCounts[disp] = (dispositionCounts[disp] || 0) + 1;
  }

  // If we still don't have 3, just fill from the top
  if (selected.length < 3) {
    for (const { agent } of scored) {
      if (selected.length >= 3) break;
      if (!selected.find((s) => s.id === agent.id)) {
        selected.push(agent);
      }
    }
  }

  return selected;
}

export async function POST(req) {
  try {
    const { courseId, courseTitle } = await req.json();
    if (!courseId || !courseTitle) {
      return NextResponse.json({ error: "Missing courseId or courseTitle" }, { status: 400 });
    }

    // Ada selects the review board
    const reviewers = selectReviewers(courseId, courseTitle);

    // Generate reviews from each agent
    const systemPrompt = `You are Ada, an AI Academy curator. You orchestrate review boards where 3 expert agents review educational courses.

Generate a JSON response for a review board of the course: "${courseTitle}" (ID: ${courseId}).

You have selected these 3 reviewers:
${reviewers.map((r, i) => `${i + 1}. ${r.name} — ${r.persona?.slice(0, 100) || "Expert reviewer"}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "reviews": [
    {
      "agentId": "agent_id",
      "agentName": "Agent Name",
      "avatar": "2-char avatar",
      "color": "#hexcolor",
      "domain": "domain name",
      "rating": 4,
      "comment": "2-3 sentence review of the course content, teaching approach, and practical value. Be specific and constructive.",
      "strengths": ["strength1", "strength2"]
    }
  ],
  "summary": "1-2 sentence consensus summary of the review board's assessment."
}

Rules:
- Each review should be 2-3 sentences, specific to the course topic
- Ratings should be 3-5 (these are good courses)
- Each reviewer should highlight different strengths
- The summary should capture the board's consensus
- Be educational and constructive, not generic`;

    const userMessage = `Generate the review board for "${courseTitle}". The 3 reviewers are: ${reviewers.map((r) => r.name).join(", ")}.

Use these exact agent details:
${reviewers.map((r) => `- ID: ${r.id}, Name: ${r.name}, Avatar: ${r.avatar || r.name?.slice(0, 2)?.toUpperCase()}, Color: ${r.color || "#6B7280"}, Domain: ${r.domain || "General"}`).join("\n")}`;

    const raw = await callLLM("anthropic", systemPrompt, userMessage, {
      maxTokens: 1200,
      timeout: 25000,
      tier: "light",
    });

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse review response" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);

    // Ensure reviews have the agent metadata from our selection
    if (data.reviews) {
      data.reviews = data.reviews.map((review, i) => {
        const agent = reviewers[i];
        return {
          ...review,
          agentId: agent?.id || review.agentId,
          agentName: agent?.name || review.agentName,
          avatar: agent?.avatar || review.avatar,
          color: agent?.color || review.color,
          domain: agent?.domain || review.domain,
        };
      });
    }

    data.generatedAt = Date.now();
    data.courseId = courseId;

    return NextResponse.json(data);
  } catch (e) {
    console.error("Academy review error:", e);
    return NextResponse.json({ error: e.message || "Review generation failed" }, { status: 500 });
  }
}
