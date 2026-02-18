"use client";
// SVG icon components: PillarIcon, Re3Logo, OrchestratorAvatar

export function PillarIcon({pillar,size=20}){const s={rethink:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3B6B9B" strokeWidth="1.5"><polygon points="12,2 22,20 2,20"/><line x1="12" y1="8" x2="8" y2="20"/><line x1="12" y1="8" x2="16" y2="20"/></svg>,rediscover:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="1.5"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="12" cy="18" r="2"/><line x1="8" y1="6" x2="16" y2="8" strokeDasharray="2,2"/><line x1="17" y1="10" x2="13" y2="16" strokeDasharray="2,2"/><line x1="6" y1="8" x2="5" y2="14" strokeDasharray="2,2"/></svg>,reinvent:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2D8A6E" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="4" rx="1"/><rect x="4" y="14" width="7" height="6" rx="1"/></svg>};return s[pillar]||null}

export function Re3Logo({variant="full",size=24}){
  const w=size*1.6;
  const mark=<svg width={w} height={size} viewBox="0 0 64 40" fill="none">
    <defs>
      <linearGradient id={`ig_${size}`} x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#2D8A6E"/>
        <stop offset="35%" stopColor="#3B82F6"/>
        <stop offset="70%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
    <path d="M8 20c0-6 4.5-12 11-12s9 4 13 8c4-4 6.5-8 13-8s11 6 11 12-4.5 12-11 12-9-4-13-8c-4 4-6.5 8-13 8S8 26 8 20zm11-7c-4 0-6 3.5-6 7s2 7 6 7 7-3.5 10-7c-3-3.5-6-7-10-7zm26 0c-4 0-7 3.5-10 7 3 3.5 6 7 10 7s6-3.5 6-7-2-7-6-7z" fill={`url(#ig_${size})`}/>
  </svg>;
  const text=<span className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:size*0.75}}>re<span style={{verticalAlign:"super",color:"#9333EA",fontWeight:900,fontSize:size*0.45}}>3</span><span style={{color:"#9CA3AF",fontWeight:400,fontSize:size*0.55}}>.live</span></span>;
  if(variant==="mark")return mark;
  if(variant==="text")return text;
  return <div className="flex items-center gap-1.5">{mark}{text}</div>;
}

export function OrchestratorAvatar({type,size=24}){
  if(type==="hypatia")return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#3B6B9B" fillOpacity="0.15" stroke="#3B6B9B" strokeWidth="1"/><path d="M6 8C9 14 15 14 18 8" stroke="#3B6B9B" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 16C9 10 15 10 18 16" stroke="#3B6B9B" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if(type==="socratia")return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#E8734A" fillOpacity="0.15" stroke="#E8734A" strokeWidth="1"/><line x1="12" y1="6" x2="12" y2="14" stroke="#E8734A" strokeWidth="1.5"/><line x1="6" y1="10" x2="18" y2="10" stroke="#E8734A" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 10L8 14H4L6 10Z" fill="#E8734A" fillOpacity="0.3"/><path d="M18 10L20 14H16L18 10Z" fill="#E8734A" fillOpacity="0.3"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2D8A6E" fillOpacity="0.15" stroke="#2D8A6E" strokeWidth="1"/><circle cx="12" cy="12" r="3" stroke="#2D8A6E" strokeWidth="1.5"/><line x1="12" y1="5" x2="12" y2="9" stroke="#2D8A6E" strokeWidth="1.5"/><line x1="12" y1="15" x2="12" y2="19" stroke="#2D8A6E" strokeWidth="1.5"/><line x1="5" y1="12" x2="9" y2="12" stroke="#2D8A6E" strokeWidth="1.5"/><line x1="15" y1="12" x2="19" y2="12" stroke="#2D8A6E" strokeWidth="1.5"/></svg>;
}
