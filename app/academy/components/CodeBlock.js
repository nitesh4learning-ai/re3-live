"use client";
import { useState, useMemo } from "react";
import { CODE_BG, CODE_TEXT } from "../constants";

export default function CodeBlock({ code, children, b64, language = 'text', label = null, title = null }) {
  // Support multiple ways to pass code content:
  // 1. b64 prop: base64-encoded code (MDX v3 safe - no curly brace issues)
  // 2. code prop: direct string (works when no curlies in code)
  // 3. children: JSX children (works when no curlies in code)
  const codeContent = useMemo(() => {
    if (b64) {
      try { return atob(b64); } catch { return ''; }
    }
    if (code) return code;
    if (typeof children === 'string') return children;
    return '';
  }, [b64, code, children]);

  const displayLabel = label || title || language;
  const [copied, setCopied] = useState(false);

  const doCopy = () => {
    navigator.clipboard.writeText(codeContent).then(() => {
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
          {(displayLabel).toUpperCase()}
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
        <code>{codeContent}</code>
      </pre>
    </div>
  );
}
