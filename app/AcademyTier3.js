"use client";
import { useState } from "react";
import { GIM, CODE_BG, CODE_TEXT, FadeIn, ProgressBar, ExpandableSection, CodeBlock, Quiz, MessageSimulator, AnalogyBox, SeeItInRe3, CourseShell, ArchitectureDecision, ComparisonTable } from "./Academy";

// ==================== COURSE 9: MULTI-AGENT ORCHESTRATION ====================
function PatternMatcher(){
  const problems=[
    {desc:'A customer complaint needs research, drafting a response, and manager approval.',correct:2,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'This is a sequential process: research \u2192 draft \u2192 approve. Pipeline pattern passes output from one stage to the next.'},
    {desc:'Should the company adopt remote-first or hybrid work? Need multiple perspectives.',correct:1,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'Multiple perspectives on a debatable question = Debate pattern. Different agents argue positions, and a synthesizer draws conclusions.'},
    {desc:'A complex data analysis project needs tasks assigned to specialist agents dynamically.',correct:0,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'An orchestrator agent analyzes the project, breaks it into tasks, and assigns them to specialists based on capabilities.'},
    {desc:'Three AI models analyze a medical image. The final diagnosis requires all to agree.',correct:3,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'When multiple agents must agree on a high-stakes decision, consensus is the right pattern. It ensures reliability through agreement.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const p=problems[current];const answered=selected!==null;const correct=selected===p.correct;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDDE9'} Try It: Pattern Matcher</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Match each scenario to the best orchestration pattern. ({current+1}/{problems.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:13,color:GIM.headingText,lineHeight:1.5}}>{p.desc}</p></div>
    <div className="flex flex-wrap gap-2 mb-3">{p.options.map((o,i)=><button key={o} onClick={()=>!answered&&(()=>{setSelected(i);if(i===p.correct)setScore(s=>s+1)})()}  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:answered?(i===p.correct?'#EBF5F1':i===selected?'#FEF2F2':'white'):'white',color:answered?(i===p.correct?'#2D8A6E':i===selected?'#EF4444':GIM.mutedText):GIM.primary,border:`1px solid ${answered?(i===p.correct?'#2D8A6E':GIM.border):GIM.primary}`,cursor:answered?'default':'pointer'}}>{o}{answered&&i===p.correct&&' \u2713'}</button>)}</div>
    {answered&&<div className="p-3 rounded-lg mb-3" style={{background:correct?'#EBF5F1':'#FEF2F2'}}><p style={{fontSize:12,color:correct?'#166534':'#991B1B'}}>{p.explanation}</p></div>}
    {answered&&current<problems.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Problem</button>}
    {answered&&current===problems.length-1&&<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{problems.length} correct</span>}
  </div>;
}

function TabWhyMulti({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why Multi-Agent?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A single AI agent can handle simple tasks. But for complex problems requiring diverse expertise, multiple perspectives, or sequential workflows, <b>multi-agent systems</b> dramatically outperform single agents.</p>
  <AnalogyBox emoji={'\uD83D\uDC65'} title="Think of it like a specialized team">One person doing research, writing, editing, and fact-checking will produce lower quality than a team with a researcher, writer, editor, and fact-checker -- each focused on what they do best.</AnalogyBox>
  <Quiz question="When is a multi-agent system better than a single agent?" options={["Always -- more agents is always better","Never -- single agents are simpler","When the task benefits from diverse expertise or structured workflows","Only for customer service"]} correctIndex={2} explanation="Multi-agent systems excel when tasks need diverse expertise, multiple perspectives, or structured workflows. For simple tasks, a single agent is more efficient." onAnswer={()=>onComplete&&onComplete('why-multi','quiz1')}/>
  <Quiz question="What is 'emergence' in multi-agent systems?" options={["When an agent crashes","When simple agent interactions produce complex, intelligent behavior","When a new agent is added","When the system runs out of memory"]} correctIndex={1} explanation="Emergence is when simple individual agents, following simple rules, produce collectively intelligent behavior that no single agent could achieve alone. Re\u00b3's debates demonstrate this." onAnswer={()=>onComplete&&onComplete('why-multi','quiz2')}/>
</div>}

function TabRolesPatterns({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Roles & Patterns</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Multi-agent systems follow established orchestration patterns. Each pattern suits different types of problems.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Pattern</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>How It Works</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Orchestrator','Central agent assigns tasks to specialists','Complex projects, dynamic task allocation'],['Debate','Agents argue positions, synthesizer combines','Multi-perspective analysis, decision support'],['Pipeline','Output of one stage feeds the next','Sequential workflows, content production'],['Consensus','Multiple agents vote or agree on answers','High-stakes decisions, quality assurance']].map(([p,h,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{p}</td><td className="p-3" style={{color:GIM.bodyText}}>{h}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <PatternMatcher/>
  <SeeItInRe3 text="Re\u00b3 uses the Debate Pattern: Ada curates the panel, Socratia moderates quality, specialized debater agents argue positions, and Hypatia synthesizes insights into The Loom." targetPage="forge" onNavigate={onNavigate}/>
  <Quiz question="Re\u00b3 uses which orchestration pattern?" options={["Orchestrator","Debate","Pipeline","Consensus"]} correctIndex={1} explanation="Re\u00b3 uses the Debate Pattern -- agents present arguments, engage in multiple rounds, and a synthesizer (Hypatia) draws emergent insights from the collective discussion." onAnswer={()=>onComplete&&onComplete('roles-patterns','quiz1')}/>
</div>}

function TabStateMemory({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>State Management & Memory</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>In multi-agent systems, agents need to share information. <b>State management</b> defines how data flows between agents, and <b>memory</b> determines what each agent can recall.</p>
  <CodeBlock language="json" label="Shared State Object (Re\u00b3 Debate)" code={`{
  "debate_id": "d_1707234567",
  "topic": "Impact of AI on healthcare",
  "round": 2,
  "agents": ["agent_strategist", "agent_ethicist", "agent_builder"],
  "arguments": {
    "round_1": [
      {"agent": "agent_strategist", "position": "..."},
      {"agent": "agent_ethicist", "position": "..."}
    ],
    "round_2": [
      {"agent": "agent_strategist", "response": "..."}
    ]
  },
  "moderator_notes": "Quality score: 8.5/10"
}`}/>
  <ExpandableSection title="Memory Strategies" icon={'\uD83E\uDDE0'}>
    <p className="mb-2"><b>Full history:</b> Every agent sees all previous messages. Simple but uses lots of tokens.</p>
    <p className="mb-2"><b>Summary memory:</b> Older conversations are summarized. Saves tokens but loses detail.</p>
    <p className="mb-2"><b>Scoped memory:</b> Each agent only sees relevant context. Efficient but requires careful design.</p>
    <p className="mb-2"><b>External memory:</b> State stored in a database. Agents query what they need on demand.</p>
  </ExpandableSection>
  <Quiz question="What's the main risk of giving every agent the full conversation history?" options={["It's too simple","It uses too many tokens, potentially exceeding context windows","It makes agents smarter","It's the default behavior"]} correctIndex={1} explanation="Full history for every agent means duplicating the entire conversation N times. With 5 agents and a long debate, this can easily exceed context windows and be very expensive." onAnswer={()=>onComplete&&onComplete('state-memory','quiz1')}/>
</div>}

function TabFrameworks({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Orchestration Frameworks</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Several frameworks simplify building multi-agent systems. Each has different strengths.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Framework</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>By</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Strength</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Pattern</th></tr></thead>
      <tbody>
        {[['LangGraph','LangChain','Graph-based workflows with cycles','Stateful orchestration'],['CrewAI','Open source','Role-based agent teams','Team collaboration'],['AutoGen','Microsoft','Conversational agents','Chat-based multi-agent'],['Claude Agent SDK','Anthropic','Agentic loops with tool use','Single-agent + tools']].map(([n,b,s,p],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{n}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td><td className="p-3" style={{color:GIM.bodyText}}>{s}</td><td className="p-3 font-mono" style={{color:GIM.primary,fontSize:11}}>{p}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Which framework is best for building a graph-based workflow with loops and conditional branching?" options={["CrewAI","LangGraph","AutoGen","Flask"]} correctIndex={1} explanation="LangGraph is specifically designed for graph-based workflows. Its nodes-and-edges model naturally supports cycles, branches, and conditional routing between agent steps." onAnswer={()=>onComplete&&onComplete('frameworks','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3 built its own orchestration framework for debates, using a round-based flow: Ada (select) \u2192 Rounds (debate) \u2192 Socratia (moderate) \u2192 Hypatia (synthesize)." targetPage="agent-community" onNavigate={onNavigate}/>
</div>}

function TabMAPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your multi-agent knowledge!</p>
  <ExpandableSection title="Exercise 1: System Design" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <Quiz question="You're building a content pipeline: research \u2192 write \u2192 edit \u2192 SEO optimize. Which pattern?" options={["Debate -- agents discuss the content","Pipeline -- each stage feeds the next","Consensus -- all agents must agree","Orchestrator -- one agent manages all"]} correctIndex={1} explanation="A sequential workflow where each stage's output becomes the next stage's input is the textbook Pipeline pattern." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Re\u00b3 Architecture" icon={'\uD83E\uDD16'}>
    <Quiz question="In Re\u00b3, what role does Socratia play?" options={["Selects which agents participate","Moderates debate quality and scores arguments","Synthesizes the final Loom output","Generates the initial article"]} correctIndex={1} explanation="Socratia is the moderator -- it evaluates argument quality, assigns scores, and ensures the debate stays on-topic and productive." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Trade-offs" icon={'\u2696\uFE0F'}>
    <Quiz question="What is the biggest challenge of multi-agent systems?" options={["They're always slower than single agents","Coordinating state and managing complexity","They require more GPU memory","They can only use one LLM provider"]} correctIndex={1} explanation="The biggest challenge is coordination complexity -- managing shared state, ensuring agents communicate effectively, handling failures, and debugging interactions across multiple agents." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 9 DEEP TABS ====================
function TabDeepOrchestration({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Orchestration Patterns</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Production multi-agent systems use four core orchestration topologies. Each pattern encodes a different control flow, failure boundary, and communication model. Choosing the wrong pattern leads to fragile, expensive systems that are impossible to debug.</p>
  <ComparisonTable title="Orchestration Topology Comparison" columns={['Pattern','Control Flow','Failure Blast Radius','Latency Profile','Best For']} rows={[
    ['Supervisor','Central coordinator dispatches and collects','Supervisor is SPOF; worker failures are isolated','Sequential bottleneck at supervisor','Task decomposition, dynamic routing'],
    ['Hierarchical','Tree of supervisors with delegation','Subtree failures contained','Parallel subtrees, sequential depth','Large-scale systems, org-chart workflows'],
    ['Peer-to-Peer','Agents communicate directly via message bus','Single agent failure can cascade','Low latency, no bottleneck','Real-time collaboration, swarm intelligence'],
    ['Swarm','Emergent behavior from simple rules','Graceful degradation','Highly parallel','Exploration, creative tasks, brainstorming'],
  ]}/>
  <CodeBlock language="python" label="Supervisor Pattern Implementation" code={`from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[dict], operator.add]
    next_agent: str
    results: dict

def supervisor_node(state: AgentState) -> AgentState:
    """Central supervisor decides which agent to invoke next."""
    messages = state["messages"]
    response = llm.invoke([
        {"role": "system", "content": """You are a supervisor managing:
        - researcher: finds information and data
        - writer: drafts content from research
        - critic: reviews and improves drafts
        Decide which agent should act next, or FINISH if done."""},
        *messages
    ])
    next_agent = parse_routing(response.content)
    return {"next_agent": next_agent, "messages": [response]}

def researcher_node(state: AgentState) -> AgentState:
    response = llm.invoke([
        {"role": "system", "content": "You are a researcher. Find relevant data."},
        *state["messages"]
    ])
    return {"messages": [{"role": "assistant", "content": f"[Researcher]: {response.content}"}]}

def writer_node(state: AgentState) -> AgentState:
    response = llm.invoke([
        {"role": "system", "content": "You are a writer. Draft content from research."},
        *state["messages"]
    ])
    return {"messages": [{"role": "assistant", "content": f"[Writer]: {response.content}"}]}

# Build the graph
graph = StateGraph(AgentState)
graph.add_node("supervisor", supervisor_node)
graph.add_node("researcher", researcher_node)
graph.add_node("writer", writer_node)
graph.add_node("critic", critic_node)

# Supervisor routes to agents
graph.add_conditional_edges("supervisor", lambda s: s["next_agent"],
    {"researcher": "researcher", "writer": "writer",
     "critic": "critic", "FINISH": END})

# All agents report back to supervisor
for agent in ["researcher", "writer", "critic"]:
    graph.add_edge(agent, "supervisor")

graph.set_entry_point("supervisor")
app = graph.compile()`}/>
  <ArchitectureDecision scenario="You are building a content pipeline where a researcher gathers data, a writer drafts articles, and an editor polishes them. The editor sometimes sends work back to the writer. Which orchestration pattern fits best?" options={[
    {label:'Supervisor Pattern',tradeoff:'Central coordinator routes between agents. Handles cycles well but adds latency per hop.'},
    {label:'Strict Pipeline',tradeoff:'Linear flow, no backtracking. Fast but cannot handle editor sending work back to writer.'},
    {label:'Peer-to-Peer',tradeoff:'Agents talk directly. Flexible but hard to trace execution order and debug.'},
    {label:'Hierarchical',tradeoff:'Overkill for 3 agents. Adds complexity without proportional benefit.'}
  ]} correctIndex={0} explanation="The Supervisor pattern handles dynamic routing including cycles (editor returning to writer) while keeping execution traceable through the central coordinator. Pipelines cannot handle backtracking, and peer-to-peer is harder to debug." onAnswer={()=>onComplete&&onComplete('deep-orchestration','quiz1')}/>
</div>}

function TabDeepCommunication({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Communication</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>How agents exchange information determines system reliability, scalability, and debuggability. There are four fundamental communication patterns, each suited to different coordination requirements.</p>
  <ComparisonTable title="Communication Patterns" columns={['Pattern','Mechanism','Coupling','Scalability','Debugging']} rows={[
    ['Message Passing','Direct messages between agents','Tight - sender knows receiver','Limited by connections','Easy - trace messages'],
    ['Shared State','Agents read/write shared store','Medium - shared data contract','Good with locking','Medium - race conditions'],
    ['Blackboard','Agents post to shared knowledge board','Loose - agents check board','Good - decoupled','Good - inspect board state'],
    ['Event-Driven','Agents publish/subscribe to events','Very loose - no direct knowledge','Excellent','Hard - async tracing'],
  ]}/>
  <CodeBlock language="python" label="Blackboard Pattern Implementation" code={`import asyncio
from dataclasses import dataclass, field
from typing import Any

@dataclass
class Blackboard:
    """Shared knowledge store that agents read from and write to."""
    knowledge: dict = field(default_factory=dict)
    history: list = field(default_factory=list)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    async def post(self, agent_id: str, key: str, value: Any):
        async with self._lock:
            self.knowledge[key] = {
                "value": value, "posted_by": agent_id,
                "timestamp": asyncio.get_event_loop().time()
            }
            self.history.append({"agent": agent_id, "action": "post",
                                 "key": key, "value": value})

    async def read(self, key: str) -> Any:
        async with self._lock:
            entry = self.knowledge.get(key)
            return entry["value"] if entry else None

    async def query(self, prefix: str) -> dict:
        async with self._lock:
            return {k: v["value"] for k, v in self.knowledge.items()
                    if k.startswith(prefix)}

class BlackboardAgent:
    def __init__(self, agent_id: str, board: Blackboard, llm):
        self.agent_id = agent_id
        self.board = board
        self.llm = llm

    async def act(self):
        # Read relevant context from blackboard
        context = await self.board.query(f"task.")
        previous = await self.board.query(f"result.")

        response = await self.llm.invoke(
            system=f"You are {self.agent_id}. Context: {context}",
            user=f"Previous results: {previous}. Contribute your analysis."
        )
        # Post results back to blackboard
        await self.board.post(self.agent_id,
            f"result.{self.agent_id}", response.content)

# Usage
board = Blackboard()
agents = [BlackboardAgent(f"agent_{i}", board, llm) for i in range(4)]
await asyncio.gather(*[agent.act() for agent in agents])`}/>
  <CodeBlock language="javascript" label="Event-Driven Communication (Node.js)" code={`import { EventEmitter } from 'events';

class AgentBus extends EventEmitter {
  constructor() {
    super();
    this.messageLog = [];
  }

  publish(fromAgent, topic, payload) {
    const message = {
      from: fromAgent, topic, payload,
      timestamp: Date.now(), id: crypto.randomUUID()
    };
    this.messageLog.push(message);
    this.emit(topic, message);
  }
}

// Agents subscribe to relevant topics
const bus = new AgentBus();

bus.on('research.complete', async (msg) => {
  const draft = await writerAgent.process(msg.payload);
  bus.publish('writer', 'draft.complete', draft);
});

bus.on('draft.complete', async (msg) => {
  const review = await criticAgent.process(msg.payload);
  bus.publish('critic', 'review.complete', review);
});

// Kick off the pipeline
bus.publish('user', 'research.complete', { topic: 'AI safety' });`}/>
  <Quiz question="In a multi-agent system where agents work independently and asynchronously on different aspects of a problem, which communication pattern minimizes coupling?" options={["Message passing with direct addressing","Shared state with mutual exclusion locks","Event-driven publish/subscribe","Synchronous RPC calls between agents"]} correctIndex={2} explanation="Event-driven pub/sub provides the loosest coupling. Agents do not need to know about each other -- they only publish events and subscribe to topics they care about. This enables independent scaling and deployment." onAnswer={()=>onComplete&&onComplete('deep-communication','quiz1')}/>
</div>}

function TabDeepConsensus({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Consensus Mechanisms</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>When multiple agents analyze the same problem, you need a strategy to combine their outputs into a single decision. The right consensus mechanism depends on whether you need reliability, diversity, or cost efficiency.</p>
  <ComparisonTable title="Consensus Strategies" columns={['Mechanism','How It Works','Strengths','Weaknesses']} rows={[
    ['Majority Voting','Each agent votes; majority wins','Simple, fault-tolerant','Ignores confidence, all votes equal'],
    ['Weighted Averaging','Agents weighted by expertise/accuracy','Rewards quality agents','Requires calibration data'],
    ['Debate-Synthesis','Agents argue, synthesizer extracts insights','Rich nuanced output','Expensive (multiple rounds)'],
    ['Critic Loop','Agent generates, critic reviews, iterate','High quality output','Latency from iterations'],
    ['Mixture of Agents','Proposers generate, aggregator merges','Diverse perspectives','Complex orchestration'],
  ]}/>
  <CodeBlock language="python" label="Weighted Consensus with Confidence Scoring" code={`from dataclasses import dataclass
from typing import List
import numpy as np

@dataclass
class AgentVote:
    agent_id: str
    answer: str
    confidence: float  # 0.0 to 1.0
    reasoning: str

def weighted_consensus(votes: List[AgentVote],
                       agent_weights: dict[str, float]) -> dict:
    """Combine agent votes using confidence-weighted scoring."""
    # Group votes by answer
    answer_scores = {}
    for vote in votes:
        base_weight = agent_weights.get(vote.agent_id, 1.0)
        score = base_weight * vote.confidence
        if vote.answer not in answer_scores:
            answer_scores[vote.answer] = {
                "total_score": 0, "voters": [], "reasonings": []
            }
        answer_scores[vote.answer]["total_score"] += score
        answer_scores[vote.answer]["voters"].append(vote.agent_id)
        answer_scores[vote.answer]["reasonings"].append(vote.reasoning)

    # Select winner
    winner = max(answer_scores.items(), key=lambda x: x[1]["total_score"])
    total = sum(v["total_score"] for v in answer_scores.values())

    return {
        "answer": winner[0],
        "confidence": winner[1]["total_score"] / total,
        "agreement_ratio": len(winner[1]["voters"]) / len(votes),
        "dissenting_views": [
            {"answer": k, "score": v["total_score"]}
            for k, v in answer_scores.items() if k != winner[0]
        ]
    }

# Usage with calibrated weights
agent_weights = {
    "agent_strategist": 1.2,   # historically accurate
    "agent_ethicist": 1.0,
    "agent_builder": 0.9,
    "agent_wildcard": 0.7,     # creative but less reliable
}
result = weighted_consensus(votes, agent_weights)`}/>
  <CodeBlock language="python" label="Critic Loop Pattern" code={`async def critic_loop(task: str, max_iterations: int = 3) -> str:
    """Generate-critique-refine loop until quality threshold met."""
    draft = await generator.invoke(task)

    for i in range(max_iterations):
        critique = await critic.invoke(f"""
        Evaluate this draft on a 1-10 scale for:
        - Accuracy, Completeness, Clarity
        Task: {task}
        Draft: {draft}

        Return JSON: {{"scores": {{}}, "issues": [], "suggestion": ""}}
        """)

        scores = parse_json(critique)
        avg_score = sum(scores["scores"].values()) / len(scores["scores"])

        if avg_score >= 8.0:
            return {"output": draft, "iterations": i + 1,
                    "final_score": avg_score}

        # Refine based on critique
        draft = await generator.invoke(f"""
        Improve this draft based on feedback:
        Draft: {draft}
        Issues: {scores["issues"]}
        Suggestion: {scores["suggestion"]}
        """)

    return {"output": draft, "iterations": max_iterations,
            "final_score": avg_score}`}/>
  <ArchitectureDecision scenario="You are building a medical diagnosis support system where 5 specialist AI agents analyze patient symptoms. Incorrect diagnoses could be dangerous. Which consensus mechanism should you use?" options={[
    {label:'Simple majority voting',tradeoff:'Fast and simple, but treats all specialists equally regardless of domain relevance.'},
    {label:'Weighted consensus with confidence thresholds',tradeoff:'Weights specialists by domain relevance and requires minimum confidence. Adds complexity but improves safety.'},
    {label:'Single best agent selection',tradeoff:'Fastest, but loses the reliability benefit of multiple opinions.'},
    {label:'Debate-synthesis with critic review',tradeoff:'Most thorough but slowest. Multiple rounds add significant latency.'}
  ]} correctIndex={1} explanation="For high-stakes medical decisions, weighted consensus with confidence thresholds provides the best safety profile. Specialists relevant to the symptoms get higher weights, and low-confidence results trigger human review rather than automated decisions." onAnswer={()=>onComplete&&onComplete('deep-consensus','quiz1')}/>
</div>}

function TabDeepMemory({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Memory Systems</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Effective multi-agent memory goes beyond simple chat history. Production systems need shared memory stores with access control, episodic recall for learning from past interactions, and working memory management to stay within context limits.</p>
  <ComparisonTable title="Memory Architecture Comparison" columns={['Memory Type','Scope','Persistence','Use Case']} rows={[
    ['Conversation Buffer','Single agent session','Ephemeral','Chat context, immediate task'],
    ['Shared State Store','All agents in a workflow','Workflow lifetime','Debate state, pipeline data'],
    ['Episodic Memory','Per agent, long-term','Persistent (DB)','Learning from past tasks'],
    ['Semantic Memory','Global knowledge base','Persistent (vector DB)','Facts, domain knowledge'],
    ['Working Memory','Per agent, per task','Task lifetime','Scratchpad, intermediate results'],
  ]}/>
  <CodeBlock language="python" label="Multi-Agent Memory Manager" code={`from datetime import datetime
import json

class AgentMemoryManager:
    """Manages different memory types for a multi-agent system."""

    def __init__(self, vector_store, kv_store):
        self.vector_store = vector_store  # for semantic memory
        self.kv_store = kv_store          # for episodic + shared state

    async def get_agent_context(self, agent_id: str,
                                 task: str,
                                 max_tokens: int = 2000) -> dict:
        """Build optimized context for an agent within token budget."""
        context = {"working": [], "episodic": [], "semantic": [],
                   "shared": {}}
        budget = max_tokens

        # 1. Shared state (highest priority) ~30% budget
        shared = await self.kv_store.get(f"shared_state")
        if shared:
            shared_str = json.dumps(shared)
            context["shared"] = shared
            budget -= len(shared_str) // 4  # rough token estimate

        # 2. Relevant episodic memories ~30% budget
        past_tasks = await self.kv_store.range(
            f"episodic:{agent_id}:", limit=10)
        for memory in past_tasks:
            if budget <= 0:
                break
            context["episodic"].append(memory)
            budget -= len(str(memory)) // 4

        # 3. Semantic retrieval ~40% budget
        relevant_docs = await self.vector_store.search(
            query=task, top_k=5,
            filter={"accessible_by": agent_id})
        for doc in relevant_docs:
            if budget <= 0:
                break
            context["semantic"].append(doc.text)
            budget -= len(doc.text) // 4

        return context

    async def save_episode(self, agent_id: str, task: str,
                           result: str, score: float):
        """Save a completed task as episodic memory for future reference."""
        episode = {
            "task": task, "result": result, "score": score,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.kv_store.set(
            f"episodic:{agent_id}:{datetime.utcnow().timestamp()}",
            episode)
        # Also index in vector store for semantic retrieval
        await self.vector_store.upsert(
            text=f"Task: {task}\\nResult: {result}",
            metadata={"agent_id": agent_id, "score": score})`}/>
  <Quiz question="An agent system processes 50 customer requests per day. After a week, agents start exceeding context windows. What memory strategy fixes this?" options={["Give agents the full conversation history for every request","Use summary memory: compress older interactions into summaries","Remove all memory so context stays small","Switch to a model with larger context window"]} correctIndex={1} explanation="Summary memory compresses older interactions into concise summaries while keeping recent interactions in full. This keeps context within bounds while preserving important historical knowledge. Simply using larger context windows is expensive and does not scale." onAnswer={()=>onComplete&&onComplete('deep-memory','quiz1')}/>
</div>}

function TabDeepLangGraph({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>LangGraph Implementation</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>LangGraph models multi-agent workflows as directed graphs with state. Nodes are agent functions, edges define transitions, and conditional edges enable dynamic routing. This is the most production-ready framework for stateful multi-agent orchestration.</p>
  <CodeBlock language="python" label="LangGraph Multi-Agent with Human-in-the-Loop" code={`from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import HumanMessage, AIMessage
from typing import TypedDict, Annotated, Literal
import operator

class ResearchState(TypedDict):
    messages: Annotated[list, operator.add]
    research_data: str
    draft: str
    review_score: float
    approved: bool

def research_agent(state: ResearchState) -> ResearchState:
    """Gather and analyze information."""
    response = llm.invoke([
        {"role": "system", "content": "You are a research analyst."},
        {"role": "user", "content": f"Research: {state['messages'][-1].content}"}
    ])
    return {"research_data": response.content,
            "messages": [AIMessage(content=f"[Research]: {response.content}")]}

def writer_agent(state: ResearchState) -> ResearchState:
    """Draft content from research."""
    response = llm.invoke([
        {"role": "system", "content": "Write a report from this research."},
        {"role": "user", "content": state["research_data"]}
    ])
    return {"draft": response.content,
            "messages": [AIMessage(content=f"[Writer]: {response.content}")]}

def reviewer_agent(state: ResearchState) -> ResearchState:
    """Score the draft quality."""
    response = llm.invoke([
        {"role": "system", "content": "Score this draft 0-10. Return JSON."},
        {"role": "user", "content": state["draft"]}
    ])
    score = parse_score(response.content)
    return {"review_score": score,
            "messages": [AIMessage(content=f"[Reviewer]: Score {score}/10")]}

def route_after_review(state: ResearchState) -> Literal["writer", "human_review", END]:
    if state["review_score"] >= 8:
        return END  # Auto-approve high quality
    elif state["review_score"] >= 5:
        return "human_review"  # Medium quality needs human check
    else:
        return "writer"  # Low quality goes back for rewrite

# Build graph with checkpointing
memory = SqliteSaver.from_conn_string(":memory:")
graph = StateGraph(ResearchState)
graph.add_node("researcher", research_agent)
graph.add_node("writer", writer_agent)
graph.add_node("reviewer", reviewer_agent)
graph.add_node("human_review", lambda s: s)  # Interrupt point

graph.set_entry_point("researcher")
graph.add_edge("researcher", "writer")
graph.add_edge("writer", "reviewer")
graph.add_conditional_edges("reviewer", route_after_review)
graph.add_edge("human_review", END)

app = graph.compile(checkpointer=memory, interrupt_before=["human_review"])

# Run with human-in-the-loop
config = {"configurable": {"thread_id": "report-123"}}
result = app.invoke({"messages": [HumanMessage("Analyze AI trends")]}, config)
# If interrupted at human_review, resume after approval:
# app.invoke(None, config)  # continues from checkpoint`}/>
  <Quiz question="In LangGraph, what enables a multi-agent workflow to pause for human approval and resume later?" options={["Using async/await in Python","Checkpointing with interrupt_before on specific nodes","Saving state to a JSON file manually","Polling the human for input in a while loop"]} correctIndex={1} explanation="LangGraph's checkpointer saves the full graph state at each step. The interrupt_before parameter pauses execution before specific nodes, allowing human review. Calling invoke again with the same thread_id resumes from the checkpoint." onAnswer={()=>onComplete&&onComplete('deep-langgraph','quiz1')}/>
</div>}

function TabDeepCrewAI({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>CrewAI & AutoGen</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>CrewAI and AutoGen take different approaches to multi-agent orchestration. CrewAI uses role-based teams with structured task delegation, while AutoGen focuses on conversational agent interactions. Understanding when to use each saves significant development time.</p>
  <CodeBlock language="python" label="CrewAI Agent Team" code={`from crewai import Agent, Task, Crew, Process

# Define agents with roles and expertise
researcher = Agent(
    role="Senior Research Analyst",
    goal="Find comprehensive data on the given topic",
    backstory="You are an expert researcher with 15 years experience "
              "in data analysis and information synthesis.",
    llm="claude-sonnet-4-20250514",
    verbose=True,
    allow_delegation=True  # Can delegate subtasks to other agents
)

writer = Agent(
    role="Technical Writer",
    goal="Create clear, engaging technical content",
    backstory="You specialize in making complex topics accessible "
              "without sacrificing accuracy.",
    llm="claude-sonnet-4-20250514",
    verbose=True
)

editor = Agent(
    role="Senior Editor",
    goal="Ensure content is polished and publication-ready",
    backstory="Former editor at a major tech publication with an eye "
              "for clarity, accuracy, and engagement.",
    llm="claude-sonnet-4-20250514",
    verbose=True
)

# Define tasks with dependencies
research_task = Task(
    description="Research {topic} thoroughly. Include data and examples.",
    expected_output="A detailed research brief with key findings.",
    agent=researcher
)

writing_task = Task(
    description="Write an article based on the research brief.",
    expected_output="A 1500-word article suitable for publication.",
    agent=writer,
    context=[research_task]  # Depends on research output
)

editing_task = Task(
    description="Edit the article for clarity and accuracy.",
    expected_output="A polished, publication-ready article.",
    agent=editor,
    context=[writing_task]
)

# Assemble and run the crew
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    process=Process.sequential,  # or Process.hierarchical
    verbose=True
)

result = crew.kickoff(inputs={"topic": "Multi-agent AI systems"})`}/>
  <ComparisonTable title="CrewAI vs AutoGen vs LangGraph" columns={['Feature','CrewAI','AutoGen','LangGraph']} rows={[
    ['Mental Model','Team of role-based agents','Conversational agents','State machine graph'],
    ['Orchestration','Sequential or hierarchical process','Chat-based turn-taking','Graph edges and conditions'],
    ['State Management','Implicit via task context','Chat history','Explicit typed state'],
    ['Human-in-Loop','Via task callbacks','Via UserProxyAgent','Via checkpoints + interrupts'],
    ['Best For','Structured team workflows','Conversational problem-solving','Complex stateful workflows'],
    ['Learning Curve','Low','Medium','Higher'],
    ['Production Readiness','Growing','Good','Most mature'],
  ]}/>
  <ArchitectureDecision scenario="Your team needs to build a customer support system where an AI triages tickets, routes to specialist agents, and escalates to humans when confidence is low. The workflow has complex branching logic." options={[
    {label:'CrewAI with hierarchical process',tradeoff:'Easy to define agent roles. But hierarchical process has limited branching control.'},
    {label:'AutoGen with group chat',tradeoff:'Good for conversational flow. But hard to enforce strict routing rules.'},
    {label:'LangGraph with conditional edges',tradeoff:'Most control over routing logic. Steeper learning curve but handles complex branching natively.'},
    {label:'Custom orchestration with raw API calls',tradeoff:'Full control but requires building state management, error handling, and checkpointing from scratch.'}
  ]} correctIndex={2} explanation="Complex branching logic with triage, routing, and escalation paths maps naturally to LangGraph's conditional edges. The graph model makes the workflow explicit and debuggable, and checkpointing enables reliable human escalation." onAnswer={()=>onComplete&&onComplete('deep-crewai','quiz1')}/>
</div>}

function TabDeepProdMultiAgent({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Production Multi-Agent</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Moving multi-agent systems from prototype to production requires solving error handling, cost control, observability, and graceful degradation. Most multi-agent failures in production come from cascading errors and unbounded token usage.</p>
  <CodeBlock language="python" label="Production Error Handling & Cost Control" code={`import asyncio
import time
from dataclasses import dataclass

@dataclass
class AgentBudget:
    max_tokens_per_call: int = 2000
    max_calls_per_task: int = 10
    max_total_cost_usd: float = 1.0
    timeout_seconds: int = 30

class ProductionAgentRunner:
    def __init__(self, agents: list, budget: AgentBudget):
        self.agents = agents
        self.budget = budget
        self.metrics = {
            "total_tokens": 0, "total_cost": 0.0,
            "calls": 0, "errors": 0, "retries": 0
        }

    async def run_agent_with_guardrails(self, agent, input_data):
        """Execute an agent with budget, timeout, and retry guards."""
        for attempt in range(3):  # Max 3 retries
            try:
                # Check budget before calling
                if self.metrics["total_cost"] >= self.budget.max_total_cost_usd:
                    raise BudgetExceededError(
                        "Budget exhausted: $%.2f" % self.metrics['total_cost'])
                if self.metrics["calls"] >= self.budget.max_calls_per_task:
                    raise BudgetExceededError(
                        f"Max calls reached: {self.metrics['calls']}")

                # Execute with timeout
                result = await asyncio.wait_for(
                    agent.invoke(input_data,
                        max_tokens=self.budget.max_tokens_per_call),
                    timeout=self.budget.timeout_seconds
                )

                # Track metrics
                self.metrics["total_tokens"] += result.usage.total_tokens
                self.metrics["total_cost"] += result.usage.cost_usd
                self.metrics["calls"] += 1

                return result

            except asyncio.TimeoutError:
                self.metrics["retries"] += 1
                if attempt == 2:
                    return self._fallback_response(agent, "timeout")

            except Exception as e:
                self.metrics["errors"] += 1
                if attempt == 2:
                    return self._fallback_response(agent, str(e))
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

    def _fallback_response(self, agent, error_type):
        """Graceful degradation when an agent fails."""
        return {
            "agent": agent.id,
            "status": "degraded",
            "error": error_type,
            "fallback": f"[{agent.role}] Unable to contribute: {error_type}",
            "metrics": dict(self.metrics)
        }`}/>
  <CodeBlock language="javascript" label="Multi-Agent Observability (Node.js)" code={`class AgentTracer {
  constructor(traceId) {
    this.traceId = traceId;
    this.spans = [];
    this.startTime = Date.now();
  }

  startSpan(agentId, operation) {
    const span = {
      spanId: crypto.randomUUID(),
      traceId: this.traceId,
      agentId, operation,
      startTime: Date.now(),
      metadata: {}
    };
    this.spans.push(span);
    return span;
  }

  endSpan(span, result) {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.tokenUsage = result.usage || {};
    span.status = result.error ? 'error' : 'success';
    span.cost = this.calculateCost(result.usage);
  }

  getSummary() {
    return {
      traceId: this.traceId,
      totalDuration: Date.now() - this.startTime,
      agentCount: new Set(this.spans.map(s => s.agentId)).size,
      totalTokens: this.spans.reduce((s, sp) =>
        s + (sp.tokenUsage?.total || 0), 0),
      totalCost: this.spans.reduce((s, sp) => s + (sp.cost || 0), 0),
      errors: this.spans.filter(s => s.status === 'error').length,
      spanTimeline: this.spans.map(s => ({
        agent: s.agentId, op: s.operation,
        ms: s.duration, status: s.status
      }))
    };
  }
}`}/>
  <Quiz question="Your multi-agent system costs spiked 20x on a single request. Investigation shows one agent called another in a loop. What production guard would have prevented this?" options={["Using a faster model to complete the loop sooner","Adding a max_calls_per_task budget limit","Making the agents stateless","Removing the looping agent from the system"]} correctIndex={1} explanation="A max_calls_per_task budget guard limits how many LLM calls any single task can make. When the budget is exhausted, the system returns a degraded response instead of spiraling into infinite cost. This is a fundamental production safety mechanism." onAnswer={()=>onComplete&&onComplete('deep-prod-multiagent','quiz1')}/>
</div>}

function TabDeepMAPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your multi-agent knowledge to production architecture decisions.</p>
  <ExpandableSection title="Exercise 1: System Architecture" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <ArchitectureDecision scenario="You are designing a multi-agent system for automated code review. Agent A analyzes code style, Agent B checks for security vulnerabilities, Agent C evaluates performance. Results must be combined into a single review. What orchestration pattern?" options={[
      {label:'Pipeline: A then B then C, then merge',tradeoff:'Sequential execution. Safe but slow -- each agent waits for the previous one.'},
      {label:'Fan-out/Fan-in: Run A, B, C in parallel, then merge',tradeoff:'Fast parallel execution. Results are independent so no data dependency issues.'},
      {label:'Debate: Agents discuss each finding',tradeoff:'Rich discussion but overkill for independent analysis tasks.'},
      {label:'Supervisor: Central agent routes code to specialists',tradeoff:'Adds unnecessary coordination overhead when all agents need to analyze the same code.'}
    ]} correctIndex={1} explanation="Since each agent analyzes different aspects independently (style, security, performance), fan-out/fan-in is optimal. Run all three in parallel for speed, then merge results. No agent depends on another's output." onAnswer={()=>onComplete&&onComplete('deep-ma-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Failure Handling" icon={'\u26A0\uFE0F'}>
    <Quiz question="In a 5-agent debate system, Agent 3 times out in round 2. What is the best production strategy?" options={["Cancel the entire debate and return an error","Continue with the remaining 4 agents and note the missing perspective","Retry Agent 3 indefinitely until it responds","Replace Agent 3 with a random agent mid-debate"]} correctIndex={1} explanation="Graceful degradation: continue the debate with available agents and note that one perspective is missing. The debate still produces valuable output from 4 agents. Retrying indefinitely risks timeout cascades, and canceling wastes all previous work." onAnswer={()=>onComplete&&onComplete('deep-ma-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Cost Optimization" icon={'\uD83D\uDCB0'}>
    <ArchitectureDecision scenario="Your multi-agent pipeline processes 10,000 requests per day. Currently each request uses 5 agents at $0.02 per agent call = $1,000/day. You need to reduce costs by 60% without significantly impacting quality." options={[
      {label:'Use cheaper models for all agents',tradeoff:'Reduces cost per call but may degrade quality for complex analysis tasks.'},
      {label:'Tiered approach: cheap models for simple tasks, expensive models only for complex ones',tradeoff:'Best cost/quality balance. Simple requests skip expensive agents entirely.'},
      {label:'Reduce to 2 agents for all requests',tradeoff:'Drastic quality reduction. Loses specialized perspectives.'},
      {label:'Cache identical requests and use semantic similarity for near-duplicates',tradeoff:'Helps with repetitive queries but may not reach 60% reduction alone.'}
    ]} correctIndex={1} explanation="A tiered approach routes simple requests to cheaper models or fewer agents, reserving expensive full-agent analysis for complex cases. Combined with caching, this typically achieves 60%+ cost reduction while maintaining quality where it matters." onAnswer={()=>onComplete&&onComplete('deep-ma-playground','quiz3')}/>
  </ExpandableSection>
</div>}

export function CourseMultiAgent({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'why-multi',label:'Why Multi-Agent',icon:'\uD83E\uDD16'},{id:'roles-patterns',label:'Roles & Patterns',icon:'\uD83C\uDFAD'},{id:'state-memory',label:'State & Memory',icon:'\uD83E\uDDE0'},{id:'frameworks',label:'Frameworks',icon:'\uD83D\uDD27'},{id:'ma-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-orchestration',label:'Orchestration Patterns',icon:'\uD83C\uDFD7\uFE0F'},{id:'deep-communication',label:'Agent Communication',icon:'\uD83D\uDCE1'},{id:'deep-consensus',label:'Consensus Mechanisms',icon:'\u2696\uFE0F'},{id:'deep-memory',label:'Agent Memory',icon:'\uD83E\uDDE0'},{id:'deep-langgraph',label:'LangGraph Implementation',icon:'\uD83D\uDD17'},{id:'deep-crewai',label:'CrewAI & AutoGen',icon:'\uD83E\uDD16'},{id:'deep-prod-multiagent',label:'Production Multi-Agent',icon:'\u2699\uFE0F'},{id:'deep-ma-playground',label:'Deep Playground',icon:'\uD83C\uDFAE'}];
  return <CourseShell title="Multi-Agent Orchestration" icon={'\uD83E\uDD16'} onBack={onBack} progress={progress} time="55 min" exercises="10 exercises" visionaryTabs={visionaryTabs} deepTabs={deepTabs} depth={depth} onChangeDepth={onChangeDepth} renderTab={(tab,i,d)=>{
    if(d==='deep'){
      if(i===0)return <TabDeepOrchestration onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1)return <TabDeepCommunication onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2)return <TabDeepConsensus onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3)return <TabDeepMemory onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===4)return <TabDeepLangGraph onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===5)return <TabDeepCrewAI onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===6)return <TabDeepProdMultiAgent onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===7)return <TabDeepMAPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }
    if(i===0)return <TabWhyMulti onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===1)return <TabRolesPatterns onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===2)return <TabStateMemory onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===3)return <TabFrameworks onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===4)return <TabMAPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
  }}/>;
}

// ==================== COURSE 10: GRAPH RAG ====================
function TripleBuilder(){
  const sentences=[
    {text:'Albert Einstein developed the theory of relativity.',triples:[['Albert Einstein','developed','Theory of Relativity']]},
    {text:'Python was created by Guido van Rossum in 1991.',triples:[['Python','created by','Guido van Rossum'],['Python','released in','1991']]},
    {text:'The Eiffel Tower is located in Paris, France.',triples:[['Eiffel Tower','located in','Paris'],['Paris','is in','France']]},
  ];
  const[current,setCurrent]=useState(0);const[sub,setSub]=useState('');const[pred,setPred]=useState('');const[obj,setObj]=useState('');const[userTriples,setUserTriples]=useState([]);const[showAnswer,setShowAnswer]=useState(false);
  const s=sentences[current];
  const addTriple=()=>{if(sub&&pred&&obj){setUserTriples(t=>[...t,{s:sub,p:pred,o:obj}]);setSub('');setPred('');setObj('')}};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD17'} Try It: Extract Knowledge Triples</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Extract (Subject, Predicate, Object) triples from the sentence. ({current+1}/{sentences.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:14,color:GIM.headingText,fontWeight:600}}>"{s.text}"</p></div>
    <div className="grid grid-cols-3 gap-2 mb-2">
      <input value={sub} onChange={e=>setSub(e.target.value)} placeholder="Subject" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
      <input value={pred} onChange={e=>setPred(e.target.value)} placeholder="Predicate" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
      <input value={obj} onChange={e=>setObj(e.target.value)} placeholder="Object" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
    </div>
    <div className="flex gap-2 mb-3">
      <button onClick={addTriple} className="px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Add Triple</button>
      <button onClick={()=>setShowAnswer(!showAnswer)} className="px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.borderLight,color:GIM.bodyText}}>Show Answer</button>
      {current<sentences.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setUserTriples([]);setShowAnswer(false)}} className="px-3 py-1 rounded text-xs font-semibold" style={{background:'white',color:GIM.primary,border:`1px solid ${GIM.primary}`}}>Next Sentence</button>}
    </div>
    {userTriples.length>0&&<div className="mb-3">{userTriples.map((t,i)=><div key={i} className="flex items-center gap-2 text-xs mb-1"><span className="px-2 py-0.5 rounded" style={{background:'#EFF6FF'}}>{t.s}</span><span style={{color:GIM.primary}}>{'\u2192'}</span><span className="px-2 py-0.5 rounded" style={{background:'#FFFBEB'}}>{t.p}</span><span style={{color:GIM.primary}}>{'\u2192'}</span><span className="px-2 py-0.5 rounded" style={{background:'#EBF5F1'}}>{t.o}</span></div>)}</div>}
    {showAnswer&&<div className="p-3 rounded-lg" style={{background:'#EBF5F1'}}><span className="text-xs font-semibold" style={{color:'#2D8A6E'}}>Expected triples:</span>{s.triples.map((t,i)=><div key={i} className="text-xs mt-1">({t[0]}, {t[1]}, {t[2]})</div>)}</div>}
  </div>;
}

function TabKnowledgeGraphs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What Are Knowledge Graphs?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A knowledge graph represents information as a network of <b>entities</b> (nodes) connected by <b>relationships</b> (edges). Each fact is stored as a triple: <b>(Subject, Predicate, Object)</b>.</p>
  <AnalogyBox emoji={'\uD83D\uDDFA\uFE0F'} title="Think of it like a map of knowledge">A road map shows cities (entities) connected by roads (relationships). A knowledge graph shows concepts connected by their relationships: "Einstein" {'\u2192'} developed {'\u2192'} "Theory of Relativity".</AnalogyBox>
  <CodeBlock language="text" label="Knowledge Graph Triples" code={`(Einstein,       developed,    Theory of Relativity)
(Einstein,       born in,      Ulm, Germany)
(Einstein,       won,          Nobel Prize in Physics)
(Nobel Prize,    awarded by,   Royal Swedish Academy)
(Relativity,     foundational to,  Modern Physics)

Following connections: Einstein \u2192 Nobel Prize \u2192 Royal Swedish Academy
  Reveals: The institution that recognized Einstein's work`}/>
  <Quiz question="What is the basic unit of information in a knowledge graph?" options={["A single word","A triple (Subject, Predicate, Object)","A paragraph","A JSON document"]} correctIndex={1} explanation="Knowledge graphs store facts as triples: (Subject, Predicate, Object). For example: (Python, created_by, Guido van Rossum). Each triple represents one relationship between two entities." onAnswer={()=>onComplete&&onComplete('knowledge-graphs','quiz1')}/>
</div>}

function TabBuildingGraphs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building Graphs from Text</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building a knowledge graph from unstructured text requires two steps: <b>Named Entity Recognition (NER)</b> to find entities, and <b>Relation Extraction</b> to find how they connect.</p>
  <CodeBlock language="text" label="NER + Relation Extraction" code={`Input: "Apple CEO Tim Cook announced the new iPhone at WWDC 2024."

NER Results:
  [Apple]       \u2192 Organization
  [Tim Cook]    \u2192 Person
  [iPhone]      \u2192 Product
  [WWDC 2024]   \u2192 Event

Extracted Relations:
  (Tim Cook,    CEO of,       Apple)
  (Tim Cook,    announced,    iPhone)
  (iPhone,      announced at, WWDC 2024)
  (Apple,       hosts,        WWDC 2024)`}/>
  <TripleBuilder/>
  <Quiz question="What is the first step in building a knowledge graph from text?" options={["Drawing the graph visualization","Named Entity Recognition (NER)","Writing SQL queries","Calculating embeddings"]} correctIndex={1} explanation="NER identifies the entities (people, places, organizations, concepts) in the text. Only after finding entities can you extract the relationships between them." onAnswer={()=>onComplete&&onComplete('building-graphs','quiz1')}/>
</div>}

function TabGraphRetrieval({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Graph-Enhanced Retrieval</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Standard RAG finds documents similar to your query. <b>Graph RAG</b> enhances this by following relationships in the knowledge graph to find connected information that pure vector search would miss.</p>
  <AnalogyBox emoji={'\uD83D\uDD0D'} title="Vector search vs Graph search">Vector search: "Find documents about Einstein" {'\u2192'} finds articles mentioning Einstein. Graph search: Start at Einstein node, follow relationships {'\u2192'} discovers connected concepts like Relativity, Nobel Prize, Quantum Mechanics.</AnalogyBox>
  <Quiz question="What can Graph RAG find that vector search alone cannot?" options={["Faster results","Multi-hop connections between entities","More documents","Cheaper processing"]} correctIndex={1} explanation="Graph RAG can traverse relationships across multiple hops -- finding connections like 'Einstein \u2192 won Nobel Prize \u2192 awarded by Royal Swedish Academy' that wouldn't appear in a single document search." onAnswer={()=>onComplete&&onComplete('graph-retrieval','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's Loom creates thematic connections between debate insights -- these connections form a knowledge graph of ideas, linking arguments across different debates." targetPage="loom" onNavigate={onNavigate}/>
</div>}

function TabHybridStrat({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Hybrid Search Strategies</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The most powerful retrieval systems combine multiple strategies: <b>vector search</b> for semantic similarity, <b>keyword search</b> for exact matches, and <b>graph traversal</b> for relationship discovery.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Method</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Finds</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Misses</th></tr></thead>
      <tbody>
        {[['Vector Search','Semantically similar content','Exact terms, connected entities'],['Keyword Search','Exact term matches','Synonyms, related concepts'],['Graph Traversal','Entity relationships, multi-hop paths','Unstructured content'],['Hybrid (all three)','Comprehensive results','(Most complete coverage)']].map(([m,f,mi],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{m}</td><td className="p-3" style={{color:'#2D8A6E'}}>{f}</td><td className="p-3" style={{color:'#EF4444'}}>{mi}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Why combine vector search with graph traversal instead of using just one?" options={["It's a trend","They find different types of information, covering each other's blind spots","Graph search is always better","Vector search doesn't work"]} correctIndex={1} explanation="Vector search finds semantically similar content but misses entity connections. Graph traversal finds connected entities but misses unstructured content. Together, they provide comprehensive coverage." onAnswer={()=>onComplete&&onComplete('hybrid-strat','quiz1')}/>
</div>}

function TabGRPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your Graph RAG knowledge!</p>
  <ExpandableSection title="Exercise 1: Triple Extraction" icon={'\uD83D\uDD17'} defaultOpen={true}>
    <Quiz question="From 'Tesla, founded by Elon Musk, is headquartered in Austin.' How many triples can be extracted?" options={["1 triple","2 triples","3 triples","4 triples"]} correctIndex={1} explanation="Two triples: (Tesla, founded by, Elon Musk) and (Tesla, headquartered in, Austin). Each relationship becomes a separate triple." onAnswer={()=>onComplete&&onComplete('gr-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Strategy Selection" icon={'\uD83D\uDD0D'}>
    <Quiz question="A user asks 'What companies did Einstein's colleagues found?' This requires:" options={["Simple vector search","Multi-hop graph traversal","Keyword search for 'Einstein'","A larger LLM"]} correctIndex={1} explanation="This requires graph traversal: Einstein \u2192 (colleagues) \u2192 People \u2192 (founded) \u2192 Companies. Pure search would never connect these dots across multiple relationship hops." onAnswer={()=>onComplete&&onComplete('gr-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 10 DEEP TABS ====================
function TabDeepKGConstruction({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Knowledge Graph Construction</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building production knowledge graphs from unstructured text requires LLM-powered entity extraction, relation extraction, and ontology design. The quality of your graph directly determines retrieval accuracy.</p>
  <CodeBlock language="python" label="LLM-Powered Entity & Relation Extraction" code={`from pydantic import BaseModel
from typing import List, Optional

class Entity(BaseModel):
    name: str
    type: str  # Person, Organization, Concept, Technology, etc.
    description: Optional[str] = None

class Relation(BaseModel):
    source: str
    relation: str
    target: str
    confidence: float
    evidence: str  # supporting text span

class ExtractionResult(BaseModel):
    entities: List[Entity]
    relations: List[Relation]

async def extract_knowledge(text: str, llm) -> ExtractionResult:
    """Extract entities and relations from text using structured output."""
    response = await llm.invoke(
        system="""You are a knowledge graph extraction engine.
        Extract ALL entities and their relationships from the text.
        Entity types: Person, Organization, Technology, Concept,
                      Event, Location, Product
        For each relation, include the exact text evidence.
        Rate confidence 0.0-1.0 based on how explicit the relation is.""",
        user=f"Extract knowledge triples from:\\n\\n{text}",
        response_format=ExtractionResult
    )
    return response

# Process a document corpus
async def build_graph_from_docs(documents: list, llm):
    all_entities = {}
    all_relations = []

    for doc in documents:
        # Chunk document for processing
        chunks = chunk_text(doc.content, max_tokens=1000, overlap=100)

        for chunk in chunks:
            result = await extract_knowledge(chunk, llm)

            for entity in result.entities:
                key = normalize_entity(entity.name)
                if key in all_entities:
                    # Merge: keep richer description
                    all_entities[key].merge(entity)
                else:
                    all_entities[key] = entity

            all_relations.extend(result.relations)

    # Deduplicate and resolve relations
    resolved = resolve_relations(all_relations, all_entities)
    return all_entities, resolved`}/>
  <CodeBlock language="python" label="Ontology Design for Domain Graphs" code={`# Define a domain ontology for a tech knowledge graph
ONTOLOGY = {
    "entity_types": {
        "Technology": {"properties": ["version", "license", "category"]},
        "Organization": {"properties": ["founded", "headquarters", "size"]},
        "Person": {"properties": ["role", "expertise"]},
        "Concept": {"properties": ["domain", "complexity"]},
        "Paper": {"properties": ["year", "venue", "citations"]},
    },
    "relation_types": {
        "DEVELOPED_BY": {"from": "Technology", "to": "Organization"},
        "AUTHORED_BY": {"from": "Paper", "to": "Person"},
        "DEPENDS_ON": {"from": "Technology", "to": "Technology"},
        "IMPLEMENTS": {"from": "Technology", "to": "Concept"},
        "COMPETES_WITH": {"from": "Technology", "to": "Technology"},
        "WORKS_AT": {"from": "Person", "to": "Organization"},
    },
    "constraints": [
        "Every entity must have a unique canonical name",
        "Relations must connect valid entity types per schema",
        "Confidence below 0.5 requires human review",
    ]
}`}/>
  <ArchitectureDecision scenario="You are building a knowledge graph for a legal research platform. Documents contain case citations, statutes, judges, courts, and legal concepts. How should you design entity extraction?" options={[
    {label:'Generic NER model (spaCy/BERT)',tradeoff:'Fast and cheap but misses domain-specific entities like case citations and statutory references.'},
    {label:'LLM extraction with domain-specific ontology',tradeoff:'More accurate for legal entities. Higher cost per document but better graph quality.'},
    {label:'Manual annotation by legal experts',tradeoff:'Highest quality but does not scale. Useful for training data, not production extraction.'},
    {label:'Regex patterns for citations, LLM for concepts',tradeoff:'Hybrid approach: reliable regex for structured patterns, LLM for nuanced concept extraction.'}
  ]} correctIndex={3} explanation="A hybrid approach combines the reliability of regex for well-structured legal citations (case numbers, statute references) with LLM extraction for nuanced concepts and relationships. This balances cost, accuracy, and scalability." onAnswer={()=>onComplete&&onComplete('deep-kg-construction','quiz1')}/>
</div>}

function TabDeepGraphDatabases({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Graph Databases</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Knowledge graphs need a storage layer optimized for traversals, pattern matching, and relationship queries. Graph databases use native graph storage with index-free adjacency for O(1) relationship lookups regardless of graph size.</p>
  <ComparisonTable title="Graph Database Comparison" columns={['Database','Model','Query Language','Strengths','Hosting']} rows={[
    ['Neo4j','Labeled Property Graph','Cypher','Most mature, rich ecosystem, APOC plugins','Self-hosted, AuraDB cloud'],
    ['Amazon Neptune','Property Graph + RDF','Gremlin / SPARQL','AWS integration, serverless, managed','AWS only'],
    ['Memgraph','Property Graph','Cypher-compatible','In-memory speed, streaming ingestion','Self-hosted, cloud'],
    ['FalkorDB','Property Graph','Cypher subset','Redis-compatible, very fast reads','Self-hosted'],
  ]}/>
  <CodeBlock language="text" label="Cypher Query Examples (Neo4j)" code={`// Create entities and relationships
CREATE (e:Person {name: 'Einstein', born: 1879})
CREATE (r:Concept {name: 'Relativity', field: 'Physics'})
CREATE (e)-[:DEVELOPED {year: 1905}]->(r)

// Find all concepts developed by Einstein
MATCH (p:Person {name: 'Einstein'})-[:DEVELOPED]->(c:Concept)
RETURN c.name, c.field

// Multi-hop: Find collaborators of Einstein's collaborators
MATCH (e:Person {name: 'Einstein'})-[:COLLABORATED_WITH]->
      (colleague)-[:COLLABORATED_WITH]->(extended)
WHERE extended <> e
RETURN DISTINCT extended.name, COUNT(*) AS connections
ORDER BY connections DESC

// Shortest path between two concepts
MATCH path = shortestPath(
  (a:Concept {name: 'Quantum Mechanics'})-[*..6]-
  (b:Concept {name: 'General Relativity'})
)
RETURN [node IN nodes(path) | node.name] AS pathway

// Subgraph for context retrieval (Graph RAG)
MATCH (seed:Concept {name: $query_entity})
CALL apoc.path.subgraphAll(seed, {
  maxLevel: 2,
  relationshipFilter: "RELATES_TO|DEPENDS_ON|IMPLEMENTS"
}) YIELD nodes, relationships
RETURN nodes, relationships`}/>
  <Quiz question="Why do graph databases outperform relational databases for multi-hop relationship queries?" options={["Graph databases use SQL which is faster","Graph databases use index-free adjacency -- each node directly references its neighbors","Graph databases store less data","Relational databases cannot represent relationships"]} correctIndex={1} explanation="Index-free adjacency means each node stores direct pointers to its neighbors. A 6-hop traversal in a graph DB is O(6) regardless of graph size, while the same query in SQL requires 6 JOIN operations that scale with table size." onAnswer={()=>onComplete&&onComplete('deep-graph-databases','quiz1')}/>
</div>}

function TabDeepGraphVector({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Graph + Vector Hybrid</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Microsoft's GraphRAG implementation combines community detection in knowledge graphs with vector retrieval. It builds a hierarchical summary structure that enables both local (specific entity) and global (thematic) queries over document collections.</p>
  <CodeBlock language="python" label="Microsoft GraphRAG Pipeline" code={`# GraphRAG pipeline overview
# Step 1: Extract entities and relations from documents
# Step 2: Build knowledge graph
# Step 3: Detect communities using Leiden algorithm
# Step 4: Generate community summaries at multiple levels
# Step 5: At query time, use community summaries for global queries
#         and entity subgraphs for local queries

from graphrag.index import run_indexing
from graphrag.query import LocalSearch, GlobalSearch

# Index documents into a GraphRAG knowledge structure
await run_indexing(
    input_dir="./documents",
    output_dir="./graphrag_output",
    config={
        "llm": {"model": "claude-sonnet-4-20250514"},
        "entity_extraction": {
            "max_gleanings": 1,  # extraction refinement passes
            "entity_types": ["person", "organization", "technology",
                             "concept", "event"]
        },
        "community_detection": {
            "algorithm": "leiden",
            "resolution": 1.0,  # controls community granularity
            "levels": [0, 1, 2]  # hierarchy depth
        },
        "summarization": {
            "max_summary_length": 500
        }
    }
)

# Local search: specific entity questions
local_search = LocalSearch(
    llm=llm,
    context_builder=local_context_builder,
    token_budget=12000
)
local_result = await local_search.search(
    "What is Einstein's contribution to quantum mechanics?")

# Global search: thematic questions across entire corpus
global_search = GlobalSearch(
    llm=llm,
    context_builder=global_context_builder,
    map_llm=map_llm,
    reduce_llm=reduce_llm
)
global_result = await global_search.search(
    "What are the major themes in 20th century physics?")`}/>
  <ComparisonTable title="Local vs Global Search" columns={['Aspect','Local Search','Global Search']} rows={[
    ['Query Type','Specific entity questions','Thematic, corpus-wide questions'],
    ['Context Source','Entity subgraphs + text chunks','Community summaries at chosen level'],
    ['Latency','Lower (targeted retrieval)','Higher (map-reduce over communities)'],
    ['Cost','Lower (fewer tokens)','Higher (processes many summaries)'],
    ['Example','What did Einstein publish in 1905?','What are the key debates in modern physics?'],
  ]}/>
  <Quiz question="In Microsoft GraphRAG, what is the role of community detection?" options={["It finds user communities who use the system","It groups related entities into thematic clusters that can be summarized","It detects plagiarism in documents","It clusters similar vector embeddings"]} correctIndex={1} explanation="Community detection (using the Leiden algorithm) groups densely connected entities in the knowledge graph into clusters. Each cluster represents a thematic area that gets its own summary, enabling global queries about themes across the entire corpus." onAnswer={()=>onComplete&&onComplete('deep-graph-vector','quiz1')}/>
</div>}

function TabDeepRAPTOR({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>RAPTOR & Hierarchical Retrieval</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) builds a tree of summaries over your document chunks. Leaf nodes are original chunks, and higher levels are progressively broader summaries, enabling retrieval at different levels of abstraction.</p>
  <CodeBlock language="python" label="RAPTOR Tree Construction" code={`import numpy as np
from sklearn.cluster import KMeans

async def build_raptor_tree(chunks: list[str], llm, embedder,
                             max_levels: int = 3):
    """Build a hierarchical summary tree over document chunks."""
    tree = {"level_0": chunks}  # leaf nodes = original chunks

    current_level = chunks
    for level in range(1, max_levels + 1):
        if len(current_level) <= 3:
            break  # Too few nodes to cluster further

        # Embed current level
        embeddings = await embedder.embed_batch(current_level)
        emb_matrix = np.array(embeddings)

        # Cluster into groups
        n_clusters = max(2, len(current_level) // 5)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(emb_matrix)

        # Summarize each cluster
        summaries = []
        for cluster_id in range(n_clusters):
            cluster_texts = [current_level[i]
                           for i in range(len(current_level))
                           if labels[i] == cluster_id]

            summary = await llm.invoke(
                system="Summarize these related text passages into a "
                       "coherent summary that captures all key information.",
                user="\\n---\\n".join(cluster_texts)
            )
            summaries.append(summary.content)

        tree[f"level_{level}"] = summaries
        current_level = summaries

    return tree

async def raptor_retrieve(query: str, tree: dict, embedder,
                           top_k: int = 5) -> list[str]:
    """Retrieve from all levels of the RAPTOR tree."""
    query_emb = await embedder.embed(query)
    all_candidates = []

    for level_name, texts in tree.items():
        embeddings = await embedder.embed_batch(texts)
        for i, emb in enumerate(embeddings):
            score = cosine_similarity(query_emb, emb)
            all_candidates.append({
                "text": texts[i], "score": score,
                "level": level_name
            })

    # Return top-k across all levels
    all_candidates.sort(key=lambda x: x["score"], reverse=True)
    return all_candidates[:top_k]`}/>
  <ArchitectureDecision scenario="You have a 10,000-page technical manual. Users ask both specific questions ('What is the torque spec for bolt A7?') and broad questions ('What are the major maintenance categories?'). Which retrieval strategy works best?" options={[
    {label:'Flat vector search over all chunks',tradeoff:'Good for specific questions but misses high-level themes. Returns fragments without context.'},
    {label:'RAPTOR hierarchical tree retrieval',tradeoff:'Retrieves from multiple abstraction levels. Specific chunks for detail, summaries for themes.'},
    {label:'Full document search (no chunking)',tradeoff:'Preserves context but 10,000 pages exceeds any context window. Impractical.'},
    {label:'Keyword search with BM25 only',tradeoff:'Fast for exact term matches but misses semantic similarity and thematic queries.'}
  ]} correctIndex={1} explanation="RAPTOR tree retrieval handles both query types: leaf-level chunks answer specific questions about bolt torque specs, while higher-level summary nodes answer broad questions about maintenance categories. The tree structure naturally serves different abstraction levels." onAnswer={()=>onComplete&&onComplete('deep-raptor','quiz1')}/>
</div>}

function TabDeepQueryPatterns({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Advanced Query Patterns</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Graph RAG queries go beyond simple vector similarity. Multi-hop reasoning, subgraph retrieval, and hybrid traversal strategies unlock the full power of knowledge graphs for complex analytical questions.</p>
  <CodeBlock language="python" label="Multi-Hop Reasoning Pipeline" code={`async def multi_hop_query(question: str, graph_db, vector_store,
                          llm, max_hops: int = 3):
    """Answer complex questions requiring multi-hop graph traversal."""

    # Step 1: Decompose question into sub-questions
    decomposition = await llm.invoke(
        system="Break this question into sequential sub-questions "
               "that can each be answered by a knowledge graph lookup.",
        user=question,
        response_format={"sub_questions": ["str"]}
    )

    context_chain = []
    visited_entities = set()

    for sub_q in decomposition["sub_questions"][:max_hops]:
        # Step 2: Extract entities from sub-question
        entities = await extract_entities(sub_q, llm)

        # Step 3: Retrieve subgraph around entities
        subgraph = await graph_db.query(f"""
            MATCH (n)-[r]-(m)
            WHERE n.name IN $entities
            AND NOT n.name IN $visited
            RETURN n, r, m LIMIT 50
        """, entities=[e.name for e in entities],
             visited=list(visited_entities))

        # Step 4: Also get vector-retrieved context
        vector_context = await vector_store.search(
            query=sub_q, top_k=3,
            filter={"entities": {"$overlap": [e.name for e in entities]}}
        )

        # Step 5: Answer sub-question with combined context
        sub_answer = await llm.invoke(
            system="Answer using ONLY the provided context.",
            user=f"Question: {sub_q}\\n"
                 f"Graph context: {format_subgraph(subgraph)}\\n"
                 f"Text context: {format_docs(vector_context)}"
        )

        context_chain.append({
            "question": sub_q,
            "answer": sub_answer.content,
            "sources": {"graph": subgraph, "text": vector_context}
        })
        visited_entities.update(e.name for e in entities)

    # Step 6: Synthesize final answer from chain
    final = await llm.invoke(
        system="Synthesize a comprehensive answer from these findings.",
        user=f"Original question: {question}\\n"
             f"Research chain: {json.dumps(context_chain, indent=2)}"
    )
    return {"answer": final.content, "chain": context_chain}`}/>
  <Quiz question="A user asks 'Which companies were founded by former Google engineers who worked on transformer research?' This requires:" options={["Single vector search for 'Google engineers transformers'","Two-hop graph traversal: Google -> engineers -> transformer papers, then engineers -> founded -> companies","Keyword search for 'Google' and 'transformer'","Asking an LLM without any retrieval"]} correctIndex={1} explanation="This requires multi-hop traversal: first find Google engineers connected to transformer research papers, then follow 'founded' edges from those people to companies. No single search query can connect these separate relationship chains." onAnswer={()=>onComplete&&onComplete('deep-query-patterns','quiz1')}/>
</div>}

function TabDeepEntityResolution({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Entity Resolution</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Real-world text refers to the same entity in many ways: "Google", "Alphabet Inc.", "the Mountain View company". Entity resolution merges these references into a single canonical node, which is essential for accurate graph traversals.</p>
  <CodeBlock language="python" label="Entity Resolution Pipeline" code={`from rapidfuzz import fuzz
from typing import List, Dict
import numpy as np

class EntityResolver:
    def __init__(self, embedder, similarity_threshold=0.85):
        self.embedder = embedder
        self.threshold = similarity_threshold
        self.canonical_entities = {}  # canonical_name -> entity_data
        self.alias_map = {}           # alias -> canonical_name

    async def resolve(self, entity_name: str,
                      entity_type: str) -> str:
        """Resolve an entity mention to its canonical form."""
        normalized = entity_name.strip().lower()

        # Check existing aliases
        if normalized in self.alias_map:
            return self.alias_map[normalized]

        # Fuzzy string matching against known entities
        best_match = None
        best_score = 0
        for canonical in self.canonical_entities:
            score = fuzz.token_sort_ratio(normalized, canonical) / 100
            if score > best_score:
                best_score = score
                best_match = canonical

        # Semantic similarity check for non-obvious matches
        if best_score < self.threshold and self.canonical_entities:
            entity_emb = await self.embedder.embed(entity_name)
            for canonical, data in self.canonical_entities.items():
                sim = cosine_similarity(entity_emb, data["embedding"])
                if sim > self.threshold and sim > best_score:
                    best_score = sim
                    best_match = canonical

        if best_match and best_score >= self.threshold:
            self.alias_map[normalized] = best_match
            return best_match
        else:
            # New entity
            emb = await self.embedder.embed(entity_name)
            self.canonical_entities[normalized] = {
                "type": entity_type, "embedding": emb,
                "aliases": [entity_name], "mention_count": 1
            }
            self.alias_map[normalized] = normalized
            return normalized

    async def merge_entities(self, entity_a: str, entity_b: str):
        """Manually merge two entities (human-in-the-loop correction)."""
        canonical = self.alias_map.get(entity_a.lower(), entity_a.lower())
        alias = self.alias_map.get(entity_b.lower(), entity_b.lower())

        if alias in self.canonical_entities:
            # Move aliases from B to A
            data = self.canonical_entities.pop(alias)
            self.canonical_entities[canonical]["aliases"].extend(
                data["aliases"])

        self.alias_map[alias] = canonical`}/>
  <Quiz question="Your knowledge graph has separate nodes for 'ML', 'Machine Learning', and 'machine learning'. What problem does this cause for retrieval?" options={["The graph uses too much storage","Graph traversals miss connections because related info is split across 3 nodes","The labels look inconsistent","It makes Cypher queries harder to write"]} correctIndex={1} explanation="Without entity resolution, a query starting from 'Machine Learning' only finds relationships attached to that specific node. Connections attached to 'ML' or 'machine learning' are invisible, fragmenting your knowledge and producing incomplete retrieval results." onAnswer={()=>onComplete&&onComplete('deep-entity-resolution','quiz1')}/>
</div>}

function TabDeepProdGraphRAG({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Production Graph RAG</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Production Graph RAG systems need incremental graph updates, consistency guarantees between the graph and vector store, performance tuning for large graphs, and monitoring for graph quality degradation.</p>
  <CodeBlock language="python" label="Production Graph RAG Pipeline" code={`class ProductionGraphRAG:
    def __init__(self, graph_db, vector_store, llm, embedder):
        self.graph = graph_db
        self.vectors = vector_store
        self.llm = llm
        self.embedder = embedder
        self.resolver = EntityResolver(embedder)

    async def ingest_document(self, doc_id: str, content: str):
        """Incrementally add a document to the graph."""
        chunks = chunk_text(content, max_tokens=500, overlap=50)

        async with self.graph.transaction() as tx:
            # Create document node
            await tx.run(
                "MERGE (d:Document {id: $id}) SET d.updated = datetime()",
                id=doc_id)

            for i, chunk in enumerate(chunks):
                # Extract and resolve entities
                extraction = await extract_knowledge(chunk, self.llm)

                for entity in extraction.entities:
                    canonical = await self.resolver.resolve(
                        entity.name, entity.type)
                    await tx.run("""
                        MERGE (e:Entity {name: $name})
                        SET e.type = $type, e.updated = datetime()
                        MERGE (d:Document {id: $doc_id})
                        MERGE (d)-[:MENTIONS]->(e)
                    """, name=canonical, type=entity.type, doc_id=doc_id)

                for rel in extraction.relations:
                    src = await self.resolver.resolve(rel.source, "Entity")
                    tgt = await self.resolver.resolve(rel.target, "Entity")
                    await tx.run("""
                        MATCH (a:Entity {name: $src}), (b:Entity {name: $tgt})
                        MERGE (a)-[r:RELATES {type: $rel_type}]->(b)
                        SET r.confidence = $conf, r.evidence = $evidence
                    """, src=src, tgt=tgt, rel_type=rel.relation,
                         conf=rel.confidence, evidence=rel.evidence)

                # Index chunk in vector store
                embedding = await self.embedder.embed(chunk)
                await self.vectors.upsert(
                    id=f"{doc_id}_chunk_{i}", vector=embedding,
                    metadata={"doc_id": doc_id, "chunk_index": i,
                              "text": chunk,
                              "entities": [e.name for e in extraction.entities]}
                )

    async def query(self, question: str, strategy: str = "hybrid"):
        """Query with configurable retrieval strategy."""
        if strategy == "local":
            return await self._local_search(question)
        elif strategy == "global":
            return await self._global_search(question)
        else:
            # Hybrid: combine graph + vector retrieval
            graph_ctx = await self._graph_context(question)
            vector_ctx = await self._vector_context(question)
            return await self._synthesize(question, graph_ctx, vector_ctx)`}/>
  <ArchitectureDecision scenario="Your Graph RAG system processes 100 new documents daily. After 3 months, query latency increased from 200ms to 2 seconds. Graph has 500K nodes and 2M edges. What is the most likely fix?" options={[
    {label:'Rebuild the entire graph from scratch monthly',tradeoff:'Clean state but expensive. Causes downtime during rebuild.'},
    {label:'Add graph database indexes on frequently queried properties',tradeoff:'Addresses the root cause. Index on entity names and types speeds up MATCH queries dramatically.'},
    {label:'Reduce the number of entities extracted per document',tradeoff:'Smaller graph but loses information. Does not fix the indexing problem.'},
    {label:'Switch to a larger database instance',tradeoff:'Throwing hardware at the problem. Helps temporarily but does not scale.'}
  ]} correctIndex={1} explanation="The latency increase is almost certainly due to missing indexes. As the graph grew from thousands to 500K nodes, unindexed property lookups became full scans. Adding indexes on entity name and type fields brings query times back to O(log n)." onAnswer={()=>onComplete&&onComplete('deep-prod-graph-rag','quiz1')}/>
</div>}

function TabDeepGRPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your Graph RAG knowledge to production architecture decisions.</p>
  <ExpandableSection title="Exercise 1: Graph Schema Design" icon={'\uD83D\uDCC0'} defaultOpen={true}>
    <ArchitectureDecision scenario="You are designing a knowledge graph for a biomedical research platform. Documents describe drugs, diseases, genes, clinical trials, and side effects. Which schema approach?" options={[
      {label:'Flat schema: all entities are generic nodes with a type property',tradeoff:'Simple but loses type-specific properties. Hard to enforce constraints.'},
      {label:'Rich ontology: typed nodes (Drug, Disease, Gene) with typed relations (TREATS, CAUSES, TARGETS)',tradeoff:'More complex to build but enables precise queries like "find all drugs that target gene X and treat disease Y".'},
      {label:'Document-centric: documents as nodes, entities as properties',tradeoff:'Loses entity relationships. Cannot traverse between entities across documents.'},
      {label:'Triple store with RDF/OWL ontology',tradeoff:'Most semantically rich but highest complexity. Best for interoperability with existing biomedical ontologies (SNOMED, UMLS).'}
    ]} correctIndex={1} explanation="Biomedical data has well-defined entity types and relationships. A rich typed ontology enables the precise multi-hop queries researchers need (drug -> targets -> gene -> associated_with -> disease) while keeping the graph navigable and queryable." onAnswer={()=>onComplete&&onComplete('deep-gr-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Retrieval Strategy" icon={'\uD83D\uDD0D'}>
    <Quiz question="A user asks 'What is the relationship between transformer architecture and recent advances in protein folding?' This spans two domains. Which retrieval approach?" options={["Keyword search for 'transformer' AND 'protein folding'","Graph traversal from 'Transformer' node through intermediate concepts to 'Protein Folding'","Vector search for the full question","Graph traversal first to find connecting concepts, then vector search for supporting detail"]} correctIndex={3} explanation="The optimal approach is graph traversal first (Transformer -> used_in -> AlphaFold -> applied_to -> Protein Folding) to discover the connecting concepts, then vector search to retrieve detailed text about each connection. This combines structural knowledge with textual detail." onAnswer={()=>onComplete&&onComplete('deep-gr-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Entity Resolution Trade-off" icon={'\u2696\uFE0F'}>
    <Quiz question="Your entity resolver aggressively merges entities, causing 'Java (programming language)' and 'Java (island)' to merge into one node. What fix preserves disambiguation?" options={["Lower the similarity threshold from 0.85 to 0.5","Add entity type as a disambiguation signal: only merge if both name AND type match","Disable entity resolution entirely","Require exact string match for merging"]} correctIndex={1} explanation="Using entity type as a disambiguation signal prevents merging entities with the same name but different types. 'Java (Technology)' and 'Java (Location)' have different types and will not be merged, while 'ML' and 'Machine Learning' (both Technology) will correctly merge." onAnswer={()=>onComplete&&onComplete('deep-gr-playground','quiz3')}/>
  </ExpandableSection>
</div>}

function TabDeepMSGraphRAG({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Microsoft GraphRAG</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Microsoft's GraphRAG combines knowledge graphs with hierarchical community detection. Instead of flat entity-relation triples, it builds a layered graph where entities are grouped into communities at multiple scales, enabling both <b>local search</b> (entity-centric) and <b>global search</b> (thematic) over a corpus.</p>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The key insight is <b>community detection</b>: using the Leiden algorithm to cluster densely connected entities, then generating summaries at each community level. This enables answering broad thematic questions that traditional RAG cannot handle.</p>
  <ComparisonTable title="GraphRAG vs Traditional RAG" columns={['Aspect','Traditional RAG','Microsoft GraphRAG']} rows={[
    ['Indexing','Chunk + embed documents','Extract entities, build graph, detect communities, generate summaries'],
    ['Local Search','Top-k vector similarity','Entity-centric retrieval with graph neighborhood context'],
    ['Global Search','Not supported well','Map-reduce over community summaries at multiple levels'],
    ['Thematic Queries','Poor -- fragments across chunks','Excellent -- community summaries capture themes'],
    ['Cost','Low (embed once)','High (multiple LLM calls per chunk for extraction)'],
  ]}/>
  <CodeBlock language="python" label="Microsoft GraphRAG Community Detection Pipeline" code={`import networkx as nx
from graspologic.partition import hierarchical_leiden

async def build_graphrag_index(docs, llm):
    """Full Microsoft GraphRAG indexing pipeline."""
    entities, rels = [], []
    for doc in docs:
        for chunk in chunk_document(doc, 600, 100):
            ext = await llm.invoke(
                system="Extract entities and relationships as JSON.",
                user=chunk)
            p = parse_json(ext.content)
            entities.extend(p["entities"])
            rels.extend(p["relationships"])

    resolved = resolve_entities(entities)
    G = nx.Graph()
    for e in resolved:
        G.add_node(e.name, type=e.entity_type, desc=e.description)
    for r in rels:
        s, t = resolve_name(r.source, resolved), resolve_name(r.target, resolved)
        if G.has_edge(s, t):
            G[s][t]["weight"] += r.weight
        else:
            G.add_edge(s, t, relation=r.relation, weight=r.weight)

    # Hierarchical community detection
    communities = hierarchical_leiden(G, max_cluster_size=10)

    # Generate community summaries at each level
    summaries = {}
    for level in range(communities.num_levels()):
        for cid, members in communities.get_level(level).items():
            descs = [G.nodes[m]["desc"] for m in members if m in G.nodes]
            s = await llm.invoke(
                system="Summarize key themes among these entities.",
                user="\\n".join(descs))
            summaries[(level, cid)] = s.content
    return G, communities, summaries

async def global_search(query, summaries, llm, level=0):
    """Map-reduce over community summaries for thematic queries."""
    level_sums = {k: v for k, v in summaries.items() if k[0] == level}
    parts = []
    for (l, c), s in level_sums.items():
        a = await llm.invoke(
            system="Provide relevant info or N/A.",
            user=f"Summary: \\$\\{s\\}\\nQ: \\$\\{query\\}")
        if a.content.strip() != "N/A":
            parts.append(a.content)
    final = await llm.invoke(
        system="Synthesize into a comprehensive answer.",
        user=f"Q: \\$\\{query\\}\\n" + "\\n---\\n".join(parts))
    return final.content`}/>
  <Quiz question="What enables Microsoft GraphRAG to answer broad thematic questions?" options={["Larger embeddings","Hierarchical community detection with summaries at multiple levels","Faster vector search","More chunks"]} correctIndex={1} explanation="The Leiden algorithm clusters entities into communities, then summaries at each level capture themes. Global search via map-reduce enables broad questions traditional RAG cannot handle." onAnswer={()=>onComplete&&onComplete('deep-ms-graphrag','quiz1')}/>
  <ArchitectureDecision scenario="Choose between standard Graph RAG and Microsoft GraphRAG for a legal discovery platform needing both specific factual and broad thematic queries." options={[
    {label:'Standard Graph RAG only',tradeoff:'Good for entity queries but not broad themes.'},
    {label:'Microsoft GraphRAG only',tradeoff:'Both query types but higher indexing costs.'},
    {label:'Hybrid: standard for local, communities for global',tradeoff:'Best coverage. Higher complexity but optimal.'},
    {label:'Pure vector RAG',tradeoff:'Cheapest but misses relationships and themes.'}
  ]} correctIndex={2} explanation="Legal discovery needs both precise lookups and thematic analysis. Hybrid uses graph traversal for specific queries and community summaries for themes." onAnswer={()=>onComplete&&onComplete('deep-ms-graphrag','quiz2')}/>
</div>}

export function CourseGraphRAG({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'knowledge-graphs',label:'Knowledge Graphs',icon:'\uD83C\uDF10'},{id:'building-graphs',label:'Building Graphs',icon:'\uD83D\uDD28'},{id:'graph-retrieval',label:'Graph Retrieval',icon:'\uD83D\uDD0D'},{id:'hybrid-strat',label:'Hybrid Strategies',icon:'\uD83D\uDD00'},{id:'gr-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-kg-construction',label:'KG Construction',icon:'🏗️'},{id:'deep-graph-dbs',label:'Graph Databases',icon:'🗄️'},{id:'deep-ms-graphrag',label:'Microsoft GraphRAG',icon:'🔷'},{id:'deep-query-patterns',label:'Query Patterns',icon:'🔍'},{id:'deep-prod-graph',label:'Production Pipeline',icon:'⚙️'},{id:'deep-gr-playground',label:'Deep Playground',icon:'🎮'}];
  return <CourseShell title="Graph RAG & Knowledge Graphs" icon={'\uD83C\uDF10'} onBack={onBack} progress={progress} time="50 min" exercises="8 exercises" visionaryTabs={visionaryTabs} deepTabs={deepTabs} depth={depth} onChangeDepth={onChangeDepth} renderTab={(tab,i,d)=>{
    if(d==='deep'){
      if(i===0)return <TabDeepKGConstruction onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1)return <TabDeepGraphDatabases onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2)return <TabDeepMSGraphRAG onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3)return <TabDeepQueryPatterns onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===4)return <TabDeepProdGraphRAG onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===5)return <TabDeepGRPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }
    if(i===0)return <TabKnowledgeGraphs onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===1)return <TabBuildingGraphs onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===2)return <TabGraphRetrieval onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===3)return <TabHybridStrat onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===4)return <TabGRPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
  }}/>;
}

// ==================== COURSE 11: AI OBSERVABILITY ====================
function TabWhyObserve({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why Observe AI?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Unlike traditional software with deterministic outputs, AI systems are <b>non-deterministic</b>. The same input can produce different outputs. This makes monitoring, debugging, and quality assurance fundamentally different.</p>
  <AnalogyBox emoji={'\uD83D\uDE97'} title="Think of it like a car dashboard">You wouldn't drive without a speedometer, fuel gauge, and warning lights. AI observability gives you the same visibility into your AI system -- speed (latency), fuel (tokens/cost), and warning lights (quality issues).</AnalogyBox>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Metric</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>What It Measures</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Why It Matters</th></tr></thead>
      <tbody>
        {[['Latency','Response time (ms)','User experience, SLA compliance'],['Token Usage','Input + output tokens per request','Cost management, budget planning'],['Error Rate','% of failed or low-quality responses','System reliability'],['Quality Score','Faithfulness, relevance, coherence','Output accuracy and usefulness']].map(([m,w,y],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{m}</td><td className="p-3" style={{color:GIM.bodyText}}>{w}</td><td className="p-3" style={{color:GIM.mutedText}}>{y}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Why is AI observability harder than traditional software monitoring?" options={["AI is always faster","AI outputs are non-deterministic -- same input can produce different outputs","AI doesn't generate errors","Monitoring tools don't work with AI"]} correctIndex={1} explanation="Traditional software has deterministic outputs (same input = same output). AI is non-deterministic, so you can't just check if the output matches an expected value -- you need quality metrics." onAnswer={()=>onComplete&&onComplete('why-observe','quiz1')}/>
</div>}

function TabTracing({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tracing & Logging</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An AI trace captures the complete journey of a request: from user input through retrieval, LLM calls, tool use, and final response. Each step is a <b>span</b> with timing, token counts, and metadata.</p>
  <CodeBlock language="json" label="Example Trace Span" code={`{
  "trace_id": "tr_abc123",
  "span_name": "llm_completion",
  "duration_ms": 2340,
  "model": "claude-3-sonnet",
  "input_tokens": 1250,
  "output_tokens": 380,
  "temperature": 0.7,
  "cost_usd": 0.0087,
  "status": "success",
  "parent_span": "rag_pipeline"
}`}/>
  <ExpandableSection title="Common tracing tools" icon={'\uD83D\uDD27'}>
    <p className="mb-2"><b>LangSmith:</b> By LangChain. Traces chains, agents, and retrievers with a visual UI.</p>
    <p className="mb-2"><b>Langfuse:</b> Open-source. Supports traces, scores, and prompt management.</p>
    <p className="mb-2"><b>Arize Phoenix:</b> Focus on embeddings analysis and retrieval evaluation.</p>
    <p className="mb-2"><b>Weights & Biases:</b> Broad ML ops platform with LLM tracing support.</p>
  </ExpandableSection>
  <Quiz question="What information does a trace span capture?" options={["Only the final output","Timing, tokens, model, cost, and status for each processing step","Just the error messages","The user's personal data"]} correctIndex={1} explanation="A span captures everything about one processing step: duration, model used, tokens consumed, cost, status, and parent-child relationships to other spans." onAnswer={()=>onComplete&&onComplete('tracing','quiz1')}/>
</div>}

function TabEvalFrameworks({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Evaluation Frameworks</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>How do you measure if your AI system is "good"? Evaluation frameworks provide standardized metrics to assess AI output quality across multiple dimensions.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Metric</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Question It Answers</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Score Range</th></tr></thead>
      <tbody>
        {[['Faithfulness','Is the answer supported by the retrieved context?','0-1 (higher = more faithful)'],['Answer Relevancy','Does the answer actually address the question?','0-1 (higher = more relevant)'],['Context Precision','Are the retrieved documents relevant?','0-1 (higher = more precise)'],['Context Recall','Did retrieval find all relevant information?','0-1 (higher = better recall)'],['Coherence','Is the answer well-structured and logical?','1-5 (higher = more coherent)']].map(([m,q,s],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{m}</td><td className="p-3" style={{color:GIM.bodyText}}>{q}</td><td className="p-3 font-mono" style={{color:GIM.mutedText,fontSize:11}}>{s}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Users report that your AI sometimes includes information not found in the source documents. Which metric is low?" options={["Answer Relevancy","Context Precision","Faithfulness","Coherence"]} correctIndex={2} explanation="Faithfulness measures whether the answer is grounded in the retrieved context. Low faithfulness means the LLM is generating information beyond what was retrieved -- hallucinating." onAnswer={()=>onComplete&&onComplete('eval-frameworks','quiz1')}/>
  <Quiz question="Your RAG system retrieves mostly irrelevant documents. Which metric would flag this?" options={["Faithfulness","Context Precision","Answer Relevancy","Coherence"]} correctIndex={1} explanation="Context Precision measures whether the retrieved documents are actually relevant to the query. Low precision means the retrieval step is returning too much irrelevant content." onAnswer={()=>onComplete&&onComplete('eval-frameworks','quiz2')}/>
  <SeeItInRe3 text="Re\u00b3's Socratia agent acts as a quality evaluator -- scoring debate arguments for relevance, depth, and accuracy. This is AI evaluation applied to a debate system." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabObsPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your observability knowledge!</p>
  <ExpandableSection title="Exercise 1: Metric Selection" icon={'\uD83D\uDCCA'} defaultOpen={true}>
    <Quiz question="Your AI system's costs doubled last month. Which metric should you investigate first?" options={["Faithfulness","Token usage per request","Coherence","Answer relevancy"]} correctIndex={1} explanation="Cost is directly proportional to token usage. If costs doubled, check if requests are using more tokens (longer prompts, more retrieval, longer outputs) or if request volume increased." onAnswer={()=>onComplete&&onComplete('obs-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Quality Diagnosis" icon={'\uD83D\uDD0D'}>
    <Quiz question="Users say answers are correct but hard to understand. Which metric is the issue?" options={["Faithfulness","Context Recall","Coherence","Context Precision"]} correctIndex={2} explanation="If answers are factually correct (high faithfulness) but hard to understand, the issue is coherence -- the logical structure, readability, and organization of the response." onAnswer={()=>onComplete&&onComplete('obs-playground','quiz2')}/>
  </ExpandableSection>
</div>}

function TabDeepTracingArch({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tracing Architecture</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>OpenTelemetry provides a vendor-neutral standard for distributed tracing. In LLM applications, traces capture the full lifecycle of a request: from user input through retrieval, prompt construction, LLM inference, tool calls, and response generation. Each step becomes a <b>span</b> in a hierarchical trace tree.</p>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Span hierarchies are critical: a parent <b>rag_pipeline</b> span contains child spans for <b>embedding</b>, <b>retrieval</b>, <b>reranking</b>, and <b>llm_completion</b>. This lets you pinpoint exactly where latency or failures occur.</p>
  <CodeBlock language="python" label="OpenTelemetry Tracing for LLM Pipelines" code={`from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4317"))
)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("llm-app")

async def rag_pipeline(query: str):
    with tracer.start_as_current_span("rag_pipeline") as parent:
        parent.set_attribute("user.query", query)

        with tracer.start_as_current_span("embed_query") as embed_span:
            embedding = await embedder.embed(query)
            embed_span.set_attribute("embedding.dimensions", len(embedding))

        with tracer.start_as_current_span("vector_retrieval") as ret_span:
            docs = await vector_store.search(embedding, top_k=5)
            ret_span.set_attribute("retrieval.num_results", len(docs))
            ret_span.set_attribute("retrieval.top_score", docs[0].score)

        with tracer.start_as_current_span("llm_completion") as llm_span:
            response = await llm.invoke(
                system="Answer using the provided context.",
                user=f"Context: \\$\\{format_docs(docs)\\}\\nQuestion: \\$\\{query\\}")
            llm_span.set_attribute("llm.model", "claude-3-sonnet")
            llm_span.set_attribute("llm.input_tokens", response.usage.input)
            llm_span.set_attribute("llm.output_tokens", response.usage.output)

        return response.content`}/>
  <Quiz question="Why are span hierarchies important in LLM tracing?" options={["They make logs look prettier","They let you pinpoint exactly which step caused latency or failures","They are required by law","They reduce token costs"]} correctIndex={1} explanation="Span hierarchies create a tree structure where each processing step is a child of its parent pipeline. When latency spikes, you can drill down to see which child span (embedding, retrieval, LLM call) is the bottleneck." onAnswer={()=>onComplete&&onComplete('deep-tracing-arch','quiz1')}/>
</div>}

function TabDeepLLMEval({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>LLM Evaluation Methods</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Evaluating LLM outputs requires multiple complementary approaches. No single method captures all quality dimensions. Production systems typically combine automated metrics, LLM-as-judge evaluation, and periodic human review in a layered evaluation pipeline.</p>
  <ComparisonTable title="Evaluation Method Comparison" columns={['Method','How It Works','Strengths','Weaknesses']} rows={[
    ['Reference-Based','Compare to gold-standard answers (BLEU, ROUGE)','Objective, reproducible','Requires labeled data, penalizes valid alternatives'],
    ['LLM-as-Judge','A separate LLM scores the output on criteria','Scalable, captures nuance','Judge bias, cost of evaluator LLM'],
    ['Human Evaluation','Domain experts rate outputs','Highest quality signal','Expensive, slow, not scalable'],
    ['Rubric-Based','Score against defined criteria (1-5 per dimension)','Structured, consistent','Requires careful rubric design'],
  ]}/>
  <CodeBlock language="python" label="LLM-as-Judge Evaluation Pipeline" code={`from dataclasses import dataclass

@dataclass
class EvalResult:
    faithfulness: float   # 0-1: grounded in context?
    relevance: float      # 0-1: answers the question?
    coherence: float      # 0-1: well-structured?
    reasoning: str

async def llm_judge_evaluate(question, answer, context, judge_llm):
    """Use a separate LLM to evaluate answer quality."""
    prompt = f"""Evaluate this answer on three criteria (0.0-1.0 each):
    Question: \\$\\{question\\}
    Context: \\$\\{context\\}
    Answer: \\$\\{answer\\}
    Return JSON: {{"faithfulness": ..., "relevance": ...,
      "coherence": ..., "reasoning": "..."}}"""

    response = await judge_llm.invoke(
        system="You are a strict evaluation judge.",
        user=prompt)
    return EvalResult(**parse_json(response.content))

async def batch_evaluate(test_cases, judge_llm):
    results = []
    for case in test_cases:
        r = await llm_judge_evaluate(
            case["question"], case["answer"],
            case["context"], judge_llm)
        results.append(r)
    avg_f = sum(r.faithfulness for r in results) / len(results)
    avg_r = sum(r.relevance for r in results) / len(results)
    avg_c = sum(r.coherence for r in results) / len(results)
    print(f"Faith: \\$\\{avg_f:.2f\\} Rel: \\$\\{avg_r:.2f\\} Coh: \\$\\{avg_c:.2f\\}")
    return results`}/>
  <Quiz question="An LLM-as-judge consistently rates Claude outputs higher than GPT outputs regardless of quality. What is this?" options={["Calibration error","Judge bias -- the evaluator has model preference","Hallucination","Context overflow"]} correctIndex={1} explanation="Judge bias occurs when the evaluating LLM has systematic preferences for certain styles or models. Mitigation: use a different model family as judge, randomize labels, or average scores from multiple judges." onAnswer={()=>onComplete&&onComplete('deep-llm-eval','quiz1')}/>
</div>}

function TabDeepDrift({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Drift Detection</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>AI systems degrade silently. Unlike traditional software that crashes visibly, LLM applications experience <b>drift</b> -- gradual quality degradation that users notice before your metrics do. Three types of drift threaten production AI systems.</p>
  <ComparisonTable title="Types of Drift" columns={['Type','What Changes','Detection Method','Example']} rows={[
    ['Distribution Drift','Input data patterns shift','Monitor embedding cluster distributions','Users ask about topics your docs do not cover'],
    ['Concept Drift','Meaning of terms changes','Track eval scores on rolling windows','Legal terminology changes after new regulations'],
    ['Prompt Drift','LLM behavior changes across versions','A/B test across model versions','Provider updates model, changing response style'],
  ]}/>
  <CodeBlock language="python" label="Drift Detection with Alerting" code={`import numpy as np
from scipy.stats import ks_2samp
from datetime import datetime, timedelta

class DriftDetector:
    def __init__(self, baseline_embeddings, threshold=0.05):
        self.baseline = baseline_embeddings
        self.threshold = threshold
        self.alerts = []

    def check_distribution_drift(self, recent_embeddings):
        """Kolmogorov-Smirnov test for embedding distribution shift."""
        drift_dims = 0
        for dim in range(self.baseline.shape[1]):
            stat, p_value = ks_2samp(
                self.baseline[:, dim], recent_embeddings[:, dim])
            if p_value < self.threshold:
                drift_dims += 1

        drift_ratio = drift_dims / self.baseline.shape[1]
        if drift_ratio > 0.1:  # >10% of dimensions drifted
            self.alerts.append({
                "type": "distribution_drift",
                "severity": "high" if drift_ratio > 0.3 else "medium",
                "drift_ratio": drift_ratio,
                "timestamp": datetime.utcnow().isoformat()})
            return True
        return False

    def check_quality_drift(self, recent_scores):
        """Detect quality score degradation over time."""
        if len(recent_scores) < 10:
            return False
        baseline_mean = np.mean(recent_scores[:len(recent_scores)//2])
        recent_mean = np.mean(recent_scores[len(recent_scores)//2:])
        degradation = (baseline_mean - recent_mean) / baseline_mean
        if degradation > 0.1:  # >10% quality drop
            self.alerts.append({
                "type": "quality_drift",
                "severity": "high" if degradation > 0.2 else "medium",
                "degradation_pct": degradation * 100,
                "timestamp": datetime.utcnow().isoformat()})
            return True
        return False`}/>
  <Quiz question="Faithfulness scores dropped from 0.92 to 0.78 over two weeks but retrieval precision stayed at 0.85. Most likely cause?" options={["Distribution drift","The LLM provider updated their model (prompt drift)","Database crash","Harder questions"]} correctIndex={1} explanation="Stable retrieval quality but dropping faithfulness means the issue is downstream. The LLM provider likely updated their model, changing how it uses context. The same documents are being used less faithfully by the new model version." onAnswer={()=>onComplete&&onComplete('deep-drift','quiz1')}/>
</div>}

function TabDeepPlatforms({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Observability Platforms</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Two leading platforms for LLM observability are <b>Langfuse</b> (open-source) and <b>LangSmith</b> (by LangChain). Both provide tracing, evaluation, and prompt management, but differ in philosophy and deployment model.</p>
  <ComparisonTable title="Langfuse vs LangSmith" columns={['Feature','Langfuse','LangSmith']} rows={[
    ['License','Open-source (MIT)','Proprietary (freemium)'],
    ['Self-Hosting','Yes -- Docker, Kubernetes','No -- cloud only'],
    ['Tracing','OpenTelemetry-compatible, decorator-based','LangChain-native, automatic for chains'],
    ['Evaluation','Custom scores, LLM-as-judge, annotation queues','Datasets, evaluators, regression testing'],
    ['Prompt Mgmt','Versioned prompts with A/B testing','Prompt hub with versioning'],
    ['Integration','Framework-agnostic','Best with LangChain, supports others'],
  ]}/>
  <CodeBlock language="python" label="Langfuse Integration" code={`from langfuse.decorators import observe, langfuse_context

@observe()
async def rag_pipeline(query: str):
    """Langfuse automatically traces this function."""

    @observe()
    async def retrieve(q):
        docs = await vector_store.search(q, top_k=5)
        langfuse_context.update_current_observation(
            metadata={"num_docs": len(docs), "top_score": docs[0].score})
        return docs

    @observe()
    async def generate(q, context):
        response = await llm.invoke(
            system="Answer using context.",
            user=f"Context: \\$\\{context\\}\\nQ: \\$\\{q\\}")
        langfuse_context.update_current_observation(
            usage={"input": response.usage.input,
                   "output": response.usage.output},
            model="claude-3-sonnet")
        return response.content

    docs = await retrieve(query)
    answer = await generate(query, format_docs(docs))
    langfuse_context.score_current_trace(name="user_feedback", value=1.0)
    return answer`}/>
  <Quiz question="When should you choose Langfuse over LangSmith?" options={["When you only use LangChain","When you need self-hosted open-source for data privacy compliance","When you want the cheapest cloud option","When you need fastest setup"]} correctIndex={1} explanation="Langfuse is the clear choice when data privacy requires self-hosting (healthcare, finance, government). Its open-source MIT license lets you deploy on your own infrastructure, keeping all trace data within your security boundary." onAnswer={()=>onComplete&&onComplete('deep-platforms','quiz1')}/>
</div>}

function TabDeepMetrics({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Custom Quality Metrics</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Generic metrics like faithfulness and relevance are a starting point, but production systems need <b>domain-specific quality scorecards</b> tailored to their use case. A support bot needs different quality signals than a code generator or medical Q&A system.</p>
  <CodeBlock language="python" label="Domain-Specific Quality Scorecard" code={`from dataclasses import dataclass

@dataclass
class QualityScorecard:
    """Domain-specific quality metrics for a support bot."""
    accuracy: float          # 0-1: factually correct?
    completeness: float      # 0-1: addresses all parts?
    tone_appropriate: float  # 0-1: professional and empathetic?
    policy_compliance: float # 0-1: follows company policies?
    escalation_correct: bool # correctly identified when to escalate?
    pii_leaked: bool         # accidentally revealed PII?
    response_time_ms: int
    tokens_used: int
    cost_usd: float

    @property
    def composite_score(self):
        if self.pii_leaked:
            return 0.0  # Automatic failure
        weights = {"accuracy": 0.35, "completeness": 0.25,
                   "tone_appropriate": 0.15, "policy_compliance": 0.25}
        return (self.accuracy * weights["accuracy"] +
                self.completeness * weights["completeness"] +
                self.tone_appropriate * weights["tone_appropriate"] +
                self.policy_compliance * weights["policy_compliance"])

    @property
    def passes_threshold(self):
        return self.composite_score >= 0.75 and not self.pii_leaked

async def evaluate_response(question, answer, context, judge_llm):
    eval_prompt = f"""Score this support response (0.0-1.0 each):
    Question: \\$\\{question\\}
    Context: \\$\\{context\\}
    Response: \\$\\{answer\\}
    Return JSON with: accuracy, completeness, tone_appropriate,
    policy_compliance, escalation_correct, pii_leaked."""
    result = await judge_llm.invoke(
        system="You are a quality evaluation specialist.",
        user=eval_prompt)
    return QualityScorecard(**parse_json(result.content))`}/>
  <Quiz question="Why does the scorecard return 0.0 if PII is leaked, regardless of other scores?" options={["It is a bug","PII leakage is a critical failure that overrides all quality signals","PII is not important","The weights do not add up"]} correctIndex={1} explanation="PII leakage is a compliance and legal failure that makes other quality dimensions irrelevant. A response that is accurate but leaks a customer's SSN is worse than a vague response that protects privacy." onAnswer={()=>onComplete&&onComplete('deep-metrics','quiz1')}/>
</div>}

function TabDeepObsPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your observability knowledge to production architecture decisions.</p>
  <ExpandableSection title="Exercise 1: Observability Architecture" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <ArchitectureDecision scenario="You are designing the observability stack for a healthcare AI assistant. Requirements: HIPAA compliance (data stays on-prem), traces for every LLM call, quality evaluation on 10% of responses, and alerting on quality degradation." options={[
      {label:'LangSmith cloud + PagerDuty',tradeoff:'Easy setup but HIPAA violation -- trace data leaves your infrastructure.'},
      {label:'Self-hosted Langfuse + custom drift detector + Slack alerts',tradeoff:'HIPAA compliant. All data stays on-prem. Requires infrastructure maintenance but meets all requirements.'},
      {label:'Custom logging to CloudWatch',tradeoff:'HIPAA compliant with BAA but lacks built-in LLM evaluation features.'},
      {label:'No observability -- manual QA review',tradeoff:'HIPAA compliant but unscalable. Cannot detect drift systematically.'}
    ]} correctIndex={1} explanation="Self-hosted Langfuse meets all requirements: HIPAA compliance through on-prem deployment, built-in tracing and evaluation, and extensibility for custom drift detection and alerting." onAnswer={()=>onComplete&&onComplete('deep-obs-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Alert Design" icon={'\uD83D\uDD14'}>
    <Quiz question="Your system fires 50 alerts per day for 'low faithfulness.' The team ignores alerts. What is the fix?" options={["Raise the threshold","Implement tiered alerting with severity levels and aggregation windows","Disable monitoring","Switch LLM provider"]} correctIndex={1} explanation="Alert fatigue from too many low-severity alerts is common. The fix is tiered alerting: aggregate over time windows (alert if average drops below 0.7 over 1 hour), and use severity levels with different notification channels." onAnswer={()=>onComplete&&onComplete('deep-obs-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Evaluation Strategy" icon={'\u2696\uFE0F'}>
    <Quiz question="You need to evaluate a medical Q&A system where incorrect answers could harm patients. Which evaluation approach?" options={["LLM-as-judge only","Human expert only","Layered: automated metrics filter, then LLM-as-judge triage, then human review for flagged cases","Random 1% sampling"]} correctIndex={2} explanation="High-stakes medical AI requires a layered approach: automated metrics catch obvious failures cheaply, LLM-as-judge provides scalable mid-tier review, and human experts validate the most important or uncertain cases." onAnswer={()=>onComplete&&onComplete('deep-obs-playground','quiz3')}/>
  </ExpandableSection>
</div>}

export function CourseObservability({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'why-observe',label:'Why Observe AI',icon:'\uD83D\uDCCA'},{id:'tracing',label:'Tracing & Logging',icon:'\uD83D\uDD0D'},{id:'eval-frameworks',label:'Evaluation Frameworks',icon:'\u2705'},{id:'obs-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-tracing-arch',label:'Tracing Architecture',icon:'📡'},{id:'deep-llm-eval',label:'LLM Evaluation',icon:'⚖️'},{id:'deep-drift',label:'Drift Detection',icon:'📉'},{id:'deep-platforms',label:'Langfuse & LangSmith',icon:'🔧'},{id:'deep-metrics',label:'Custom Metrics',icon:'📋'},{id:'deep-obs-playground',label:'Deep Playground',icon:'🎮'}];
  return <CourseShell title="AI Observability & Evaluation" icon={'\uD83D\uDCCA'} onBack={onBack} progress={progress} time="45 min" exercises="7 exercises" visionaryTabs={visionaryTabs} deepTabs={deepTabs} depth={depth} onChangeDepth={onChangeDepth} renderTab={(tab,i,d)=>{
    if(d==='deep'){
      if(i===0)return <TabDeepTracingArch onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1)return <TabDeepLLMEval onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2)return <TabDeepDrift onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3)return <TabDeepPlatforms onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===4)return <TabDeepMetrics onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===5)return <TabDeepObsPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }
    if(i===0)return <TabWhyObserve onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===1)return <TabTracing onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===2)return <TabEvalFrameworks onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===3)return <TabObsPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
  }}/>;
}

// ==================== COURSE 12: LLM GATEWAY PATTERNS ====================
function GatewaySimulator(){
  const[strategy,setStrategy]=useState('cheapest');
  const[providers,setProviders]=useState([{name:'Anthropic',status:'healthy',cost:3.0,latency:1200},{name:'OpenAI',status:'healthy',cost:2.5,latency:800},{name:'Gemini',status:'healthy',cost:1.0,latency:1500},{name:'Groq',status:'healthy',cost:0.3,latency:200}]);
  const toggleStatus=(i)=>{const p=[...providers];p[i].status=p[i].status==='healthy'?'down':'healthy';setProviders(p)};
  const healthy=providers.filter(p=>p.status==='healthy');
  const routed=healthy.length===0?null:strategy==='cheapest'?healthy.reduce((a,b)=>a.cost<b.cost?a:b):strategy==='fastest'?healthy.reduce((a,b)=>a.latency<b.latency?a:b):healthy[Math.floor(Math.random()*healthy.length)];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDE80'} Try It: Gateway Router Simulator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Choose a routing strategy, toggle provider health, and see where requests get routed.</p>
    <div className="flex gap-2 mb-3">{['cheapest','fastest','round-robin'].map(s=><button key={s} onClick={()=>setStrategy(s)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:strategy===s?GIM.primary:'white',color:strategy===s?'white':GIM.bodyText,border:`1px solid ${strategy===s?GIM.primary:GIM.border}`}}>{s}</button>)}</div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">{providers.map((p,i)=><div key={p.name} className="rounded-lg p-3 text-center cursor-pointer transition-all" onClick={()=>toggleStatus(i)} style={{background:p.status==='healthy'?(routed&&routed.name===p.name?'#EBF5F1':'white'):'#FEF2F2',border:`2px solid ${p.status==='healthy'?(routed&&routed.name===p.name?'#2D8A6E':GIM.border):'#EF4444'}`}}>
      <div className="font-semibold text-xs" style={{color:GIM.headingText}}>{p.name}</div>
      <div className="text-xs mt-1" style={{color:p.status==='healthy'?'#2D8A6E':'#EF4444'}}>{p.status==='healthy'?'\u2705 Healthy':'\u274C Down'}</div>
      <div className="text-xs mt-1" style={{color:GIM.mutedText}}>${p.cost}/1K tok</div>
      <div className="text-xs" style={{color:GIM.mutedText}}>{p.latency}ms</div>
      {routed&&routed.name===p.name&&<div className="text-xs font-bold mt-1" style={{color:'#2D8A6E'}}>{'\u2190'} ROUTED</div>}
    </div>)}</div>
    {!routed&&<div className="p-2 rounded-lg" style={{background:'#FEF2F2'}}><span className="text-xs font-semibold" style={{color:'#EF4444'}}>All providers are down! No routing possible.</span></div>}
    <p className="text-xs mt-2" style={{color:GIM.mutedText}}>Click any provider to toggle its health status.</p>
  </div>;
}

function CostCalculator(){
  const[requests,setRequests]=useState(1000);const[avgTokens,setAvgTokens]=useState(500);const[provider,setProvider]=useState('anthropic');
  const costs={anthropic:0.003,openai:0.0025,gemini:0.001,groq:0.0003};
  const daily=requests*(avgTokens/1000)*costs[provider];const monthly=daily*30;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCB0'} Try It: LLM Cost Calculator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Estimate your LLM costs based on usage and provider.</p>
    <div className="space-y-3 mb-4">
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Requests per day</span><span style={{fontSize:12,color:GIM.mutedText}}>{requests.toLocaleString()}</span></label><input type="range" min="100" max="100000" step="100" value={requests} onChange={e=>setRequests(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Avg tokens per request</span><span style={{fontSize:12,color:GIM.mutedText}}>{avgTokens}</span></label><input type="range" min="50" max="4000" step="50" value={avgTokens} onChange={e=>setAvgTokens(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/></div>
      <div className="flex gap-2">{Object.keys(costs).map(p=><button key={p} onClick={()=>setProvider(p)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:provider===p?GIM.primary:'white',color:provider===p?'white':GIM.bodyText,border:`1px solid ${provider===p?GIM.primary:GIM.border}`}}>{p}</button>)}</div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg text-center" style={{background:GIM.borderLight}}><div className="font-bold" style={{fontSize:20,color:GIM.primary}}>${daily.toFixed(2)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per day</div></div>
      <div className="p-3 rounded-lg text-center" style={{background:GIM.primaryBadge}}><div className="font-bold" style={{fontSize:20,color:GIM.primaryDark}}>${monthly.toFixed(0)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per month</div></div>
    </div>
  </div>;
}

function TabWhatGateway({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is an LLM Gateway?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An LLM Gateway is a <b>middleware layer</b> between your application and LLM providers. It handles routing, failover, rate limiting, cost management, and logging -- so your application code stays simple.</p>
  <AnalogyBox emoji={'\u2708\uFE0F'} title="Think of it like air traffic control">Air traffic control routes planes to the right runway, manages congestion, handles emergencies, and tracks all flights. An LLM gateway does the same for AI requests -- routing them to the right provider efficiently.</AnalogyBox>
  <CodeBlock language="text" label="Gateway Architecture" code={`Your App \u2500\u2500request\u2500\u2500> [LLM Gateway]
                         \u2502
                    \u250C\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2510\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                    \u25BC    \u25BC    \u25BC        \u25BC
               Anthropic OpenAI Gemini Groq

Gateway handles:
  \u2713 Routing (cheapest, fastest, round-robin)
  \u2713 Failover (if Anthropic is down \u2192 try OpenAI)
  \u2713 Rate limiting (max 100 req/min per user)
  \u2713 Cost tracking (budget alerts, usage caps)
  \u2713 Logging (trace every request for debugging)`}/>
  <Quiz question="What is the main benefit of using an LLM gateway instead of calling providers directly?" options={["It makes responses faster","It centralizes routing, failover, and cost management","It improves AI quality","It's required by law"]} correctIndex={1} explanation="A gateway centralizes cross-cutting concerns (routing, failover, rate limiting, cost tracking, logging) so your application code only needs to make one call and the gateway handles the rest." onAnswer={()=>onComplete&&onComplete('what-gateway','quiz1')}/>
</div>}

function TabRouting({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Routing Strategies</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Different routing strategies optimize for different goals. The best strategy depends on your priorities.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Strategy</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>How It Works</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Cost-Optimized','Route to cheapest available provider','Budget-constrained applications'],['Latency-Optimized','Route to fastest available provider','Real-time applications, chatbots'],['Quality-Optimized','Route to best model for the task type','High-stakes applications'],['Round-Robin','Distribute evenly across providers','Load balancing, rate limit spreading'],['Fallback Chain','Try primary, fall back to secondary','Maximum reliability']].map(([s,h,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{s}</td><td className="p-3" style={{color:GIM.bodyText}}>{h}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <GatewaySimulator/>
  <Quiz question="Your app needs maximum reliability. Which routing strategy?" options={["Cost-optimized","Round-robin","Fallback chain","Random"]} correctIndex={2} explanation="Fallback chain provides maximum reliability: try the primary provider first, and if it fails, automatically try the next one. This ensures your app stays up even during provider outages." onAnswer={()=>onComplete&&onComplete('routing','quiz1')}/>
</div>}

function TabCostRate({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Cost & Rate Limiting</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>LLM costs can spiral quickly in production. A gateway provides <b>token budgeting</b>, <b>rate limiting</b>, and <b>caching</b> to keep costs under control.</p>
  <ExpandableSection title="Token Budgeting" icon={'\uD83D\uDCB0'} defaultOpen={true}>
    <p className="mb-2">Set maximum tokens per request, per user, per day, or per month. If a user exhausts their budget, the gateway returns a friendly error instead of an expensive API call.</p>
  </ExpandableSection>
  <ExpandableSection title="Semantic Caching" icon={'\u26A1'}>
    <p className="mb-2">Cache responses for similar queries. If a user asks "What's the capital of France?" and someone asked the same thing 5 minutes ago, return the cached response instead of making a new API call. This can reduce costs by 30-50% for repetitive workloads.</p>
  </ExpandableSection>
  <ExpandableSection title="Rate Limiting" icon={'\uD83D\uDEA6'}>
    <p className="mb-2">Limit requests per minute/hour per user or API key. Prevents runaway loops, abusive users, and unexpected cost spikes. Typically: 60 req/min for free tier, 300 req/min for paid.</p>
  </ExpandableSection>
  <CostCalculator/>
  <Quiz question="Which technique can reduce LLM costs by 30-50% for repetitive queries?" options={["Using smaller models","Semantic caching","Increasing temperature","Adding more providers"]} correctIndex={1} explanation="Semantic caching stores responses for similar queries. Instead of calling the LLM again for the same (or semantically similar) question, it returns the cached response instantly." onAnswer={()=>onComplete&&onComplete('cost-rate','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's lib/llm-router.js IS a gateway pattern -- it routes requests across Anthropic, OpenAI, Gemini, and Groq with automatic fallback, 30-second timeouts, and provider-specific handling." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabGWPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your gateway knowledge!</p>
  <ExpandableSection title="Exercise 1: Strategy Selection" icon={'\uD83D\uDD00'} defaultOpen={true}>
    <Quiz question="A startup has a tight budget and mostly handles simple FAQ queries. Which routing strategy?" options={["Quality-optimized (use the best model)","Cost-optimized (use the cheapest model)","Latency-optimized (use the fastest)","Fallback chain"]} correctIndex={1} explanation="For a budget-constrained startup with simple queries, cost-optimized routing sends requests to the cheapest provider that can handle the task. Simple FAQs don't need the most expensive models." onAnswer={()=>onComplete&&onComplete('gw-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Cost Optimization" icon={'\uD83D\uDCB0'}>
    <Quiz question="Your LLM costs spiked 10x overnight. What's the most likely cause?" options={["The model got smarter","A bug causing infinite loops of LLM calls","The provider raised prices 10x","Users suddenly became 10x smarter"]} correctIndex={1} explanation="A 10x cost spike is almost always a runaway loop -- code that recursively calls the LLM without proper termination. Rate limiting and token budgets in your gateway would have prevented this." onAnswer={()=>onComplete&&onComplete('gw-playground','quiz2')}/>
  </ExpandableSection>
</div>}

function TabDeepGatewayArch({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Gateway Architecture</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An LLM gateway can be deployed in three architectural patterns: <b>reverse proxy</b>, <b>sidecar</b>, or <b>embedded SDK</b>. Each pattern has different implications for latency, operational complexity, and feature richness.</p>
  <ComparisonTable title="Gateway Deployment Patterns" columns={['Pattern','How It Works','Latency Impact','Best For']} rows={[
    ['Reverse Proxy','Standalone service between app and LLM providers','Adds network hop (1-5ms)','Multi-service architectures, centralized control'],
    ['Sidecar','Co-located process alongside each app instance','Minimal (~0.5ms)','Kubernetes deployments, per-service policies'],
    ['Embedded SDK','Library imported directly into application code','Zero network overhead','Simple apps, serverless, edge deployments'],
  ]}/>
  <CodeBlock language="python" label="Reverse Proxy Gateway Implementation" code={`from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

PROVIDERS = {
    "anthropic": {
        "url": "https://api.anthropic.com/v1/messages",
        "headers": {"x-api-key": ANTHROPIC_KEY,
                     "anthropic-version": "2023-06-01"},
        "transform": transform_to_anthropic},
    "openai": {
        "url": "https://api.openai.com/v1/chat/completions",
        "headers": {"Authorization": f"Bearer \\$\\{OPENAI_KEY\\}"},
        "transform": transform_to_openai},
}

class GatewayMiddleware:
    def __init__(self):
        self.request_log = []
        self.circuit_breakers = {p: CircuitBreaker() for p in PROVIDERS}

    async def route_request(self, request, strategy):
        # 1. Rate limiting
        if not await self.check_rate_limit(request.get("user_id")):
            raise HTTPException(429, "Rate limit exceeded")
        # 2. Select provider
        provider = self.select_provider(strategy)
        config = PROVIDERS[provider]
        transformed = config["transform"](request)
        # 3. Circuit breaker check
        if self.circuit_breakers[provider].is_open:
            provider = self.select_fallback(provider)
            config = PROVIDERS[provider]
            transformed = config["transform"](request)
        # 4. Forward request
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                config["url"], json=transformed,
                headers=config["headers"])
        # 5. Log and return
        self.request_log.append({
            "provider": provider,
            "tokens": extract_tokens(response.json()),
            "status": response.status_code})
        return response.json()`}/>
  <Quiz question="When should you choose a sidecar gateway over a reverse proxy?" options={["Single monolithic app","Kubernetes with per-service routing policies and minimal latency","Simplest possible setup","Deploying to serverless"]} correctIndex={1} explanation="The sidecar pattern excels in Kubernetes where each service needs its own gateway instance co-located in the same pod. This minimizes latency while allowing per-service routing policies and rate limits." onAnswer={()=>onComplete&&onComplete('deep-gateway-arch','quiz1')}/>
</div>}

function TabDeepRoutingAlgo({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Advanced Routing Algorithms</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Beyond simple cost or latency routing, production gateways use sophisticated algorithms. <b>Semantic routing</b> analyzes request content to select the best model, while <b>canary deployments</b> gradually shift traffic to test new models safely.</p>
  <CodeBlock language="python" label="Semantic Router with Model-Task Matching" code={`from dataclasses import dataclass
from typing import List

@dataclass
class ModelProfile:
    name: str
    provider: str
    strengths: List[str]
    cost_per_1k: float
    avg_latency_ms: int
    quality_scores: dict  # task -> score

MODELS = [
    ModelProfile("claude-3-opus", "anthropic",
        ["reasoning", "analysis", "coding"],
        15.0, 3000, {"reasoning": 0.95, "coding": 0.92,
                     "creative": 0.88, "simple_qa": 0.90}),
    ModelProfile("gpt-4o", "openai",
        ["coding", "creative", "multilingual"],
        5.0, 1500, {"reasoning": 0.90, "coding": 0.93,
                    "creative": 0.91, "simple_qa": 0.88}),
    ModelProfile("gemini-pro", "google",
        ["multilingual", "simple_qa"],
        1.25, 1200, {"reasoning": 0.82, "coding": 0.78,
                     "creative": 0.80, "simple_qa": 0.85}),
    ModelProfile("llama-3-70b", "groq",
        ["simple_qa", "summarization"],
        0.59, 200, {"reasoning": 0.78, "coding": 0.72,
                    "creative": 0.75, "simple_qa": 0.82}),
]

class SemanticRouter:
    def __init__(self, classifier_llm):
        self.classifier = classifier_llm

    async def classify_task(self, request):
        response = await self.classifier.invoke(
            system="Classify into: reasoning, coding, creative, "
                   "simple_qa, summarization. Return only the category.",
            user=request)
        return response.content.strip().lower()

    async def route(self, request, budget="balanced"):
        task = await self.classify_task(request)
        if budget == "quality":
            return max(MODELS,
                key=lambda m: m.quality_scores.get(task, 0))
        elif budget == "cost":
            ok = [m for m in MODELS
                  if m.quality_scores.get(task, 0) > 0.75]
            return min(ok, key=lambda m: m.cost_per_1k)
        else:  # balanced
            return max(MODELS,
                key=lambda m: m.quality_scores.get(task, 0) / m.cost_per_1k)`}/>
  <CodeBlock language="python" label="Canary Deployment for Model Upgrades" code={`import random
import numpy as np

class CanaryRouter:
    """Gradually shift traffic to test new models."""
    def __init__(self, old_model, new_model, initial_pct=5):
        self.old_model = old_model
        self.new_model = new_model
        self.canary_pct = initial_pct
        self.metrics = {"old": [], "new": []}

    def route(self):
        if random.randint(1, 100) <= self.canary_pct:
            return self.new_model
        return self.old_model

    def record_result(self, model, quality_score, latency_ms):
        key = "new" if model == self.new_model else "old"
        self.metrics[key].append({"quality": quality_score,
                                   "latency": latency_ms})

    def should_promote(self):
        if len(self.metrics["new"]) < 100:
            return False
        old_q = np.mean([m["quality"] for m in self.metrics["old"]])
        new_q = np.mean([m["quality"] for m in self.metrics["new"]])
        return new_q >= old_q * 0.95  # within 5% of old quality

    def increase_traffic(self, increment=5):
        self.canary_pct = min(100, self.canary_pct + increment)`}/>
  <Quiz question="A semantic router misclassifies a complex math proof as 'simple_qa' and routes to the cheapest model. How do you fix this?" options={["Remove cheap model","Add a confidence threshold -- if low confidence, route to highest quality model","Always use expensive model","Disable routing"]} correctIndex={1} explanation="A confidence threshold prevents misclassification from degrading quality. Uncertain classifications route to the highest-quality model, while clear-cut simple queries still go to cheaper models." onAnswer={()=>onComplete&&onComplete('deep-routing-algo','quiz1')}/>
</div>}

function TabDeepCaching({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Semantic Caching</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Semantic caching goes beyond exact string matching. By comparing <b>embeddings</b> of incoming queries against cached queries, the gateway can return cached responses for semantically similar questions, dramatically reducing LLM costs for repetitive workloads.</p>
  <CodeBlock language="python" label="Semantic Cache Implementation" code={`import numpy as np
from datetime import datetime, timedelta

class SemanticCache:
    def __init__(self, embedder, similarity_threshold=0.95,
                 ttl_minutes=60):
        self.embedder = embedder
        self.threshold = similarity_threshold
        self.ttl = timedelta(minutes=ttl_minutes)
        self.cache = []

    async def get(self, query):
        query_emb = await self.embedder.embed(query)
        now = datetime.utcnow()
        best_match, best_score = None, 0

        for entry in self.cache:
            if now - entry["timestamp"] > self.ttl:
                continue
            score = self._cosine_sim(query_emb, entry["embedding"])
            if score > best_score:
                best_score = score
                best_match = entry

        if best_match and best_score >= self.threshold:
            return {"response": best_match["response"],
                    "cache_hit": True, "similarity": best_score}
        return None

    async def put(self, query, response):
        embedding = await self.embedder.embed(query)
        self.cache.append({"embedding": embedding, "query": query,
            "response": response, "timestamp": datetime.utcnow()})
        self._cleanup()

    def _cosine_sim(self, a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def _cleanup(self):
        now = datetime.utcnow()
        self.cache = [e for e in self.cache
                      if now - e["timestamp"] <= self.ttl]

# Usage in gateway
cache = SemanticCache(embedder, similarity_threshold=0.95)

async def gateway_request(query, llm):
    cached = await cache.get(query)
    if cached:
        return cached["response"]  # Free!
    response = await llm.invoke(query)
    await cache.put(query, response)
    return response`}/>
  <Quiz question="Setting similarity threshold to 0.80 instead of 0.95 would have what effect?" options={["No effect","More cache hits but higher risk of returning wrong cached answers","Fewer cache hits","Better quality"]} correctIndex={1} explanation="A lower threshold means more queries match cached entries (higher hit rate), but some matches will be false positives -- different questions with somewhat similar embeddings. This trades accuracy for cost savings." onAnswer={()=>onComplete&&onComplete('deep-caching','quiz1')}/>
</div>}

function TabDeepRateLimiting({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Rate Limiting & Budgets</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Rate limiting protects both your budget and upstream providers. Production gateways implement <b>token bucket</b> for burst tolerance, <b>sliding window</b> for smooth enforcement, and <b>per-user budgets</b> for cost allocation.</p>
  <CodeBlock language="python" label="Token Bucket Rate Limiter with Per-User Budgets" code={`import time
from dataclasses import dataclass

@dataclass
class TokenBucket:
    capacity: int       # Maximum tokens (burst size)
    refill_rate: float  # Tokens added per second
    tokens: float
    last_refill: float

    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity,
                          self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

    def consume(self, tokens=1):
        self._refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

class UserBudgetManager:
    def __init__(self):
        self.budgets = {}
        self.rate_limiters = {}

    def configure_user(self, user_id, tier):
        tiers = {
            "free":    {"daily_tokens": 10_000,  "rpm": 10},
            "pro":     {"daily_tokens": 100_000, "rpm": 60},
            "enterprise": {"daily_tokens": 1_000_000, "rpm": 300}}
        config = tiers[tier]
        self.budgets[user_id] = {
            "daily_limit": config["daily_tokens"], "used_today": 0}
        self.rate_limiters[user_id] = TokenBucket(
            capacity=config["rpm"],
            refill_rate=config["rpm"] / 60)

    def check_request(self, user_id, est_tokens):
        budget = self.budgets.get(user_id)
        limiter = self.rate_limiters.get(user_id)
        if not budget:
            return {"allowed": False, "reason": "Unknown user"}
        if not limiter.consume():
            return {"allowed": False, "reason": "Rate limit exceeded"}
        if budget["used_today"] + est_tokens > budget["daily_limit"]:
            return {"allowed": False, "reason": "Budget exceeded"}
        return {"allowed": True}

    def record_usage(self, user_id, tokens_used):
        self.budgets[user_id]["used_today"] += tokens_used`}/>
  <Quiz question="A free-tier user (10 RPM limit) sends 15 rapid requests. With a token bucket, what happens?" options={["All 15 rejected","First 10 succeed (burst capacity), remaining 5 are rate-limited","All 15 succeed","System crashes"]} correctIndex={1} explanation="The token bucket starts with capacity tokens (10). The first 10 consume the bucket. Subsequent requests wait for the bucket to refill at the configured rate. This allows short bursts while enforcing the average rate." onAnswer={()=>onComplete&&onComplete('deep-rate-limiting','quiz1')}/>
</div>}

function TabDeepFailover({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Failover & Circuit Breakers</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>LLM providers experience outages and degraded performance. A production gateway needs <b>circuit breakers</b> to detect unhealthy providers, <b>automatic failover</b> to alternatives, and <b>graceful degradation</b> when all providers struggle.</p>
  <CodeBlock language="python" label="Circuit Breaker Pattern" code={`from enum import Enum
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"        # Normal operation
    OPEN = "open"            # Failing -- reject requests
    HALF_OPEN = "half_open"  # Testing recovery

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60,
                 success_threshold=3):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = timedelta(seconds=recovery_timeout)
        self.success_threshold = success_threshold
        self.last_failure_time = None

    @property
    def is_available(self):
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if datetime.utcnow() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
                return True
            return False
        return True  # HALF_OPEN: allow test requests

    def record_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
        else:
            self.failure_count = 0

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

class FailoverGateway:
    def __init__(self, providers):
        self.providers = providers
        self.breakers = {p.name: CircuitBreaker() for p in providers}

    async def request(self, payload):
        errors = []
        for provider in self.providers:
            breaker = self.breakers[provider.name]
            if not breaker.is_available:
                continue
            try:
                response = await provider.call(payload)
                breaker.record_success()
                return response
            except Exception as e:
                breaker.record_failure()
                errors.append({"provider": provider.name, "error": str(e)})
        return {"error": "All providers unavailable",
                "fallback": "Please try again shortly.",
                "provider_errors": errors}`}/>
  <Quiz question="A circuit breaker is in HALF_OPEN state. What does this mean?" options={["Partially broken","Testing whether the failed provider has recovered by allowing limited test requests","Half of requests go through","Provider at 50% capacity"]} correctIndex={1} explanation="HALF_OPEN is the recovery testing state. After the recovery timeout, the circuit allows limited test requests. If they succeed, it returns to CLOSED (normal). If they fail, it goes back to OPEN." onAnswer={()=>onComplete&&onComplete('deep-failover','quiz1')}/>
</div>}

function TabDeepGWPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your gateway knowledge to production architecture decisions.</p>
  <ExpandableSection title="Exercise 1: Gateway Architecture Decision" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <ArchitectureDecision scenario="You are building an AI support platform serving 10,000 requests/minute across 4 LLM providers. You need centralized logging, per-customer rate limiting, semantic caching, and model A/B testing. Which gateway architecture?" options={[
      {label:'Embedded SDK in each microservice',tradeoff:'Zero latency but duplicates caching/logging/rate limiting across services.'},
      {label:'Centralized reverse proxy gateway',tradeoff:'Single point for all concerns. Adds 1-5ms but provides centralized logging, caching, and rate limiting.'},
      {label:'Sidecar per service',tradeoff:'Good for K8s but duplicates cache storage. Per-service limits do not aggregate correctly.'},
      {label:'No gateway -- direct provider calls',tradeoff:'Simplest but no failover, caching, rate limiting, or centralized logging.'}
    ]} correctIndex={1} explanation="At 10K RPM with centralized requirements, a reverse proxy gateway is optimal. The 1-5ms overhead is negligible vs LLM latency (200-3000ms), and centralization makes policy management tractable." onAnswer={()=>onComplete&&onComplete('deep-gw-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Caching Strategy" icon={'\u26A1'}>
    <Quiz question="Your semantic cache has 95% hit rate but users complain answers feel stale for rapidly changing topics. Best fix?" options={["Disable caching","Topic-aware TTL: short TTL for time-sensitive topics, long TTL for stable knowledge","Lower similarity threshold","Increase cache size"]} correctIndex={1} explanation="Topic-aware TTL solves staleness without sacrificing savings for stable content. Time-sensitive queries get short TTL (minutes), stable queries get long TTL (hours)." onAnswer={()=>onComplete&&onComplete('deep-gw-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Failover Design" icon={'\uD83D\uDEE1\uFE0F'}>
    <Quiz question="Primary provider goes down. Circuit breaker switches to backup. Primary recovers 5 minutes later. What should happen?" options={["Immediately switch all traffic back","Circuit breaker enters HALF_OPEN, sends test requests, gradually shifts traffic back if tests succeed","Keep all traffic on backup permanently","Split 50/50"]} correctIndex={1} explanation="The circuit breaker handles this automatically. After recovery timeout, it enters HALF_OPEN, tests with a few requests, and if successful, transitions back to CLOSED. This prevents stampeding a just-recovered provider." onAnswer={()=>onComplete&&onComplete('deep-gw-playground','quiz3')}/>
  </ExpandableSection>
</div>}

export function CourseLLMGateway({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'what-gateway',label:'What is a Gateway',icon:'\uD83D\uDE80'},{id:'routing',label:'Routing Strategies',icon:'\uD83D\uDD00'},{id:'cost-rate',label:'Cost & Rate Limiting',icon:'\uD83D\uDCB0'},{id:'gw-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-gateway-arch',label:'Gateway Architecture',icon:'🏗️'},{id:'deep-routing-algo',label:'Routing Algorithms',icon:'🛤️'},{id:'deep-caching',label:'Semantic Caching',icon:'⚡'},{id:'deep-rate-limiting',label:'Rate Limiting',icon:'🚦'},{id:'deep-failover',label:'Failover & Circuit Breakers',icon:'🛡️'},{id:'deep-gw-playground',label:'Deep Playground',icon:'🎮'}];
  return <CourseShell title="LLM Gateway Patterns" icon={'\uD83D\uDE80'} onBack={onBack} progress={progress} time="40 min" exercises="6 exercises" visionaryTabs={visionaryTabs} deepTabs={deepTabs} depth={depth} onChangeDepth={onChangeDepth} renderTab={(tab,i,d)=>{
    if(d==='deep'){
      if(i===0)return <TabDeepGatewayArch onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1)return <TabDeepRoutingAlgo onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2)return <TabDeepCaching onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3)return <TabDeepRateLimiting onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===4)return <TabDeepFailover onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===5)return <TabDeepGWPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }
    if(i===0)return <TabWhatGateway onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===1)return <TabRouting onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===2)return <TabCostRate onNavigate={onNavigate} onComplete={onComplete}/>;
    if(i===3)return <TabGWPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
  }}/>;
}

// ==================== COURSE 5: FINE-TUNING ====================
function TabFTOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>What Is Fine-Tuning?</h2>
  <AnalogyBox title="Teaching a Specialist">{`Fine-tuning is like sending a general practitioner to a residency \u2014 the base model already knows medicine, but fine-tuning specializes it in cardiology. You don't teach it language from scratch; you teach it domain expertise.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Fine-tuning adapts a pre-trained model to your specific domain by training it on your data. It changes the model's <b>weights</b>, unlike prompting which only changes the model's <b>input</b>.</p>
  <ComparisonTable title="When to Fine-Tune vs RAG vs Prompt Engineering" headers={['Approach','Best For','Data Needed','Cost','Flexibility']} rows={[['Prompt Engineering','Behavior/format changes','None','Lowest','Highest'],['RAG','External knowledge, citations','Documents','Medium','High'],['Fine-Tuning','Style, domain expertise, consistent behavior','100s-1000s examples','Higher','Lower']]}/>
  <Quiz question="Your company wants the AI to always respond in a specific technical writing style with domain-specific terminology. Best approach?" options={["Longer system prompts with examples","RAG with company style guide","Fine-tuning on 500 examples of desired style","Just tell the model to be technical"]} correctIndex={2} explanation="Consistent style and domain terminology are ideal fine-tuning use cases. Few-shot prompting works but uses tokens every call. Fine-tuning bakes the style into the model weights, giving consistent behavior at lower inference cost." onAnswer={()=>onComplete&&onComplete('ft-overview','quiz1')}/>
</div></FadeIn>}
function TabFTMethods({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Fine-Tuning Methods</h2>
  <ExpandableSection title="Full Fine-Tuning" icon={'\uD83D\uDD27'} defaultOpen><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Update all model weights. Highest quality but requires significant compute (GPUs) and risks catastrophic forgetting. Best for small models or when you have abundant data.</p></ExpandableSection>
  <ExpandableSection title="LoRA (Low-Rank Adaptation)" icon={'\u26A1'}><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Only train small adapter matrices (0.1-1% of total parameters). Fast, cheap, and preserves base model knowledge. The most popular fine-tuning method in 2025.</p></ExpandableSection>
  <ExpandableSection title="QLoRA" icon={'\uD83D\uDCBE'}><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>LoRA + 4-bit quantization. Fine-tune a 70B model on a single GPU. Slight quality trade-off for massive compute savings.</p></ExpandableSection>
  <CodeBlock title="LoRA Fine-Tuning with Hugging Face" code={`from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")

lora_config = LoraConfig(
    r=16,           # Rank of the adapter
    lora_alpha=32,  # Scaling factor
    target_modules=["q_proj", "v_proj"],  # Which layers to adapt
    lora_dropout=0.05,
)

model = get_peft_model(model, lora_config)
# Only 0.1% of parameters are trainable!
model.print_trainable_parameters()
# trainable: 4,194,304 || total: 8,030,261,248 || 0.05%`}/>
</div></FadeIn>}
function TabFTData({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Data Preparation</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Quality {'>'} quantity. 500 high-quality examples often beat 5000 mediocre ones.</p>
  <ExpandableSection title="Synthetic Data Generation" icon={'\uD83E\uDD16'} defaultOpen><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Use a powerful model (GPT-4, Claude) to generate training data for a smaller model. This "distillation" approach is standard practice: have Claude write 500 examples of your desired output format, then fine-tune Llama on those examples.</p></ExpandableSection>
  <Quiz question="You have 50 real examples of the desired output style. Is this enough for fine-tuning?" options={["No, you need at least 10,000","Yes, 50 is plenty for LoRA","Use the 50 to generate 500 synthetic examples, then fine-tune on the combined set","Fine-tuning always needs millions of examples"]} correctIndex={2} explanation="50 real examples establish the pattern. Use a powerful model to generate 450-950 more synthetic examples following the same pattern. Fine-tune on the combined dataset. This 'human seed + synthetic expansion' approach is highly effective." onAnswer={()=>onComplete&&onComplete('ft-data','quiz1')}/>
</div></FadeIn>}
function TabFTPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Fine-Tuning Playground</h2>
  <ArchitectureDecision scenario="You want your customer support AI to always respond in your company's tone (friendly but professional, never use 'sorry', always offer next steps). You have 200 real support conversations showing the ideal tone." options={[{label:'System prompt with style instructions + few examples',tradeoff:'Works but uses 500+ tokens per call. Style drift over long conversations.'},{label:'Fine-tune a small model (Llama 8B) on the 200 examples + 800 synthetic',tradeoff:'Consistent style baked into weights. Lower inference cost. But locked to one style.'},{label:'RAG with style guide document',tradeoff:'Flexible but the model may not consistently follow the style guide'}]} correctIndex={1} explanation="Consistent tone/style is a perfect fine-tuning use case. The 200 real examples + synthetic expansion gives enough training data. The fine-tuned model produces the right style automatically without consuming prompt tokens." onAnswer={()=>onComplete&&onComplete('ft-playground','arch1')}/>
</div></FadeIn>}
function TabDeepFTEval({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Evaluation & Deployment</h2>
  <CodeBlock title="Fine-Tuning Evaluation Pipeline" code={`def evaluate_fine_tuned_model(base_model, ft_model, test_set):
    results = {"base": [], "finetuned": []}
    for example in test_set:
        base_response = base_model.generate(example["prompt"])
        ft_response = ft_model.generate(example["prompt"])

        # Score on multiple dimensions
        for name, model_resp in [("base", base_response), ("finetuned", ft_response)]:
            results[name].append({
                "relevance": score_relevance(model_resp, example["reference"]),
                "style_match": score_style(model_resp, target_style),
                "factuality": score_facts(model_resp, example["facts"]),
                "toxicity": score_toxicity(model_resp),
            })

    # Compare
    for metric in ["relevance", "style_match", "factuality"]:
        base_avg = mean([r[metric] for r in results["base"]])
        ft_avg = mean([r[metric] for r in results["finetuned"]])
        print(f"{metric}: base={base_avg:.2f} ft={ft_avg:.2f} delta={ft_avg-base_avg:+.2f}")`}/>
  <ExpandableSection title="Deployment Checklist" icon={'\u2705'}><div className="space-y-1">{['A/B test fine-tuned vs base model on 10% of traffic','Monitor for regression on general capabilities','Set up rollback mechanism (swap back to base model)','Track domain-specific metrics (style score, accuracy)','Re-evaluate monthly as base models improve'].map((r,i)=><p key={i} style={{fontSize:12,color:GIM.bodyText}}>{'\u2022'} {r}</p>)}</div></ExpandableSection>
</div></FadeIn>}
export function CourseFineTuning({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'ft-overview',label:'What Is Fine-Tuning?',icon:'\uD83D\uDD27'},{id:'ft-methods',label:'Methods',icon:'\u26A1'},{id:'ft-data',label:'Data Preparation',icon:'\uD83D\uDCCA'},{id:'ft-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-ft-eval',label:'Evaluation & Deploy',icon:'\uD83D\uDE80'}];
  return <CourseShell id="fine-tuning" icon={'\uD83D\uDD27'} title="Fine-Tuning & Model Customization" timeMinutes={50} exerciseCount={8} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(d==='visionary'){if(i===0)return <TabFTOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabFTMethods onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabFTData onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabFTPlayground onNavigate={onNavigate} onComplete={onComplete}/>;}
    else{if(i===0)return <TabDeepFTEval onNavigate={onNavigate} onComplete={onComplete}/>;}
    return null;
  }}/>;
}

// ==================== COURSE 6: AI CODE GENERATION ====================
function TabCodeGenOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>AI-Powered Code Generation</h2>
  <AnalogyBox title="The Pair Programmer">{`AI code generation is like having an expert pair programmer who never gets tired, knows every framework, and can write boilerplate at superhuman speed \u2014 but still needs you to drive the architecture and review the output.`}</AnalogyBox>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\uD83D\uDCAC',title:'Agentic Coding',desc:'AI tools like Claude Code and Cursor that understand your entire codebase and make multi-file changes'},
    {icon:'\uD83C\uDFA8',title:'Vibe Coding',desc:'Describe what you want in natural language, AI generates the implementation'},
    {icon:'\uD83D\uDD04',title:'Test-Driven AI',desc:'Write tests first, let AI generate code that passes them'},
    {icon:'\uD83D\uDC1B',title:'AI Debugging',desc:'Paste an error, AI diagnoses the issue and suggests fixes'},
  ].map((p,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{p.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{p.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{p.desc}</p></div>)}</div>
  <Quiz question="What is 'vibe coding'?" options={["Writing code while listening to music","Describing what you want in natural language and letting AI generate the code","Using AI to review code vibes","A framework for code quality"]} correctIndex={1} explanation="Vibe coding is the practice of describing desired functionality in natural language and letting AI tools generate the implementation. It shifts the developer's role from writing code to directing and reviewing AI-generated code." onAnswer={()=>onComplete&&onComplete('codegen-overview','quiz1')}/>
</div></FadeIn>}
function TabCodeGenTools({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Tools & Workflows</h2>
  <ComparisonTable title="AI Coding Tools (2025)" headers={['Tool','Type','Best For','Codebase Awareness']} rows={[['Claude Code','CLI agent','Multi-file changes, refactoring','Full repo'],['Cursor','IDE','Inline editing, code completion','Current file + context'],['GitHub Copilot','IDE extension','Autocomplete, single functions','Current file'],['Aider','CLI agent','Git-aware editing','Full repo'],['Cline/Continue','IDE extension','Chat-based editing','Project context']]}/>
  <SeeItInRe3 text="Re\u00b3 itself was significantly built with AI coding tools \u2014 the Academy courses, debate system, and UI components all involved AI-assisted development."/>
</div></FadeIn>}
function TabCodeGenPatterns({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Effective Patterns</h2>
  <ExpandableSection title="1. Spec-First Development" icon={'\uD83D\uDCCB'} defaultOpen><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Write a detailed spec or pseudocode, then have AI implement it. The spec acts as a contract \u2014 AI generates code that matches your design, not its own interpretation.</p></ExpandableSection>
  <ExpandableSection title="2. Test-Driven AI" icon={'\u2705'}><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Write tests first, then tell AI: "Generate code that passes these tests." The tests constrain the AI's output and make verification automatic.</p></ExpandableSection>
  <ExpandableSection title="3. Incremental Generation" icon={'\uD83D\uDD04'}><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Build in small steps. Generate one function, verify it works, then generate the next. Avoid asking AI to generate entire systems at once \u2014 errors compound.</p></ExpandableSection>
  <ExpandableSection title="4. Context Loading" icon={'\uD83D\uDCDA'}><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Give the AI relevant context: existing code patterns, type definitions, API docs. The more context about your codebase conventions, the better the generated code matches your style.</p></ExpandableSection>
  <Quiz question="You need to add a new feature to a 50-file project. Best approach with AI?" options={["Ask AI to generate the entire feature at once","Write a spec, generate incrementally, test each piece","Just start coding and let autocomplete help","Copy-paste from Stack Overflow"]} correctIndex={1} explanation="Spec-first + incremental generation is most reliable. The spec ensures the AI understands your intent. Generating and testing in small steps catches errors early before they compound across files." onAnswer={()=>onComplete&&onComplete('codegen-patterns','quiz1')}/>
</div></FadeIn>}
function TabCodeGenPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>AI Coding Playground</h2>
  <ArchitectureDecision scenario="Your team is debating whether to adopt AI coding tools. Some developers are excited, others worried about code quality. How do you roll out?" options={[{label:'Mandatory adoption for everyone immediately',tradeoff:'Fast adoption but resistance from skeptics, potential quality issues as people learn'},{label:'Opt-in pilot with interested developers, measure code quality metrics, then expand based on data',tradeoff:'Data-driven approach \u2014 builds evidence of value before wider rollout'},{label:'Only use AI for tests and documentation, not production code',tradeoff:'Low risk but misses the biggest productivity gains in code generation'}]} correctIndex={1} explanation="A pilot program lets enthusiastic early adopters demonstrate value with real metrics (velocity, bug rate, code review time). This builds organizational confidence and best practices before wider rollout." onAnswer={()=>onComplete&&onComplete('codegen-playground','arch1')}/>
</div></FadeIn>}
export function CourseAICodeGen({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'codegen-overview',label:'AI Code Gen',icon:'\uD83D\uDCBB'},{id:'codegen-tools',label:'Tools',icon:'\uD83D\uDD27'},{id:'codegen-patterns',label:'Patterns',icon:'\uD83D\uDCCB'},{id:'codegen-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[];
  return <CourseShell id="ai-code-gen" icon={'\uD83D\uDCBB'} title="AI-Powered Code Generation" timeMinutes={45} exerciseCount={9} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(i===0)return <TabCodeGenOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabCodeGenTools onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabCodeGenPatterns onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabCodeGenPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    return null;
  }}/>;
}

// ==================== COURSE 7: MULTIMODAL AI ====================
function TabMMOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>What Is Multimodal AI?</h2>
  <AnalogyBox title="The Five Senses">{`Multimodal AI gives models multiple senses \u2014 text is like hearing, vision is like seeing, audio is like listening. Combining modalities lets AI understand the world more like humans do.`}</AnalogyBox>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">{[
    {icon:'\uD83D\uDDBC\uFE0F',title:'Vision',desc:'Image understanding, document OCR, chart analysis'},{icon:'\uD83C\uDF99\uFE0F',title:'Audio',desc:'Speech-to-text, sound classification, music analysis'},{icon:'\uD83C\uDFA5',title:'Video',desc:'Scene understanding, action recognition, temporal reasoning'},
  ].map((m,i)=><div key={i} className="p-3 rounded-xl border text-center" style={{borderColor:GIM.border}}><span style={{fontSize:28}}>{m.icon}</span><h4 className="font-semibold mt-1" style={{fontSize:13,color:GIM.headingText}}>{m.title}</h4><p style={{fontSize:12,color:GIM.bodyText}}>{m.desc}</p></div>)}</div>
  <Quiz question="Which multimodal capability is most mature in 2025?" options={["Video understanding","Image/document understanding (vision + text)","Audio generation","3D scene understanding"]} correctIndex={1} explanation="Vision + text (image understanding, document OCR, chart analysis) is the most mature multimodal capability, supported by GPT-4o, Claude 3.5, and Gemini 1.5 with high accuracy." onAnswer={()=>onComplete&&onComplete('mm-overview','quiz1')}/>
</div></FadeIn>}
function TabMMVision({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Vision Pipelines</h2>
  <CodeBlock title="Document Processing with Vision" code={`import anthropic
import base64

def process_document(image_path):
    """Extract structured data from a document image."""
    client = anthropic.Anthropic()

    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode()

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data
                }},
                {"type": "text", "text": "Extract all text, tables, "
                 "and key data from this document as structured JSON."}
            ]
        }]
    )`}/>
  <ComparisonTable title="Vision Model Comparison" headers={['Model','OCR Quality','Chart Understanding','Cost']} rows={[['GPT-4o','Excellent','Very Good','$2.50/1M + image tokens'],['Claude 3.5 Sonnet','Excellent','Excellent','$3.00/1M + image tokens'],['Gemini 1.5 Pro','Very Good','Good','$1.25/1M + image tokens']]}/>
</div></FadeIn>}
function TabMMPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Multimodal Playground</h2>
  <ArchitectureDecision scenario="You need to build a system that processes 10,000 scanned invoices per day, extracting vendor name, amount, date, and line items. Some invoices are handwritten, some are printed PDFs." options={[{label:'Vision LLM for everything \u2014 send each invoice image to GPT-4o',tradeoff:'Highest accuracy but expensive at scale ($500+/day for 10K invoices)'},{label:'OCR (Tesseract) + text extraction LLM for printed, Vision LLM only for handwritten',tradeoff:'Cost-efficient: 80% of invoices use cheap OCR, expensive vision only when needed'},{label:'Custom ML model trained on invoice data',tradeoff:'Cheapest at scale but requires training data, maintenance, and doesn\'t handle edge cases well'}]} correctIndex={1} explanation="A hybrid pipeline is most cost-effective. Printed invoices are handled well by traditional OCR + text LLM. Reserve expensive vision models for handwritten or complex layouts. Route based on document classification." onAnswer={()=>onComplete&&onComplete('mm-playground','arch1')}/>
</div></FadeIn>}
export function CourseMultimodal({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'mm-overview',label:'What Is Multimodal?',icon:'\uD83D\uDDBC\uFE0F'},{id:'mm-vision',label:'Vision Pipelines',icon:'\uD83D\uDC41\uFE0F'},{id:'mm-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[];
  return <CourseShell id="multimodal" icon={'\uD83D\uDDBC\uFE0F'} title="Multimodal AI Pipelines" timeMinutes={45} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(i===0)return <TabMMOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabMMVision onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabMMPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    return null;
  }}/>;
}

// ==================== COURSE 8: VOICE AI ====================
function TabVoiceOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Voice AI & Conversational Agents</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Voice AI transforms how humans interact with machines \u2014 from contact centers to personal assistants to accessibility tools.</p>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">{[
    {icon:'\uD83C\uDF99\uFE0F',title:'STT',desc:'Speech-to-Text: convert audio to text (Whisper, Deepgram)'},{icon:'\uD83E\uDDE0',title:'NLU',desc:'Natural Language Understanding: interpret intent from text'},{icon:'\uD83D\uDD0A',title:'TTS',desc:'Text-to-Speech: generate natural-sounding voice (ElevenLabs, OpenAI TTS)'},
  ].map((s,i)=><div key={i} className="p-3 rounded-xl border text-center" style={{borderColor:GIM.border}}><span style={{fontSize:24}}>{s.icon}</span><h4 className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{s.title}</h4><p style={{fontSize:12,color:GIM.bodyText}}>{s.desc}</p></div>)}</div>
  <Quiz question="What is the biggest challenge in real-time voice AI?" options={["Voice quality","Latency \u2014 users expect {'<'}500ms response time for natural conversation","Accuracy","Cost"]} correctIndex={1} explanation="Latency is the #1 challenge. Natural conversation requires sub-500ms end-to-end (STT + LLM + TTS). Users notice delays beyond 1 second and it breaks conversational flow." onAnswer={()=>onComplete&&onComplete('voice-overview','quiz1')}/>
</div></FadeIn>}
function TabVoicePipeline({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Voice Pipeline Architecture</h2>
  <CodeBlock title="Real-Time Voice Pipeline" code={`class VoicePipeline:
    def __init__(self, stt_model, llm, tts_model):
        self.stt = stt_model    # e.g., Whisper, Deepgram
        self.llm = llm          # e.g., GPT-4o-mini (fast!)
        self.tts = tts_model    # e.g., ElevenLabs, OpenAI TTS

    async def process_utterance(self, audio_chunk):
        # Step 1: STT (50-200ms)
        text = await self.stt.transcribe(audio_chunk)

        # Step 2: LLM response (100-500ms with streaming)
        response_stream = self.llm.stream(text)

        # Step 3: TTS with streaming (start speaking before LLM finishes)
        async for chunk in response_stream:
            audio = await self.tts.synthesize(chunk)
            yield audio  # Stream audio back to user

    # Total latency: ~300-700ms with streaming overlap`}/>
  <ComparisonTable title="Voice AI Providers" headers={['Component','Provider','Latency','Quality']} rows={[['STT','Whisper (local)','100-200ms','Excellent'],['STT','Deepgram','50-100ms','Very Good'],['LLM','GPT-4o-mini','100-300ms','Good'],['TTS','ElevenLabs','150-300ms','Excellent'],['TTS','OpenAI TTS','100-200ms','Very Good']]}/>
</div></FadeIn>}
function TabVoicePlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Voice AI Playground</h2>
  <ArchitectureDecision scenario="You are building a voice-based customer support agent for a restaurant chain. It handles reservations, menu questions, and hours. 500 calls/day." options={[{label:'IVR menu tree (press 1 for reservations...)',tradeoff:'Cheapest but frustrating UX. Customers hate phone trees.'},{label:'Full AI voice agent: Deepgram STT + GPT-4o-mini + OpenAI TTS',tradeoff:'Natural conversation, handles diverse queries. ~$0.10/call. Great UX.'},{label:'AI voice with human escalation for complex requests',tradeoff:'Best of both: AI handles 80% of calls, humans handle edge cases. Slightly more complex to build.'}]} correctIndex={2} explanation="AI voice + human escalation is the production sweet spot. The AI handles routine calls (hours, reservations, menu) quickly and naturally. Complex situations (complaints, special dietary needs, large party planning) get seamlessly transferred to a human." onAnswer={()=>onComplete&&onComplete('voice-playground','arch1')}/>
</div></FadeIn>}
export function CourseVoiceAI({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'voice-overview',label:'Voice AI',icon:'\uD83C\uDF99\uFE0F'},{id:'voice-pipeline',label:'Pipeline',icon:'\uD83D\uDD27'},{id:'voice-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[];
  return <CourseShell id="voice-ai" icon={'\uD83C\uDF99\uFE0F'} title="Voice AI & Conversational Agents" timeMinutes={40} exerciseCount={6} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(i===0)return <TabVoiceOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabVoicePipeline onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabVoicePlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    return null;
  }}/>;
}

// ==================== COURSE 9: RETRIEVAL ENGINEERING ====================
function TabRetEngOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Beyond Basic RAG</h2>
  <AnalogyBox title="The Research Librarian">{`Basic RAG is like using a library catalog \u2014 you search by keyword and get results. Retrieval engineering is like having an expert research librarian who understands your question, knows where to look, cross-references sources, and gives you exactly what you need.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Retrieval engineering goes beyond simple vector search to build production-grade retrieval systems.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\uD83D\uDD2A',title:'Advanced Chunking',desc:'Semantic, agentic, and hierarchical chunking strategies'},{icon:'\uD83D\uDD0D',title:'Hybrid Search',desc:'Combine vector similarity with keyword (BM25) search'},{icon:'\uD83C\uDFAF',title:'Reranking',desc:'Cross-encoder models reorder search results by true relevance'},{icon:'\uD83C\uDF33',title:'RAPTOR',desc:'Recursive summarization for hierarchical document retrieval'},
  ].map((t,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{t.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{t.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{t.desc}</p></div>)}</div>
  <Quiz question="Why does basic vector search often fail for production RAG?" options={["Vectors are too slow","Vector similarity misses keyword matches and doesn't capture document structure","Embeddings are inaccurate","Vector databases are expensive"]} correctIndex={1} explanation="Pure vector search can miss exact keyword matches (a user asking about 'error 502' needs the exact match, not semantically similar content). Hybrid search combines vector similarity with keyword matching for much better recall." onAnswer={()=>onComplete&&onComplete('reteng-overview','quiz1')}/>
</div></FadeIn>}
function TabRetEngHybrid({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Hybrid Search & Reranking</h2>
  <CodeBlock title="Hybrid Search Pipeline" code={`class HybridSearch:
    def __init__(self, vector_store, bm25_index, reranker):
        self.vector_store = vector_store
        self.bm25 = bm25_index
        self.reranker = reranker

    def search(self, query, top_k=5):
        # Step 1: Vector search (semantic similarity)
        vector_results = self.vector_store.search(query, top_k=20)

        # Step 2: BM25 search (keyword matching)
        bm25_results = self.bm25.search(query, top_k=20)

        # Step 3: Reciprocal Rank Fusion (combine results)
        combined = reciprocal_rank_fusion(vector_results, bm25_results)

        # Step 4: Rerank with cross-encoder
        reranked = self.reranker.rerank(query, combined[:20])

        return reranked[:top_k]`}/>
  <ComparisonTable title="Search Strategies" headers={['Strategy','Recall','Precision','Speed','Best For']} rows={[['Vector only','Good','Medium','Fast','Semantic queries'],['BM25 only','Medium','Good','Very fast','Keyword/exact match'],['Hybrid (no rerank)','Very good','Good','Fast','General purpose'],['Hybrid + reranking','Very good','Excellent','Medium','Production RAG']]}/>
</div></FadeIn>}
function TabRetEngPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Retrieval Engineering Playground</h2>
  <ArchitectureDecision scenario="Your RAG system processes technical documentation (10K pages). Users report two issues: (1) searching 'error 502' returns unrelated content about HTTP, (2) long documents are chunked poorly, losing context." options={[{label:'Increase vector search top_k to return more results',tradeoff:'Returns more noise, doesn\'t fix the keyword matching or chunking problems'},{label:'Add BM25 for keyword search + semantic chunking + parent-child chunk retrieval',tradeoff:'BM25 catches exact matches, semantic chunking preserves meaning, parent-child retrieval provides surrounding context'},{label:'Switch to a more powerful embedding model',tradeoff:'May help semantic search quality but doesn\'t fix keyword matching or chunking issues'}]} correctIndex={1} explanation="This is a multi-faceted problem requiring multiple fixes. BM25 handles exact keyword queries like 'error 502'. Semantic chunking splits documents at natural boundaries. Parent-child retrieval returns the matching chunk plus its surrounding context for better answers." onAnswer={()=>onComplete&&onComplete('reteng-playground','arch1')}/>
</div></FadeIn>}
export function CourseRetrievalEng({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'reteng-overview',label:'Beyond Basic RAG',icon:'\uD83D\uDD0E'},{id:'reteng-hybrid',label:'Hybrid Search',icon:'\uD83D\uDD00'},{id:'reteng-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[];
  return <CourseShell id="retrieval-eng" icon={'\uD83D\uDD0E'} title="Retrieval Engineering" timeMinutes={45} exerciseCount={8} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(i===0)return <TabRetEngOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabRetEngHybrid onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabRetEngPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    return null;
  }}/>;
}

// ==================== COURSE 10: AI TESTING ====================
function TabTestOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>AI Testing & Red-Teaming</h2>
  <AnalogyBox title="Crash Testing for AI">{`AI testing is like crash testing cars \u2014 you intentionally try to break the system in controlled conditions so you can fix vulnerabilities before real users encounter them.`}</AnalogyBox>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\uD83D\uDD34',title:'Red-Teaming',desc:'Adversarial testing: intentionally try to make the AI misbehave'},{icon:'\uD83E\uDDEA',title:'Eval Frameworks',desc:'Systematic measurement of quality, safety, and reliability'},{icon:'\uD83D\uDEE1\uFE0F',title:'Injection Defense',desc:'Testing prompt injection resistance and safety boundaries'},{icon:'\uD83D\uDCCA',title:'Regression Testing',desc:'Ensure updates don\'t break existing behavior'},
  ].map((t,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{t.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{t.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{t.desc}</p></div>)}</div>
  <Quiz question="Why is testing AI systems fundamentally different from testing traditional software?" options={["AI is harder to debug","AI outputs are non-deterministic \u2014 the same input can produce different outputs","AI systems are slower","Traditional testing methods work fine for AI"]} correctIndex={1} explanation="Non-determinism is the core challenge. The same prompt can produce different responses, making assertion-based testing insufficient. AI testing requires statistical evaluation over many runs, not single pass/fail checks." onAnswer={()=>onComplete&&onComplete('test-overview','quiz1')}/>
</div></FadeIn>}
function TabTestEval({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Evaluation Frameworks</h2>
  <CodeBlock title="LLM-as-Judge Evaluation" code={`def evaluate_response(question, response, reference_answer):
    """Use a powerful LLM to judge response quality."""
    judge_prompt = f"""Rate this AI response on a scale of 1-5:

Question: {question}
AI Response: {response}
Reference Answer: {reference_answer}

Criteria:
- Accuracy (1-5): Does the response contain correct information?
- Completeness (1-5): Does it address all parts of the question?
- Clarity (1-5): Is it well-written and easy to understand?

Return JSON: {{"accuracy": N, "completeness": N, "clarity": N, "reasoning": "..."}}"""

    judgment = call_llm("gpt-4o", judge_prompt, response_format="json")
    return judgment`}/>
  <ComparisonTable title="Evaluation Methods" headers={['Method','Speed','Cost','Reliability','Best For']} rows={[['Exact match','Instant','Free','High (for factual)','Classification, extraction'],['BLEU/ROUGE','Instant','Free','Medium','Summarization'],['LLM-as-Judge','Slow','$$','Good','Open-ended generation'],['Human eval','Very slow','$$$','Highest','Critical applications'],['Automated test suites','Fast','$','Good','Regression testing']]}/>
</div></FadeIn>}
function TabTestPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Testing Playground</h2>
  <ArchitectureDecision scenario="You are about to deploy a new version of your AI chatbot. The previous version has been in production for 3 months. How do you test the new version before full deployment?" options={[{label:'Manual testing by the team for a few hours',tradeoff:'Catches obvious issues but misses edge cases. Not reproducible or systematic.'},{label:'Automated eval suite (500 test cases) + red-teaming session + A/B test on 5% of traffic',tradeoff:'Comprehensive: automated tests catch regressions, red-teaming finds vulnerabilities, A/B test validates real-world performance'},{label:'Deploy to 100% and monitor for issues',tradeoff:'Fast to deploy but extremely risky. Production users become your test subjects.'}]} correctIndex={1} explanation="The gold standard is three layers: (1) automated eval suite catches regressions on known test cases, (2) red-teaming finds new failure modes, (3) A/B testing on a small percentage validates real-world performance before full rollout." onAnswer={()=>onComplete&&onComplete('test-playground','arch1')}/>
</div></FadeIn>}
export function CourseAITesting({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'test-overview',label:'AI Testing',icon:'\uD83E\uDDEA'},{id:'test-eval',label:'Evaluation',icon:'\uD83D\uDCCA'},{id:'test-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[];
  return <CourseShell id="ai-testing" icon={'\uD83E\uDDEA'} title="AI Testing & Red-Teaming" timeMinutes={40} exerciseCount={7} onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(i===0)return <TabTestOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabTestEval onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabTestPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    return null;
  }}/>;
}
