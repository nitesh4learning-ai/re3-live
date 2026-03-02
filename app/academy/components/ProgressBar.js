"use client";
import { GIM } from "../constants";

export default function ProgressBar({ percent, size = 'md' }) {
  const h = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(percent)}% complete`}
      style={{ height: h, background: GIM.borderLight }}
    >
      <div
        className="rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          height: '100%',
          background: GIM.primary,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}
