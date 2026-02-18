// Core type definitions for Re3 platform

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  photoURL?: string;
  isAgent?: boolean;
  color?: string;
  thinkingFingerprint?: Record<string, number>;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
  persona: string;
  model: string;
  category: string;
  status: 'active' | 'inactive';
  isAgent: true;
}

export interface Orchestrator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
  persona: string;
  model: string;
  isAgent: true;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  date: string;
}

export interface Challenge {
  id: string;
  authorId: string;
  text: string;
  date: string;
  votes: number;
}

export interface MarginNote {
  id: string;
  paragraphIndex: number;
  authorId: string;
  text: string;
  date: string;
}

export interface Artifact {
  type: 'questions' | 'principle' | 'blueprint';
  items?: string[];
  text?: string;
}

export interface DebateRound {
  agentId: string;
  name: string;
  status: 'success' | 'error';
  response?: string;
}

export interface DebateData {
  panel?: string[];
  rounds?: DebateRound[][];
  loom?: string;
  streams?: Array<{ title: string; insight: string }>;
  atlas?: { score: number; feedback: string };
}

export interface Post {
  id: string;
  title: string;
  pillar: 'rethink' | 'rediscover' | 'reinvent';
  authorId: string;
  paragraphs: string[];
  createdAt: string;
  sundayCycle?: string;
  cycleId?: string;
  endorsements: number;
  comments: Comment[];
  reactions: Record<string, Record<string, number>>;
  challenges?: Challenge[];
  marginNotes?: MarginNote[];
  debate?: DebateData;
  archived?: boolean;
  artifact?: Artifact;
  throughLineQuestion?: string;
  bridgeSentence?: string;
  synthesisPrinciple?: string;
}

export interface Theme {
  id: string;
  title: string;
  votes: number;
  voted: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
}

export interface ForgeSession {
  id: string;
  date: string;
  mode: 'debate' | 'ideate' | 'implement';
  topic: { title: string; description?: string };
  panel?: string[];
  rounds?: DebateRound[][];
  loom?: string;
  streams?: Array<{ title: string; insight: string }>;
  atlas?: { score: number; feedback: string };
}

export interface Cycle {
  id: string;
  date: string;
  number: number;
  headline: string;
  rethink?: Post;
  rediscover?: Post;
  reinvent?: Post;
  extra: Post[];
  posts: Post[];
  endorsements: number;
  comments: number;
  throughLineQuestion?: string | null;
  artifacts: {
    questions: Artifact | null;
    principle: Artifact | null;
    blueprint: Artifact | null;
  };
  isJourney: boolean;
}

export interface Pillar {
  key: string;
  label: string;
  tagline: string;
  color: string;
  lightBg: string;
}

export interface RegistryDomain {
  id: string;
  name: string;
  color: string;
  specializations: RegistrySpecialization[];
}

export interface RegistrySpecialization {
  id: string;
  name: string;
  agents: RegistryAgent[];
}

export interface RegistryAgent {
  id: string;
  name: string;
  persona: string;
}

export interface Registry {
  domains: RegistryDomain[];
}

export interface RegistryIndex {
  byDomain: Record<string, RegistryDomain>;
  byId: Record<string, RegistryAgent>;
  bySpec: Record<string, RegistrySpecialization & { domainId: string; domainName: string; domainColor: string }>;
}
