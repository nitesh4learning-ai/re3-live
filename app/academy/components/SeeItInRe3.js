"use client";
import { GIM } from "../constants";

export default function SeeItInRe3({ text, targetPage, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate && onNavigate(targetPage)}
      className="w-full rounded-xl p-3 mb-4 flex items-center gap-3 transition-all hover:shadow-sm text-left"
      style={{ background: GIM.primaryLight, border: '1px solid rgba(147,51,234,0.15)' }}
    >
      <span style={{ fontSize: 18 }} aria-hidden="true">{'\uD83D\uDD17'}</span>
      <div className="flex-1">
        <span className="font-semibold" style={{ fontSize: 12, color: GIM.primary, fontFamily: GIM.fontMain }}>
          See It In Re{'\u00b3'}
        </span>
        <p style={{ fontSize: 12, color: GIM.bodyText, marginTop: 2, fontFamily: GIM.fontMain }}>{text}</p>
      </div>
      <span style={{ fontSize: 14, color: GIM.primary }} aria-hidden="true">{'\u2192'}</span>
    </button>
  );
}
