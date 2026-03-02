"use client";
import { GIM } from "../constants";

export default function AnalogyBox({ emoji, title, children }) {
  return (
    <div
      className="rounded-xl border p-4 mb-4 flex items-start gap-3"
      role="note"
      aria-label={`Analogy: ${title}`}
      style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }} aria-hidden="true">{emoji}</span>
      <div>
        <span className="font-semibold" style={{ fontSize: 13, color: '#92400E', fontFamily: GIM.fontMain }}>
          {title}
        </span>
        <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6, marginTop: 4, fontFamily: GIM.fontMain }}>
          {children}
        </p>
      </div>
    </div>
  );
}
