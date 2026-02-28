"use client";
import { useEffect, useRef, useState } from "react";

// Renders Mermaid.js diagrams inline using the CDN-loaded mermaid library.
// Falls back to a copyable code block if rendering fails.
let mermaidLoaded = false;
let mermaidLoadPromise = null;

function loadMermaid() {
  if (mermaidLoaded) return Promise.resolve();
  if (mermaidLoadPromise) return mermaidLoadPromise;
  mermaidLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");
    if (window.mermaid) { mermaidLoaded = true; return resolve(); }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    s.onload = () => {
      window.mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
      mermaidLoaded = true;
      resolve();
    };
    s.onerror = () => reject("Failed to load Mermaid");
    document.head.appendChild(s);
  });
  return mermaidLoadPromise;
}

export default function MermaidDiagram({ code, title }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [rendered, setRendered] = useState(false);
  const idRef = useRef("mermaid-" + Math.random().toString(36).slice(2, 9));

  useEffect(() => {
    if (!code || typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      try {
        await loadMermaid();
        if (cancelled || !containerRef.current) return;
        // Clean the code — remove any markdown fencing
        let clean = code.trim();
        if (clean.startsWith("```")) clean = clean.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
        const { svg } = await window.mermaid.render(idRef.current, clean);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Diagram render failed");
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (!code) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {title && (
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#6B7280", marginBottom: 8, textTransform: "uppercase" }}>
          {title}
        </div>
      )}
      {/* Rendered diagram */}
      <div
        ref={containerRef}
        style={{
          background: "#FAFAFA",
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: 16,
          overflow: "auto",
          minHeight: 60,
          display: rendered ? "block" : "none",
        }}
      />
      {/* Fallback: code block */}
      {(error || !rendered) && (
        <pre style={{
          background: "#1E1E2E",
          color: "#CDD6F4",
          padding: 16,
          borderRadius: 10,
          fontSize: 12,
          lineHeight: 1.6,
          overflow: "auto",
          maxHeight: 300,
          fontFamily: "'JetBrains Mono', monospace",
          display: rendered ? "none" : "block",
        }}>
          {error && <div style={{ color: "#F38BA8", marginBottom: 8, fontSize: 11 }}>Render failed: {error}. Showing source:</div>}
          {code}
        </pre>
      )}
    </div>
  );
}
