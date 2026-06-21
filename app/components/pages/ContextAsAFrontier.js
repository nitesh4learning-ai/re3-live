"use client";
// Context as a Frontier — CodeMesh Series, Paper 01 / 03.
// First in-house piece of work, served at /work/context-as-a-frontier.
//
// Ported 1:1 from the original standalone HTML. This page keeps its OWN visual
// identity (navy / teal / amber, Space Grotesk + Inter + JetBrains Mono) rather
// than the Re³ design system — by design. To avoid leaking that identity into
// the rest of the app, every selector is scoped under `.caf-root` (including the
// generic tag rules and the class rules lifted out of the inline SVG <style>
// blocks). The hero's top padding includes a +56px offset to clear the app's
// fixed header.
//
// Structure: MAIN sections (hero → golden outcome), then an EXTENSION SLOT, then
// the CLOSE + footer. A future interactive engine (use case → tailored tech list
// + roadmap through the six stages) drops into the extension slot below the
// framework content without restructuring the rest.
import { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "../../providers";
import {
  CONTEXT_SPINE,
  CONTEXT_COMPREHENSION_TYPE,
} from "../../../lib/orchestration/context-spine";

const CAF_CSS = `
.caf-root{
  --navy:#0A2540; --navy-2:#0E2E4D; --teal:#1C7293; --teal-lt:#3D9AB8;
  --amber:#F5A623; --amber-soft:#FBC56B; --slate:#334155; --muted:#64748B;
  --line:#CBD5E1; --panel:#F8FAFC; --paper:#FFFFFF; --dim:#94A3B8;
  font-family:'Inter',system-ui,sans-serif;color:var(--slate);background:var(--paper);line-height:1.6;-webkit-font-smoothing:antialiased;
}
.caf-root *{box-sizing:border-box;margin:0;padding:0}
.caf-root .wrap{max-width:1080px;margin:0 auto;padding:0 32px}
.caf-root .eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--teal)}
.caf-root h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(40px,6.5vw,76px);line-height:1.02;color:var(--navy);letter-spacing:-.02em}
.caf-root h2{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(26px,3.6vw,40px);line-height:1.1;color:var(--navy);letter-spacing:-.015em}
.caf-root h3{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:20px;color:var(--navy)}
.caf-root .lede{font-size:clamp(17px,2vw,21px);line-height:1.5;color:var(--slate);max-width:62ch}
.caf-root .band{padding:96px 0}
.caf-root .band-tight{padding:64px 0}
.caf-root .band-navy{background:var(--navy);color:#CBD8E6}
.caf-root .band-navy h2,.caf-root .band-navy h3{color:#fff}
.caf-root .band-navy .eyebrow{color:var(--amber)}
.caf-root .band-panel{background:var(--panel)}
.caf-root .hero{background:radial-gradient(1200px 500px at 78% 18%, rgba(245,166,35,.10), transparent 60%),radial-gradient(900px 600px at 10% 90%, rgba(28,114,147,.14), transparent 55%),var(--navy);color:#CBD8E6;padding:140px 0 72px;overflow:hidden}
.caf-root .hero h1{color:#fff;margin:18px 0 22px}
.caf-root .hero .lede{color:#AFC2D6;max-width:60ch}
.caf-root .hero-art{margin-top:46px}
.caf-root .hero-cap{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:.04em;color:#7F94AB;text-align:center;margin-top:14px}
.caf-root .points{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:44px}
.caf-root .point{border-top:2px solid var(--teal);padding-top:18px}
.caf-root .point .n{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--teal);font-weight:700}
.caf-root .point h3{margin:8px 0 8px;font-size:18px}
.caf-root .point p{font-size:15px;color:var(--slate);line-height:1.55}
.caf-root .kicker-line{margin-top:52px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(19px,2.4vw,26px);line-height:1.35;color:var(--navy);max-width:32ch}
.caf-root .kicker-line b{color:var(--teal);font-weight:600}
.caf-root .spine-intro{max-width:60ch;margin-top:14px;color:#AFC2D6}
.caf-root .spine-art{margin:50px 0 8px}
.caf-root .stages{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);border:1px solid var(--line);margin-top:48px;border-radius:10px;overflow:hidden}
.caf-root .stage{background:var(--paper);padding:30px 30px 32px;position:relative;transition:background .2s}
.caf-root .stage:hover{background:#FCFDFE}
.caf-root .stage .num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--amber);letter-spacing:.08em}
.caf-root .stage .name{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:21px;color:var(--navy);margin:6px 0 4px;display:flex;align-items:center;gap:12px}
.caf-root .stage .q{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--teal);margin-bottom:12px;letter-spacing:.01em}
.caf-root .stage p{font-size:15px;line-height:1.58;color:var(--slate)}
.caf-root .stage .move{margin-top:14px;font-size:13.5px;color:var(--muted);border-left:2px solid var(--amber);padding-left:12px;line-height:1.5}
.caf-root .stage .move b{color:var(--navy);font-weight:600}
.caf-root .glyph{flex:0 0 auto}
.caf-root .gold-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;margin-top:18px}
.caf-root .gold-copy p{font-size:17px;line-height:1.6;color:#CBD8E6;margin-top:18px;max-width:48ch}
.caf-root .gold-copy p b{color:#fff;font-weight:600}
.caf-root .gold-def{margin-top:26px;border:1px solid rgba(245,166,35,.35);border-radius:10px;padding:20px 22px;background:rgba(245,166,35,.06)}
.caf-root .gold-def .lbl{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--amber);margin-bottom:8px}
.caf-root .gold-def p{font-family:'Space Grotesk',sans-serif;font-size:18px;line-height:1.45;color:#fff;margin:0;font-weight:500}
.caf-root .close{text-align:center;padding:104px 0}
.caf-root .close p{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(22px,3.2vw,34px);line-height:1.3;color:var(--navy);max-width:22ch;margin:0 auto;letter-spacing:-.01em}
.caf-root .close p b{color:var(--teal)}
.caf-root footer{border-top:1px solid var(--line);padding:30px 0;background:var(--panel)}
.caf-root .foot-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.04em;color:var(--muted)}
.caf-root .reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease}
.caf-root .reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.caf-root .reveal{opacity:1;transform:none;transition:none}}
@media (max-width:820px){.caf-root .points{grid-template-columns:1fr;gap:22px}.caf-root .stages{grid-template-columns:1fr}.caf-root .gold-grid{grid-template-columns:1fr;gap:32px}.caf-root .band{padding:64px 0}.caf-root .wrap{padding:0 22px}}
.caf-root svg{display:block;width:100%;height:auto}
.caf-root svg.glyph{width:22px !important;height:22px !important;flex:0 0 auto}
.caf-root .lbl{font-family:'JetBrains Mono',monospace;font-size:11px;fill:#9DB1C7;letter-spacing:.04em}
.caf-root .chip{font-family:'JetBrains Mono',monospace;font-size:11px;fill:#9DB1C7;letter-spacing:.06em}
.caf-root .zone{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase}
.caf-root .sn{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;fill:#F5A623;letter-spacing:.06em}
.caf-root .st{font-family:'Space Grotesk',sans-serif;font-size:14.5px;font-weight:600;fill:#fff}
.caf-root .sq{font-family:'JetBrains Mono',monospace;font-size:10px;fill:#7F94AB;letter-spacing:.02em}
.caf-root .ring-lbl{font-family:'JetBrains Mono',monospace;font-size:11px;fill:#AFC2D6;letter-spacing:.06em}
.caf-root .ctr-lbl{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;fill:#F5A623}
.caf-root .cap2{font-family:'JetBrains Mono',monospace;font-size:10.5px;fill:#6F86A0;letter-spacing:.04em}

/* ── Interactive "Apply this framework" engine ── */
.caf-root .apply-intro{max-width:60ch;margin-top:14px;color:var(--slate)}
.caf-root .apply-form{margin-top:30px}
.caf-root .apply-ta{width:100%;min-height:130px;resize:vertical;font-family:'Inter',sans-serif;font-size:16px;line-height:1.55;color:var(--navy);background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;outline:none;transition:border-color .2s,box-shadow .2s}
.caf-root .apply-ta:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(28,114,147,.12)}
.caf-root .apply-ta::placeholder{color:var(--dim)}
.caf-root .apply-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:16px}
.caf-root .apply-btn{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:#fff;background:var(--teal);border:none;border-radius:999px;padding:12px 26px;cursor:pointer;transition:background .2s,transform .1s,opacity .2s}
.caf-root .apply-btn:hover:not(:disabled){background:#155C79}
.caf-root .apply-btn:active:not(:disabled){transform:translateY(1px)}
.caf-root .apply-btn:disabled{opacity:.55;cursor:not-allowed}
.caf-root .apply-hint{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--muted);letter-spacing:.02em}
.caf-root .apply-err{margin-top:16px;border-left:3px solid #C5562E;background:rgba(197,86,46,.06);color:#9A3F1E;padding:12px 16px;border-radius:0 8px 8px 0;font-size:14px}
.caf-root .apply-status{margin-top:26px;display:flex;align-items:center;gap:12px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.06em;color:var(--teal);text-transform:uppercase}
.caf-root .apply-spinner{width:13px;height:13px;border:2px solid rgba(28,114,147,.25);border-top-color:var(--teal);border-radius:50%;animation:caf-spin .8s linear infinite}
@keyframes caf-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.caf-root .apply-spinner{animation:none}}
.caf-root .stage-results{margin-top:34px;display:grid;gap:16px}
.caf-root .sr-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:22px 24px;transition:border-color .2s,box-shadow .2s}
.caf-root .sr-card.is-active{border-color:var(--teal);box-shadow:0 0 0 3px rgba(28,114,147,.10)}
.caf-root .sr-card.is-done{border-left:3px solid var(--amber)}
.caf-root .sr-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.caf-root .sr-num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--amber);letter-spacing:.08em}
.caf-root .sr-name{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:19px;color:var(--navy)}
.caf-root .sr-q{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--teal);margin-top:4px}
.caf-root .sr-persona{margin-left:auto;text-align:right;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.5;color:var(--muted)}
.caf-root .sr-persona b{color:var(--navy);font-weight:600;font-family:'Space Grotesk',sans-serif}
.caf-root .sr-state{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.caf-root .sr-body{margin-top:14px;font-size:15px;line-height:1.62;color:var(--slate);white-space:pre-wrap}
.caf-root .sr-body h3{font-family:'Space Grotesk',sans-serif;font-size:15px;color:var(--navy);margin:14px 0 6px}
.caf-root .sr-body strong{color:var(--navy);font-weight:600}
.caf-root .roadmap{margin-top:40px;border:1px solid rgba(245,166,35,.4);border-radius:14px;background:rgba(245,166,35,.05);padding:28px 28px 30px}
.caf-root .roadmap h3{font-family:'Space Grotesk',sans-serif;font-size:22px;color:var(--navy);margin-bottom:6px}
.caf-root .roadmap .rm-sum{font-size:15.5px;line-height:1.6;color:var(--slate);max-width:60ch}
.caf-root .rm-step{margin-top:20px;padding-top:18px;border-top:1px solid rgba(245,166,35,.3)}
.caf-root .rm-step:first-of-type{border-top:none}
.caf-root .rm-stage{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--teal);letter-spacing:.08em}
.caf-root .rm-obj{font-family:'Space Grotesk',sans-serif;font-size:16px;color:var(--navy);margin:4px 0 8px;font-weight:500}
.caf-root .rm-list{margin:6px 0 0 0;padding-left:18px;font-size:14.5px;line-height:1.6;color:var(--slate)}
.caf-root .rm-tools{margin-top:8px;display:flex;flex-wrap:wrap;gap:7px}
.caf-root .rm-tool{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--teal);background:rgba(28,114,147,.08);border:1px solid rgba(28,114,147,.2);border-radius:999px;padding:4px 11px}
`;

// MAIN — hero through the golden-context outcome. SVG inline <style> blocks have
// been lifted into CAF_CSS above (scoped); everything else is verbatim.
const BODY_MAIN = `
<header class="hero">
  <div class="wrap">
    <div class="paper-tag" style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.16em;color:var(--amber);text-transform:uppercase">Framework Paper — 01 / 03 · The CodeMesh Series</div>
    <h1>Context as a<br>Frontier</h1>
    <p class="lede">Enterprise context lives scattered across code, configuration, integrations, and people — drifting, conflicting, and quietly lost to attrition. A six-stage spine to derive one trusted, living source of truth that humans <em>and</em> AI agents can act on without checking it anywhere else.</p>

    <div class="hero-art reveal">
      <svg viewBox="0 0 1080 364" role="img" aria-label="Scattered sources resolving through the six-stage spine into a golden context graph">
        <defs>
          <linearGradient id="capG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2A8AAD"/><stop offset="1" stop-color="#155C79"/>
          </linearGradient>
          <radialGradient id="nodeG" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stop-color="#FBD089"/><stop offset="0.55" stop-color="#F5A623"/><stop offset="1" stop-color="#D6850C"/>
          </radialGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- zone labels -->
        <text class="zone" x="40" y="22" fill="#5E7390">Scattered sources</text>
        <text class="zone" x="452" y="22" fill="#6FB6CE">The spine</text>
        <text class="zone" x="780" y="22" fill="#F5A623">Golden context</text>

        <!-- ===== LEFT: scattered, drifting source chips ===== -->
        <g opacity="0.92">
          <!-- faint broken/conflicting connectors -->
          <path d="M138 64 L196 112" stroke="#36506E" stroke-width="1" stroke-dasharray="3 4"/>
          <path d="M96 168 L150 132" stroke="#36506E" stroke-width="1" stroke-dasharray="3 4"/>
          <path d="M104 226 L186 222" stroke="#36506E" stroke-width="1" stroke-dasharray="3 4"/>
          <!-- conflict marks -->
          <g stroke="#C5562E" stroke-width="1.6"><path d="M163 86 l8 8 M171 86 l-8 8"/></g>
          <g stroke="#C5562E" stroke-width="1.6"><path d="M141 200 l8 8 M149 200 l-8 8"/></g>

          <g transform="translate(40 48) rotate(-6)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">CODE</text></g>
          <g transform="translate(150 96) rotate(5)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">CONFIG</text></g>
          <g transform="translate(28 150) rotate(7)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">DOCS</text></g>
          <g transform="translate(160 188) rotate(-5)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">SME MEMORY</text></g>
          <g transform="translate(44 244) rotate(4)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">LINEAGE</text></g>
          <g transform="translate(158 286) rotate(-3)"><rect width="100" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="chip" x="50" y="19" text-anchor="middle">TICKETS</text></g>
        </g>

        <!-- convergence lines: chips -> spine -->
        <g stroke="#2A4A66" stroke-width="1.2" fill="none" opacity="0.8">
          <path d="M150 63 C 320 70, 380 110, 452 120"/>
          <path d="M260 111 C 360 116, 400 130, 452 150"/>
          <path d="M138 165 C 320 168, 380 168, 452 178"/>
          <path d="M270 203 C 360 200, 400 198, 452 206"/>
          <path d="M154 259 C 330 250, 390 240, 452 234"/>
          <path d="M268 301 C 360 290, 400 270, 452 262"/>
        </g>

        <!-- ===== CENTER: the spine capsule ===== -->
        <g>
          <rect x="452" y="96" width="62" height="192" rx="31" fill="url(#capG)"/>
          <rect x="452" y="96" width="62" height="192" rx="31" fill="none" stroke="#7FCBE2" stroke-opacity=".35"/>
          <g font-family="'JetBrains Mono',monospace" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">
            <circle cx="483" cy="120" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="124">1</text>
            <circle cx="483" cy="150" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="154">2</text>
            <circle cx="483" cy="180" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="184">3</text>
            <circle cx="483" cy="210" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="214">4</text>
            <circle cx="483" cy="240" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="244">5</text>
            <circle cx="483" cy="270" r="11" fill="#0E2E4D" stroke="#7FCBE2" stroke-opacity=".5"/><text x="483" y="274">6</text>
          </g>
        </g>

        <!-- emergence lines: spine -> golden graph -->
        <g stroke="#C58A2E" stroke-width="1.3" fill="none" opacity="0.85">
          <path d="M514 150 C 600 150, 660 130, 726 120"/>
          <path d="M514 192 C 610 192, 680 178, 752 176"/>
          <path d="M514 240 C 600 244, 670 240, 740 226"/>
        </g>

        <!-- ===== RIGHT: golden context graph ===== -->
        <g>
          <!-- edges -->
          <g stroke-width="1.6" fill="none">
            <path d="M845 168 L772 116" stroke="#C58A2E"/>
            <path d="M845 168 L922 110" stroke="#1C7293"/>
            <path d="M845 168 L744 184" stroke="#C58A2E"/>
            <path d="M845 168 L946 196" stroke="#1C7293"/>
            <path d="M845 168 L808 244" stroke="#C58A2E"/>
            <path d="M845 168 L912 254" stroke="#1C7293"/>
            <path d="M922 110 L996 158" stroke="#C58A2E" opacity=".8"/>
            <path d="M946 196 L996 158" stroke="#1C7293" opacity=".8"/>
            <path d="M808 244 L912 254" stroke="#1C7293" opacity=".7"/>
            <path d="M772 116 L744 184" stroke="#C58A2E" opacity=".7"/>
          </g>
          <!-- nodes -->
          <g filter="url(#glow)">
            <circle cx="845" cy="168" r="15" fill="url(#nodeG)"/>
            <circle cx="772" cy="116" r="9.5" fill="url(#nodeG)"/>
            <circle cx="922" cy="110" r="10" fill="url(#nodeG)"/>
            <circle cx="744" cy="184" r="8.5" fill="url(#nodeG)"/>
            <circle cx="946" cy="196" r="9" fill="url(#nodeG)"/>
            <circle cx="808" cy="244" r="8.5" fill="url(#nodeG)"/>
            <circle cx="912" cy="254" r="9.5" fill="url(#nodeG)"/>
            <circle cx="996" cy="158" r="8" fill="url(#nodeG)"/>
          </g>
          <text x="870" y="316" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="11.5" letter-spacing=".06em" fill="#F5A623">ONE TRUSTED, LIVING GRAPH</text>
        </g>
      </svg>
      <div class="hero-cap">many partial truths&nbsp;&nbsp;→&nbsp;&nbsp;one resolution pipeline&nbsp;&nbsp;→&nbsp;&nbsp;golden context</div>
    </div>
  </div>
</header>
<!-- ================= WHY NOW ================= -->
<section class="band band-panel">
  <div class="wrap reveal">
    <div class="eyebrow">Why context, why now</div>
    <h2 style="margin-top:14px;max-width:18ch">The bottleneck moved. Most roadmaps haven't noticed.</h2>
    <div class="points">
      <div class="point">
        <div class="n">01</div>
        <h3>Writing code stopped being the constraint</h3>
        <p>AI generates and refactors across whole repositories in seconds. Producing the change is no longer the hard part. Knowing what the system actually does — and what silently breaks when you touch it — is.</p>
      </div>
      <div class="point">
        <div class="n">02</div>
        <h3>Agents raise the stakes, not lower them</h3>
        <p>Autonomous agents act faster than a human can catch a misunderstanding. And many agents can't each hold their own private, drifting picture — they need one shared, trusted context to reason and act against.</p>
      </div>
      <div class="point">
        <div class="n">03</div>
        <h3>The clock is attrition</h3>
        <p>The people who configured the core systems are retiring. Each departure deletes context that was never written down — and you cannot re-hire your way back to it.</p>
      </div>
    </div>
    <p class="kicker-line">Context is the new frontier — and it behaves like an unsolved data problem: <b>many sources, no agreement, no authority.</b></p>
  </div>
</section>

<!-- ================= THE SPINE ================= -->
<section class="band band-navy">
  <div class="wrap reveal">
    <div class="eyebrow">The engine</div>
    <h2 style="margin-top:14px">Six stages to derive context</h2>
    <p class="spine-intro">The same sequence runs against any system. The answers differ wildly — a clean microservice versus a thirteen-year-old rebate engine — but the <em>questions</em> are identical. That invariance is what makes it teachable to a team, and executable by a machine.</p>

    <div class="spine-art">
      <svg viewBox="0 0 1080 200" role="img" aria-label="The six-stage spine: Locate, Extract, Reconstruct, Validate, Decide, Sustain, with a continuous loop back">
        <defs>
          <linearGradient id="rail" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#1C7293"/><stop offset="1" stop-color="#2A8AAD"/>
          </linearGradient>
        </defs>
        <!-- rail -->
        <line x1="86" y1="78" x2="994" y2="78" stroke="url(#rail)" stroke-width="2.5"/>
        <!-- continuous loop back -->
        <path d="M994 78 C 994 150, 900 168, 540 168 C 180 168, 86 150, 86 86" fill="none" stroke="#2A4A66" stroke-width="1.6" stroke-dasharray="5 5"/>
        <text x="540" y="190" text-anchor="middle" class="sq" fill="#5E7390" style="letter-spacing:.18em">CONTINUOUS — EVERY CHANGE RE-ENTERS THE SPINE</text>

        <!-- stations -->
        <!-- positions: 6 evenly across 86..994 -->
        <g text-anchor="middle">
          <!-- 1 LOCATE -->
          <circle cx="86" cy="78" r="13" fill="#0E2E4D" stroke="#2A8AAD" stroke-width="2"/><circle cx="86" cy="78" r="4" fill="#F5A623"/>
          <text x="86" y="36" class="sn">01</text><text x="86" y="118" class="st">Locate</text><text x="86" y="136" class="sq">where it lives</text>
          <!-- 2 EXTRACT -->
          <circle cx="268" cy="78" r="13" fill="#0E2E4D" stroke="#2A8AAD" stroke-width="2"/><circle cx="268" cy="78" r="4" fill="#F5A623"/>
          <text x="268" y="36" class="sn">02</text><text x="268" y="118" class="st">Extract</text><text x="268" y="136" class="sq">get it out → graph</text>
          <!-- 3 RECONSTRUCT -->
          <circle cx="450" cy="78" r="13" fill="#0E2E4D" stroke="#2A8AAD" stroke-width="2"/><circle cx="450" cy="78" r="4" fill="#F5A623"/>
          <text x="450" y="36" class="sn">03</text><text x="450" y="118" class="st">Reconstruct</text><text x="450" y="136" class="sq">explain the why</text>
          <!-- 4 VALIDATE -->
          <circle cx="632" cy="78" r="13" fill="#0E2E4D" stroke="#2A8AAD" stroke-width="2"/><circle cx="632" cy="78" r="4" fill="#F5A623"/>
          <text x="632" y="36" class="sn">04</text><text x="632" y="118" class="st">Validate</text><text x="632" y="136" class="sq">ground truth</text>
          <!-- 5 DECIDE -->
          <circle cx="814" cy="78" r="13" fill="#0E2E4D" stroke="#2A8AAD" stroke-width="2"/><circle cx="814" cy="78" r="4" fill="#F5A623"/>
          <text x="814" y="36" class="sn">05</text><text x="814" y="118" class="st">Decide</text><text x="814" y="136" class="sq">change the call</text>
          <!-- 6 SUSTAIN -->
          <circle cx="994" cy="78" r="13" fill="#0E2E4D" stroke="#F5A623" stroke-width="2.5"/><circle cx="994" cy="78" r="4" fill="#F5A623"/>
          <text x="994" y="36" class="sn">06</text><text x="994" y="118" class="st">Sustain</text><text x="994" y="136" class="sq">keep it golden</text>
        </g>
      </svg>
    </div>
  </div>
</section>
<!-- ================= STAGE CARDS ================= -->
<section class="band">
  <div class="wrap reveal">
    <div class="eyebrow">Stage by stage — applied to context</div>
    <h2 style="margin-top:14px;max-width:20ch">What each stage does for the truth of a system</h2>

    <div class="stages">
      <!-- 1 -->
      <div class="stage">
        <div class="num">01</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/><circle cx="12" cy="12" r="1.6" fill="#F5A623" stroke="none"/></svg>Locate</div>
        <div class="q">Where does the context actually live?</div>
        <p>Map each rule to its physical home: readable <b>code</b>, assembled <b>configuration</b>, a vendor <b>black box</b>, or the <b>motion</b> between systems. Most enterprise logic isn't in the code — pricing, rebates, and eligibility live in config tables no file reads top to bottom.</p>
        <div class="move">The trap: reading the code and declaring the system understood, having never opened the config where the decision is actually made.</div>
      </div>
      <!-- 2 -->
      <div class="stage">
        <div class="num">02</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><rect x="3" y="9" width="12" height="12" rx="2"/><path d="M14 10l7-7M21 3v6M21 3h-6" stroke="#F5A623"/></svg>Extract</div>
        <div class="q">Get it out — the right way for where it lives</div>
        <p>Parse the code, reconstruct the config wiring, model the contract, trace the flow — four techniques for four homes, all producing one shape: a <b>graph</b> of nodes and edges. That graph is the only representation an AI agent can reason over without inventing the connections.</p>
        <div class="move">Make it re-runnable. A one-shot manual export is stale next week; Stage&nbsp;06 depends on firing this again on every change.</div>
      </div>
      <!-- 3 -->
      <div class="stage">
        <div class="num">03</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4" fill="#F5A623" stroke="none"/><path d="M6.8 7.4 10.6 16M17.2 7.4 13.4 16M7 6h10"/></svg>Reconstruct</div>
        <div class="q">Explain why — not just what</div>
        <p>Walk the graph to answer the question documentation can't: <em>why did this specific customer get this specific rate?</em> A language model narrating a clean graph turns a structure only a specialist could read into an account a business analyst can verify — and the graph keeps the model honest.</p>
        <div class="move">Fluency isn't correctness. A well-written explanation over a graph with gaps is high-quality fiction until Stage&nbsp;04 checks it.</div>
      </div>
      <!-- 4 -->
      <div class="stage">
        <div class="num">04</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#F5A623"/></svg>Validate</div>
        <div class="q">What is the ground truth?</div>
        <p>Where sources disagree, the <b>running system wins</b> — behavior is truth, documentation is opinion. Replay real historical inputs through the reconstruction and measure how closely it matches reality. The gap you find <em>is</em> the value: it's the drift no one knew about.</p>
        <div class="move">Put a number on it. "Validated against N transactions at X% equivalence; these edge cases unconfirmed" beats a binary "done."</div>
      </div>
      <!-- 5 -->
      <div class="stage">
        <div class="num">05</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><path d="M6 3v6a4 4 0 0 0 4 4h8"/><path d="M15 9l3-3-3-3" stroke="#F5A623"/><path d="M6 9v0a4 4 0 0 1 4 4h0M6 21V9"/></svg>Decide</div>
        <div class="q">Let context change the call</div>
        <p>Validated understanding routinely overturns the plan you walked in with. The budgeted year-long rewrite turns out to be three live configuration rules sitting on eighty percent dead code — so it becomes a two-week change. That flip is only possible because context came <em>before</em> commitment.</p>
        <div class="move">Comprehension that isn't allowed to reverse the decision was theater. Decide on validated-enough; it's never "complete."</div>
      </div>
      <!-- 6 -->
      <div class="stage">
        <div class="num">06</div>
        <div class="name"><svg class="glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C7293" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5" stroke="#F5A623"/></svg>Sustain</div>
        <div class="q">Keep it golden</div>
        <p>Wire every commit, transport, and config change to re-derive context automatically, with drift detection when the graph and reality diverge. Context stops being a project cost that depreciates and becomes an <b>asset that compounds</b> — each system added makes the next one cheaper to understand.</p>
        <div class="move">The deliverable is not a document that's wrong in three months. It's a living graph humans and agents both query for current truth.</div>
      </div>
    </div>
  </div>
</section>
<!-- ================= GOLDEN OUTCOME ================= -->
<section class="band band-navy">
  <div class="wrap reveal">
    <div class="eyebrow">The outcome</div>
    <div class="gold-grid">
      <div class="gold-copy">
        <h2>Golden context</h2>
        <p>The output isn't a report. It's a <b>living graph</b>: the single, current, trusted account of how every system truly behaves — derived from the scattered, conflicting places that knowledge lives, and authoritative enough to act on without checking anywhere else.</p>
        <p>Build it once through the spine. Keep it golden as the system changes. It becomes the ground truth every team — and every AI agent — operates from.</p>
        <div class="gold-def">
          <div class="lbl">Definition</div>
          <p>The authoritative, current, and usable account of how an enterprise system actually behaves — and why — trustworthy enough to act on directly.</p>
        </div>
      </div>

      <div>
        <svg viewBox="0 0 460 430" role="img" aria-label="Golden context graph at the center of a continuous refresh loop fed by commits, config changes, transports and deploys">
          <defs>
            <radialGradient id="nodeG2" cx="0.35" cy="0.3" r="0.85">
              <stop offset="0" stop-color="#FBD089"/><stop offset="0.55" stop-color="#F5A623"/><stop offset="1" stop-color="#D6850C"/>
            </radialGradient>
            <filter id="glow2" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="arrIn" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L8 4.5 L0 9 z" fill="#7FCBE2"/></marker>
          </defs>

          <!-- refresh ring -->
          <circle cx="230" cy="200" r="150" fill="none" stroke="#2A4A66" stroke-width="1.4" stroke-dasharray="5 6"/>

          <!-- inward arrows from ring -->
          <g stroke="#7FCBE2" stroke-width="1.6" fill="none" opacity=".85" marker-end="url(#arrIn)">
            <path d="M230 78 L230 150"/>
            <path d="M352 200 L300 200"/>
            <path d="M230 322 L230 256"/>
            <path d="M108 200 L160 200"/>
          </g>

          <!-- input chips -->
          <g text-anchor="middle">
            <g transform="translate(230 56)"><rect x="-52" y="-15" width="104" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="ring-lbl" y="4">COMMIT</text></g>
            <g transform="translate(388 200)"><rect x="-62" y="-15" width="124" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="ring-lbl" y="4">CONFIG CHANGE</text></g>
            <g transform="translate(230 344)"><rect x="-56" y="-15" width="112" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="ring-lbl" y="4">TRANSPORT</text></g>
            <g transform="translate(72 200)"><rect x="-46" y="-15" width="92" height="30" rx="6" fill="#11314F" stroke="#3A5575"/><text class="ring-lbl" y="4">DEPLOY</text></g>
          </g>

          <!-- center golden graph -->
          <g>
            <g stroke-width="1.6" fill="none">
              <path d="M230 200 L196 168" stroke="#C58A2E"/>
              <path d="M230 200 L266 166" stroke="#1C7293"/>
              <path d="M230 200 L190 224" stroke="#C58A2E"/>
              <path d="M230 200 L272 226" stroke="#1C7293"/>
              <path d="M230 200 L230 158" stroke="#C58A2E"/>
              <path d="M196 168 L230 158" stroke="#1C7293" opacity=".7"/>
              <path d="M266 166 L272 226" stroke="#C58A2E" opacity=".7"/>
              <path d="M190 224 L272 226" stroke="#1C7293" opacity=".7"/>
            </g>
            <g filter="url(#glow2)">
              <circle cx="230" cy="200" r="14" fill="url(#nodeG2)"/>
              <circle cx="196" cy="168" r="8.5" fill="url(#nodeG2)"/>
              <circle cx="266" cy="166" r="9" fill="url(#nodeG2)"/>
              <circle cx="190" cy="224" r="8" fill="url(#nodeG2)"/>
              <circle cx="272" cy="226" r="8.5" fill="url(#nodeG2)"/>
              <circle cx="230" cy="158" r="7.5" fill="url(#nodeG2)"/>
            </g>
            <text x="230" y="270" text-anchor="middle" class="ctr-lbl">GOLDEN CONTEXT</text>
          </g>

          <text x="230" y="416" text-anchor="middle" class="cap2" style="letter-spacing:.16em">EVERY CHANGE RE-DERIVES — IT NEVER GOES STALE</text>
        </svg>
      </div>
    </div>
  </div>
</section>
`;

// CLOSE — the closing statement + the paper's own footer.
const BODY_CLOSE = `
<section class="close">
  <div class="wrap reveal">
    <p>Comprehend before you change. Then <b>keep comprehending.</b></p>
    <p style="font-family:'Inter',sans-serif;font-weight:400;font-size:17px;color:var(--muted);margin-top:22px;max-width:46ch">Because in a world where machines write the code, trusted context is the only durable advantage left.</p>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="foot-row">
      <span>CodeMesh Series · Paper 01 of 03</span>
      <span>Context as a Frontier</span>
      <span>Working draft — June 2026</span>
    </div>
  </div>
</footer>
`;

// Minimal inline markdown: **bold** within a line.
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// Render a stage agent's markdown output (### headings, "- " bullets, paragraphs).
function StageBody({ text }) {
  const lines = String(text).split("\n");
  const out = [];
  let bullets = null;
  const flush = (key) => {
    if (bullets) {
      out.push(<ul className="rm-list" key={`u${key}`} style={{ marginTop: 4 }}>{bullets}</ul>);
      bullets = null;
    }
  };
  lines.forEach((raw, i) => {
    const ln = raw.replace(/\s+$/, "");
    const h = ln.match(/^#{1,6}\s+(.*)$/);
    const b = ln.match(/^[-*]\s+(.*)$/);
    if (h) { flush(i); out.push(<h3 key={i}>{renderInline(h[1])}</h3>); return; }
    if (b) { (bullets || (bullets = [])).push(<li key={i}>{renderInline(b[1])}</li>); return; }
    flush(i);
    if (ln.trim()) out.push(<p key={i} style={{ margin: "0 0 6px" }}>{renderInline(ln)}</p>);
  });
  flush("end");
  return out;
}

const initialStages = () =>
  CONTEXT_SPINE.map((s) => ({
    id: s.id, num: s.num, name: s.name, question: s.question,
    agentName: null, specialization: null, status: "idle", output: null,
  }));

// Interactive "Apply this framework" engine. Submits a context-comprehension run
// to the existing orchestration endpoint and renders the six-stage result live.
function ContextApplyEngine() {
  const { user, setShowLogin } = useApp();
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [phaseLabel, setPhaseLabel] = useState("");
  const [stages, setStages] = useState(initialStages);
  const [roadmap, setRoadmap] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const patchStage = useCallback((taskId, patch) => {
    if (!taskId) return;
    setStages((prev) => prev.map((s) => (s.id === taskId ? { ...s, ...patch } : s)));
  }, []);

  const handleEvent = useCallback((event) => {
    const { type, data } = event || {};
    if (type === "result") {
      const d = data?.deliverable;
      if (d) {
        if (Array.isArray(d.taskResults)) {
          setStages((prev) => prev.map((s) => {
            const r = d.taskResults.find((t) => t.taskId === s.id);
            return r
              ? { ...s, output: r.output || s.output, agentName: r.agentName || s.agentName, status: r.status === "failed" ? "failed" : "done" }
              : s;
          }));
        }
        setRoadmap(Array.isArray(d.roadmap) ? d.roadmap : null);
        setSummary(d.executiveSummary || null);
      }
      setStatus("done");
      setPhaseLabel("");
      return;
    }
    if (type === "error") {
      setError(data?.error || "Something went wrong running the engine.");
      setStatus("error");
      setPhaseLabel("");
      return;
    }
    switch (type) {
      case "phase.decompose.start": setPhaseLabel("Mapping the spine…"); break;
      case "phase.assemble.start": setPhaseLabel("Assembling specialists…"); break;
      case "phase.assemble.complete":
        setPhaseLabel("Running the six stages…");
        if (Array.isArray(data?.agents)) {
          setStages((prev) => prev.map((s) => {
            const a = data.agents.find((ag) => ag.assignedTask === s.id);
            return a ? { ...s, agentName: a.name, specialization: a.specialization } : s;
          }));
        }
        break;
      case "phase.execute.start": setPhaseLabel("Running the six stages…"); break;
      case "task.start": patchStage(data?.taskId, { status: "active" }); break;
      case "task.complete": patchStage(data?.taskId, { status: "done" }); break;
      case "task.failed": patchStage(data?.taskId, { status: "failed" }); break;
      case "a2a.start":
      case "a2a.refine.start": setPhaseLabel("Cross-checking across stages…"); break;
      case "phase.synthesize.start": setPhaseLabel("Sequencing the roadmap…"); break;
      default: break;
    }
  }, [patchStage]);

  const run = useCallback(async () => {
    const description = desc.trim();
    if (description.length < 40) {
      setError("Add a sentence or two more about your system — what it does, the stack, and where the logic and config live.");
      return;
    }
    setError(null);
    setRoadmap(null);
    setSummary(null);
    setStages(initialStages());
    setStatus("running");
    setPhaseLabel("Starting…");

    try {
      const { getFirebase } = await import("../../utils/firebase-client");
      const { auth } = await getFirebase();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setStatus("idle");
        setPhaseLabel("");
        setError("Please sign in to run the framework engine.");
        setShowLogin(true);
        return;
      }

      const res = await fetch("/api/orchestration/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `Apply Context as a Frontier — ${description.slice(0, 60)}`,
          description,
          type: CONTEXT_COMPREHENSION_TYPE,
          options: { maxAgents: 6 },
        }),
      });

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/event-stream")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            const t = part.trim();
            if (t.startsWith("data: ")) {
              try { handleEvent(JSON.parse(t.slice(6))); } catch { /* skip malformed */ }
            }
          }
        }
        if (buffer.trim().startsWith("data: ")) {
          try { handleEvent(JSON.parse(buffer.trim().slice(6))); } catch { /* ignore */ }
        }
      } else {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "The engine could not run this. Try refining your description.");
      }
    } catch (err) {
      setError(err.message || "Network error — please try again.");
      setStatus("error");
      setPhaseLabel("");
    }
  }, [desc, handleEvent, setShowLogin]);

  const busy = status === "running";
  const showResults = (status !== "idle" && status !== "error") || (status === "error" && stages.some((s) => s.output));

  return (
    <section className="band band-panel" id="apply">
      <div className="wrap reveal">
        <div className="eyebrow">Apply the framework</div>
        <h2 style={{ marginTop: 14, maxWidth: "22ch" }}>Run your own system through the spine</h2>
        <p className="apply-intro">Describe a system in plain language — what it does, its stack, and where the logic and configuration live. Six specialist agents each take one stage and return what it means for your system, the tooling that fits your stack, and a sequenced roadmap.</p>

        <div className="apply-form">
          <textarea
            className="apply-ta"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={busy}
            placeholder={"e.g. We run a 12-year-old maintenance system — a .NET monolith over SQL Server, with pricing and SLA rules in config tables and a couple of vendor integrations. How do we apply this framework?"}
          />
          <div className="apply-row">
            <button className="apply-btn" onClick={run} disabled={busy}>
              {busy ? "Running…" : "Apply the framework"}
            </button>
            <span className="apply-hint">{user ? "Six stages · ~30–60s" : "Sign in to run · six stages"}</span>
          </div>
          {error && <div className="apply-err">{error}</div>}
        </div>

        {busy && phaseLabel && (
          <div className="apply-status"><span className="apply-spinner" />{phaseLabel}</div>
        )}

        {showResults && (
          <div className="stage-results">
            {stages.map((s) => (
              <div key={s.id} className={`sr-card${s.status === "active" ? " is-active" : ""}${s.status === "done" ? " is-done" : ""}`}>
                <div className="sr-head">
                  <div>
                    <span className="sr-num">{s.num}</span>{" "}
                    <span className="sr-name">{s.name}</span>
                    <div className="sr-q">{s.question}</div>
                  </div>
                  <div className="sr-persona">
                    {s.agentName
                      ? <><b>{s.agentName}</b><br />{s.specialization || ""}</>
                      : <span className="sr-state">{s.status === "active" ? "working…" : s.status === "failed" ? "failed" : "queued"}</span>}
                  </div>
                </div>
                {s.output
                  ? <div className="sr-body"><StageBody text={s.output} /></div>
                  : busy
                    ? <div className="sr-state" style={{ marginTop: 12 }}>{s.status === "active" ? "Analyzing your system…" : s.status === "failed" ? "This stage failed." : "Queued…"}</div>
                    : null}
              </div>
            ))}
          </div>
        )}

        {roadmap && (
          <div className="roadmap reveal">
            <h3>Your sequenced roadmap</h3>
            {summary && <p className="rm-sum">{summary}</p>}
            {roadmap.map((step, i) => (
              <div className="rm-step" key={i}>
                <div className="rm-stage">{step.stage}</div>
                {step.objective && <div className="rm-obj">{step.objective}</div>}
                {Array.isArray(step.actions) && step.actions.length > 0 && (
                  <ul className="rm-list">{step.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
                )}
                {Array.isArray(step.tools) && step.tools.length > 0 && (
                  <div className="rm-tools">{step.tools.map((t, j) => <span className="rm-tool" key={j}>{t}</span>)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ContextAsAFrontier() {
  const rootRef = useRef(null);

  // Scroll-reveal — ports the original IntersectionObserver, scoped to this page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add("in");
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="caf-root" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: CAF_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY_MAIN }} />
      {/* EXTENSION SLOT — the interactive "Apply this framework" engine, between
          the framework content and the close. */}
      <ContextApplyEngine />
      <div dangerouslySetInnerHTML={{ __html: BODY_CLOSE }} />
    </div>
  );
}
