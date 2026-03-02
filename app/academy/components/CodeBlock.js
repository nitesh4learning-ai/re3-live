"use client";
import { useState } from "react";
import { CODE_BG, CODE_TEXT } from "../constants";

export default function CodeBlock({ code, language = 'text', label = null }) {
  const [copied, setCopied] = useState(false);

  const doCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: CODE_BG }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#64748B',
            fontFamily: 'monospace',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {(label || language).toUpperCase()}
        </span>
        <button
          onClick={doCopy}
          className="px-2 py-0.5 rounded text-xs font-medium transition-colors"
          style={{
            color: copied ? '#86EFAC' : '#64748B',
            background: 'rgba(255,255,255,0.05)',
          }}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        className="p-4 overflow-x-auto"
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          color: CODE_TEXT,
          fontFamily: "'Consolas','Fira Code',monospace",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
