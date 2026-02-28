"use client";
import { useState, useRef, useEffect } from "react";

// Renders a React+Tailwind component in a sandboxed iframe.
// The component code is injected into an HTML page with React + Tailwind CDN.
export default function PrototypeSandbox({ code, componentName, description }) {
  const iframeRef = useRef(null);
  const [tab, setTab] = useState("preview"); // "preview" | "code"
  const [copied, setCopied] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(500);

  // Build the HTML document for the iframe
  const buildHTML = () => {
    if (!code) return "";
    // Clean code — remove markdown fences if present
    let clean = code.trim();
    if (clean.startsWith("```")) clean = clean.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();

    // Ensure we have a valid component name
    const name = componentName || "Prototype";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
  <style>
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #F9FAFB; }
    #root { min-height: 100vh; }
    .error-display { padding: 24px; color: #EF4444; font-size: 14px; font-family: monospace; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    try {
      ${clean}

      // Try to find the component — check default export or named export
      const Component = typeof ${name} !== 'undefined' ? ${name} : (typeof App !== 'undefined' ? App : (typeof Prototype !== 'undefined' ? Prototype : null));

      if (Component) {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
      } else {
        document.getElementById('root').innerHTML = '<div class="error-display">Component "${name}" not found. Check the export.</div>';
      }

      // Notify parent of content height
      const sendHeight = () => {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 're3-prototype-height', height: h }, '*');
      };
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 500);
      new ResizeObserver(sendHeight).observe(document.body);
    } catch (e) {
      document.getElementById('root').innerHTML = '<div class="error-display">Error: ' + e.message + '</div>';
    }
  <\/script>
</body>
</html>`;
  };

  // Listen for height messages from iframe
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "re3-prototype-height" && e.data.height) {
        setIframeHeight(Math.min(Math.max(e.data.height + 20, 300), 800));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#6B7280", textTransform: "uppercase" }}>
            INTERACTIVE PROTOTYPE
          </div>
          {description && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{description}</div>}
        </div>
        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 2 }}>
          {[["preview", "Preview"], ["code", "Code"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: tab === id ? "#FFFFFF" : "transparent",
                color: tab === id ? "#9333EA" : "#6B7280",
                boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview tab — sandboxed iframe */}
      {tab === "preview" && (
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", background: "#FFFFFF" }}>
          <iframe
            ref={iframeRef}
            srcDoc={buildHTML()}
            sandbox="allow-scripts"
            style={{
              width: "100%",
              height: iframeHeight,
              border: "none",
              display: "block",
            }}
            title="Prototype Preview"
          />
        </div>
      )}

      {/* Code tab */}
      {tab === "code" && (
        <div style={{ position: "relative" }}>
          <button
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
              color: copied ? "#6EE7B7" : "#CDD6F4",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            {copied ? "\u2713 Copied" : "Copy"}
          </button>
          <pre style={{
            background: "#1E1E2E",
            color: "#CDD6F4",
            padding: 20,
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.6,
            overflow: "auto",
            maxHeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
