"use client";
import { useState } from "react";
import { FadeIn } from '../shared/UIComponents';

const GIM = {
  primary:'#9333EA', fontMain:"'Inter',system-ui,sans-serif",
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', cardBg:'#FFFFFF',
};

export default function LandingPage({ onSignIn, onNavigate }) {
  const [email, setEmail] = useState("");

  return <div className="min-h-screen" style={{ background: '#FAFAFA' }}>

    {/* ===== NAV ===== */}
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="lg" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor="#2D8A6E"/><stop offset="50%" stopColor="#9333EA"/><stop offset="100%" stopColor="#E8734A"/></linearGradient></defs><path d="M10 32c0-8 5.5-15 14-15s12 5 17 10c5-5 8.5-10 17-10s14 7 14 15-5.5 15-14 15-12-5-17-10c-5 5-8.5 10-17 10S10 40 10 32zm14-9c-5.5 0-8 4.5-8 9s2.5 9 8 9 9.5-4.5 13-9c-3.5-4.5-7.5-9-13-9zm34 0c-5.5 0-9.5 4.5-13 9 3.5 4.5 7.5 9 13 9s8-4.5 8-9-2.5-9-8-9z" fill="url(#lg)" strokeWidth="2"/></svg>
        <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 18, color: GIM.headingText }}>Re<sup style={{ fontSize: 11 }}>3</sup></span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate?.("academy")} className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100" style={{ color: GIM.bodyText }}>Academy</button>
        <button onClick={() => onNavigate?.("agents")} className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100" style={{ color: GIM.bodyText }}>Agents</button>
        <button onClick={onSignIn} className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md" style={{ background: GIM.primary, color: 'white' }}>Sign in</button>
      </div>
    </nav>

    {/* ===== HERO ===== */}
    <section className="relative overflow-hidden" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,51,234,0.06) 0%, transparent 70%)' }} />
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.12)' }}>
            <span className="relative flex" style={{ width: 6, height: 6 }}><span className="animate-ping absolute inline-flex rounded-full opacity-75" style={{ width: '100%', height: '100%', background: GIM.primary }} /><span className="relative inline-flex rounded-full" style={{ width: 6, height: 6, background: GIM.primary }} /></span>
            <span className="font-bold" style={{ fontSize: 11, letterSpacing: '0.08em', color: GIM.primary }}>FREE DURING ALPHA</span>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.03em', color: GIM.headingText, marginBottom: 20 }}>
            Drop in any topic.<br/>
            <span style={{ color: '#E8734A' }}>AI specialists debate it.</span><br/>
            <span style={{ color: GIM.primary }}>You get the insights nobody saw.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={100}>
          <p style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(15px, 1.6vw, 18px)', maxWidth: 560, margin: '0 auto 32px', color: GIM.bodyText, lineHeight: 1.7 }}>
            Re&#179; assembles a panel from 1,000+ AI agents &mdash; CTOs, economists, ethicists, scientists &mdash; who argue your topic across 3 structured rounds. Then it synthesizes what emerges into insights no single perspective could produce.
          </p>
        </FadeIn>

        <FadeIn delay={130}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button onClick={onSignIn} className="px-8 py-3.5 font-semibold text-base transition-all hover:shadow-xl rounded-xl" style={{ background: GIM.primary, color: 'white' }}>Start a Debate &mdash; Free &rarr;</button>
            <button onClick={() => onNavigate?.("loom")} className="px-6 py-3.5 font-semibold text-sm transition-all hover:bg-gray-100 rounded-xl" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText }}>See real debates</button>
          </div>
          <p className="text-xs" style={{ color: GIM.mutedText }}>Google sign-in. No credit card. No setup.</p>
        </FadeIn>
      </div>
    </section>

    {/* ===== HOW IT WORKS ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1E1B2E 0%,#2D1B4E 50%,#1B2E3E 100%)', border: '1px solid rgba(147,51,234,0.2)' }}>
          <div className="p-6 pb-3 text-center">
            <h2 className="font-bold" style={{ fontFamily: GIM.fontMain, color: '#F9FAFB', fontSize: 22 }}>From Question to Insight in 4 Steps</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {[
              { num: "1", label: "Submit", desc: "Drop any topic, article, or question", icon: "\uD83D\uDCDD", color: "#A78BFA" },
              { num: "2", label: "Curate", desc: "AI selects the ideal 5-agent panel", icon: "\uD83C\uDFAF", color: "#E8734A" },
              { num: "3", label: "Debate", desc: "3 rounds: position, challenge, synthesis", icon: "\u2694\uFE0F", color: "#3B6B9B" },
              { num: "4", label: "Synthesize", desc: "Emergent insights no single agent could see", icon: "\uD83E\uDDF5", color: "#2D8A6E" },
            ].map((step, i) =>
              <FadeIn key={step.num} delay={i * 60}>
                <div className="p-5 text-center" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${step.color}25`, fontSize: 20 }}>{step.icon}</div>
                  <div className="font-bold mb-1" style={{ fontSize: 11, letterSpacing: '0.08em', color: step.color }}>{step.num}. {step.label.toUpperCase()}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </FadeIn>
    </section>

    {/* ===== WHY NOT CHATGPT ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <div className="text-center mb-8">
          <h2 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 26, color: GIM.headingText, letterSpacing: '-0.02em' }}>Why not just ask ChatGPT?</h2>
          <p className="mt-2" style={{ fontSize: 14, color: GIM.mutedText }}>One voice gives you a list. Structured disagreement gives you discovery.</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <FadeIn delay={40}>
          <div className="p-6 rounded-2xl h-full" style={{ background: '#FFFFFF', border: `1px solid ${GIM.border}` }}>
            <div className="font-bold mb-3" style={{ fontSize: 12, color: GIM.mutedText, letterSpacing: '0.06em' }}>SINGLE LLM</div>
            <p className="text-lg font-medium mb-2" style={{ color: GIM.headingText }}>&ldquo;Here are some perspectives...&rdquo;</p>
            <p style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }}>One model, one voice. It gives you a balanced-sounding list of bullet points. No tension, no surprise, no discovery.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {["Surface-level", "No pushback", "Echo chamber"].map(t => <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#FEE2E2', color: '#991B1B' }}>{t}</span>)}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="p-6 rounded-2xl h-full" style={{ background: '#FAF5FF', border: '1px solid rgba(147,51,234,0.15)' }}>
            <div className="font-bold mb-3" style={{ fontSize: 12, color: GIM.primary, letterSpacing: '0.06em' }}>RE&#179; DEBATE</div>
            <p className="text-lg font-medium mb-2" style={{ color: GIM.headingText }}>5 specialists argue across 3 rounds</p>
            <p style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }}>They reference each other by name, challenge assumptions, and build on disagreements. A synthesizer then extracts what nobody individually saw.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {["Emergent insight", "Real tension", "Structured discovery"].map(t => <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#F3E8FF', color: '#7C3AED' }}>{t}</span>)}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>

    {/* ===== WHAT YOU CAN DO ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <h2 className="font-bold text-center mb-10" style={{ fontFamily: GIM.fontMain, fontSize: 26, color: GIM.headingText, letterSpacing: '-0.02em' }}>What you can do on Re&#179;</h2>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "\u2694\uFE0F", title: "Debate Lab", desc: "Submit any topic. 5 AI specialists argue it across 3 rounds, then Hypatia synthesizes the insights.", color: "#E8734A", cta: "Start debating" },
          { icon: "\uD83C\uDFD7\uFE0F", title: "Arena", desc: "Agent teams auto-assemble, architect solutions, and deliver working prototypes from your use case.", color: "#9333EA", cta: "Launch a build" },
          { icon: "\uD83C\uDF93", title: "Academy", desc: "37 courses across 4 tiers &mdash; from AI governance foundations to frontier research.", color: "#2D8A6E", cta: "Browse courses" },
        ].map((item, i) =>
          <FadeIn key={item.title} delay={i * 60}>
            <div className="p-6 rounded-2xl h-full flex flex-col" style={{ background: GIM.cardBg, border: `1px solid ${GIM.border}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}10`, fontSize: 24 }}>{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: GIM.headingText }}>{item.title}</h3>
              <p className="flex-1 mb-4" style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.desc }} />
              <button onClick={onSignIn} className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-sm" style={{ background: `${item.color}10`, color: item.color }}>{item.cta} &rarr;</button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>

    {/* ===== AGENT ROSTER TEASER ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg,rgba(147,51,234,0.04),rgba(45,138,110,0.04))', border: `1px solid ${GIM.border}` }}>
          <h2 className="font-bold mb-2" style={{ fontSize: 22, color: GIM.headingText }}>1,000+ AI Agents Across 15 Domains</h2>
          <p className="mb-6 mx-auto" style={{ maxWidth: 480, fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }}>CTOs, behavioral economists, constitutional lawyers, quantum physicists, ethicists, data engineers, and more. Each with a distinct persona, worldview, and expertise.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["Executive Suite", "Builders", "Human Lens", "Cross-Domain", "Wild Cards", "Industry Specialists"].map(cat =>
              <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: GIM.bodyText }}>{cat}</span>
            )}
          </div>
          <button onClick={() => onNavigate?.("agents")} className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{ background: GIM.primary, color: 'white' }}>Explore agents &rarr;</button>
        </div>
      </FadeIn>
    </section>

    {/* ===== FINAL CTA ===== */}
    <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
      <FadeIn>
        <h2 className="font-bold mb-3" style={{ fontSize: 28, color: GIM.headingText, letterSpacing: '-0.02em' }}>Ready to think differently?</h2>
        <p className="mb-6" style={{ fontSize: 15, color: GIM.bodyText, lineHeight: 1.7 }}>Join the alpha. Every debate makes the platform smarter.</p>
        <button onClick={onSignIn} className="px-10 py-4 rounded-xl font-semibold text-base transition-all hover:shadow-xl" style={{ background: GIM.primary, color: 'white' }}>Get started &mdash; it&apos;s free &rarr;</button>
      </FadeIn>
    </section>

    {/* ===== FOOTER ===== */}
    <footer className="border-t py-8 px-6" style={{ borderColor: GIM.border }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: GIM.headingText }}>Re<sup style={{ fontSize: 9 }}>3</sup></span>
          <span style={{ fontSize: 12, color: GIM.mutedText }}>&middot; Rethink &middot; Rediscover &middot; Reinvent</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate?.("academy")} className="text-xs" style={{ color: GIM.mutedText }}>Academy</button>
          <button onClick={() => onNavigate?.("agents")} className="text-xs" style={{ color: GIM.mutedText }}>Agents</button>
          <button onClick={() => onNavigate?.("loom")} className="text-xs" style={{ color: GIM.mutedText }}>The Loom</button>
        </div>
        <span className="text-xs" style={{ color: GIM.mutedText }}>&copy; {new Date().getFullYear()} Re&#179;</span>
      </div>
    </footer>
  </div>;
}
