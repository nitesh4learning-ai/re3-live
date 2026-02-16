"use client";
import { useState } from "react";
import { GIM, CODE_BG, CODE_TEXT, FadeIn, ProgressBar, ExpandableSection, CodeBlock, Quiz, MessageSimulator, AnalogyBox, SeeItInRe3, CourseShell, ArchitectureDecision, ComparisonTable } from "./Academy";

// ==================== TIER 4: STRATEGIC & FRONTIER ====================

function ComingSoonContent({title}){
  return <div className="text-center py-16">
    <span style={{fontSize:48}}>{'\uD83D\uDEA7'}</span>
    <h2 className="font-bold mt-4 mb-2" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>{title}</h2>
    <p style={{fontSize:14,color:GIM.bodyText}}>This course is under construction. Check back soon!</p>
  </div>;
}

export function CourseAIRegulatory({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'⚖️'}];
  return <CourseShell id="ai-regulatory" icon="⚖️" title="AI Governance & Regulatory Landscape" timeMinutes={50} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="AI Governance & Regulatory Landscape"/>}/>;
}

export function CourseResponsibleAI({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'🤝'}];
  return <CourseShell id="responsible-ai" icon="🤝" title="Responsible AI in Practice" timeMinutes={45} exerciseCount={6} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="Responsible AI in Practice"/>}/>;
}

export function CourseEnterpriseStrategy({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'📊'}];
  return <CourseShell id="enterprise-strategy" icon="📊" title="Enterprise AI Strategy" timeMinutes={40} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="Enterprise AI Strategy"/>}/>;
}

export function CourseAIEconomics({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'📈'}];
  return <CourseShell id="ai-economics" icon="📈" title="AI Economics & ROI" timeMinutes={35} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="AI Economics & ROI"/>}/>;
}

export function CourseComputerUse({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'🖥️'}];
  return <CourseShell id="computer-use" icon="🖥️" title="Computer Use & Browser Agents" timeMinutes={45} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="Computer Use & Browser Agents"/>}/>;
}

export function CoursePhysicalAI({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const tabs=[{id:'coming',label:'Coming Soon',icon:'🤖'}];
  return <CourseShell id="physical-ai" icon="🤖" title="Physical AI & Robotics Foundations" timeMinutes={40} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={tabs} deepTabs={tabs} renderTab={()=><ComingSoonContent title="Physical AI & Robotics Foundations"/>}/>;
}
