"use client";
import { useState } from "react";
import { GIM } from "../constants";

export default function ArchitectureDecision({ scenario, options = [], correctIndex, explanation, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const correct = selected === correctIndex;

  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i);
    if (onAnswer) onAnswer(i === correctIndex);
  };

  return (
    <fieldset
      className="rounded-xl border p-4 mb-4"
      style={{
        borderColor: answered ? (correct ? '#2D8A6E' : '#EF4444') : GIM.border,
        background: GIM.cardBg,
      }}
    >
      <legend className="sr-only">Architecture decision</legend>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 16 }} aria-hidden="true">{'\uD83C\uDFD7\uFE0F'}</span>
        <span className="font-semibold" style={{ fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain }}>
          Architecture Decision
        </span>
      </div>
      <p className="mb-4" style={{ fontSize: 13, color: GIM.bodyText, lineHeight: 1.6, fontFamily: GIM.fontMain }}>
        {scenario}
      </p>
      <div className="space-y-2" role="radiogroup" aria-label={scenario}>
        {options.map((opt, i) => {
          const isC = i === correctIndex;
          const isS = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              role="radio"
              aria-checked={isS}
              aria-disabled={answered}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                borderColor: answered ? (isC ? '#2D8A6E' : isS ? '#EF4444' : GIM.borderLight) : GIM.border,
                background: answered ? (isC ? '#EBF5F1' : isS ? '#FEF2F2' : 'white') : 'white',
                cursor: answered ? 'default' : 'pointer',
              }}
            >
              <div
                className="font-semibold mb-1"
                style={{ fontSize: 13, color: answered ? (isC ? '#2D8A6E' : isS ? '#EF4444' : GIM.headingText) : GIM.headingText }}
              >
                {opt.label}
                {answered && isC && ' \u2713'}
              </div>
              <p style={{ fontSize: 12, color: GIM.mutedText }}>{opt.tradeoff}</p>
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          className="mt-3 p-3 rounded-lg"
          role="alert"
          style={{
            background: correct ? '#EBF5F1' : '#FEF2F2',
            color: correct ? '#166534' : '#991B1B',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {correct ? '\u2705 Correct! ' : '\u274C Not quite. '}
          {explanation}
        </div>
      )}
    </fieldset>
  );
}
