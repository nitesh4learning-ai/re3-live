// Handshake — Context curation and agent-to-agent output passing protocol.
// Ensures each agent gets exactly the right context without burning tokens.

import { readFromBoard, getBoardSummary } from "./blackboard.js";

/**
 * Curate a context package for a specific agent based on its role and position.
 * Implements cost-conscious consciousness: relevance filtering + progressive context.
 *
 * @param {object} board - Blackboard
 * @param {object} agent - Agent profile
 * @param {object} task - Current task being executed
 * @param {object[]} allTasks - All tasks in the workflow
 * @returns {object} Context package { upstreamOutputs, boardSummary, budgetStatus }
 */
export function curateContextPackage(board, agent, task, allTasks) {
  // 1. Get upstream outputs (only from direct dependencies)
  const upstreamOutputs = {};
  for (const depId of task.dependsOn || []) {
    const output = readFromBoard(board, `${depId}.output`);
    if (output) {
      const depTask = allTasks.find((t) => t.id === depId);
      upstreamOutputs[depId] = {
        taskTitle: depTask?.title || depId,
        output: summarizeOutput(output, 1000),
      };
    }
  }

  // 2. Board summary (what exists, not the full content)
  const boardSummary = getBoardSummary(board);

  // 3. Budget status (so agents can be cost-aware)
  const budgetStatus = {
    status: board.status,
    completedTasks: Object.keys(board.state).filter((k) =>
      k.endsWith(".output")
    ).length,
    totalTasks: allTasks.length,
  };

  return { upstreamOutputs, boardSummary, budgetStatus };
}

/**
 * Summarize an output to fit within a token budget.
 * For long outputs, extract the first and last sections.
 *
 * @param {string|object} output
 * @param {number} maxChars - Maximum character length
 * @returns {string}
 */
function summarizeOutput(output, maxChars = 1000) {
  const text =
    typeof output === "string" ? output : JSON.stringify(output, null, 2);

  if (text.length <= maxChars) return text;

  // Take first 70% and last 30% with ellipsis
  const headLen = Math.floor(maxChars * 0.7);
  const tailLen = maxChars - headLen - 20;
  return (
    text.slice(0, headLen) + "\n\n[... truncated ...]\n\n" + text.slice(-tailLen)
  );
}

/**
 * Format a handshake payload for the synthesis agent.
 * The synthesis agent gets a comprehensive view of all outputs.
 *
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks
 * @param {object[]} results - Execution results
 * @returns {string} Formatted synthesis input
 */
export function formatSynthesisInput(board, allTasks, results) {
  const sections = [];

  for (const task of allTasks) {
    const output = readFromBoard(board, `${task.id}.output`);
    const result = results.find((r) => r.taskId === task.id);

    if (result?.status === "completed" && output) {
      sections.push(
        `## ${task.title} (${task.id})\nAgent: ${result.agentName}\n\n${summarizeOutput(output, 1500)}`
      );
    } else if (result?.status === "failed") {
      sections.push(
        `## ${task.title} (${task.id})\nStatus: FAILED — ${result.error || "unknown error"}`
      );
    }
  }

  return sections.join("\n\n---\n\n");
}

/**
 * Parse the synthesis output into structured sections.
 * Uses a multi-strategy approach:
 *   1. Extract prototype code from ===PROTOTYPE_CODE=== delimiters (kept outside JSON to avoid escaping issues)
 *   2. Parse the remaining JSON for metadata, blueprint, recommendations, report
 *   3. If JSON parse fails, attempt to salvage the "code" field and re-parse
 *   4. Final fallback: regex extraction of individual fields
 *
 * @param {string} text - Raw synthesis output
 * @returns {object|null} Parsed structure or null
 */
function parseSynthesisOutput(text) {
  // Step 1: Extract prototype code from delimiters (new two-section format)
  let prototypeCode = null;
  let textWithoutCode = text;
  const codeMatch = text.match(/===PROTOTYPE_CODE===\s*\n?([\s\S]*?)\n?\s*===END_PROTOTYPE_CODE===/);
  if (codeMatch) {
    prototypeCode = codeMatch[1].trim();
    textWithoutCode = text.replace(codeMatch[0], "").trim();
  }

  // Step 2: Parse JSON from the remaining text
  let structured = null;

  // Strategy A: Direct JSON.parse on extracted JSON block
  try {
    const jsonMatch = textWithoutCode.match(/\{[\s\S]*\}/);
    if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
  } catch {
    structured = null;
  }

  // Strategy B: If Strategy A failed and no delimiter code was found,
  // the LLM may have put code inside JSON (old format). Extract it manually
  // using position-based parsing to avoid JSON escaping issues.
  if (!structured && !prototypeCode) {
    try {
      const fullJson = text.match(/\{[\s\S]*\}/)?.[0];
      if (fullJson) {
        const { cleaned, code } = extractCodeFromJson(fullJson);
        if (code) prototypeCode = code;
        structured = JSON.parse(cleaned);
      }
    } catch {
      structured = null;
    }
  }

  // Strategy C: Final fallback — regex field extraction
  if (!structured) {
    structured = regexExtractFields(text);
  }

  // Attach extracted prototype code
  if (structured && prototypeCode) {
    if (!structured.prototype) structured.prototype = {};
    structured.prototype.code = prototypeCode;
  }

  return structured;
}

/**
 * Extract the "code" field value from a JSON string using character-level parsing.
 * This handles cases where the code value contains improperly escaped characters
 * that break JSON.parse. We replace the code value with a safe placeholder,
 * making the rest of the JSON parseable.
 *
 * @param {string} json - Raw JSON string
 * @returns {{ cleaned: string, code: string|null }}
 */
function extractCodeFromJson(json) {
  const codeKeyIdx = json.indexOf('"code"');
  if (codeKeyIdx === -1) return { cleaned: json, code: null };

  const colonIdx = json.indexOf(":", codeKeyIdx + 6);
  if (colonIdx === -1) return { cleaned: json, code: null };

  // Find opening quote of the value (skip whitespace)
  let startQuote = -1;
  for (let i = colonIdx + 1; i < json.length; i++) {
    if (json[i] === '"') { startQuote = i; break; }
    if (json[i] !== " " && json[i] !== "\t" && json[i] !== "\n" && json[i] !== "\r") break;
  }
  if (startQuote === -1) return { cleaned: json, code: null };

  // Walk forward to find the closing quote. Track escape sequences.
  // Also handle literal (unescaped) newlines that LLMs sometimes produce.
  let pos = startQuote + 1;
  const codeChars = [];
  while (pos < json.length) {
    const ch = json[pos];
    if (ch === "\\" && pos + 1 < json.length) {
      // Escape sequence — consume both characters
      const next = json[pos + 1];
      if (next === "n") codeChars.push("\n");
      else if (next === "t") codeChars.push("\t");
      else if (next === '"') codeChars.push('"');
      else if (next === "\\") codeChars.push("\\");
      else { codeChars.push(ch, next); }
      pos += 2;
    } else if (ch === '"') {
      // Possible end of string. Verify by checking if what follows looks like
      // valid JSON continuation (comma, closing brace, whitespace then comma/brace).
      const after = json.slice(pos + 1, pos + 20).trimStart();
      if (after[0] === "," || after[0] === "}" || after[0] === "]" || after.length === 0) {
        break; // This is the real closing quote
      }
      // Otherwise it's an unescaped quote inside the code — keep it
      codeChars.push('"');
      pos++;
    } else {
      codeChars.push(ch);
      pos++;
    }
  }

  const code = codeChars.join("");
  const cleaned = json.slice(0, startQuote) + '"__CODE_EXTRACTED__"' + json.slice(pos + 1);
  return { cleaned, code };
}

/**
 * Last-resort regex extraction of individual fields from raw synthesis text.
 * Handles cases where the entire JSON is malformed.
 *
 * @param {string} text - Raw synthesis text
 * @returns {object|null}
 */
function regexExtractFields(text) {
  // Extract simple string fields
  const extractStr = (key) => {
    const m = text.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\") : null;
  };

  // Extract array of strings
  const extractArr = (key) => {
    const m = text.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*?)\\]`));
    if (!m) return null;
    const items = [];
    const itemRe = /"((?:[^"\\]|\\.)*)"/g;
    let match;
    while ((match = itemRe.exec(m[1])) !== null) {
      items.push(match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'));
    }
    return items.length > 0 ? items : null;
  };

  const summary = extractStr("executive_summary");
  const report = extractStr("full_report");
  const seqDiagram = extractStr("sequence_diagram");
  const erd = extractStr("erd");

  // Need at least a summary or report to consider this valid
  if (!summary && !report) return null;

  return {
    executive_summary: summary,
    full_report: report,
    blueprint: (seqDiagram || erd) ? {
      sequence_diagram: seqDiagram,
      erd: erd,
      technical_constraints: extractArr("technical_constraints"),
      api_integrations: extractArr("api_integrations"),
    } : null,
    prototype: {
      component_name: extractStr("component_name"),
      description: extractStr("description"),
    },
    recommendations: extractArr("recommendations"),
  };
}

/**
 * Build the final deliverable structure from synthesis output and metadata.
 *
 * @param {object} board - Blackboard
 * @param {string} synthesisText - Output from synthesis agent
 * @param {object[]} results - All execution results
 * @param {object} budget - BudgetTracker
 * @returns {object} Final deliverable
 */
export function buildDeliverable(board, synthesisText, results, budget) {
  const completedCount = results.filter((r) => r.status === "completed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  const structured = parseSynthesisOutput(synthesisText);

  return {
    runId: board.runId,
    useCase: board.useCase,
    // Keep raw text for backward compat; structured sections below
    deliverable: structured?.full_report || structured?.executive_summary || synthesisText,
    // Structured deliverable sections
    blueprint: structured?.blueprint || null,
    prototype: structured?.prototype?.code ? structured.prototype : null,
    executiveSummary: structured?.executive_summary || null,
    recommendations: structured?.recommendations || null,
    team: board.team,
    taskResults: results.map((r) => ({
      taskId: r.taskId,
      agentId: r.agentId,
      agentName: r.agentName,
      status: r.status,
      error: r.error || null,
    })),
    metrics: {
      completedTasks: completedCount,
      failedTasks: failedCount,
      totalTasks: results.length,
      successRate:
        results.length > 0
          ? Math.round((completedCount / results.length) * 100)
          : 0,
      budget: budget?.toJSON() || null,
      elapsedMs: Date.now() - board.createdAt,
    },
    completedAt: Date.now(),
  };
}
