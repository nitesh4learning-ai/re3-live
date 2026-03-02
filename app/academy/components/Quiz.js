"use client";
import { useState } from "react";
import { GIM } from "../constants";

export default function Quiz({ question, options = [], correctIndex, explanation, onAnswer }) {
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
      <legend className="sr-only">Quiz question</legend>
      <p
        className="font-semibold mb-3"
        style={{ fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain, lineHeight: 1.5 }}
      >
        <span style={{ color: GIM.primary, marginRight: 6 }}>Q.</span>
        {question}
      </p>
      <div className="space-y-2" role="radiogroup" aria-label={question}>
        {options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={answered}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                borderColor: answered
                  ? (isCorrect ? '#2D8A6E' : isSelected ? '#EF4444' : GIM.borderLight)
                  : isSelected ? GIM.primary : GIM.border,
                background: answered
                  ? (isCorrect ? '#EBF5F1' : isSelected ? '#FEF2F2' : 'white')
                  : 'white',
                color: GIM.bodyText,
                fontSize: 13,
                fontFamily: GIM.fontMain,
                cursor: answered ? 'default' : 'pointer',
              }}
            >
              <span
                className="font-medium"
                style={{
                  color: answered
                    ? (isCorrect ? '#2D8A6E' : isSelected ? '#EF4444' : GIM.bodyText)
                    : GIM.bodyText,
                }}
              >
                {String.fromCharCode(65 + i)}.
              </span>{' '}
              {opt}
              {answered && isCorrect && <span style={{ marginLeft: 8, color: '#2D8A6E' }}>{'\u2713'}</span>}
              {answered && isSelected && !isCorrect && <span style={{ marginLeft: 8, color: '#EF4444' }}>{'\u2717'}</span>}
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
            fontFamily: GIM.fontMain,
          }}
        >
          {correct ? '\u2705 Correct! ' : '\u274C Not quite. '}
          {explanation}
        </div>
      )}
    </fieldset>
  );
}
