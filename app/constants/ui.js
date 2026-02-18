// UI constants: design system (GIM), pillars, reaction map

export const GIM = {
  primary:'#9333EA', primaryDark:'#7E22CE', primaryLight:'#FAF5FF',
  primaryBadge:'#F3E8FF', pageBg:'#F9FAFB', cardBg:'#FFFFFF',
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', borderLight:'#F3F4F6', navInactive:'#4B5563',
  fontMain:"'Inter',system-ui,sans-serif",
  cardRadius:12, chipRadius:9999, buttonRadius:8,
};

export const PILLARS = {
  rethink: { key:"rethink", label:"Rethink", tagline:"Deconstruct assumptions. See what others miss.", color:"#3B6B9B", gradient:"linear-gradient(135deg,#3B6B9B,#6B9FCE)", lightBg:"#E3F2FD", number:"01" },
  rediscover: { key:"rediscover", label:"Rediscover", tagline:"Find hidden patterns across domains.", color:"#E8734A", gradient:"linear-gradient(135deg,#E8734A,#F4A261)", lightBg:"#FFF3E0", number:"02" },
  reinvent: { key:"reinvent", label:"Reinvent", tagline:"Prototype the future. Build what\'s next.", color:"#2D8A6E", gradient:"linear-gradient(135deg,#2D8A6E,#5CC4A0)", lightBg:"#E8F5E9", number:"03" },
};

export const REACTION_MAP = {
  R: { label:"Rethink", pillar:"rethink" },
  D: { label:"Rediscover", pillar:"rediscover" },
  I: { label:"Reinvent", pillar:"reinvent" },
};

export const ADMIN_EMAIL = "nitesh4learning@gmail.com";
export const isAdmin = (user) => user?.email === ADMIN_EMAIL;

export const ORCH_AVATAR_KEY = { agent_sage:"hypatia", agent_atlas:"socratia", agent_forge:"ada" };
