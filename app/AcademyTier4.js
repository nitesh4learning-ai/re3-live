"use client";
import { useState } from "react";
import { GIM, CODE_BG, CODE_TEXT, FadeIn, ProgressBar, ExpandableSection, CodeBlock, Quiz, MessageSimulator, AnalogyBox, SeeItInRe3, CourseShell, ArchitectureDecision, ComparisonTable } from "./Academy";

// ==================== TIER 4: STRATEGIC & FRONTIER ====================

// ==================== COURSE 1: AI GOVERNANCE & REGULATORY LANDSCAPE ====================
function RegFrameworkTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>The AI Regulatory Landscape</h2>
    <AnalogyBox emoji={'\uD83C\uDF0D'} title="Think of it like city zoning laws">AI regulation is like urban planning -- different jurisdictions have different rules about what you can build, where, and how. Some zones are strict (healthcare, finance), others are permissive. Your job is to know which zone your AI operates in.</AnalogyBox>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The global AI regulatory landscape is evolving rapidly. Three major frameworks are shaping how organizations deploy AI systems worldwide.</p>
    <ExpandableSection title="EU AI Act" icon={'\uD83C\uDDEA\uD83C\uDDFA'} defaultOpen>
      <p>The world{"'"}s first comprehensive AI law. Classifies AI systems by risk level:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Unacceptable Risk:</strong> Banned (social scoring, real-time biometric surveillance)</li>
        <li><strong>High Risk:</strong> Strict requirements (hiring tools, credit scoring, medical devices)</li>
        <li><strong>Limited Risk:</strong> Transparency obligations (chatbots must disclose they{"'"}re AI)</li>
        <li><strong>Minimal Risk:</strong> No restrictions (spam filters, AI in games)</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="NIST AI Risk Management Framework" icon={'\uD83C\uDDFA\uD83C\uDDF8'}>
      <p>Voluntary US framework organized around four functions:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Govern:</strong> Establish policies, roles, and accountability structures</li>
        <li><strong>Map:</strong> Understand the context and risks of your AI system</li>
        <li><strong>Measure:</strong> Assess and track identified risks quantitatively</li>
        <li><strong>Manage:</strong> Prioritize and act on risks with controls</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="ISO/IEC 42001" icon={'\uD83C\uDF10'}>
      <p>The first international standard for AI Management Systems (AIMS). Provides a certifiable framework for organizations to demonstrate responsible AI practices through systematic governance, risk management, and continuous improvement.</p>
    </ExpandableSection>
    <Quiz question="Under the EU AI Act, which risk category would a hiring/recruitment AI tool fall into?" options={["Minimal Risk","Limited Risk","High Risk","Unacceptable Risk"]} correctIndex={2} explanation="Hiring and recruitment AI tools are classified as High Risk under the EU AI Act because they significantly impact people's access to employment and livelihoods."/>
  </div>;
}
function RiskClassTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Classifying AI Risk</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Not all AI systems carry the same risk. The key is mapping your use case to the appropriate risk tier, then applying proportionate controls.</p>
    <ComparisonTable title="Risk Classification by Domain" columns={['Domain','Risk Level','Key Requirements','Example']} rows={[
      ['Healthcare diagnostics','High','Clinical validation, human oversight, audit trails','AI reading X-rays'],
      ['Content recommendation','Limited','Transparency, opt-out mechanisms','News feed algorithms'],
      ['Customer service chatbot','Limited','Disclose AI identity, escalation path','Support automation'],
      ['Spam filtering','Minimal','None specific','Email spam detection'],
      ['Employee surveillance','Unacceptable*','Banned in many jurisdictions','Emotion detection at work'],
    ]}/>
    <ExpandableSection title="Model Risk Management (MRM)" icon={'\uD83C\uDFE6'} defaultOpen>
      <p>Originally from banking (SR 11-7), now applied to AI. Three lines of defense:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>1st Line:</strong> Model developers -- build, test, document</li>
        <li><strong>2nd Line:</strong> Model validation -- independent review and challenge</li>
        <li><strong>3rd Line:</strong> Internal audit -- assess the overall MRM framework</li>
      </ul>
    </ExpandableSection>
    <Quiz question="In the three lines of defense for Model Risk Management, who performs independent model validation?" options={["Model developers (1st line)","Risk management / validation team (2nd line)","Internal audit (3rd line)","External regulators"]} correctIndex={1} explanation="The 2nd line of defense -- risk management and model validation teams -- provides independent review and challenge of models built by the 1st line."/>
  </div>;
}
function ComplianceTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Building a Compliance Program</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A compliance program isn{"'"}t just paperwork -- it{"'"}s an operational system that ensures your AI deployments meet regulatory requirements continuously.</p>
    <CodeBlock language="yaml" label="AI Governance Checklist" code={`ai_compliance_checklist:
  pre_deployment:
    - risk_assessment: "Classify system by EU AI Act tier"
    - impact_assessment: "Document potential harms & affected groups"
    - data_audit: "Verify training data provenance & consent"
    - bias_testing: "Run fairness metrics across protected groups"
    - documentation: "Create model card & system card"

  deployment:
    - human_oversight: "Define escalation triggers & override mechanisms"
    - transparency: "Implement user disclosure (chatbot = AI)"
    - logging: "Enable full audit trail of decisions"
    - monitoring: "Set drift detection & performance alerts"

  post_deployment:
    - incident_response: "24hr reporting for serious incidents (EU)"
    - periodic_review: "Quarterly bias & performance audits"
    - user_feedback: "Mechanism for affected individuals to contest"`}/>
    <Quiz question="Under the EU AI Act, how quickly must providers report serious incidents involving high-risk AI systems?" options={["Within 7 days","Within 72 hours","Within 24 hours","Within 30 days"]} correctIndex={1} explanation="The EU AI Act requires providers to report serious incidents to authorities within 72 hours of becoming aware, similar to GDPR breach notification timelines."/>
  </div>;
}
function RegStrategyTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Regulatory Strategy</h2>
    <AnalogyBox emoji={'\u265F\uFE0F'} title="Play chess, not checkers">Regulation is evolving -- the organizations that treat compliance as a competitive advantage (not a burden) will lead. Build governance infrastructure now that scales as rules tighten.</AnalogyBox>
    <ExpandableSection title="Jurisdiction Mapping" icon={'\uD83D\uDDFA\uFE0F'} defaultOpen>
      <p>Your AI system may be subject to multiple regulatory regimes simultaneously:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>EU AI Act:</strong> If you serve EU customers or deploy in EU, regardless of HQ</li>
        <li><strong>US State Laws:</strong> Colorado AI Act, NYC Local Law 144 (hiring algorithms)</li>
        <li><strong>Sector-Specific:</strong> FDA (medical AI), SEC (financial AI), EEOC (employment)</li>
        <li><strong>International:</strong> Canada AIDA, China Interim Measures, Brazil AI Bill</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="Future-Proofing Your AI Program" icon={'\uD83D\uDD2E'}>
      <p>Regulatory trends to prepare for:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li>Mandatory AI impact assessments before deployment</li>
        <li>Right to explanation for AI-affected decisions</li>
        <li>AI liability frameworks (who pays when AI causes harm?)</li>
        <li>Foundation model regulation (upstream obligations)</li>
        <li>Cross-border data governance for AI training sets</li>
      </ul>
    </ExpandableSection>
    <Quiz question="If your company is headquartered in the US but serves EU customers via an AI chatbot, which regulations apply?" options={["Only US regulations","Only EU AI Act","Both US and EU regulations","Neither -- chatbots are exempt"]} correctIndex={2} explanation="The EU AI Act has extraterritorial reach -- if your AI system outputs are used within the EU, you must comply regardless of where you're headquartered. US regulations also apply to your domestic operations."/>
  </div>;
}
// Deep tabs for AI Regulatory
function RegDeepFrameworksTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Deep Dive: Regulatory Frameworks Compared</h2>
    <ComparisonTable title="Global AI Regulation Comparison" columns={['Framework','Approach','Scope','Enforcement','Status']} rows={[
      ['EU AI Act','Risk-based, prescriptive','All AI systems in EU market','Fines up to 7% global revenue','In force, phased compliance'],
      ['NIST AI RMF','Voluntary, flexible','US organizations','No direct penalties','Published, widely adopted'],
      ['ISO 42001','Certifiable standard','Global','Certification audits','Published 2023'],
      ['China Interim Measures','Content-focused','Generative AI in China','Service suspension, fines','In force'],
      ['Canada AIDA','Risk-based','Federal regulated entities','Criminal penalties possible','In progress'],
    ]}/>
    <CodeBlock language="python" label="Automated EU AI Act Risk Classifier" code={`class EUAIActClassifier:
    """Classify AI systems per EU AI Act risk tiers"""

    UNACCEPTABLE = {
        "social_scoring", "real_time_biometric_mass",
        "emotion_detection_workplace", "predictive_policing_individual"
    }
    HIGH_RISK_DOMAINS = {
        "hiring", "credit_scoring", "education_access",
        "medical_diagnosis", "criminal_justice", "border_control",
        "critical_infrastructure", "law_enforcement"
    }

    def classify(self, system_profile):
        use_case = system_profile["use_case"]
        if use_case in self.UNACCEPTABLE:
            return {"tier": "UNACCEPTABLE", "action": "DO NOT DEPLOY"}
        if system_profile.get("domain") in self.HIGH_RISK_DOMAINS:
            return {
                "tier": "HIGH_RISK",
                "requirements": [
                    "conformity_assessment",
                    "quality_management_system",
                    "technical_documentation",
                    "human_oversight_measures",
                    "accuracy_robustness_cybersecurity",
                    "post_market_monitoring"
                ]
            }
        if system_profile.get("interacts_with_humans"):
            return {"tier": "LIMITED_RISK", "requirements": ["transparency_disclosure"]}
        return {"tier": "MINIMAL_RISK", "requirements": []}`}/>
    <ArchitectureDecision scenario="Your startup is building an AI resume screener for enterprise clients. You want to sell globally. How should you approach compliance?" options={[
      {label:"Comply with EU AI Act only (strictest)",tradeoff:"Covers most requirements but misses US-specific rules like NYC Local Law 144"},
      {label:"Build modular compliance per jurisdiction",tradeoff:"Most thorough but highest engineering cost -- separate controls per market"},
      {label:"Superset approach: meet all frameworks simultaneously",tradeoff:"Build to the highest bar across all regulations; simplifies ops but may over-engineer for lenient markets"},
    ]} correctIndex={2} explanation="For a global product, the superset approach is most practical -- build once to the highest standard. The marginal cost of over-complying in lenient markets is far less than maintaining separate compliance modules per jurisdiction."/>
  </div>;
}
function RegDeepDocTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Documentation & Model Cards</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>High-risk AI systems require comprehensive technical documentation. Model cards and system cards are the industry standard for transparency.</p>
    <CodeBlock language="yaml" label="Model Card Template (EU AI Act Compliant)" code={`model_card:
  model_details:
    name: "ResumeScreener-v2.1"
    version: "2.1.0"
    type: "Classification (binary: advance/reject)"
    developers: "TalentAI Inc."
    release_date: "2025-03-15"

  intended_use:
    primary: "First-pass resume screening for technical roles"
    out_of_scope: "Final hiring decisions, performance evaluation"
    users: "HR teams with AI training certification"

  training_data:
    sources: "500K anonymized resumes from 2020-2024"
    demographics: "Balanced across gender, ethnicity, age"
    preprocessing: "Name/photo/address redaction, skill normalization"

  performance:
    overall_accuracy: 0.89
    false_positive_rate: 0.08
    false_negative_rate: 0.12

  fairness_metrics:
    demographic_parity:
      gender: {male: 0.45, female: 0.44, non_binary: 0.43}
      ethnicity: {max_disparity: 0.03}
    equalized_odds:
      tpr_gap: 0.02
      fpr_gap: 0.01

  limitations:
    - "Not validated for non-English resumes"
    - "Performance degrades for roles with < 100 training examples"
    - "Cannot assess soft skills or cultural fit"

  human_oversight:
    mechanism: "All rejections reviewed by human within 48hrs"
    override_rate: "12% of AI rejections reversed by human review"
    escalation: "Candidates can request human-only review"`}/>
    <Quiz question="Why should a model card include fairness metrics broken down by demographic groups?" options={["It's only needed for marketing purposes","To identify disparate impact before deployment and satisfy regulatory requirements","Demographic data improves model accuracy","It's optional and rarely useful"]} correctIndex={1} explanation="Fairness metrics by demographic group are essential to identify disparate impact -- where a model performs differently across protected groups. This is required under the EU AI Act for high-risk systems and helps prevent discrimination."/>
  </div>;
}
function RegDeepAuditTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>AI Audit & Incident Response</h2>
    <CodeBlock language="python" label="AI Audit Trail System" code={`import json, hashlib
from datetime import datetime

class AIAuditLogger:
    """Tamper-evident audit logging for AI decisions"""

    def __init__(self, system_id):
        self.system_id = system_id
        self.chain = []

    def log_decision(self, input_data, output, confidence,
                     model_version, human_override=None):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "system_id": self.system_id,
            "model_version": model_version,
            "input_hash": hashlib.sha256(
                json.dumps(input_data, sort_keys=True).encode()
            ).hexdigest(),
            "output": output,
            "confidence": confidence,
            "human_override": human_override,
            "prev_hash": self.chain[-1]["hash"] if self.chain else "genesis"
        }
        entry["hash"] = hashlib.sha256(
            json.dumps(entry, sort_keys=True).encode()
        ).hexdigest()
        self.chain.append(entry)
        return entry

    def verify_chain(self):
        """Verify no entries have been tampered with"""
        for i, entry in enumerate(self.chain):
            stored_hash = entry["hash"]
            entry_copy = {k: v for k, v in entry.items() if k != "hash"}
            computed = hashlib.sha256(
                json.dumps(entry_copy, sort_keys=True).encode()
            ).hexdigest()
            if stored_hash != computed:
                return False, f"Tampered at index {i}"
        return True, "Chain intact"`}/>
    <ExpandableSection title="Incident Response Playbook" icon={'\uD83D\uDEA8'} defaultOpen>
      <p><strong>When an AI system causes harm or behaves unexpectedly:</strong></p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>0-1 hr:</strong> Contain -- disable system or switch to human fallback</li>
        <li><strong>1-24 hr:</strong> Assess -- determine scope, affected users, root cause</li>
        <li><strong>24-72 hr:</strong> Report -- notify authorities per EU AI Act / local rules</li>
        <li><strong>1-2 weeks:</strong> Remediate -- fix root cause, update monitoring</li>
        <li><strong>30 days:</strong> Post-mortem -- document lessons, update risk assessment</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What is the primary purpose of a tamper-evident audit trail for AI decisions?" options={["To speed up the AI system","To prove that decision logs haven't been altered after the fact","To improve model accuracy over time","To reduce storage costs"]} correctIndex={1} explanation="Tamper-evident audit trails (using hash chains) ensure that decision logs cannot be altered retroactively. This is critical for regulatory compliance -- you must prove that the records you present to auditors are the same records generated at decision time."/>
  </div>;
}

export function CourseAIRegulatory({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'frameworks',label:'Frameworks',icon:'\uD83C\uDF0D'},
    {id:'risk',label:'Risk Classification',icon:'\u26A0\uFE0F'},
    {id:'compliance',label:'Compliance',icon:'\u2705'},
    {id:'strategy',label:'Strategy',icon:'\u265F\uFE0F'},
  ];
  const dTabs=[
    {id:'d-frameworks',label:'Frameworks Deep Dive',icon:'\uD83C\uDF0D'},
    {id:'d-risk',label:'Risk Classification',icon:'\u26A0\uFE0F'},
    {id:'d-compliance',label:'Compliance',icon:'\u2705'},
    {id:'d-docs',label:'Documentation',icon:'\uD83D\uDCDD'},
    {id:'d-audit',label:'Audit & Incident',icon:'\uD83D\uDEA8'},
    {id:'d-strategy',label:'Strategy',icon:'\u265F\uFE0F'},
    {id:'d-future',label:'Future Trends',icon:'\uD83D\uDD2E'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <RegFrameworkTab/>;
      if(i===1)return <RiskClassTab/>;
      if(i===2)return <ComplianceTab/>;
      return <RegStrategyTab/>;
    }
    if(i===0)return <RegDeepFrameworksTab/>;
    if(i===1)return <RiskClassTab/>;
    if(i===2)return <ComplianceTab/>;
    if(i===3)return <RegDeepDocTab/>;
    if(i===4)return <RegDeepAuditTab/>;
    if(i===5)return <RegStrategyTab/>;
    return <RegStrategyTab/>;
  };
  return <CourseShell id="ai-regulatory" icon={'\u2696\uFE0F'} title="AI Governance & Regulatory Landscape" timeMinutes={50} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}

// ==================== COURSE 2: RESPONSIBLE AI IN PRACTICE ====================
function FairnessTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Understanding AI Fairness</h2>
    <AnalogyBox emoji={'\u2696\uFE0F'} title="Fairness is like a multisided die">There are many valid definitions of fairness -- and they often conflict mathematically. You can{"'"}t satisfy all of them simultaneously. The key is choosing which definition fits your context and being transparent about the trade-offs.</AnalogyBox>
    <ExpandableSection title="Types of Bias in AI" icon={'\uD83D\uDD0D'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Historical bias:</strong> Training data reflects past discrimination (e.g., hiring data from biased organizations)</li>
        <li><strong>Representation bias:</strong> Some groups underrepresented in training data</li>
        <li><strong>Measurement bias:</strong> Features that are poor proxies (e.g., zip code as proxy for race)</li>
        <li><strong>Aggregation bias:</strong> One model for diverse subpopulations that behave differently</li>
        <li><strong>Evaluation bias:</strong> Test set doesn{"'"}t represent deployment population</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="Fairness Definitions" icon={'\uD83D\uDCCF'}>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Demographic Parity:</strong> Equal selection rates across groups</li>
        <li><strong>Equalized Odds:</strong> Equal true positive and false positive rates</li>
        <li><strong>Calibration:</strong> When model says 80% confidence, it{"'"}s right 80% for all groups</li>
        <li><strong>Individual Fairness:</strong> Similar individuals get similar outcomes</li>
      </ul>
    </ExpandableSection>
    <Quiz question="Why is it mathematically impossible to satisfy all fairness definitions simultaneously?" options={["It's actually possible with enough data","Different fairness metrics optimize for conflicting objectives","Only because of compute limitations","It's a theoretical claim that doesn't apply in practice"]} correctIndex={1} explanation="This is the 'impossibility theorem of fairness' -- demographic parity, equalized odds, and calibration cannot all be satisfied simultaneously except in trivial cases. Organizations must choose which definition matters most for their context."/>
  </div>;
}
function ExplainTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Explainability & Transparency</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Explainability is the ability to describe an AI system{"'"}s decision process in human-understandable terms. It{"'"}s both a regulatory requirement and a trust-building tool.</p>
    <ComparisonTable title="Explainability Methods" columns={['Method','Type','How It Works','Best For']} rows={[
      ['SHAP Values','Post-hoc, global/local','Assigns contribution scores to each feature','Tabular data, feature importance'],
      ['LIME','Post-hoc, local','Fits simple model around a single prediction','Any model, individual explanations'],
      ['Attention Maps','Intrinsic','Shows which tokens/regions the model focuses on','NLP, vision models'],
      ['Counterfactuals','Post-hoc, local','"What would need to change for a different outcome?"','Individual recourse'],
      ['Decision Trees','Intrinsic, global','Inherently interpretable model structure','When accuracy trade-off acceptable'],
    ]}/>
    <ExpandableSection title="The Explanation Spectrum" icon={'\uD83C\uDF08'} defaultOpen>
      <p>Not all stakeholders need the same level of explanation:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>End users:</strong> Simple, actionable ("You were declined because X. To improve, try Y.")</li>
        <li><strong>Domain experts:</strong> Feature importances, confidence scores, model behavior</li>
        <li><strong>Regulators:</strong> Full methodology, training data provenance, validation results</li>
        <li><strong>Developers:</strong> Model internals, attention patterns, gradient analysis</li>
      </ul>
    </ExpandableSection>
    <Quiz question="Which explainability method would be most appropriate for telling a loan applicant why they were denied?" options={["SHAP values with raw feature scores","Attention visualization maps","Counterfactual explanations","Full model architecture diagram"]} correctIndex={2} explanation="Counterfactual explanations ('If your income were $5K higher, you would have been approved') are the most actionable for end users because they explain what would need to change, giving the individual recourse."/>
  </div>;
}
function RAIPracticeTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Responsible AI in Practice</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Implementing responsible AI requires tooling, processes, and culture. Here are the practical building blocks.</p>
    <CodeBlock language="python" label="Fairness Assessment Pipeline" code={`# Using Fairlearn for bias detection
from fairlearn.metrics import MetricFrame
from sklearn.metrics import accuracy_score, selection_rate

# After training your model
metric_frame = MetricFrame(
    metrics={
        "accuracy": accuracy_score,
        "selection_rate": selection_rate
    },
    y_true=y_test,
    y_pred=predictions,
    sensitive_features=demographics["gender"]
)

print(metric_frame.by_group)
#              accuracy  selection_rate
# Female        0.87         0.42
# Male          0.89         0.45
# Non-binary    0.84         0.40

# Check if disparity exceeds threshold
ratio = metric_frame.ratio()  # min/max per metric
if ratio["selection_rate"] < 0.8:  # 4/5ths rule
    print("WARNING: Potential disparate impact detected")`}/>
    <ExpandableSection title="Responsible AI Checklist" icon={'\u2705'} defaultOpen>
      <ul className="list-disc ml-5 space-y-1">
        <li>Conduct bias audit before deployment across protected groups</li>
        <li>Implement human-in-the-loop for high-stakes decisions</li>
        <li>Provide clear recourse mechanisms for affected individuals</li>
        <li>Monitor for drift in fairness metrics post-deployment</li>
        <li>Document limitations prominently in model cards</li>
        <li>Establish an AI ethics review board for new use cases</li>
      </ul>
    </ExpandableSection>
    <Quiz question="The '4/5ths rule' (or 80% rule) in employment law states that:" options={["AI systems must be 80% accurate","The selection rate for any group must be at least 80% of the highest group's rate","80% of decisions must be made by humans","AI must explain 80% of its predictions"]} correctIndex={1} explanation="The 4/5ths rule is a legal standard: if the selection rate for a protected group is less than 80% of the rate for the most-selected group, it may indicate disparate impact and trigger regulatory scrutiny."/>
  </div>;
}
function RAIToolsTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Tools & Frameworks</h2>
    <ComparisonTable title="Responsible AI Tooling" columns={['Tool','Provider','Focus','Language']} rows={[
      ['Fairlearn','Microsoft','Fairness assessment & mitigation','Python'],
      ['AI Fairness 360','IBM','Bias detection (70+ metrics)','Python'],
      ['What-If Tool','Google','Visual model exploration & fairness','Web/Python'],
      ['Aequitas','U Chicago','Audit tool for decision systems','Python'],
      ['LIT (Language Interp.)','Google','NLP model interpretability','Python/Web'],
    ]}/>
    <ExpandableSection title="Building an AI Ethics Board" icon={'\uD83E\uDDD1\u200D\u2696\uFE0F'} defaultOpen>
      <p>An effective AI ethics board should include:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Diverse membership:</strong> Engineers, ethicists, legal, domain experts, affected community reps</li>
        <li><strong>Clear mandate:</strong> Review new AI use cases, audit existing systems, handle escalations</li>
        <li><strong>Real authority:</strong> Power to block or modify deployments, not just advisory</li>
        <li><strong>Regular cadence:</strong> Monthly reviews of flagged systems + quarterly portfolio audits</li>
      </ul>
    </ExpandableSection>
    <Quiz question="Which is the most important attribute of an effective AI ethics review board?" options={["All members should be AI engineers","It should meet daily","It should have real authority to block deployments","It should only include C-suite executives"]} correctIndex={2} explanation="An ethics board without the power to block or modify deployments is merely performative. Real authority -- the ability to say 'no' or 'not yet' -- is what separates effective governance from checkbox compliance."/>
  </div>;
}
// Deep tabs for Responsible AI
function RAIDeepFairnessTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Advanced Fairness: Mitigation Strategies</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Once you{"'"}ve detected bias, you need to mitigate it. There are three intervention points:</p>
    <ComparisonTable title="Bias Mitigation Approaches" columns={['Stage','Technique','Pros','Cons']} rows={[
      ['Pre-processing','Resampling, reweighting data','Model-agnostic, intuitive','May lose signal, privacy concerns'],
      ['In-processing','Fairness constraints during training','Direct optimization','Model-specific, harder to implement'],
      ['Post-processing','Threshold adjustment per group','Simple, no retraining needed','May reduce overall accuracy'],
    ]}/>
    <CodeBlock language="python" label="Post-processing: Equalized Odds" code={`from fairlearn.postprocessing import ThresholdOptimizer

# Wrap your trained model with fairness post-processing
mitigated = ThresholdOptimizer(
    estimator=trained_model,
    constraints="equalized_odds",
    objective="balanced_accuracy_score"
)

mitigated.fit(X_train, y_train,
              sensitive_features=train_demographics)

fair_predictions = mitigated.predict(
    X_test,
    sensitive_features=test_demographics
)

# Compare before/after
print("Original disparity:", compute_disparity(y_pred))
print("Mitigated disparity:", compute_disparity(fair_predictions))`}/>
    <ArchitectureDecision scenario="Your credit scoring model has a 5% selection rate gap between demographic groups. The business wants to launch next month. What approach do you take?" options={[
      {label:"Post-processing threshold adjustment",tradeoff:"Fastest to implement; no retraining; may slightly reduce overall accuracy"},
      {label:"Retrain with in-processing fairness constraints",tradeoff:"Best long-term solution; requires weeks of development; may delay launch"},
      {label:"Document the gap and launch with enhanced monitoring",tradeoff:"Meets timeline but risks regulatory action; may need to address later anyway"},
    ]} correctIndex={0} explanation="Post-processing threshold adjustment is the pragmatic choice -- it addresses the disparity immediately without retraining, gets you to launch on time, and you can iterate with in-processing constraints in the next model version. Launching with a known 5% gap in credit scoring is too risky given regulatory scrutiny."/>
  </div>;
}
function RAIDeepExplainTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Production Explainability</h2>
    <CodeBlock language="python" label="SHAP Explanations at Scale" code={`import shap

# For tabular models
explainer = shap.TreeExplainer(model)  # or KernelExplainer for any model

# Single prediction explanation
shap_values = explainer.shap_values(single_input)

# Generate human-readable explanation
def explain_decision(shap_vals, feature_names, prediction):
    """Convert SHAP values to plain English"""
    contributions = sorted(
        zip(feature_names, shap_vals),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    top_reasons = contributions[:3]
    explanation = f"Decision: {'Approved' if prediction else 'Denied'}\\n"
    explanation += "Top factors:\\n"

    for feature, value in top_reasons:
        direction = "increased" if value > 0 else "decreased"
        explanation += f"  - {feature} {direction} likelihood by {abs(value):.1%}\\n"

    return explanation

# Output:
# Decision: Denied
# Top factors:
#   - income decreased likelihood by 23.4%
#   - credit_history decreased likelihood by 15.1%
#   - employment_length increased likelihood by 8.2%`}/>
    <Quiz question="Why should you use TreeExplainer instead of KernelExplainer for tree-based models?" options={["TreeExplainer works with any model type","TreeExplainer computes exact SHAP values in polynomial time vs. KernelExplainer's approximation","KernelExplainer is deprecated","TreeExplainer doesn't need training data"]} correctIndex={1} explanation="TreeExplainer leverages the tree structure to compute exact SHAP values efficiently (polynomial time), while KernelExplainer uses sampling-based approximation which is slower and less precise. Always use the specialized explainer when available."/>
  </div>;
}

export function CourseResponsibleAI({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'fairness',label:'Fairness',icon:'\u2696\uFE0F'},
    {id:'explain',label:'Explainability',icon:'\uD83D\uDCA1'},
    {id:'practice',label:'In Practice',icon:'\uD83D\uDD27'},
    {id:'tools',label:'Tools',icon:'\uD83E\uDDF0'},
  ];
  const dTabs=[
    {id:'d-fairness',label:'Fairness',icon:'\u2696\uFE0F'},
    {id:'d-explain',label:'Explainability',icon:'\uD83D\uDCA1'},
    {id:'d-mitigation',label:'Mitigation',icon:'\uD83D\uDEE1\uFE0F'},
    {id:'d-prod-explain',label:'Prod Explainability',icon:'\u2699\uFE0F'},
    {id:'d-practice',label:'In Practice',icon:'\uD83D\uDD27'},
    {id:'d-tools',label:'Tools',icon:'\uD83E\uDDF0'},
    {id:'d-governance',label:'Governance',icon:'\uD83C\uDFDB\uFE0F'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <FairnessTab/>;
      if(i===1)return <ExplainTab/>;
      if(i===2)return <RAIPracticeTab/>;
      return <RAIToolsTab/>;
    }
    if(i===0)return <FairnessTab/>;
    if(i===1)return <ExplainTab/>;
    if(i===2)return <RAIDeepFairnessTab/>;
    if(i===3)return <RAIDeepExplainTab/>;
    if(i===4)return <RAIPracticeTab/>;
    if(i===5)return <RAIToolsTab/>;
    return <RAIToolsTab/>;
  };
  return <CourseShell id="responsible-ai" icon={'\uD83E\uDD1D'} title="Responsible AI in Practice" timeMinutes={45} exerciseCount={6} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}

// ==================== COURSE 3: ENTERPRISE AI STRATEGY ====================
function EntStrategyTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>AI Strategy Fundamentals</h2>
    <AnalogyBox emoji={'\uD83C\uDFD7\uFE0F'} title="AI strategy is like building a skyscraper">You don{"'"}t start with the penthouse -- you start with the foundation. Many enterprises fail by chasing flashy AI use cases before building data infrastructure, governance, and organizational readiness.</AnalogyBox>
    <ExpandableSection title="Top-Down vs Bottom-Up AI Adoption" icon={'\u2195\uFE0F'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Top-Down:</strong> CEO mandate, centralized AI team, enterprise-wide strategy. Best for: regulated industries, large transformations. Risk: slow, disconnected from frontline needs.</li>
        <li><strong>Bottom-Up:</strong> Teams experiment independently, best practices emerge. Best for: tech-forward cultures, innovation-driven orgs. Risk: fragmentation, shadow AI, governance gaps.</li>
        <li><strong>Hybrid (Recommended):</strong> Central CoE sets guardrails and platforms; business units drive use cases. Combines strategic alignment with grassroots innovation.</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What is the biggest risk of purely bottom-up AI adoption in a large enterprise?" options={["It's too slow to show results","It creates fragmented, ungoverned 'shadow AI' across the organization","It requires too much C-suite involvement","It only works for small companies"]} correctIndex={1} explanation="Bottom-up adoption without governance leads to shadow AI -- dozens of ungoverned AI tools and models across departments, creating data silos, compliance risks, and duplicated effort. A hybrid approach with central guardrails prevents this."/>
  </div>;
}
function ValueRealizationTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Value Realization</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The graveyard of enterprise AI is full of brilliant proofs of concept that never reached production. Value realization is the discipline of turning AI experiments into measurable business outcomes.</p>
    <ExpandableSection title="The AI Value Chain" icon={'\uD83D\uDD17'} defaultOpen>
      <ul className="list-disc ml-5 space-y-1">
        <li><strong>Identify:</strong> Map high-impact use cases to business KPIs</li>
        <li><strong>Validate:</strong> Rapid prototyping with real data (2-4 weeks, not months)</li>
        <li><strong>Scale:</strong> Production deployment with monitoring and feedback loops</li>
        <li><strong>Measure:</strong> Track actual business impact vs. projected ROI</li>
        <li><strong>Optimize:</strong> Iterate based on real-world performance data</li>
      </ul>
    </ExpandableSection>
    <ComparisonTable title="AI Use Case Prioritization Matrix" columns={['Criteria','High Priority','Low Priority']} rows={[
      ['Business Impact','Revenue growth, cost reduction > 10%','Nice-to-have, incremental improvement'],
      ['Data Readiness','Clean, accessible, sufficient volume','Scattered, poor quality, privacy issues'],
      ['Technical Feasibility','Proven patterns, available models','Research-stage, no clear path'],
      ['Organizational Readiness','Champion + team + budget','No sponsor, resistance to change'],
      ['Time to Value','Results in 3-6 months','12+ months before any measurable impact'],
    ]}/>
    <Quiz question="What is the most common reason enterprise AI projects fail to deliver value?" options={["The AI models aren't accurate enough","Lack of clear connection between AI output and business KPIs","Insufficient computing power","The technology isn't mature enough"]} correctIndex={1} explanation="Most AI projects fail not because of technology but because there's no clear line from model output to business value. A model that's 95% accurate is worthless if the organization can't act on its predictions or measure the business impact."/>
  </div>;
}
function WorkflowRedesignTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Workflow Redesign</h2>
    <AnalogyBox emoji={'\uD83D\uDD04'} title="Don't pave the cow paths">The biggest AI wins come not from automating existing workflows, but from reimagining them. If you just bolt AI onto a broken process, you get a faster broken process.</AnalogyBox>
    <ExpandableSection title="Three Levels of AI Integration" icon={'\uD83D\uDCC8'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Level 1 - Assist:</strong> AI helps humans do existing tasks faster (autocomplete, summarization). Low risk, quick wins, modest impact.</li>
        <li><strong>Level 2 - Augment:</strong> AI handles routine cases, humans handle exceptions (triage, pre-screening). Medium risk, significant efficiency gains.</li>
        <li><strong>Level 3 - Automate:</strong> AI handles end-to-end with human oversight (autonomous agents, decision systems). High risk, transformative impact.</li>
      </ul>
    </ExpandableSection>
    <CodeBlock language="yaml" label="AI Integration Assessment" code={`workflow_assessment:
  current_process: "Customer support ticket routing"
  current_state:
    volume: "5,000 tickets/day"
    avg_resolution: "4.2 hours"
    misroute_rate: "23%"
    cost_per_ticket: "$12.50"

  ai_integration:
    level_1_assist:
      action: "AI suggests category, human confirms"
      expected_improvement: "15% faster routing"
      risk: "Low"

    level_2_augment:
      action: "AI auto-routes high-confidence tickets (>90%)"
      expected_improvement: "60% auto-routed, 5% misroute"
      risk: "Medium - needs escalation path"

    level_3_automate:
      action: "AI routes + resolves FAQ tickets autonomously"
      expected_improvement: "40% fully automated resolution"
      risk: "High - needs quality monitoring"`}/>
    <Quiz question="When introducing AI into an existing workflow, what should you do first?" options={["Automate the entire workflow end-to-end","Start with Level 1 (assist) and measure impact before escalating","Skip to Level 3 for maximum ROI","Replace the existing workflow entirely"]} correctIndex={1} explanation="Starting with Level 1 (assist) lets you validate AI quality, build organizational trust, and gather real-world performance data before escalating to augmentation or automation. Jumping straight to full automation risks costly failures."/>
  </div>;
}
function EntChangeTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Change Management & AI Culture</h2>
    <ExpandableSection title="The AI Adoption Curve" icon={'\uD83D\uDCC8'} defaultOpen>
      <p>Successful AI transformation requires managing people, not just technology:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Champions (10%):</strong> Early adopters who evangelize and prototype</li>
        <li><strong>Curious (30%):</strong> Open to AI but need training and clear use cases</li>
        <li><strong>Cautious (40%):</strong> Worried about job displacement, need reassurance + upskilling</li>
        <li><strong>Resistant (20%):</strong> Actively opposed -- require leadership alignment and demonstrated value</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="Building an AI Center of Excellence" icon={'\uD83C\uDFE2'}>
      <p>A CoE serves as the central hub for AI expertise, governance, and enablement:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Platform team:</strong> Shared infrastructure (MLOps, data pipelines, model registry)</li>
        <li><strong>Advisory team:</strong> Use case evaluation, architecture review, vendor assessment</li>
        <li><strong>Governance team:</strong> Responsible AI policies, compliance, risk management</li>
        <li><strong>Enablement team:</strong> Training, documentation, community of practice</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What is the primary purpose of an AI Center of Excellence (CoE)?" options={["To build all AI models centrally","To block business units from using AI independently","To provide shared infrastructure, governance, and enablement while business units drive use cases","To evaluate and purchase AI vendors"]} correctIndex={2} explanation="A CoE's primary role is enablement -- providing shared platforms, governance guardrails, and expertise so business units can drive their own AI use cases safely and efficiently, rather than centralizing all AI work."/>
  </div>;
}
// Deep tabs for Enterprise Strategy
function EntDeepMaturityTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>AI Maturity Assessment</h2>
    <ComparisonTable title="Enterprise AI Maturity Model" columns={['Level','Name','Characteristics','Focus']} rows={[
      ['1','Exploring','Ad-hoc experiments, no strategy, individual champions','Awareness & education'],
      ['2','Experimenting','Multiple PoCs, some executive sponsorship, basic data infra','Use case validation'],
      ['3','Operationalizing','Models in production, MLOps basics, governance starting','Scaling & reliability'],
      ['4','Scaling','AI platform, CoE, systematic deployment pipeline','Enterprise-wide adoption'],
      ['5','Transforming','AI-native workflows, continuous improvement, competitive moat','Business model innovation'],
    ]}/>
    <CodeBlock language="yaml" label="AI Maturity Self-Assessment" code={`assessment:
  strategy:
    - question: "Is there a board-approved AI strategy?"
      level_1: "No formal strategy"
      level_3: "Strategy exists but loosely followed"
      level_5: "Strategy drives all AI investment decisions"

  data:
    - question: "How accessible is data for AI projects?"
      level_1: "Data in silos, no catalog"
      level_3: "Central data lake, basic governance"
      level_5: "Self-service data platform, real-time streaming"

  talent:
    - question: "What AI skills exist in-house?"
      level_1: "No dedicated AI roles"
      level_3: "Small ML team, some citizen developers"
      level_5: "AI literacy org-wide, specialized teams per domain"

  operations:
    - question: "How are models deployed and monitored?"
      level_1: "Manual, ad-hoc deployments"
      level_3: "CI/CD for models, basic monitoring"
      level_5: "Full MLOps, automated retraining, A/B testing"`}/>
    <ArchitectureDecision scenario="Your enterprise is at maturity Level 2 (Experimenting). You have 5 PoCs running with mixed results. The CEO wants to 'scale AI across the company' by next quarter. What do you recommend?" options={[
      {label:"Scale the most successful PoC to 10 departments",tradeoff:"Fastest visible progress but risks scaling without proper infrastructure"},
      {label:"Pause new PoCs, invest in Level 3 infrastructure first",tradeoff:"Right long-term move but looks like 'slowing down' to leadership"},
      {label:"Productionize 2 best PoCs while building platform in parallel",tradeoff:"Balanced approach -- delivers wins while building foundation; requires careful resource allocation"},
    ]} correctIndex={2} explanation="The parallel approach balances quick wins (keeping leadership engaged) with infrastructure investment (enabling sustainable scale). Scaling without infrastructure leads to fragile deployments; pausing everything loses organizational momentum."/>
  </div>;
}
function EntDeepRoadmapTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Building an AI Roadmap</h2>
    <CodeBlock language="yaml" label="12-Month Enterprise AI Roadmap" code={`quarter_1: "Foundation"
  goals:
    - "Establish AI CoE (5-person core team)"
    - "Deploy data platform / lakehouse"
    - "Complete AI maturity assessment"
    - "Select 3 high-impact pilot use cases"
  kpis:
    - "Data platform uptime > 99%"
    - "3 use cases selected with executive sponsors"

quarter_2: "Pilot & Prove"
  goals:
    - "Deploy 2 pilots to production"
    - "Implement basic MLOps pipeline"
    - "Launch AI literacy program (100+ employees)"
    - "Draft responsible AI policy"
  kpis:
    - "2 models in production"
    - "Measurable ROI from at least 1 pilot"

quarter_3: "Scale & Govern"
  goals:
    - "Scale successful pilots to 3+ departments"
    - "Operationalize responsible AI framework"
    - "Build model registry and monitoring"
    - "Launch citizen developer program"
  kpis:
    - "5+ models in production"
    - "100% of models with monitoring"

quarter_4: "Transform"
  goals:
    - "AI-assisted workflows in 5+ business units"
    - "Self-service AI platform for citizen developers"
    - "Quarterly AI portfolio review process"
    - "Plan next year's AI investment roadmap"
  kpis:
    - "Measurable ROI across 3+ use cases"
    - "Employee AI satisfaction > 70%"`}/>
    <Quiz question="What should be the primary KPI for Quarter 1 of an enterprise AI roadmap?" options={["Number of models in production","Revenue generated by AI","Infrastructure readiness and use case selection with executive sponsors","Employee AI certification rate"]} correctIndex={2} explanation="Quarter 1 is about foundation -- you can't measure model production or revenue yet. The right KPIs are infrastructure readiness and having selected use cases with committed executive sponsors, which sets up everything that follows."/>
  </div>;
}

export function CourseEnterpriseStrategy({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'strategy',label:'Strategy',icon:'\uD83C\uDFAF'},
    {id:'value',label:'Value Realization',icon:'\uD83D\uDCB0'},
    {id:'workflow',label:'Workflow Redesign',icon:'\uD83D\uDD04'},
    {id:'change',label:'Change Mgmt',icon:'\uD83D\uDC65'},
  ];
  const dTabs=[
    {id:'d-strategy',label:'Strategy',icon:'\uD83C\uDFAF'},
    {id:'d-value',label:'Value',icon:'\uD83D\uDCB0'},
    {id:'d-maturity',label:'Maturity Model',icon:'\uD83D\uDCCA'},
    {id:'d-workflow',label:'Workflow',icon:'\uD83D\uDD04'},
    {id:'d-roadmap',label:'Roadmap',icon:'\uD83D\uDDFA\uFE0F'},
    {id:'d-change',label:'Change Mgmt',icon:'\uD83D\uDC65'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <EntStrategyTab/>;
      if(i===1)return <ValueRealizationTab/>;
      if(i===2)return <WorkflowRedesignTab/>;
      return <EntChangeTab/>;
    }
    if(i===0)return <EntStrategyTab/>;
    if(i===1)return <ValueRealizationTab/>;
    if(i===2)return <EntDeepMaturityTab/>;
    if(i===3)return <WorkflowRedesignTab/>;
    if(i===4)return <EntDeepRoadmapTab/>;
    return <EntChangeTab/>;
  };
  return <CourseShell id="enterprise-strategy" icon={'\uD83D\uDCCA'} title="Enterprise AI Strategy" timeMinutes={40} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}

// ==================== COURSE 4: AI ECONOMICS & ROI ====================
function CostModelTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>AI Cost Structure</h2>
    <AnalogyBox emoji={'\uD83D\uDCB0'} title="AI costs are like an iceberg">The API call cost is just the tip. Below the surface: data preparation, engineering time, monitoring, retraining, compliance, and the opportunity cost of getting it wrong.</AnalogyBox>
    <ComparisonTable title="AI Cost Breakdown" columns={['Category','% of Total','Components']} rows={[
      ['Data & Preparation','25-35%','Collection, cleaning, labeling, storage, pipelines'],
      ['Development','20-30%','Engineering, experimentation, model selection, testing'],
      ['Infrastructure','15-25%','Compute (training + inference), GPUs, cloud services'],
      ['Operations','10-15%','Monitoring, retraining, incident response, on-call'],
      ['Governance','5-10%','Compliance, audits, documentation, legal review'],
    ]}/>
    <ExpandableSection title="Inference Cost Drivers" icon={'\u26A1'} defaultOpen>
      <p>For production AI, inference cost usually dominates over time:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Token volume:</strong> Input + output tokens per request x requests per day</li>
        <li><strong>Model size:</strong> GPT-4 class = 10-30x cost of GPT-4o-mini class</li>
        <li><strong>Latency requirements:</strong> Real-time needs more expensive provisioned capacity</li>
        <li><strong>Caching:</strong> Prompt caching can reduce costs 50-90% for repeated patterns</li>
      </ul>
    </ExpandableSection>
    <Quiz question="Which cost category typically represents the largest share of an enterprise AI project's total cost?" options={["GPU/compute infrastructure","API call costs","Data preparation and engineering","Model training compute"]} correctIndex={2} explanation="Data preparation and engineering (collection, cleaning, labeling, pipeline building) typically accounts for 25-35% of total AI project costs -- more than any other single category. The popular focus on GPU costs and API pricing misses the bigger picture."/>
  </div>;
}
function BuildVsBuyTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Build vs Buy vs Fine-Tune</h2>
    <ComparisonTable title="Build vs Buy Decision Framework" columns={['Factor','Build Custom','Fine-Tune Foundation','Buy SaaS/API']} rows={[
      ['Upfront Cost','$$$','$$','$'],
      ['Time to Deploy','6-18 months','2-8 weeks','Days to weeks'],
      ['Customization','Full control','Moderate','Limited'],
      ['Maintenance','High (your team)','Medium','Low (vendor handles)'],
      ['Data Privacy','Full control','Your data stays local','Data sent to vendor'],
      ['Best For','Core differentiator','Domain adaptation','Commodity capabilities'],
    ]}/>
    <ExpandableSection title="Decision Framework" icon={'\uD83E\uDD14'} defaultOpen>
      <p>Ask these questions to choose the right approach:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Is this a competitive differentiator?</strong> Yes = Build or Fine-tune. No = Buy.</li>
        <li><strong>Do you have proprietary data that matters?</strong> Yes = Fine-tune. No = Buy.</li>
        <li><strong>Can you afford 6+ months to deploy?</strong> No = Buy or Fine-tune. Yes = Build is an option.</li>
        <li><strong>Does your data leave your premises?</strong> Can{"'"}t = Build or Fine-tune locally. Can = Buy is fine.</li>
      </ul>
    </ExpandableSection>
    <Quiz question="When should you fine-tune a foundation model instead of using it via API?" options={["Always -- fine-tuning is always better","When you have proprietary domain data that significantly improves performance for your specific task","When you want to save on API costs","Only when building consumer products"]} correctIndex={1} explanation="Fine-tuning makes sense when you have proprietary data that meaningfully improves the model for your specific domain (medical, legal, your company's style). If a well-prompted API call works, fine-tuning adds unnecessary cost and maintenance."/>
  </div>;
}
function ROITab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Measuring AI ROI</h2>
    <CodeBlock language="python" label="AI ROI Calculator" code={`def calculate_ai_roi(
    development_cost,      # One-time build cost
    monthly_infra_cost,    # Ongoing compute + ops
    monthly_labor_savings, # Hours saved * hourly rate
    monthly_revenue_lift,  # Additional revenue from AI
    monthly_error_reduction_value,  # Cost of errors avoided
    months=12
):
    total_investment = development_cost + (monthly_infra_cost * months)
    total_benefit = (
        monthly_labor_savings +
        monthly_revenue_lift +
        monthly_error_reduction_value
    ) * months

    roi_percent = ((total_benefit - total_investment) / total_investment) * 100
    payback_months = development_cost / (
        monthly_labor_savings +
        monthly_revenue_lift +
        monthly_error_reduction_value -
        monthly_infra_cost
    )

    return {
        "total_investment": total_investment,
        "total_benefit": total_benefit,
        "net_value": total_benefit - total_investment,
        "roi_percent": round(roi_percent, 1),
        "payback_months": round(payback_months, 1)
    }

# Example: AI customer support triage
result = calculate_ai_roi(
    development_cost=50000,
    monthly_infra_cost=2000,
    monthly_labor_savings=15000,
    monthly_revenue_lift=5000,
    monthly_error_reduction_value=3000,
    months=12
)
# roi_percent: 230.8%, payback_months: 3.1`}/>
    <Quiz question="Which metric best captures the 'time to break even' on an AI investment?" options={["ROI percentage","Net Present Value","Payback period in months","Total cost of ownership"]} correctIndex={2} explanation="Payback period (months until cumulative benefits exceed cumulative costs) is the most intuitive measure of when you break even. It's especially important for AI projects where leadership wants to see returns quickly."/>
  </div>;
}
// Deep tabs for AI Economics
function EconDeepGPUTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>GPU Economics & Infrastructure</h2>
    <ComparisonTable title="Inference Cost Comparison (per 1M tokens)" columns={['Model','Input Cost','Output Cost','Speed','Best For']} rows={[
      ['GPT-4o','$2.50','$10.00','Fast','Complex reasoning, coding'],
      ['GPT-4o-mini','$0.15','$0.60','Very fast','Simple tasks, high volume'],
      ['Claude 3.5 Sonnet','$3.00','$15.00','Fast','Analysis, writing, coding'],
      ['Claude 3.5 Haiku','$0.25','$1.25','Very fast','Classification, extraction'],
      ['Gemini 1.5 Flash','$0.075','$0.30','Very fast','Bulk processing'],
      ['Llama 3 70B (self-hosted)','~$0.50*','~$0.50*','Moderate','Data privacy, custom deployment'],
    ]}/>
    <p className="mb-4 text-xs italic" style={{color:GIM.mutedText}}>* Self-hosted costs vary significantly based on GPU utilization and hardware amortization.</p>
    <ExpandableSection title="Cost Optimization Strategies" icon={'\uD83D\uDCB8'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Model routing:</strong> Use cheap models for simple tasks, expensive models only when needed (save 60-80%)</li>
        <li><strong>Prompt caching:</strong> Cache system prompts and repeated context (save 50-90% on cached tokens)</li>
        <li><strong>Batching:</strong> Batch non-urgent requests for off-peak pricing</li>
        <li><strong>Output length control:</strong> Set max_tokens aggressively -- output tokens cost 3-5x input</li>
        <li><strong>Semantic caching:</strong> Cache responses for semantically similar queries</li>
      </ul>
    </ExpandableSection>
    <CodeBlock language="python" label="Model Router for Cost Optimization" code={`class CostAwareRouter:
    """Route requests to cheapest capable model"""

    MODELS = {
        "simple": {"name": "gpt-4o-mini", "cost_per_1k": 0.00015},
        "medium": {"name": "claude-3-5-haiku", "cost_per_1k": 0.00025},
        "complex": {"name": "claude-3-5-sonnet", "cost_per_1k": 0.003},
    }

    def classify_complexity(self, prompt):
        """Simple heuristic -- production would use a classifier"""
        token_count = len(prompt.split()) * 1.3
        has_code = any(kw in prompt.lower()
                       for kw in ["code", "function", "implement", "debug"])
        has_analysis = any(kw in prompt.lower()
                          for kw in ["analyze", "compare", "evaluate", "strategy"])

        if has_code or has_analysis or token_count > 500:
            return "complex"
        elif token_count > 100:
            return "medium"
        return "simple"

    def route(self, prompt):
        tier = self.classify_complexity(prompt)
        model = self.MODELS[tier]
        return model["name"]

# Result: 70% of requests go to 'simple' tier
# saving ~90% vs routing everything to complex`}/>
    <Quiz question="What is the most impactful cost optimization strategy for most AI applications?" options={["Using the cheapest model for everything","Model routing -- using cheap models for simple tasks and expensive ones only when needed","Training your own model to avoid API costs","Reducing the number of AI features"]} correctIndex={1} explanation="Model routing typically saves 60-80% on inference costs because most requests (70%+) are simple enough for cheap models. The expensive model only handles the 20-30% that actually need it."/>
  </div>;
}
function EconDeepBizCaseTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Building an AI Business Case</h2>
    <CodeBlock language="yaml" label="AI Business Case Template" code={`ai_business_case:
  executive_summary:
    problem: "Manual invoice processing costs $45/invoice, 15 FTE"
    solution: "AI-powered invoice extraction and matching"
    investment: "$180K first year ($80K dev + $100K infra/ops)"
    return: "$540K annual savings (12 FTE equivalent redeployed)"
    payback: "4 months"

  current_state:
    process: "Manual data entry from PDF invoices"
    volume: "3,000 invoices/month"
    error_rate: "8%"
    cost_per_invoice: "$45"
    annual_cost: "$1,620,000"

  proposed_state:
    process: "AI extraction with human review of low-confidence"
    automation_rate: "85% fully automated"
    error_rate: "2%"
    cost_per_invoice: "$12"
    annual_cost: "$432,000"

  risk_factors:
    - risk: "Invoice format variability"
      mitigation: "Train on 50+ formats, human fallback for new"
      probability: "Medium"
    - risk: "Vendor pushback on automated payments"
      mitigation: "Phased rollout, human approval > $10K"
      probability: "Low"

  success_metrics:
    - "Automation rate > 80% within 3 months"
    - "Error rate < 3%"
    - "Cost per invoice < $15"
    - "Employee satisfaction (redeployed staff) > 75%"`}/>
    <ArchitectureDecision scenario="Your CFO asks: 'Should we build AI invoice processing in-house or buy an off-the-shelf solution at $8/invoice?' Your current cost is $45/invoice." options={[
      {label:"Buy the SaaS solution at $8/invoice",tradeoff:"Immediate savings (82%), zero dev cost, but you're dependent on vendor and your data leaves your systems"},
      {label:"Build custom for $12/invoice target",tradeoff:"Higher upfront cost but full control, better long-term economics at scale, data stays in-house"},
      {label:"Start with SaaS now, build custom later if volume justifies",tradeoff:"Fastest time-to-savings; evaluate real needs before committing to build; risk of migration cost later"},
    ]} correctIndex={2} explanation="Starting with SaaS gives immediate 82% cost reduction with zero development risk. If your volume grows or you need more control, you can build custom later with real production data to inform the design. This 'crawl-walk-run' approach minimizes risk while capturing value quickly."/>
  </div>;
}

export function CourseAIEconomics({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'costs',label:'Cost Structure',icon:'\uD83D\uDCB0'},
    {id:'build-buy',label:'Build vs Buy',icon:'\uD83E\uDD14'},
    {id:'roi',label:'Measuring ROI',icon:'\uD83D\uDCC8'},
  ];
  const dTabs=[
    {id:'d-costs',label:'Cost Structure',icon:'\uD83D\uDCB0'},
    {id:'d-build-buy',label:'Build vs Buy',icon:'\uD83E\uDD14'},
    {id:'d-gpu',label:'GPU Economics',icon:'\u26A1'},
    {id:'d-roi',label:'Measuring ROI',icon:'\uD83D\uDCC8'},
    {id:'d-bizcase',label:'Business Case',icon:'\uD83D\uDCBC'},
    {id:'d-optimize',label:'Cost Optimization',icon:'\uD83D\uDCB8'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <CostModelTab/>;
      if(i===1)return <BuildVsBuyTab/>;
      return <ROITab/>;
    }
    if(i===0)return <CostModelTab/>;
    if(i===1)return <BuildVsBuyTab/>;
    if(i===2)return <EconDeepGPUTab/>;
    if(i===3)return <ROITab/>;
    if(i===4)return <EconDeepBizCaseTab/>;
    return <EconDeepGPUTab/>;
  };
  return <CourseShell id="ai-economics" icon={'\uD83D\uDCC8'} title="AI Economics & ROI" timeMinutes={35} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}

// ==================== COURSE 5: COMPUTER USE & BROWSER AGENTS ====================
function CompUseIntroTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>AI That Operates Your Computer</h2>
    <AnalogyBox emoji={'\uD83D\uDDA5\uFE0F'} title="From chatbot to co-pilot to operator">Traditional AI answers questions. Agentic AI takes actions. Computer-use AI actually operates your software -- clicking buttons, filling forms, navigating websites -- like a remote colleague sharing your screen.</AnalogyBox>
    <ExpandableSection title="How Computer Use Works" icon={'\u2699\uFE0F'} defaultOpen>
      <p>Computer use AI combines several capabilities:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Screen understanding:</strong> AI sees screenshots and understands UI elements</li>
        <li><strong>Action generation:</strong> Converts intent into mouse clicks, keyboard input, scrolling</li>
        <li><strong>State tracking:</strong> Remembers what it{"'"}s done and what{"'"}s changed</li>
        <li><strong>Error recovery:</strong> Detects when something went wrong and tries alternatives</li>
      </ul>
    </ExpandableSection>
    <ComparisonTable title="Computer Use Approaches" columns={['Approach','How It Works','Pros','Cons']} rows={[
      ['Screenshot + Vision','AI sees pixels, identifies elements visually','Works with any app, no integration needed','Slower, brittle to UI changes'],
      ['DOM/Accessibility Tree','AI reads the page structure directly','Fast, reliable, structured data','Web-only, needs browser extension'],
      ['API-first','AI calls APIs instead of using UI','Fastest, most reliable','Only works when APIs exist'],
      ['Hybrid','Combines DOM reading with visual fallback','Best of both worlds','More complex to build'],
    ]}/>
    <Quiz question="What is the key advantage of computer-use AI over traditional API-based automation?" options={["It's always faster","It works with any application that has a visual interface, even without APIs","It's more reliable than APIs","It doesn't need any permissions"]} correctIndex={1} explanation="Computer-use AI's superpower is universality -- it can automate any application with a visual interface, even legacy systems with no APIs. This is what makes it 'RPA 2.0' -- it handles the long tail of applications that can't be integrated any other way."/>
  </div>;
}
function BrowserAgentsTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Browser Agents</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Browser agents are AI systems that can navigate the web, interact with websites, and complete tasks autonomously. They represent the intersection of LLMs, browser automation, and agentic reasoning.</p>
    <ExpandableSection title="Browser Agent Architecture" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Perception:</strong> Read DOM, take screenshots, extract accessibility tree</li>
        <li><strong>Planning:</strong> Break task into steps, identify which elements to interact with</li>
        <li><strong>Action:</strong> Click, type, scroll, navigate, wait for page loads</li>
        <li><strong>Verification:</strong> Confirm action succeeded, handle errors or unexpected states</li>
        <li><strong>Memory:</strong> Track what{"'"}s been done, what pages visited, what data collected</li>
      </ul>
    </ExpandableSection>
    <CodeBlock language="javascript" label="Browser Agent Loop (Conceptual)" code={`async function browserAgentLoop(task, browser) {
  const history = [];
  let step = 0;

  while (step < MAX_STEPS) {
    // 1. Perceive current state
    const screenshot = await browser.screenshot();
    const dom = await browser.getAccessibilityTree();

    // 2. Plan next action
    const action = await llm.decide({
      task: task,
      currentPage: dom,
      screenshot: screenshot,
      history: history,
      prompt: "What should I do next to complete this task?"
    });

    // 3. Execute action
    if (action.type === "click") {
      await browser.click(action.selector);
    } else if (action.type === "type") {
      await browser.type(action.selector, action.text);
    } else if (action.type === "navigate") {
      await browser.goto(action.url);
    } else if (action.type === "done") {
      return { success: true, result: action.result };
    }

    // 4. Record and verify
    history.push(action);
    await browser.waitForNavigation();
    step++;
  }
  return { success: false, reason: "Max steps exceeded" };
}`}/>
    <Quiz question="Why do browser agents need both DOM/accessibility tree access AND screenshot capability?" options={["Screenshots are just for debugging","DOM gives structure but screenshots help with visual elements the DOM doesn't describe well","They always use screenshots, DOM is optional","Browser agents don't actually need both"]} correctIndex={1} explanation="DOM provides structured, reliable element data (text, roles, properties), but some UI elements are better understood visually (icons, layouts, visual state indicators). The combination gives the agent both structural understanding and visual context."/>
  </div>;
}
function RPA2Tab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>From RPA to AI Agents</h2>
    <ComparisonTable title="RPA vs AI-Powered Automation" columns={['Capability','Traditional RPA','AI Browser Agents']} rows={[
      ['UI Handling','Pixel coordinates, selectors','Visual understanding + DOM'],
      ['Adaptability','Breaks on any UI change','Adapts to layout changes'],
      ['Decision Making','Fixed rules, if/then','Reasoning, judgment, context'],
      ['Unstructured Data','Cannot handle','Reads, interprets, extracts'],
      ['Error Recovery','Predefined error paths','Reasons about errors, tries alternatives'],
      ['Setup Time','Weeks of scripting','Natural language instructions'],
    ]}/>
    <ExpandableSection title="Safety & Guardrails" icon={'\uD83D\uDEE1\uFE0F'} defaultOpen>
      <p>Computer-use AI needs careful safety controls:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Action sandboxing:</strong> Limit which applications and sites the agent can access</li>
        <li><strong>Confirmation gates:</strong> Require human approval for irreversible actions (purchases, deletions, sends)</li>
        <li><strong>Credential isolation:</strong> Never let the agent handle passwords or sensitive data directly</li>
        <li><strong>Audit logging:</strong> Record every action with screenshots for review</li>
        <li><strong>Kill switch:</strong> Instant abort capability for when things go wrong</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What is the single most important safety control for a computer-use AI agent?" options={["Speed limiting (slow it down)","Confirmation gates for irreversible actions","Only allowing it to use one website","Requiring it to explain every action first"]} correctIndex={1} explanation="Confirmation gates for irreversible actions (purchases, deletions, sending messages) are the most critical safety control. They prevent the worst-case scenarios while still allowing the agent to operate autonomously for reversible, low-risk actions."/>
  </div>;
}
function CompUseFutureTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>The Future of Computer Use</h2>
    <ExpandableSection title="Key Players & Approaches" icon={'\uD83C\uDFAE'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Anthropic Computer Use:</strong> Claude can see screenshots and generate mouse/keyboard actions. Works with any desktop application.</li>
        <li><strong>OpenAI Operator:</strong> Web browsing agent with built-in safety controls and human handoff.</li>
        <li><strong>Google Project Mariner:</strong> Chrome-based agent that understands and acts on web content.</li>
        <li><strong>Open source:</strong> Playwright + LLM combinations, Browser Use, LaVague for web automation.</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="What's Next" icon={'\uD83D\uDD2E'}>
      <ul className="list-disc ml-5 space-y-1">
        <li>Multi-app workflows (email to CRM to calendar in one flow)</li>
        <li>Persistent agents that monitor and act on triggers</li>
        <li>Collaborative agents (one researches, another books, another confirms)</li>
        <li>OS-level integration (beyond browser into native desktop apps)</li>
        <li>Standardized safety protocols for autonomous computer operation</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What makes Anthropic's computer use approach different from traditional browser automation?" options={["It only works in Chrome","It uses pixel-level vision to understand any application, not just web pages","It requires special APIs from each application","It can only perform read operations"]} correctIndex={1} explanation="Anthropic's approach uses vision (screenshots) to understand any application's interface -- desktop apps, web pages, terminals, anything visible on screen. This makes it application-agnostic, unlike browser automation that only works with web content."/>
  </div>;
}
// Deep tabs for Computer Use
function CompUseDeepArchTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Building a Browser Agent</h2>
    <CodeBlock language="python" label="Production Browser Agent Framework" code={`from playwright.async_api import async_playwright
import anthropic

class BrowserAgent:
    def __init__(self, task, max_steps=20):
        self.task = task
        self.max_steps = max_steps
        self.client = anthropic.Anthropic()
        self.history = []

    async def get_page_context(self, page):
        """Extract structured page representation"""
        # Get accessibility tree (more reliable than raw DOM)
        tree = await page.accessibility.snapshot()
        url = page.url
        title = await page.title()
        return {
            "url": url,
            "title": title,
            "elements": self._flatten_tree(tree),
            "interactable": [
                e for e in self._flatten_tree(tree)
                if e.get("role") in (
                    "button", "link", "textbox",
                    "checkbox", "combobox"
                )
            ]
        }

    async def decide_action(self, context):
        """Use LLM to decide next action"""
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system="You are a browser automation agent.",
            messages=[{
                "role": "user",
                "content": f"""Task: {self.task}
Current page: {context['title']} ({context['url']})
History: {self.history[-5:]}
Interactive elements: {context['interactable'][:30]}

Return JSON: {{"action": "click|type|navigate|scroll|done",
"target": "element description", "value": "text if typing"}}"""
            }]
        )
        return self._parse_action(response)

    async def run(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page()

            for step in range(self.max_steps):
                context = await self.get_page_context(page)
                action = await self.decide_action(context)

                if action["action"] == "done":
                    return {"success": True, "steps": step}

                await self._execute(page, action)
                self.history.append(action)

            return {"success": False, "reason": "max steps"}`}/>
    <ArchitectureDecision scenario="You're building a browser agent for internal enterprise use (expense reports, HR forms). The agent needs to fill forms that contain employee PII. How should you handle credentials and sensitive data?" options={[
      {label:"Pass credentials to the LLM in the prompt",tradeoff:"Simple but extremely dangerous -- PII in LLM context, potential logging/training exposure"},
      {label:"Use a credential vault with scoped, temporary tokens",tradeoff:"Secure but complex -- agent gets time-limited tokens, never sees actual passwords"},
      {label:"Have the human log in first, then hand off the authenticated session",tradeoff:"Good balance -- human handles auth, agent handles tedious form-filling in authenticated context"},
    ]} correctIndex={2} explanation="Having the human authenticate first is the safest practical approach. The agent never touches credentials, operates within an already-authenticated session, and the human maintains control over access. For PII form fields, the agent can fill from a secure vault without the LLM ever seeing the raw values."/>
  </div>;
}
function CompUseDeepSafetyTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Safety Architecture for Autonomous Agents</h2>
    <CodeBlock language="python" label="Action Safety Layer" code={`class SafetyLayer:
    """Filter and gate agent actions before execution"""

    IRREVERSIBLE_ACTIONS = {
        "purchase", "delete", "send_email",
        "submit_form", "transfer_funds",
        "publish", "share_externally"
    }

    BLOCKED_DOMAINS = {
        "bank.*", "*.gov", "admin.*",
        "payment.*", "oauth.*"
    }

    def __init__(self, allowed_domains=None):
        self.allowed_domains = allowed_domains or ["*"]
        self.action_log = []

    def check_action(self, action, context):
        """Returns (allowed, reason, needs_confirmation)"""
        # Check domain allowlist
        if not self._domain_allowed(context["url"]):
            return False, "Domain not in allowlist", False

        # Check for irreversible actions
        if action.get("type") in self.IRREVERSIBLE_ACTIONS:
            return True, "Irreversible action", True  # needs confirmation

        # Check for sensitive data in typed text
        if action.get("type") == "type":
            if self._contains_pii(action.get("value", "")):
                return True, "Contains PII", True

        # Rate limiting
        if len(self.action_log) > 100:
            return False, "Rate limit exceeded", False

        return True, "OK", False

    def _domain_allowed(self, url):
        import re
        domain = url.split("//")[-1].split("/")[0]
        for pattern in self.BLOCKED_DOMAINS:
            if re.match(pattern.replace("*", ".*"), domain):
                return False
        if self.allowed_domains == ["*"]:
            return True
        return any(
            re.match(p.replace("*", ".*"), domain)
            for p in self.allowed_domains
        )`}/>
    <Quiz question="An AI browser agent encounters a page with a 'Delete All Records' button during a data export task. What should it do?" options={["Click it if it seems relevant to the task","Skip it silently and continue","Halt execution and request human confirmation","Add it to the action queue for later"]} correctIndex={2} explanation="Any irreversible action like deletion must trigger a confirmation gate. The agent should halt, present the situation to the human operator with full context (what page, what button, why it's relevant), and only proceed with explicit approval. This is the core safety principle for autonomous agents."/>
  </div>;
}

export function CourseComputerUse({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'intro',label:'Computer Use',icon:'\uD83D\uDDA5\uFE0F'},
    {id:'browser',label:'Browser Agents',icon:'\uD83C\uDF10'},
    {id:'rpa',label:'RPA 2.0',icon:'\uD83E\uDD16'},
    {id:'future',label:'Future',icon:'\uD83D\uDD2E'},
  ];
  const dTabs=[
    {id:'d-intro',label:'Computer Use',icon:'\uD83D\uDDA5\uFE0F'},
    {id:'d-browser',label:'Browser Agents',icon:'\uD83C\uDF10'},
    {id:'d-arch',label:'Building Agents',icon:'\uD83C\uDFD7\uFE0F'},
    {id:'d-rpa',label:'RPA 2.0',icon:'\uD83E\uDD16'},
    {id:'d-safety',label:'Safety Architecture',icon:'\uD83D\uDEE1\uFE0F'},
    {id:'d-future',label:'Future',icon:'\uD83D\uDD2E'},
    {id:'d-practice',label:'Hands-On',icon:'\u2699\uFE0F'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <CompUseIntroTab/>;
      if(i===1)return <BrowserAgentsTab/>;
      if(i===2)return <RPA2Tab/>;
      return <CompUseFutureTab/>;
    }
    if(i===0)return <CompUseIntroTab/>;
    if(i===1)return <BrowserAgentsTab/>;
    if(i===2)return <CompUseDeepArchTab/>;
    if(i===3)return <RPA2Tab/>;
    if(i===4)return <CompUseDeepSafetyTab/>;
    if(i===5)return <CompUseFutureTab/>;
    return <CompUseFutureTab/>;
  };
  return <CourseShell id="computer-use" icon={'\uD83D\uDDA5\uFE0F'} title="Computer Use & Browser Agents" timeMinutes={45} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}

// ==================== COURSE 6: PHYSICAL AI & ROBOTICS FOUNDATIONS ====================
function EmbodiedAITab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Embodied AI: When AI Meets the Physical World</h2>
    <AnalogyBox emoji={'\uD83E\uDD16'} title="From brain to body">LLMs are like brilliant brains in jars -- immense reasoning power but no hands, no eyes, no ability to interact with the physical world. Embodied AI gives them a body: sensors to perceive, actuators to act, and physics to contend with.</AnalogyBox>
    <ExpandableSection title="What Makes Physical AI Different" icon={'\uD83C\uDF0D'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Real-world consequences:</strong> A wrong API call can be retried; a robot arm that moves wrong can break things or hurt people</li>
        <li><strong>Continuous state:</strong> Digital systems have discrete states; physical world is continuous and noisy</li>
        <li><strong>Latency matters:</strong> A self-driving car needs decisions in milliseconds, not seconds</li>
        <li><strong>Sensor noise:</strong> Cameras blur, LiDAR has artifacts, GPS drifts -- real data is messy</li>
        <li><strong>Physics constraints:</strong> Gravity, friction, momentum -- you can{"'"}t ctrl+Z in the real world</li>
      </ul>
    </ExpandableSection>
    <ComparisonTable title="Digital AI vs Physical AI" columns={['Aspect','Digital AI','Physical AI']} rows={[
      ['Environment','Structured data, APIs','Unstructured, continuous, noisy'],
      ['Errors','Retry, rollback','May cause physical damage'],
      ['Latency','Seconds acceptable','Milliseconds critical'],
      ['Testing','Unit tests, CI/CD','Simulation + real-world validation'],
      ['Deployment','Cloud, push update','Hardware + software, field updates'],
      ['Safety','Data protection','Physical safety, human proximity'],
    ]}/>
    <Quiz question="What is the fundamental challenge that makes physical AI harder than digital AI?" options={["Physical AI needs more compute power","Robots are expensive to build","Real-world actions are irreversible and the environment is continuous and noisy","Programming languages for robotics are harder"]} correctIndex={2} explanation="The core challenge is irreversibility combined with environmental complexity. In digital AI, you can retry, rollback, or A/B test safely. In physical AI, a wrong action can damage property or injure people, and the continuous, noisy nature of the real world makes prediction much harder."/>
  </div>;
}
function SimToRealTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Simulation-to-Real Transfer</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Training robots in the real world is slow, expensive, and dangerous. The breakthrough: train in simulation, then transfer to reality. This is called sim-to-real transfer.</p>
    <ExpandableSection title="The Sim-to-Real Pipeline" icon={'\uD83C\uDFAE'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>Build simulation:</strong> Create virtual environment mimicking real-world physics (Isaac Sim, MuJoCo, PyBullet)</li>
        <li><strong>Domain randomization:</strong> Vary lighting, textures, physics parameters so the model generalizes</li>
        <li><strong>Train policy:</strong> Use reinforcement learning to learn tasks in simulation (millions of trials in hours)</li>
        <li><strong>Transfer:</strong> Deploy trained policy on real robot</li>
        <li><strong>Fine-tune:</strong> Adapt with small amounts of real-world data to close the "reality gap"</li>
      </ul>
    </ExpandableSection>
    <CodeBlock language="python" label="Sim-to-Real Training Loop (Conceptual)" code={`# Training a robot arm to pick up objects

# 1. Simulation setup
env = IsaacSimEnv(
    scene="tabletop_pick_and_place",
    robot="franka_panda",
    randomize={
        "object_positions": True,
        "lighting": True,
        "table_texture": True,
        "object_mass": (0.1, 2.0),  # kg range
        "friction": (0.3, 0.8),
    }
)

# 2. Train with reinforcement learning
agent = PPO(
    policy_network=TransformerPolicy(
        obs_dim=env.observation_space,
        act_dim=env.action_space
    ),
    learning_rate=3e-4
)

# 3. Millions of simulated episodes
for episode in range(2_000_000):
    obs = env.reset()  # Random scene each time
    while not done:
        action = agent.act(obs)
        obs, reward, done = env.step(action)
        agent.learn(reward)

# 4. Transfer to real robot
real_robot = FrankaPanda()
real_robot.load_policy(agent.policy)
# Fine-tune with 100 real-world demonstrations`}/>
    <Quiz question="Why is 'domain randomization' critical for sim-to-real transfer?" options={["It makes the simulation run faster","It reduces training compute costs","It forces the model to generalize across variations so it's robust to real-world differences","It improves the visual quality of the simulation"]} correctIndex={2} explanation="Domain randomization deliberately varies visual and physical parameters (lighting, textures, friction, mass) during simulation training. This forces the model to learn robust strategies that work across many conditions, rather than overfitting to one specific simulation setup -- which is key to surviving the 'reality gap' when deployed on real hardware."/>
  </div>;
}
function SensorFusionTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Sensor Fusion & Perception</h2>
    <ComparisonTable title="Common Robot Sensors" columns={['Sensor','What It Measures','Strengths','Weaknesses']} rows={[
      ['Camera (RGB)','Visual images','Rich detail, color, cheap','Affected by lighting, no depth'],
      ['LiDAR','Distance (3D point cloud)','Precise depth, works in dark','Expensive, sparse, rain/fog issues'],
      ['IMU','Acceleration, rotation','Fast, cheap, no external deps','Drift over time, noisy'],
      ['Force/Torque','Contact forces','Essential for manipulation','Local only, fragile'],
      ['Ultrasonic','Distance (short range)','Cheap, simple','Short range, low resolution'],
      ['GPS/RTK','Global position','Absolute positioning','Poor indoors, cm-level accuracy'],
    ]}/>
    <ExpandableSection title="Why Fuse Sensors?" icon={'\uD83E\uDDE9'} defaultOpen>
      <p>No single sensor is perfect. Sensor fusion combines multiple sensor streams to get a more reliable picture:</p>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><strong>Camera + LiDAR:</strong> Rich visual context + accurate depth (self-driving standard)</li>
        <li><strong>IMU + GPS:</strong> Fast local tracking + absolute global position (drones)</li>
        <li><strong>Camera + Force sensor:</strong> See the object + feel the grip (manipulation)</li>
        <li><strong>Multi-camera:</strong> Multiple viewpoints for 3D reconstruction</li>
      </ul>
    </ExpandableSection>
    <Quiz question="Self-driving cars typically fuse camera and LiDAR data. What does each contribute?" options={["Camera provides depth, LiDAR provides color","Camera provides rich visual context and object recognition, LiDAR provides precise 3D depth measurements","They both measure the same thing for redundancy","Camera works at night, LiDAR works during the day"]} correctIndex={1} explanation="Cameras excel at visual understanding (reading signs, recognizing objects, detecting lane markings) while LiDAR provides precise 3D point clouds for distance measurement. Together they give both 'what is it' (camera) and 'exactly where is it' (LiDAR)."/>
  </div>;
}
function PhysAIFutureTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>The Frontier of Physical AI</h2>
    <ExpandableSection title="Foundation Models for Robotics" icon={'\uD83E\uDDE0'} defaultOpen>
      <p>Just as GPT transformed NLP, foundation models are coming to robotics:</p>
      <ul className="list-disc ml-5 mt-2 space-y-2">
        <li><strong>RT-2 (Google):</strong> Vision-Language-Action model that can reason about tasks and execute robot actions from natural language instructions</li>
        <li><strong>NVIDIA GR00T:</strong> Foundation model for humanoid robots, trained on massive simulation data</li>
        <li><strong>Open X-Embodiment:</strong> Collaborative dataset across 22 robot types to train general-purpose robot policies</li>
        <li><strong>World models:</strong> AI that learns physics from video to predict what will happen next</li>
      </ul>
    </ExpandableSection>
    <ExpandableSection title="Key Frontiers" icon={'\uD83D\uDE80'}>
      <ul className="list-disc ml-5 space-y-1">
        <li>Humanoid robots for general-purpose physical tasks (Figure, Tesla Optimus, 1X)</li>
        <li>Autonomous construction and manufacturing</li>
        <li>Surgical robots with AI-assisted precision</li>
        <li>Agricultural robots for planting, monitoring, and harvesting</li>
        <li>Last-mile delivery robots and autonomous vehicles</li>
        <li>Space exploration with AI-driven rovers and probes</li>
      </ul>
    </ExpandableSection>
    <Quiz question="What is a 'world model' in the context of physical AI?" options={["A 3D map of the physical environment","An AI that learns physics from observation to predict future states","A database of all physical objects","A simulation engine like Unity or Unreal"]} correctIndex={1} explanation="World models are AI systems that learn the underlying physics and dynamics of the world from observation (usually video). They can predict what will happen next given an action, enabling robots to 'imagine' the consequences of their actions before executing them -- a key capability for safe autonomous behavior."/>
  </div>;
}
// Deep tabs for Physical AI
function PhysDeepControlTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Robot Control & Planning</h2>
    <ComparisonTable title="Control Approaches" columns={['Approach','How It Works','Best For','Limitation']} rows={[
      ['Classical Control (PID)','Mathematical feedback loops','Simple, well-modeled systems','Can\'t handle complex tasks'],
      ['Model Predictive Control','Optimize trajectory over future horizon','Smooth motion, constraints','Needs accurate dynamics model'],
      ['Reinforcement Learning','Learn from trial and error','Complex, hard-to-model tasks','Sample inefficient, safety concerns'],
      ['Imitation Learning','Learn from human demonstrations','Quick bootstrapping','Limited to demonstrated behaviors'],
      ['LLM-guided Planning','Language model plans high-level steps','Novel tasks, reasoning','Slow, can\'t do low-level control'],
    ]}/>
    <CodeBlock language="python" label="Hierarchical Robot Planning" code={`class HierarchicalRobotPlanner:
    """LLM plans high-level, RL executes low-level"""

    def __init__(self):
        self.llm = LanguageModel("claude-sonnet")
        self.skills = {
            "pick": PickSkill(),      # RL-trained
            "place": PlaceSkill(),    # RL-trained
            "navigate": NavSkill(),   # Classical + RL
            "inspect": InspectSkill() # Vision model
        }

    def plan_task(self, instruction):
        """LLM decomposes instruction into skill sequence"""
        plan = self.llm.generate(f"""
            Instruction: {instruction}
            Available skills: {list(self.skills.keys())}
            Output a JSON list of steps.
        """)
        return plan  # e.g., [
        #   {"skill": "navigate", "target": "red_box"},
        #   {"skill": "pick", "object": "red_box"},
        #   {"skill": "navigate", "target": "shelf_2"},
        #   {"skill": "place", "location": "shelf_2"}
        # ]

    def execute_plan(self, plan):
        for step in plan:
            skill = self.skills[step["skill"]]
            success = skill.execute(step)
            if not success:
                # Re-plan from current state
                return self.plan_task(
                    f"Continue: completed steps "
                    f"{plan[:plan.index(step)]}, "
                    f"failed at {step}"
                )`}/>
    <ArchitectureDecision scenario="You're building a warehouse robot that needs to pick diverse objects from bins. Some objects are well-known (boxes, bottles), others are novel (random consumer products). What control approach should you use?" options={[
      {label:"Pure reinforcement learning trained on all objects",tradeoff:"Most general but needs enormous training data and simulation; struggles with truly novel objects"},
      {label:"Imitation learning from human demonstrations",tradeoff:"Quick to train, natural behaviors, but limited to what was demonstrated; needs re-training for new objects"},
      {label:"Foundation model (RT-2 style) + fine-tuning on your objects",tradeoff:"Best generalization to novel objects; leverages pre-trained visual understanding; still needs real-world fine-tuning"},
    ]} correctIndex={2} explanation="A foundation model approach (like RT-2) trained on diverse manipulation data provides the best generalization to novel objects. It leverages pre-trained visual understanding to handle objects it hasn't been specifically trained on, with fine-tuning on your specific warehouse environment to close the domain gap."/>
  </div>;
}
function PhysDeepSafetyTab(){
  return <div>
    <h2 className="text-xl font-bold mb-4" style={{color:GIM.headingText}}>Physical AI Safety</h2>
    <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Physical AI safety is literally life-and-death. Unlike software bugs, robot failures can cause physical injury, property damage, or worse.</p>
    <ExpandableSection title="Safety Standards" icon={'\uD83D\uDCCB'} defaultOpen>
      <ul className="list-disc ml-5 space-y-2">
        <li><strong>ISO 10218:</strong> Industrial robot safety -- workspace separation, speed limits, force limits</li>
        <li><strong>ISO/TS 15066:</strong> Collaborative robot (cobot) safety -- defines allowable forces for human contact</li>
        <li><strong>IEC 61508:</strong> Functional safety for safety-critical systems -- SIL levels</li>
        <li><strong>UL 4600:</strong> Safety for autonomous vehicles -- evaluation framework</li>
      </ul>
    </ExpandableSection>
    <CodeBlock language="python" label="Safety Monitoring System" code={`class RobotSafetyMonitor:
    """Real-time safety monitoring for autonomous robots"""

    def __init__(self, config):
        self.force_limit = config["max_force_newtons"]  # e.g., 150N per ISO/TS 15066
        self.speed_limit = config["max_speed_ms"]       # e.g., 0.25 m/s near humans
        self.proximity_threshold = config["min_human_distance_m"]  # e.g., 0.5m

    def check_safety(self, state):
        violations = []

        # Force limit check
        if state["contact_force"] > self.force_limit:
            violations.append({
                "type": "FORCE_EXCEEDED",
                "action": "IMMEDIATE_STOP",
                "value": state["contact_force"]
            })

        # Speed near humans
        if (state["human_detected"]
            and state["human_distance"] < 2.0
            and state["speed"] > self.speed_limit):
            violations.append({
                "type": "SPEED_NEAR_HUMAN",
                "action": "REDUCE_SPEED",
                "value": state["speed"]
            })

        # Proximity violation
        if (state["human_detected"]
            and state["human_distance"] < self.proximity_threshold):
            violations.append({
                "type": "PROXIMITY_VIOLATION",
                "action": "IMMEDIATE_STOP"
            })

        return {
            "safe": len(violations) == 0,
            "violations": violations
        }`}/>
    <Quiz question="Under ISO/TS 15066, what is the primary safety mechanism for collaborative robots working near humans?" options={["Physical barriers and cages","Force and speed limiting based on body region contact","Software-only safety controls","Remote operation with cameras"]} correctIndex={1} explanation="ISO/TS 15066 defines Power and Force Limiting (PFL) as the primary safety mechanism for cobots. It specifies maximum allowable forces and pressures for different body regions (e.g., lower limits for head/face, higher for arms/legs), enabling robots to work alongside humans without physical barriers."/>
  </div>;
}

export function CoursePhysicalAI({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const vTabs=[
    {id:'embodied',label:'Embodied AI',icon:'\uD83E\uDD16'},
    {id:'sim2real',label:'Sim-to-Real',icon:'\uD83C\uDFAE'},
    {id:'sensors',label:'Sensor Fusion',icon:'\uD83D\uDCE1'},
    {id:'future',label:'Frontier',icon:'\uD83D\uDE80'},
  ];
  const dTabs=[
    {id:'d-embodied',label:'Embodied AI',icon:'\uD83E\uDD16'},
    {id:'d-sim2real',label:'Sim-to-Real',icon:'\uD83C\uDFAE'},
    {id:'d-sensors',label:'Sensors',icon:'\uD83D\uDCE1'},
    {id:'d-control',label:'Control & Planning',icon:'\uD83C\uDFAF'},
    {id:'d-safety',label:'Physical Safety',icon:'\uD83D\uDEE1\uFE0F'},
    {id:'d-future',label:'Frontier',icon:'\uD83D\uDE80'},
  ];
  const renderTab=(tab,i,d)=>{
    if(d==='visionary'){
      if(i===0)return <EmbodiedAITab/>;
      if(i===1)return <SimToRealTab/>;
      if(i===2)return <SensorFusionTab/>;
      return <PhysAIFutureTab/>;
    }
    if(i===0)return <EmbodiedAITab/>;
    if(i===1)return <SimToRealTab/>;
    if(i===2)return <SensorFusionTab/>;
    if(i===3)return <PhysDeepControlTab/>;
    if(i===4)return <PhysDeepSafetyTab/>;
    return <PhysAIFutureTab/>;
  };
  return <CourseShell id="physical-ai" icon={'\uD83E\uDD16'} title="Physical AI & Robotics Foundations" timeMinutes={40} exerciseCount={5} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={vTabs} deepTabs={dTabs} renderTab={renderTab}/>;
}
