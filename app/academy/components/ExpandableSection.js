"use client";
import { useState, useId } from "react";
import { GIM } from "../constants";

export default function ExpandableSection({ title, children, defaultOpen = false, icon = null }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      className="rounded-xl border overflow-hidden mb-3"
      style={{ borderColor: GIM.border, background: GIM.cardBg }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        aria-expanded={open}
        aria-controls={contentId}
        style={{ fontFamily: GIM.fontMain }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFA'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex items-center gap-2">
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <span className="font-semibold" style={{ fontSize: 14, color: GIM.headingText }}>
            {title}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            color: GIM.mutedText,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        >
          {'\u25BC'}
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        style={{
          maxHeight: open ? 5000 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out',
        }}
      >
        <div
          className="px-4 pb-4"
          style={{ color: GIM.bodyText, fontSize: 14, lineHeight: 1.8, fontFamily: GIM.fontMain }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
