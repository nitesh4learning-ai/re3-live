"use client";
import { useState } from "react";
import { GIM } from "../constants";

export default function MessageSimulator({ messages = [], title = "See how it works" }) {
  const [step, setStep] = useState(0);
  const visible = messages.slice(0, step + 1);

  return (
    <div
      className="rounded-xl border overflow-hidden mb-4"
      style={{ borderColor: GIM.border, background: GIM.cardBg }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${GIM.border}` }}
      >
        <span className="font-semibold" style={{ fontSize: 13, color: GIM.headingText, fontFamily: GIM.fontMain }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: GIM.mutedText }}>Step {step + 1} of {messages.length}</span>
      </div>
      <div className="p-4 space-y-3" aria-live="polite">
        {visible.map((msg, i) => (
          <div
            key={i}
            className="flex items-start gap-3"
            style={{ opacity: i === step ? 1 : 0.6, transition: 'opacity 0.3s' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{
                background: msg.role === 'user' ? GIM.primaryBadge : '#EBF5F1',
                color: msg.role === 'user' ? GIM.primary : '#2D8A6E',
                fontSize: 10,
              }}
              aria-hidden="true"
            >
              {msg.role === 'user' ? 'U' : msg.role === 'system' ? 'S' : 'AI'}
            </div>
            <div>
              <span className="text-xs font-semibold" style={{ color: msg.role === 'user' ? GIM.primary : '#2D8A6E' }}>
                {msg.label || msg.role}
              </span>
              <p style={{ fontSize: 13, color: GIM.bodyText, lineHeight: 1.6, marginTop: 2, fontFamily: GIM.fontMain }}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-3 py-1.5 rounded-lg font-medium text-xs"
          style={{ background: GIM.borderLight, color: step === 0 ? GIM.mutedText : GIM.bodyText }}
        >
          Back
        </button>
        <button
          onClick={() => setStep(Math.min(messages.length - 1, step + 1))}
          disabled={step === messages.length - 1}
          className="px-3 py-1.5 rounded-lg font-medium text-xs"
          style={{
            background: step === messages.length - 1 ? GIM.borderLight : GIM.primary,
            color: step === messages.length - 1 ? GIM.mutedText : 'white',
          }}
        >
          Next Step
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep(0)}
            className="px-3 py-1.5 rounded-lg font-medium text-xs"
            style={{ background: 'transparent', color: GIM.mutedText }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
