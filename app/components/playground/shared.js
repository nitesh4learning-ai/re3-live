"use client";
// Shared theme, constants, and reusable components for the Playground UI.

export const THEME = {
  bg: "#1E293B",
  bgSection: "#273549",
  bgSurface: "#334155",
  bgHover: "#3B4D66",
  border: "#475569",
  borderLight: "#334155",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  accent: "#9333EA",
  accentLight: "#A855F7",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  cyan: "#06B6D4",
  fontUI: "'DM Sans', 'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
};

// ── StatusBadge ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  done: { color: THEME.success, label: "Done" },
  completed: { color: THEME.success, label: "Done" },
  running: { color: THEME.cyan, label: "Running" },
  active: { color: THEME.cyan, label: "Running" },
  pending: { color: THEME.textMuted, label: "Pending" },
  failed: { color: THEME.error, label: "Failed" },
  skipped: { color: THEME.textMuted, label: "Skipped" },
  idle: { color: THEME.textMuted, label: "Idle" },
};

export function StatusBadge({ status, size = "default" }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const fs = size === "small" ? 11 : 13;
  const pad = size === "small" ? "2px 8px" : "3px 10px";

  return (
    <span
      style={{
        fontSize: fs,
        fontWeight: 600,
        color: c.color,
        background: `${c.color}15`,
        padding: pad,
        borderRadius: 6,
        fontFamily: THEME.fontMono,
        letterSpacing: "0.02em",
      }}
    >
      {c.label}
    </span>
  );
}

// ── ExpandButton (+/−) ───────────────────────────────────────────────

export function ExpandButton({ expanded, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: expanded ? `${THEME.accent}15` : `${THEME.textMuted}10`,
        border: `1px solid ${expanded ? THEME.accent + "30" : THEME.border}`,
        borderRadius: 6,
        cursor: "pointer",
        transition: "all 0.2s",
        color: expanded ? THEME.accentLight : THEME.textSecondary,
        fontSize: 16,
        fontWeight: 700,
        flexShrink: 0,
        padding: 0,
        lineHeight: 1,
      }}
    >
      {expanded ? "\u2212" : "+"}
    </button>
  );
}

// ── SectionHeader ────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, rightContent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: THEME.text,
            fontFamily: THEME.fontUI,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 15,
              color: THEME.textSecondary,
              margin: "4px 0 0",
              fontFamily: THEME.fontUI,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {rightContent}
    </div>
  );
}

// ── Stat pill for headers ────────────────────────────────────────────

export function StatPill({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        background: `${color || THEME.textMuted}10`,
        borderRadius: 8,
        border: `1px solid ${color || THEME.textMuted}20`,
      }}
    >
      <span style={{ fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: color || THEME.text, fontFamily: THEME.fontMono }}>
        {value}
      </span>
    </div>
  );
}
