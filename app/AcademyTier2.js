"use client";
import { useState, useEffect } from "react";
import {
  GIM, CODE_BG, CODE_TEXT,
  FadeIn, ProgressBar, ExpandableSection, CodeBlock, Quiz,
  MessageSimulator, AnalogyBox, SeeItInRe3, CourseShell,
  ArchitectureDecision, ComparisonTable
} from "./Academy";
import { JargonTip } from "./AcademyReviews";
import { ToolDefinitionBuilder, RiskClassifier } from "./AcademyWidgets";

// ==================== COURSE 5: MODEL CONTEXT PROTOCOL (MCP) ====================

function TabWhatMCP({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is MCP?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The <b>Model Context Protocol (MCP)</b> is an open standard that provides a universal way for AI models to connect to external tools, data sources, and services. Instead of building custom integrations for every tool, MCP provides one protocol that works everywhere.</p>
  <AnalogyBox emoji={'\uD83D\uDD0C'} title="Think of it like USB-C">Before USB-C, every device had its own charger. MCP is the USB-C of AI -- one standard connector that lets any AI model talk to any tool or data source.</AnalogyBox>
  <CodeBlock language="text" label="Before vs After MCP" code={`BEFORE MCP: N models \u00d7 M tools = N\u00d7M custom integrations
  GPT-4  \u2500\u2500custom\u2500\u2500> Slack, GitHub, Database, Calendar
  Claude \u2500\u2500custom\u2500\u2500> Slack, GitHub, Database, Calendar
  Result: 8 custom integrations (and growing!)

AFTER MCP: N models + M tools = N+M implementations
  GPT-4  \u2500\u2500MCP\u2500\u2500\u2510
  Claude \u2500\u2500MCP\u2500\u2500\u2524\u2500\u2500> MCP Server: Slack, GitHub, DB, Calendar
  Result: 2 clients + 4 servers = 6 implementations total`}/>
  <Quiz question="What problem does MCP solve?" options={["Making AI models faster","Eliminating the need for N\u00d7M custom integrations","Replacing APIs entirely","Training better models"]} correctIndex={1} explanation="MCP standardizes how AI models connect to tools. Instead of every model needing a custom integration for every tool (N\u00d7M), each model implements MCP once and can access any MCP-compatible tool." onAnswer={()=>onComplete&&onComplete('what-mcp','quiz1')}/>
  <Quiz question="Which best describes MCP's role?" options={["A new programming language","A universal protocol connecting AI to tools","A database technology","A model training framework"]} correctIndex={1} explanation="MCP is a protocol -- a standardized way for AI models (clients) to communicate with tools and data sources (servers). It defines the message format, not the implementation." onAnswer={()=>onComplete&&onComplete('what-mcp','quiz2')}/>
</div>}

function TabMCPArch({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>MCP Architecture</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP uses a three-layer architecture: <b>Host</b>, <b>Client</b>, and <b>Server</b>. Understanding these roles is key to building and using MCP systems.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Role</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>What It Does</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Example</th></tr></thead>
      <tbody>
        {[['Host','The application the user interacts with','Claude Desktop, VS Code, IDE'],['Client','Manages the connection to MCP servers','Built into the host app'],['Server','Exposes tools, resources, and prompts','GitHub server, Slack server, DB server']].map(([r,w,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{r}</td><td className="p-3" style={{color:GIM.bodyText}}>{w}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <MessageSimulator title="MCP Session Lifecycle" messages={[
    {role:'user',label:'1. Initialize',text:'Client sends initialize request with its capabilities and protocol version to the server.'},
    {role:'ai',label:'2. Server Responds',text:'Server returns its capabilities: available tools, resources, and prompts it offers.'},
    {role:'user',label:'3. Discovery',text:'Client calls tools/list to get detailed tool definitions including input schemas.'},
    {role:'ai',label:'4. Tool Call',text:'When the AI needs a tool, client sends tools/call with the tool name and arguments.'},
    {role:'ai',label:'5. Result',text:'Server executes the tool and returns the result. The AI uses this to generate its response.'},
  ]}/>
  <Quiz question="In MCP, which component exposes tools to the AI?" options={["The Host","The Client","The Server","The LLM itself"]} correctIndex={2} explanation="The Server exposes tools, resources, and prompts. The Client connects to servers and manages communication. The Host is the user-facing application." onAnswer={()=>onComplete&&onComplete('mcp-arch','quiz1')}/>
</div>}

function TabMCPTools({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The Tools Primitive</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Tools are the most commonly used MCP primitive. A tool is a <b>function the AI can call</b> -- like searching a database, sending an email, or creating a file. Tools have a name, description, and an input schema that defines what parameters they accept.</p>
  <CodeBlock language="json" label="MCP Tool Definition" code={`{
  "name": "search_documents",
  "description": "Search internal documents by query",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query text"
      },
      "limit": {
        "type": "number",
        "description": "Max results to return"
      }
    },
    "required": ["query"]
  }
}`}/>
  <ToolDefinitionBuilder/>
  <Quiz question="Why does a tool need an inputSchema?" options={["For documentation only","So the AI knows what parameters to provide and their types","To make the JSON look professional","It's optional and rarely used"]} correctIndex={1} explanation="The inputSchema tells the AI exactly what parameters the tool accepts, their types, and which are required. Without it, the AI wouldn't know how to correctly call the tool." onAnswer={()=>onComplete&&onComplete('mcp-tools','quiz1')}/>
  <Quiz question={"A tool definition has 'required: [\"query\"]'. What does this mean?"} options={["The query parameter has a default value","The AI must always provide the query parameter when calling this tool","The tool only works with queries","The query is optional"]} correctIndex={1} explanation="The 'required' array lists parameters that must be provided every time the tool is called. Optional parameters can be omitted and the tool will use defaults." onAnswer={()=>onComplete&&onComplete('mcp-tools','quiz2')}/>
</div>}

function TabMCPResources({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Resources & Prompts</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP has three primitives. Beyond Tools, there are <b>Resources</b> (read-only data) and <b>Prompts</b> (reusable templates).</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Primitive</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Direction</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Purpose</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Example</th></tr></thead>
      <tbody>
        {[['Tools','AI \u2192 Server','Execute actions','Search DB, send email, create file'],['Resources','Server \u2192 AI','Provide read-only data','Config files, documentation, schemas'],['Prompts','Server \u2192 User','Reusable templates','Code review template, analysis prompt']].map(([p,d,pu,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{p}</td><td className="p-3" style={{color:GIM.headingText}}>{d}</td><td className="p-3" style={{color:GIM.bodyText}}>{pu}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="A server exposes a company's API documentation. Which MCP primitive is most appropriate?" options={["Tool -- because you can search it","Resource -- it's read-only reference data","Prompt -- it's a template","All three equally"]} correctIndex={1} explanation="API documentation is read-only reference data that the AI consumes for context. Resources are designed for exactly this -- providing data to the AI without any action being taken." onAnswer={()=>onComplete&&onComplete('mcp-resources','quiz1')}/>
  <Quiz question="Which MCP primitive would you use for a 'Summarize this PR' workflow?" options={["Tool","Resource","Prompt","None of these"]} correctIndex={2} explanation="Prompts are reusable templates that define workflows. A 'Summarize this PR' prompt would include the template with placeholders for the PR content, guiding the AI through a structured analysis." onAnswer={()=>onComplete&&onComplete('mcp-resources','quiz2')}/>
</div>}

function TabMCPBuild({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building an MCP Server</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building an MCP server is surprisingly simple. Here's a minimal Python server that exposes a single tool.</p>
  <CodeBlock language="python" label="Minimal MCP Server (Python)" code={`from mcp.server import Server
from mcp.types import Tool, TextContent

app = Server("my-server")

@app.tool()
async def get_greeting(name: str) -> str:
    """Generate a personalized greeting."""
    return f"Hello, {name}! Welcome to MCP."

# That's it! The decorator handles:
# - Tool registration and schema generation
# - Input validation
# - JSON-RPC message handling
# - Error responses`}/>
  <ExpandableSection title="How tool definitions are auto-generated" icon={'\u2699\uFE0F'}>
    <p className="mb-3">The MCP SDK inspects your Python function to automatically generate the tool definition:</p>
    <p className="mb-2">{'\u2022'} <b>Function name</b> becomes the tool name</p>
    <p className="mb-2">{'\u2022'} <b>Docstring</b> becomes the description</p>
    <p className="mb-2">{'\u2022'} <b>Type hints</b> become the input schema</p>
    <p className="mb-2">{'\u2022'} <b>Required params</b> are those without defaults</p>
    <p className="mt-3">This convention-over-configuration approach means writing an MCP server is almost as simple as writing a regular Python function.</p>
  </ExpandableSection>
  <Quiz question="What does the MCP SDK auto-generate from a Python function?" options={["The server's hosting infrastructure","The tool's name, description, and input schema","The client-side UI","Test cases for the tool"]} correctIndex={1} explanation="The SDK inspects the function name (tool name), docstring (description), and type hints (input schema) to automatically generate the complete MCP tool definition." onAnswer={()=>onComplete&&onComplete('mcp-build','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's Debate Lab could be exposed as an MCP server -- offering tools like 'search_articles', 'start_debate', and 'get_loom_synthesis' to any MCP-compatible AI client." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabMCPPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your MCP knowledge!</p>
  <ExpandableSection title="Exercise 1: Primitive Classification" icon={'\uD83D\uDCCB'} defaultOpen={true}>
    <Quiz question="An MCP server gives the AI access to a company's product catalog for browsing (no modifications). Which primitive?" options={["Tool","Resource","Prompt","All three"]} correctIndex={1} explanation="Read-only data access = Resource. Tools are for actions. If the AI could modify the catalog, it would be a Tool." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Architecture Design" icon={'\uD83C\uDFD7\uFE0F'}>
    <Quiz question="A company wants Claude Desktop to access their CRM and their ticketing system. How many MCP servers do they need?" options={["1 server handling both","2 servers -- one per system","It depends on the company size","MCP can't handle multiple systems"]} correctIndex={1} explanation="Best practice is one MCP server per external system. This keeps servers focused, independently deployable, and easier to maintain. The MCP client can connect to multiple servers simultaneously." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Schema Design" icon={'\uD83D\uDD27'}>
    <Quiz question="Your tool accepts an optional 'format' parameter (defaults to 'json'). How should you define it?" options={["Include 'format' in the 'required' array","Omit 'format' from 'required' and add a default in the description","Don't include 'format' in the schema at all","Make a separate tool for each format"]} correctIndex={1} explanation="Optional parameters are defined in the schema's properties but NOT listed in the 'required' array. Adding the default value in the description helps the AI know what to expect." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 5 DEEP TABS ====================

function TabDeepMCPProtocolArch({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Protocol Architecture</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP uses <b>JSON-RPC 2.0</b> as its wire protocol. Every message is a JSON object with a method, params, and an id for request-response correlation. The protocol supports three transport layers, each suited to different deployment scenarios.</p>
  <ComparisonTable title="MCP Transport Layers" columns={['Transport','Mechanism','Best For','Limitations']} rows={[
    ['stdio','Standard input/output streams','Local tools, CLI integrations, desktop apps','Single machine only, no network'],
    ['SSE (Server-Sent Events)','HTTP POST + SSE stream','Web-hosted servers, cloud deployments','Unidirectional streaming, HTTP overhead'],
    ['Streamable HTTP','HTTP with bidirectional streaming','Production APIs, scalable services','Newer spec, less tooling support'],
  ]}/>
  <CodeBlock language="json" label="JSON-RPC 2.0 Initialize Request" code={`// Client -> Server: Initialize handshake
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "roots": { "listChanged": true }
    },
    "clientInfo": {
      "name": "my-ai-app",
      "version": "1.0.0"
    }
  }
}

// Server -> Client: Capability response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "subscribe": true },
      "prompts": { "listChanged": true }
    },
    "serverInfo": {
      "name": "github-mcp-server",
      "version": "2.1.0"
    }
  }
}`}/>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The capability negotiation phase is critical. The client advertises what it supports (e.g., root listing), and the server responds with what it offers (tools, resources, prompts). Both sides only use features the other supports.</p>
  <CodeBlock language="python" label="Transport Selection in Python" code={`from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Route

app = Server("my-server")

# Option 1: stdio transport (local, e.g., Claude Desktop)
async def run_stdio():
    async with stdio_server() as (read, write):
        await app.run(read, write, app.create_initialization_options())

# Option 2: SSE transport (remote, HTTP-based)
sse = SseServerTransport("/messages")

async def handle_sse(request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await app.run(streams[0], streams[1], app.create_initialization_options())

starlette_app = Starlette(routes=[
    Route("/sse", endpoint=handle_sse),
    Route("/messages", endpoint=sse.handle_post_message, methods=["POST"]),
])`}/>
  <ArchitectureDecision scenario="You are building an MCP server for a team's internal knowledge base. Developers will use it from Claude Desktop on their laptops, but the knowledge base lives on a shared server accessible via HTTP." options={[
    {label:'stdio transport',tradeoff:'Simple setup, but requires the server binary on every developer machine and cannot access remote knowledge base directly'},
    {label:'SSE transport',tradeoff:'Runs on the shared server, all devs connect over HTTP, single deployment to maintain, easy to update'},
    {label:'Streamable HTTP',tradeoff:'Most scalable but newest spec, less tooling maturity, may be overkill for internal team use'},
  ]} correctIndex={1} explanation="SSE is ideal here. The knowledge base is remote, so stdio would require syncing data locally. SSE lets you run one server instance that all devs connect to over HTTP. Streamable HTTP is viable but adds complexity without clear benefit for an internal tool." onAnswer={()=>onComplete&&onComplete('deep-proto-arch','quiz1')}/>
  <Quiz question="During MCP initialization, what happens if the client requests a capability the server does not support?" options={["The connection fails with an error","The server ignores it and omits it from the response","The server automatically adds the capability","The client retries with a different version"]} correctIndex={1} explanation="MCP uses graceful capability negotiation. If the server does not support a requested capability, it simply omits it from its response. The client then knows not to use that feature." onAnswer={()=>onComplete&&onComplete('deep-proto-arch','quiz2')}/>
</div>}

function TabDeepMCPBuildServers({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building MCP Servers</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A production MCP server registers tools with input validation, handles errors gracefully, and manages resources. Here is a complete Python server with multiple tools, resource handlers, and proper error handling.</p>
  <CodeBlock language="python" label="Production MCP Server (Python)" code={`from mcp.server import Server
from mcp.types import Tool, TextContent, Resource, ResourceTemplate
import json, httpx, logging

logger = logging.getLogger("knowledge-server")
app = Server("knowledge-base")

# --- Tool 1: Search documents ---
@app.tool()
async def search_documents(query: str, limit: int = 10, category: str = None) -> str:
    """Search the knowledge base for documents matching a query.

    Args:
        query: Search terms to match against document titles and content
        limit: Maximum number of results to return (1-50)
        category: Optional category filter (engineering, product, design)
    """
    if limit < 1 or limit > 50:
        raise ValueError("limit must be between 1 and 50")
    valid_cats = ["engineering", "product", "design", None]
    if category not in valid_cats:
        raise ValueError(f"category must be one of: {valid_cats}")

    # In production: query your vector DB or search index
    results = await _do_search(query, limit, category)
    return json.dumps({"results": results, "total": len(results)})

# --- Tool 2: Create a document ---
@app.tool()
async def create_document(title: str, content: str, category: str) -> str:
    """Create a new document in the knowledge base.

    Args:
        title: Document title (max 200 characters)
        content: Document body in markdown format
        category: Document category (engineering, product, design)
    """
    if len(title) > 200:
        raise ValueError("Title must be 200 characters or less")
    doc_id = await _save_document(title, content, category)
    return json.dumps({"id": doc_id, "status": "created"})

# --- Resource: Expose category listing ---
@app.resource("kb://categories")
async def list_categories() -> str:
    """List all available document categories."""
    return json.dumps(["engineering", "product", "design"])

# --- Prompt: Document review template ---
@app.prompt("review-doc")
async def review_prompt(doc_id: str) -> list:
    """Generate a review prompt for a specific document."""
    doc = await _get_document(doc_id)
    return [
        {"role": "user", "content": f"Review this document for clarity and accuracy:\\n\\n{doc['content']}"}
    ]`}/>
  <CodeBlock language="typescript" label="MCP Server in TypeScript" code={`import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new Server({ name: "ts-kb-server", version: "1.0.0" }, {
  capabilities: { tools: {}, resources: {} }
});

// Register a tool with Zod schema validation
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "search_documents",
    description: "Search knowledge base by query",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms" },
        limit: { type: "number", description: "Max results (1-50)" }
      },
      required: ["query"]
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "search_documents") {
    const results = await doSearch(args.query, args.limit ?? 10);
    return { content: [{ type: "text", text: JSON.stringify(results) }] };
  }
  throw new Error(\`Unknown tool: \${name}\`);
});

const transport = new StdioServerTransport();
await server.connect(transport);`}/>
  <Quiz question="In the Python MCP SDK, how are tool input schemas generated?" options={["You write JSON Schema manually","From function type hints, parameter names, and docstrings","From a separate schema file","From a database of tool definitions"]} correctIndex={1} explanation="The Python SDK inspects type hints for parameter types, parameter names for property names, docstrings for descriptions, and default values to determine required vs optional. Convention over configuration." onAnswer={()=>onComplete&&onComplete('deep-build-servers','quiz1')}/>
  <ArchitectureDecision scenario="You need to build MCP servers for your team. Half the team knows Python well, the other half prefers TypeScript. Which approach?" options={[
    {label:'All Python -- pick one language for consistency',tradeoff:'Unified codebase and shared patterns, but TS devs are less productive and may resist adoption'},
    {label:'All TypeScript -- the Node ecosystem is larger',tradeoff:'Larger package ecosystem, but Python devs lose productivity and some data science tools are Python-only'},
    {label:'Mixed -- each team uses their preferred language',tradeoff:'Maximum developer velocity, MCP protocol is language-agnostic so servers interoperate. Slightly more DevOps complexity'},
  ]} correctIndex={2} explanation="MCP is protocol-level interoperability -- servers written in different languages work identically with any client. Let teams use what they know best. The DevOps overhead of supporting two runtimes is typically small compared to the productivity gains." onAnswer={()=>onComplete&&onComplete('deep-build-servers','quiz2')}/>
</div>}

function TabDeepMCPBuildClients({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building MCP Clients</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An MCP client manages connections to one or more servers, discovers available tools, and routes tool calls from the LLM to the correct server. Here is a production client implementation.</p>
  <CodeBlock language="python" label="MCP Client Session Management" code={`from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import json

class MCPManager:
    """Manages connections to multiple MCP servers."""

    def __init__(self):
        self.sessions: dict[str, ClientSession] = {}
        self.tools: dict[str, dict] = {}  # tool_name -> {session, definition}

    async def connect(self, name: str, command: str, args: list[str] = None):
        """Connect to an MCP server and discover its tools."""
        params = StdioServerParameters(command=command, args=args or [])
        read, write = await stdio_client(params).__aenter__()
        session = ClientSession(read, write)
        await session.initialize()

        # Discover tools from this server
        tools_response = await session.list_tools()
        for tool in tools_response.tools:
            self.tools[tool.name] = {
                "session": session,
                "definition": tool,
                "server": name
            }
        self.sessions[name] = session
        return tools_response.tools

    async def call_tool(self, tool_name: str, arguments: dict) -> str:
        """Route a tool call to the correct server."""
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")
        entry = self.tools[tool_name]
        result = await entry["session"].call_tool(tool_name, arguments)
        return result.content[0].text

    def get_all_tool_definitions(self) -> list[dict]:
        """Get all tool definitions for LLM function calling."""
        return [
            {
                "name": t["definition"].name,
                "description": t["definition"].description,
                "input_schema": t["definition"].inputSchema
            }
            for t in self.tools.values()
        ]

# Usage: connect to multiple servers
manager = MCPManager()
await manager.connect("github", "npx", ["-y", "@modelcontextprotocol/server-github"])
await manager.connect("slack", "npx", ["-y", "@modelcontextprotocol/server-slack"])

# Get unified tool list for the LLM
all_tools = manager.get_all_tool_definitions()
# LLM sees tools from both servers as one unified set`}/>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The key insight is that the client acts as a <b>router</b>. The LLM sees a flat list of all tools from all servers. When it calls a tool, the client routes that call to whichever server originally registered it.</p>
  <Quiz question="Why does the MCPManager maintain a mapping from tool name to session?" options={["For logging purposes only","To route tool calls to the correct server that registered the tool","To prevent duplicate tool names","To cache tool results"]} correctIndex={1} explanation="When the LLM calls a tool, the client needs to know which server session to send the request to. The mapping from tool name to session enables this routing transparently." onAnswer={()=>onComplete&&onComplete('deep-build-clients','quiz1')}/>
  <Quiz question="A client is connected to 3 MCP servers. The LLM receives tools from:" options={["Only the first server connected","Only the last server connected","A merged list from all 3 servers","It picks one server at random"]} correctIndex={2} explanation="The client merges tool definitions from all connected servers into a single unified list. The LLM sees all tools as if they came from one source, and the client handles routing behind the scenes." onAnswer={()=>onComplete&&onComplete('deep-build-clients','quiz2')}/>
</div>}

function TabDeepMCPToolsDeep({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tools Deep Dive</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Tool design is where MCP servers succeed or fail in practice. Good tool schemas guide the LLM to call tools correctly. Poor schemas lead to hallucinated parameters, wrong tool selection, and frustrated users.</p>
  <CodeBlock language="python" label="Tool Design Best Practices" code={`# BAD: Vague name, no descriptions, loose types
@app.tool()
async def do_stuff(data: str) -> str:
    """Process data."""  # What data? What processing?
    pass

# GOOD: Clear name, rich descriptions, constrained types
@app.tool()
async def search_customer_orders(
    customer_email: str,
    status: str = None,
    date_after: str = None,
    limit: int = 20
) -> str:
    """Search for customer orders by email address.

    Returns order summaries including order ID, date, total, and status.
    Use this when a customer asks about their order history or a specific order.

    Args:
        customer_email: The customer's email address (e.g., user@example.com)
        status: Filter by order status: 'pending', 'shipped', 'delivered', 'canceled'
        date_after: Only return orders after this date (ISO 8601: YYYY-MM-DD)
        limit: Maximum orders to return (1-100, default 20)
    """
    # Validate inputs
    if status and status not in ('pending', 'shipped', 'delivered', 'canceled'):
        return json.dumps({"error": f"Invalid status '{status}'. Use: pending, shipped, delivered, canceled"})
    if limit < 1 or limit > 100:
        limit = max(1, min(100, limit))

    orders = await db.search_orders(customer_email, status, date_after, limit)
    return json.dumps({"orders": orders, "count": len(orders)})`}/>
  <CodeBlock language="python" label="Async Tool Execution with Timeouts" code={`import asyncio
from mcp.types import TextContent

@app.tool()
async def analyze_repository(repo_url: str, depth: str = "summary") -> str:
    """Analyze a GitHub repository's structure and code quality.

    This operation may take 10-30 seconds for large repos.

    Args:
        repo_url: Full GitHub repository URL
        depth: Analysis depth - 'summary' (fast) or 'detailed' (slower, includes file-level analysis)
    """
    try:
        result = await asyncio.wait_for(
            _run_analysis(repo_url, depth),
            timeout=60.0  # Hard timeout
        )
        return json.dumps(result)
    except asyncio.TimeoutError:
        return json.dumps({
            "error": "Analysis timed out after 60 seconds",
            "suggestion": "Try with depth='summary' for faster results"
        })
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "recoverable": True,
            "suggestion": "Check if the repository URL is correct and accessible"
        })`}/>
  <Quiz question="A tool returns an error. What is the best practice for the error response format?" options={["Raise an exception that crashes the server","Return a JSON object with error details and recovery suggestions","Return an empty string","Return HTTP 500"]} correctIndex={1} explanation="Returning structured error information (what went wrong, whether it is recoverable, and what the user or LLM can try instead) lets the LLM handle the failure gracefully rather than giving up." onAnswer={()=>onComplete&&onComplete('deep-tools-deep','quiz1')}/>
  <ArchitectureDecision scenario="You have a tool that fetches data from a slow external API (5-15 second response time). How should you handle this in your MCP server?" options={[
    {label:'Synchronous call with no timeout',tradeoff:'Simple code, but the client and LLM hang indefinitely if the API is down'},
    {label:'Async with timeout + structured error on failure',tradeoff:'Robust handling -- the LLM gets a clear error it can act on if the call times out, and the server stays responsive'},
    {label:'Cache everything and never call the API in real time',tradeoff:'Fast responses but stale data, cache invalidation complexity, and cold-start misses'},
  ]} correctIndex={1} explanation="Async with timeouts is the production standard. The LLM receives a structured error it can reason about (e.g., suggest trying again or using a different approach). Caching can supplement this but should not replace real-time access entirely." onAnswer={()=>onComplete&&onComplete('deep-tools-deep','quiz2')}/>
</div>}

function TabDeepMCPResourcesPrompts({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Resources & Prompts</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Resources provide <b>read-only contextual data</b> to the LLM. Unlike tools (which perform actions), resources feed information into the conversation. Prompts are <b>reusable workflow templates</b> that guide the LLM through structured tasks.</p>
  <CodeBlock language="python" label="Resource URI Schemes and Handlers" code={`from mcp.server import Server

app = Server("docs-server")

# Static resource: always returns the same content
@app.resource("config://app/settings")
async def get_settings() -> str:
    """Current application configuration."""
    return json.dumps({
        "environment": "production",
        "features": {"dark_mode": True, "beta_api": False}
    })

# Dynamic resource with URI template
@app.resource("docs://articles/{article_id}")
async def get_article(article_id: str) -> str:
    """Retrieve a specific article by ID."""
    article = await db.get_article(article_id)
    if not article:
        raise ValueError(f"Article {article_id} not found")
    return json.dumps(article)

# Resource listing: let clients discover available resources
@app.list_resources()
async def list_resources():
    articles = await db.list_article_ids()
    return [
        {"uri": f"docs://articles/{aid}", "name": f"Article {aid}"}
        for aid in articles
    ]`}/>
  <CodeBlock language="python" label="Templated Prompts" code={`@app.prompt("code-review")
async def code_review_prompt(language: str, file_path: str) -> list:
    """Generate a structured code review prompt.

    Args:
        language: Programming language (python, javascript, etc.)
        file_path: Path to the file to review
    """
    file_content = await read_file(file_path)
    return [
        {
            "role": "user",
            "content": f"""Review this {language} code for:
1. Bugs and potential runtime errors
2. Security vulnerabilities
3. Performance issues
4. Code style and readability

File: {file_path}
\\n\\n{file_content}

Provide your review in this format:
- CRITICAL: Issues that will cause bugs or security problems
- WARNING: Issues that may cause problems under certain conditions
- SUGGESTION: Style and readability improvements"""
        }
    ]

@app.prompt("summarize-pr")
async def summarize_pr_prompt(pr_number: int) -> list:
    """Generate a PR summary prompt with diff context."""
    diff = await github.get_pr_diff(pr_number)
    return [
        {"role": "user", "content": f"Summarize this pull request diff. Focus on what changed and why it matters:\\n\\n{diff}"}
    ]`}/>
  <ComparisonTable title="When to Use Each MCP Primitive" columns={['Scenario','Tool','Resource','Prompt']} rows={[
    ['Search a database by query','Yes -- action with parameters','No','No'],
    ['Expose API documentation','No','Yes -- read-only data','No'],
    ['Structured code review workflow','No','No','Yes -- reusable template'],
    ['Create a new GitHub issue','Yes -- write action','No','No'],
    ['List available config settings','No','Yes -- contextual data','No'],
    ['Multi-step analysis workflow','No','No','Yes -- guided template'],
  ]}/>
  <Quiz question="A resource URI is 'docs://articles/{article_id}'. What does the {article_id} part represent?" options={["A literal string","A variable that the client fills in with a specific article ID","A regex pattern","A default value"]} correctIndex={1} explanation="URI templates use {param} syntax for dynamic segments. The client replaces {article_id} with an actual ID when requesting a specific resource, enabling the server to return the right document." onAnswer={()=>onComplete&&onComplete('deep-resources-prompts','quiz1')}/>
</div>}

function TabDeepMCPSecurity({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Security & Auth</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP servers often access sensitive systems -- databases, APIs, internal tools. Security is not optional. The protocol supports <b>OAuth 2.0</b> for authentication, and servers must implement input sanitization, rate limiting, and trust verification.</p>
  <CodeBlock language="python" label="Input Sanitization and Rate Limiting" code={`import time
from collections import defaultdict

# Simple rate limiter
class RateLimiter:
    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window = window_seconds
        self.calls: dict[str, list[float]] = defaultdict(list)

    def check(self, client_id: str) -> bool:
        now = time.time()
        # Remove old entries outside the window
        self.calls[client_id] = [
            t for t in self.calls[client_id]
            if now - t < self.window
        ]
        if len(self.calls[client_id]) >= self.max_calls:
            return False
        self.calls[client_id].append(now)
        return True

limiter = RateLimiter(max_calls=100, window_seconds=60)

@app.tool()
async def query_database(sql_query: str) -> str:
    """Run a read-only SQL query against the analytics database.

    Args:
        sql_query: SQL SELECT query (read-only, no mutations allowed)
    """
    # 1. Rate limit
    if not limiter.check("default"):
        return json.dumps({"error": "Rate limit exceeded. Try again in 60s."})

    # 2. Input sanitization -- block dangerous patterns
    blocked = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "EXEC", "--", ";"]
    upper = sql_query.upper()
    for pattern in blocked:
        if pattern in upper:
            return json.dumps({"error": f"Blocked: query contains '{pattern}'. Only SELECT queries are allowed."})

    # 3. Enforce read-only at DB level too (defense in depth)
    try:
        result = await db.execute_readonly(sql_query, timeout=10)
        return json.dumps({"rows": result, "count": len(result)})
    except Exception as e:
        return json.dumps({"error": str(e)})`}/>
  <CodeBlock language="python" label="OAuth 2.0 Token Verification" code={`from mcp.server.auth import oauth2_required
import jwt

# Verify OAuth tokens on MCP connections
async def verify_token(token: str) -> dict:
    """Verify and decode an OAuth 2.0 bearer token."""
    try:
        payload = jwt.decode(
            token,
            key=PUBLIC_KEY,
            algorithms=["RS256"],
            audience="mcp-knowledge-server"
        )
        return {
            "user_id": payload["sub"],
            "scopes": payload.get("scope", "").split(),
            "expires": payload["exp"]
        }
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

# Check scopes before tool execution
async def require_scope(token_info: dict, scope: str):
    if scope not in token_info["scopes"]:
        raise PermissionError(f"Missing required scope: {scope}")

@app.tool()
async def delete_document(doc_id: str) -> str:
    """Delete a document from the knowledge base. Requires 'write' scope."""
    token_info = get_current_token()  # From auth middleware
    await require_scope(token_info, "write")
    await db.delete(doc_id)
    return json.dumps({"deleted": doc_id})`}/>
  <Quiz question="Why implement both SQL pattern blocking AND a read-only database connection?" options={["Redundancy is wasteful -- pick one","Defense in depth: if one layer fails, the other still protects","It makes the code look more secure","For compliance documentation only"]} correctIndex={1} explanation="Defense in depth means multiple independent security layers. If a creative SQL injection bypasses pattern matching, the read-only database connection still prevents mutations. Neither layer alone is sufficient." onAnswer={()=>onComplete&&onComplete('deep-security','quiz1')}/>
  <ArchitectureDecision scenario="Your MCP server accesses a customer database. A user asks: 'Show me all customers who spent over $10,000.' Should the MCP server execute this query?" options={[
    {label:'Yes -- the user asked for it',tradeoff:'Violates principle of least privilege. The LLM may not have authorization to access all customer data'},
    {label:'No -- verify the user has permission to access customer financial data first',tradeoff:'Adds latency for auth check but prevents unauthorized data access. This is the correct approach'},
    {label:'Return aggregated data only (count, average) to avoid exposing individual records',tradeoff:'Good privacy practice but does not answer the user question and may frustrate legitimate authorized users'},
  ]} correctIndex={1} explanation="Always verify authorization before returning sensitive data. The MCP server should check the user's permissions against the requested data scope. Never assume the LLM user is authorized for all data the server can access." onAnswer={()=>onComplete&&onComplete('deep-security','quiz2')}/>
</div>}

function TabDeepMCPProduction({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>MCP in Production</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Running MCP servers in production requires monitoring, versioning, multi-server orchestration, and deployment strategies. Here are the patterns used by teams running MCP at scale.</p>
  <CodeBlock language="python" label="Structured Logging and Monitoring" code={`import structlog, time

logger = structlog.get_logger("mcp-server")

class ToolMetrics:
    """Track tool call metrics for monitoring dashboards."""

    def __init__(self):
        self.call_counts: dict[str, int] = defaultdict(int)
        self.error_counts: dict[str, int] = defaultdict(int)
        self.latencies: dict[str, list[float]] = defaultdict(list)

    def record(self, tool_name: str, duration: float, error: bool = False):
        self.call_counts[tool_name] += 1
        self.latencies[tool_name].append(duration)
        if error:
            self.error_counts[tool_name] += 1

    def get_stats(self, tool_name: str) -> dict:
        lats = self.latencies.get(tool_name, [])
        return {
            "calls": self.call_counts[tool_name],
            "errors": self.error_counts[tool_name],
            "p50_ms": sorted(lats)[len(lats)//2] * 1000 if lats else 0,
            "p99_ms": sorted(lats)[int(len(lats)*0.99)] * 1000 if lats else 0,
        }

metrics = ToolMetrics()

# Middleware pattern: wrap all tool calls with metrics
def instrumented_tool(func):
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = await func(*args, **kwargs)
            metrics.record(func.__name__, time.time() - start)
            logger.info("tool_call", tool=func.__name__, duration=time.time()-start)
            return result
        except Exception as e:
            metrics.record(func.__name__, time.time() - start, error=True)
            logger.error("tool_error", tool=func.__name__, error=str(e))
            raise
    return wrapper`}/>
  <ComparisonTable title="MCP Deployment Patterns" columns={['Pattern','When to Use','Trade-off']} rows={[
    ['Sidecar (per-user process)','Desktop apps, personal tools','Simple isolation but high resource use per user'],
    ['Shared service (HTTP/SSE)','Team tools, cloud resources','Efficient but requires auth and rate limiting'],
    ['Serverless (per-request)','Infrequent tools, cost-sensitive','Low cost at low volume but cold start latency'],
    ['Gateway (proxy to multiple servers)','Many servers, unified management','Central control but single point of failure'],
  ]}/>
  <CodeBlock language="json" label="MCP Server Versioning (package.json)" code={`{
  "name": "@company/mcp-knowledge-server",
  "version": "2.1.0",
  "mcp": {
    "protocolVersion": "2025-03-26",
    "capabilities": ["tools", "resources", "prompts"],
    "minClientVersion": "0.5.0"
  },
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "test": "vitest run",
    "test:mcp": "mcp-inspector test"
  }
}`}/>
  <Quiz question="Your MCP server has a tool that takes 20 seconds on average. You deploy it as a serverless function with a 10-second timeout. What happens?" options={["The tool works fine, serverless handles long tasks","The tool times out on most calls, returning errors to the LLM","The serverless platform automatically extends the timeout","The tool runs in the background and results are returned later"]} correctIndex={1} explanation="Serverless functions have hard timeout limits. If your tool regularly exceeds the timeout, most calls will fail. Either increase the timeout, optimize the tool, or use a different deployment pattern like a shared service." onAnswer={()=>onComplete&&onComplete('deep-production','quiz1')}/>
  <ArchitectureDecision scenario="You manage 12 MCP servers across your organization. Each team maintains their own server. How should you handle discovery and routing for client applications?" options={[
    {label:'Hardcode server URIs in each client config',tradeoff:'Simple but brittle. Adding or moving servers requires updating every client config manually'},
    {label:'MCP Gateway that maintains a server registry and routes tool calls',tradeoff:'Central discovery and routing. Adds a hop but provides unified auth, logging, and server management'},
    {label:'Service mesh with automatic server discovery',tradeoff:'Most sophisticated but complex to set up. Best for very large deployments with dynamic scaling needs'},
  ]} correctIndex={1} explanation="A gateway pattern provides centralized management without the complexity of a full service mesh. It handles discovery, auth, rate limiting, and monitoring in one place. The extra network hop is usually negligible compared to LLM latency." onAnswer={()=>onComplete&&onComplete('deep-production','quiz2')}/>
</div>}

function TabDeepMCPPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your MCP knowledge to real-world architecture challenges.</p>
  <ExpandableSection title="Exercise 1: Design an MCP Server" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <p className="mb-3" style={{fontSize:13,color:GIM.bodyText}}>A company wants to give their AI assistant access to: (a) their PostgreSQL database for customer queries, (b) their Slack workspace for sending notifications, and (c) their Confluence wiki for reading documentation.</p>
    <ArchitectureDecision scenario="How many MCP servers should you build, and what primitives should each expose?" options={[
      {label:'1 server with all three integrations as tools',tradeoff:'Simple deployment but violates separation of concerns. A Slack API outage takes down database access too'},
      {label:'3 servers: DB (tools + resources), Slack (tools), Confluence (resources)',tradeoff:'Clean separation, independent deployment, correct primitive usage. DB uses tools for queries and resources for schema info. Confluence is read-only so resources are correct'},
      {label:'2 servers: one for read (DB + Confluence) and one for write (Slack)',tradeoff:'Groups by read/write but mixes unrelated systems. Harder to maintain and reason about'},
    ]} correctIndex={1} explanation="One server per external system is the MCP best practice. The database server exposes tools (for running queries) and resources (for schema information). Confluence is read-only so resources are the right primitive. Slack needs tools for sending messages." onAnswer={()=>onComplete&&onComplete('deep-mcp-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Security Review" icon={'\uD83D\uDD12'}>
    <Quiz question="An MCP server exposes a 'run_shell_command' tool that executes arbitrary shell commands on the server host. What is the security concern?" options={["It is too slow for production use","It gives the LLM (and any prompt injection) full system access -- a critical vulnerability","It uses too many tokens","The tool name is too generic"]} correctIndex={1} explanation="Arbitrary shell command execution is one of the most dangerous tools you can expose. A prompt injection in user input could cause the LLM to execute 'rm -rf /' or exfiltrate data. Tools should be narrowly scoped with specific, validated operations." onAnswer={()=>onComplete&&onComplete('deep-mcp-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Transport Selection" icon={'\uD83D\uDD0C'}>
    <Quiz question="Your MCP server needs to support 500 concurrent users via a web application. Which transport?" options={["stdio -- it is the simplest","SSE or Streamable HTTP -- they support network connections and scale to many clients","Any transport works at this scale","Build a custom WebSocket transport"]} correctIndex={1} explanation="stdio is limited to local single-user scenarios. At 500 concurrent users over a network, you need HTTP-based transports (SSE or Streamable HTTP) behind a load balancer. Building a custom transport is unnecessary when the spec already supports this." onAnswer={()=>onComplete&&onComplete('deep-mcp-playground','quiz3')}/>
  </ExpandableSection>
</div>}

export function CourseMCP({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[
    {id:'what-mcp',label:'What is MCP',icon:'\uD83D\uDD0C'},
    {id:'mcp-arch',label:'Architecture',icon:'\uD83C\uDFD7\uFE0F'},
    {id:'mcp-tools',label:'Tools Primitive',icon:'\uD83D\uDD27'},
    {id:'mcp-resources',label:'Resources & Prompts',icon:'\uD83D\uDCC1'},
    {id:'mcp-build',label:'Building a Server',icon:'\uD83D\uDCBB'},
    {id:'mcp-playground',label:'Playground',icon:'\uD83C\uDFAE'},
  ];
  const deepTabs=[
    {id:'deep-proto-arch',label:'Protocol Architecture',icon:'\uD83D\uDCE1'},
    {id:'deep-build-servers',label:'Building MCP Servers',icon:'\uD83D\uDCBB'},
    {id:'deep-build-clients',label:'Building MCP Clients',icon:'\uD83D\uDD17'},
    {id:'deep-tools-deep',label:'Tools Deep Dive',icon:'\uD83D\uDD27'},
    {id:'deep-resources-prompts',label:'Resources & Prompts',icon:'\uD83D\uDCC1'},
    {id:'deep-security',label:'Security & Auth',icon:'\uD83D\uDD12'},
    {id:'deep-production',label:'MCP in Production',icon:'\uD83D\uDE80'},
    {id:'deep-mcp-playground',label:'Deep Playground',icon:'\uD83C\uDFAE'},
  ];
  return <CourseShell
    id="mcp-protocol"
    progress={progress}
    onBack={onBack}
    onNavigate={onNavigate}
    onComplete={onComplete}
    depth={depth}
    onChangeDepth={onChangeDepth}
    visionaryTabs={visionaryTabs}
    deepTabs={deepTabs}
    renderTab={(tab,i,d)=>{
      if(d==='deep'){
        if(i===0) return <TabDeepMCPProtocolArch onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===1) return <TabDeepMCPBuildServers onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===2) return <TabDeepMCPBuildClients onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===3) return <TabDeepMCPToolsDeep onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===4) return <TabDeepMCPResourcesPrompts onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===5) return <TabDeepMCPSecurity onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===6) return <TabDeepMCPProduction onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===7) return <TabDeepMCPPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
      }
      if(i===0) return <TabWhatMCP onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1) return <TabMCPArch onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2) return <TabMCPTools onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3) return <TabMCPResources onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===4) return <TabMCPBuild onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===5) return <TabMCPPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }}
  />;
}

// ==================== COURSE 6: AGENT-TO-AGENT (A2A) ====================

function TabWhyA2A({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why A2A?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP connects AI to <b>tools</b>. But what about connecting AI to <b>other AI agents</b>? The <b>Agent-to-Agent (A2A)</b> protocol enables AI agents to discover each other, negotiate capabilities, and collaborate on tasks.</p>
  <AnalogyBox emoji={'\uD83D\uDCDE'} title="MCP vs A2A: Phone analogy">MCP is like calling a service (pizza delivery, bank). A2A is like calling a colleague to collaborate on a project. Different relationship, different protocol.</AnalogyBox>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Aspect</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>MCP</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>A2A</th></tr></thead>
      <tbody>
        {[['Connects','AI \u2194 Tools/Data','AI \u2194 AI Agents'],['Pattern','Client-Server','Peer-to-Peer'],['Communication','Tool calls','Task delegation'],['Discovery','Server exposes tools','Agent Cards advertise capabilities']].map(([a,m,g],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{a}</td><td className="p-3" style={{color:'#3B82F6'}}>{m}</td><td className="p-3" style={{color:'#2D8A6E'}}>{g}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="MCP connects AI to tools. A2A connects AI to..." options={["Databases","Other AI agents","Users","The internet"]} correctIndex={1} explanation="A2A is specifically designed for agent-to-agent communication. It enables AI agents built by different teams or companies to discover and collaborate with each other." onAnswer={()=>onComplete&&onComplete('why-a2a','quiz1')}/>
  <Quiz question="Which protocol would you use for an AI agent to search a database?" options={["A2A -- agents handle everything","MCP -- it connects AI to tools and data","Both equally","Neither"]} correctIndex={1} explanation="Database search is a tool/data access pattern -- exactly what MCP is designed for. A2A is for agent-to-agent collaboration, not tool access." onAnswer={()=>onComplete&&onComplete('why-a2a','quiz2')}/>
</div>}

function TabAgentCards({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Cards</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An <b>Agent Card</b> is a JSON document that describes what an AI agent can do. It's like a LinkedIn profile for AI agents -- advertising capabilities so other agents know who to collaborate with.</p>
  <AnalogyBox emoji={'\uD83D\uDCBC'} title="Think of it like a business card + resume">An Agent Card tells other agents: "Here's my name, what I specialize in, how to reach me, and what I can help with." It enables discovery and capability negotiation.</AnalogyBox>
  <CodeBlock language="json" label="Example Agent Card (Re\u00b3 Debate Lab)" code={`{
  "name": "Re\u00b3 Debate Lab Agent",
  "description": "Orchestrates multi-agent debates on any topic",
  "url": "https://re3.live/api/a2a",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "debate",
      "name": "Multi-Agent Debate",
      "description": "Run a structured debate with 5 specialized agents"
    },
    {
      "id": "synthesize",
      "name": "Debate Synthesis",
      "description": "Synthesize debate results into emergent insights"
    }
  ]
}`}/>
  <Quiz question="What is the primary purpose of an Agent Card?" options={["To authenticate the agent","To describe capabilities for discovery by other agents","To store the agent's conversation history","To define the agent's pricing"]} correctIndex={1} explanation="Agent Cards enable discovery -- other agents can find and understand what capabilities are available, then decide whether to collaborate." onAnswer={()=>onComplete&&onComplete('agent-cards','quiz1')}/>
  <SeeItInRe3 text="Each Re\u00b3 orchestrator agent could publish an Agent Card describing their debate capabilities, allowing external AI systems to discover and collaborate with them." targetPage="agent-community" onNavigate={onNavigate}/>
</div>}

function TabTaskLifecycle({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Task Lifecycle</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>When one agent delegates work to another, the task goes through a defined lifecycle. This ensures both agents understand the current state and can handle failures gracefully.</p>
  <MessageSimulator title="A2A Task Flow" messages={[
    {role:'user',label:'1. Submitted',text:'Agent A sends a task to Agent B: "Research recent AI governance frameworks and summarize the top 3."'},
    {role:'ai',label:'2. Working',text:'Agent B acknowledges the task and begins working. It can send progress updates: "Found 7 frameworks, analyzing..."'},
    {role:'ai',label:'3. Artifact Created',text:'Agent B produces an artifact (partial result): a draft summary of the first framework for early feedback.'},
    {role:'ai',label:'4. Completed',text:'Agent B finishes the task and returns the final result: a structured summary of the top 3 AI governance frameworks.'},
  ]}/>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>State</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Meaning</th></tr></thead>
      <tbody>
        {[['submitted','Task sent, waiting for agent to pick it up'],['working','Agent is actively processing'],['input-needed','Agent needs more info from the requester'],['completed','Task finished successfully'],['failed','Task could not be completed'],['canceled','Task was canceled by the requester']].map(([s,m],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-mono font-medium" style={{color:GIM.primary}}>{s}</td><td className="p-3" style={{color:GIM.bodyText}}>{m}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="An agent needs more information to complete a task. What state should it transition to?" options={["failed","working","input-needed","canceled"]} correctIndex={2} explanation="The 'input-needed' state signals that the agent requires additional information from the requester before it can continue. This enables interactive collaboration." onAnswer={()=>onComplete&&onComplete('task-lifecycle','quiz1')}/>
</div>}

function TabA2APlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your A2A knowledge!</p>
  <ExpandableSection title="Exercise 1: MCP vs A2A" icon={'\uD83E\uDD14'} defaultOpen={true}>
    <Quiz question="An AI assistant needs to delegate a complex research task to a specialized research agent. Which protocol?" options={["MCP -- all AI communication uses MCP","A2A -- it's agent-to-agent delegation","HTTP REST API","WebSocket"]} correctIndex={1} explanation="Delegating a task to another agent is exactly what A2A is designed for. MCP would be used if the agent needed to call a specific tool, not delegate to another intelligent agent." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Agent Card Design" icon={'\uD83D\uDCCB'}>
    <Quiz question="An Agent Card should NOT include:" options={["The agent's capabilities","How to contact the agent","The agent's internal implementation details","A description of what the agent does"]} correctIndex={2} explanation="Agent Cards describe WHAT an agent can do and HOW to reach it, but never expose internal implementation details. That's an abstraction boundary -- other agents only need to know the interface." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Architecture Design" icon={'\uD83C\uDFD7\uFE0F'}>
    <Quiz question="A system has 3 agents that need tools AND need to collaborate with each other. What protocols are needed?" options={["MCP only","A2A only","Both MCP (for tools) and A2A (for agent collaboration)","A custom proprietary protocol"]} correctIndex={2} explanation="MCP and A2A are complementary. MCP connects agents to tools and data sources. A2A connects agents to each other. A full system typically needs both." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 6 DEEP TABS ====================

function TabDeepA2AProtocol({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Protocol Deep Dive</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A2A uses <b>Agent Cards</b> for discovery and <b>JSON-RPC 2.0</b> for communication. Agent Cards are served at a well-known URL (<code>/.well-known/agent.json</code>), enabling automatic discovery. The protocol defines specific JSON-RPC methods for task management.</p>
  <CodeBlock language="json" label="Complete Agent Card Specification" code={`{
  "name": "Research Agent",
  "description": "Deep research and analysis on any topic",
  "url": "https://research-agent.example.com/a2a",
  "version": "1.2.0",
  "documentationUrl": "https://docs.example.com/research-agent",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "authentication": {
    "schemes": ["bearer"],
    "credentials": "OAuth 2.0 token from auth.example.com"
  },
  "defaultInputModes": ["text/plain", "application/json"],
  "defaultOutputModes": ["text/plain", "text/markdown"],
  "skills": [
    {
      "id": "deep-research",
      "name": "Deep Research",
      "description": "Comprehensive research with citations on any topic",
      "tags": ["research", "analysis", "citations"],
      "examples": [
        "Research the impact of remote work on productivity",
        "Analyze trends in renewable energy adoption"
      ]
    },
    {
      "id": "fact-check",
      "name": "Fact Checking",
      "description": "Verify claims against authoritative sources",
      "tags": ["verification", "fact-check", "accuracy"]
    }
  ]
}`}/>
  <CodeBlock language="json" label="A2A JSON-RPC Methods" code={`// Send a task to another agent
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "tasks/send",
  "params": {
    "id": "task-abc-123",
    "message": {
      "role": "user",
      "parts": [
        {"type": "text", "text": "Research the latest trends in AI governance frameworks. Provide a summary with citations."}
      ]
    }
  }
}

// Get task status and results
{
  "jsonrpc": "2.0",
  "id": "req-002",
  "method": "tasks/get",
  "params": {
    "id": "task-abc-123",
    "historyLength": 5
  }
}`}/>
  <Quiz question="Where does an A2A agent publish its Agent Card for discovery?" options={["In a central registry only","At /.well-known/agent.json on its host URL","Embedded in every JSON-RPC response","In DNS TXT records"]} correctIndex={1} explanation="The well-known URL convention (/.well-known/agent.json) enables automatic discovery. Any agent that knows another agent's host URL can fetch its capabilities without a central registry." onAnswer={()=>onComplete&&onComplete('deep-a2a-protocol','quiz1')}/>
  <Quiz question="A2A Agent Cards include 'skills' with 'examples'. Why are examples important?" options={["For documentation only","They help other agents understand when to delegate specific tasks to this agent","They are required by the specification","They serve as test cases"]} correctIndex={1} explanation="Examples help requesting agents make better routing decisions. When an orchestrator sees example tasks, it can better match incoming work to the right specialist agent." onAnswer={()=>onComplete&&onComplete('deep-a2a-protocol','quiz2')}/>
</div>}

function TabDeepA2ATaskLifecycle({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Task Lifecycle</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A2A tasks move through defined states. The protocol supports <b>streaming via SSE</b> for real-time progress updates, <b>push notifications</b> for long-running tasks, and <b>artifacts</b> for structured outputs.</p>
  <CodeBlock language="python" label="Task State Machine" code={`# A2A Task States and Transitions
#
# submitted --> working --> completed
#                 |    \\--> failed
#                 |    \\--> canceled
#                 \\--> input-needed --> working (after input received)
#
# Key rules:
# - Only the receiving agent can change state
# - 'input-needed' pauses work until the requester provides more info
# - 'canceled' can only be triggered by the requester
# - Artifacts can be attached at any state (partial results)

class TaskState:
    SUBMITTED = "submitted"
    WORKING = "working"
    INPUT_NEEDED = "input-needed"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"

VALID_TRANSITIONS = {
    TaskState.SUBMITTED: [TaskState.WORKING, TaskState.FAILED, TaskState.CANCELED],
    TaskState.WORKING: [TaskState.COMPLETED, TaskState.FAILED, TaskState.INPUT_NEEDED, TaskState.CANCELED],
    TaskState.INPUT_NEEDED: [TaskState.WORKING, TaskState.CANCELED],
    TaskState.COMPLETED: [],  # Terminal
    TaskState.FAILED: [],     # Terminal
    TaskState.CANCELED: [],   # Terminal
}`}/>
  <CodeBlock language="python" label="SSE Streaming for Task Progress" code={`import json
from starlette.responses import StreamingResponse

async def stream_task_updates(task_id: str):
    """Stream real-time task updates via SSE."""
    async def event_generator():
        task = await get_task(task_id)
        while task.state not in ("completed", "failed", "canceled"):
            # Send current state as SSE event
            event = {
                "id": task.id,
                "status": {"state": task.state, "message": task.status_message},
                "artifacts": [a.to_dict() for a in task.artifacts]
            }
            yield f"data: {json.dumps(event)}\\n\\n"
            await asyncio.sleep(1)
            task = await get_task(task_id)  # Refresh

        # Send final state
        yield f"data: {json.dumps(task.to_dict())}\\n\\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )`}/>
  <CodeBlock language="json" label="Artifact Structure" code={`{
  "id": "task-abc-123",
  "status": {"state": "completed"},
  "artifacts": [
    {
      "name": "research-report",
      "description": "Comprehensive research report with citations",
      "parts": [
        {
          "type": "text",
          "mimeType": "text/markdown",
          "text": "# AI Governance Trends 2025\\n\\n## Key Findings\\n..."
        }
      ]
    },
    {
      "name": "data-table",
      "description": "Supporting data in structured format",
      "parts": [
        {
          "type": "data",
          "mimeType": "application/json",
          "data": {"frameworks": [...], "adoption_rates": {...}}
        }
      ]
    }
  ]
}`}/>
  <Quiz question="An agent is processing a research task but realizes it needs to know the desired time range. What state should it transition to?" options={["failed -- it cannot complete without more info","completed -- return what it has so far","input-needed -- ask the requester for the time range","canceled -- start over"]} correctIndex={2} explanation="The 'input-needed' state is designed exactly for this. It pauses the task, signals the requester that additional information is needed, and waits for a follow-up message before resuming work." onAnswer={()=>onComplete&&onComplete('deep-a2a-task','quiz1')}/>
  <ArchitectureDecision scenario="An agent task will take approximately 30 minutes to complete (e.g., deep research with multiple source verification). How should the requesting agent get results?" options={[
    {label:'Poll the tasks/get endpoint every 5 seconds',tradeoff:'Simple but wasteful. 360 requests over 30 minutes, most returning no change'},
    {label:'Use SSE streaming to receive real-time updates',tradeoff:'Efficient for medium waits, but requires maintaining an open HTTP connection for 30 minutes'},
    {label:'Use push notifications -- agent notifies when done',tradeoff:'Most efficient for long tasks. No polling, no persistent connection. Agent POSTs to a callback URL when state changes'},
  ]} correctIndex={2} explanation="Push notifications are ideal for long-running tasks. The requesting agent provides a callback URL, and the working agent POSTs status updates when state changes. This eliminates polling waste and does not require long-lived connections." onAnswer={()=>onComplete&&onComplete('deep-a2a-task','quiz2')}/>
</div>}

function TabDeepA2AMultiAgent({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Multi-Agent Workflows</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A2A enables sophisticated multi-agent patterns where an <b>orchestrator agent</b> coordinates work across specialist agents. Each pattern has different trade-offs for latency, reliability, and complexity.</p>
  <ComparisonTable title="A2A Orchestration Patterns" columns={['Pattern','Flow','Best For','Complexity']} rows={[
    ['Sequential Pipeline','A -> B -> C -> D','Ordered processing, each step depends on previous','Low'],
    ['Parallel Fan-Out','A -> [B, C, D] -> A','Independent subtasks that can run simultaneously','Medium'],
    ['Hierarchical Delegation','A -> B -> [C, D]; A -> E','Nested delegation with sub-orchestrators','High'],
    ['Competitive','A -> [B, C] -> pick best','Multiple agents solve same problem, best answer wins','Medium'],
  ]}/>
  <CodeBlock language="python" label="Parallel Fan-Out Orchestrator" code={`import asyncio

class OrchestratorAgent:
    """Orchestrator that delegates subtasks to specialist agents."""

    def __init__(self):
        self.specialists = {}  # name -> agent_card

    async def discover_agents(self, urls: list[str]):
        """Discover specialist agents from their well-known URLs."""
        for url in urls:
            card = await fetch_agent_card(url)
            self.specialists[card["name"]] = card

    async def research_topic(self, topic: str) -> dict:
        """Fan-out research across multiple specialist agents."""
        # 1. Select relevant specialists
        relevant = self.select_specialists(topic)

        # 2. Create tasks in parallel
        tasks = []
        for agent in relevant:
            task = asyncio.create_task(
                self.delegate_task(agent, f"Research '{topic}' from your specialty area")
            )
            tasks.append((agent["name"], task))

        # 3. Gather all results (with timeout per agent)
        results = {}
        for name, task in tasks:
            try:
                result = await asyncio.wait_for(task, timeout=120)
                results[name] = {"status": "completed", "data": result}
            except asyncio.TimeoutError:
                results[name] = {"status": "timeout"}
            except Exception as e:
                results[name] = {"status": "error", "error": str(e)}

        # 4. Synthesize results from all specialists
        return await self.synthesize(topic, results)

    async def delegate_task(self, agent_card: dict, message: str) -> dict:
        """Send a task to an agent and wait for completion."""
        response = await a2a_client.send_task(
            agent_url=agent_card["url"],
            message={"role": "user", "parts": [{"type": "text", "text": message}]}
        )
        # Poll or stream until complete
        return await a2a_client.wait_for_completion(response["id"])`}/>
  <Quiz question="In a fan-out pattern, Agent A delegates to Agents B, C, and D in parallel. Agent C fails. What should Agent A do?" options={["Fail the entire task","Return results from B and D only, noting C's failure","Retry C indefinitely","Wait for C to recover"]} correctIndex={1} explanation="Graceful degradation is key. The orchestrator should collect successful results from B and D, note that C failed, and present a partial but useful result. The requester can decide whether to retry." onAnswer={()=>onComplete&&onComplete('deep-a2a-multi','quiz1')}/>
</div>}

function TabDeepA2AvsMCP({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>A2A vs MCP</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A2A and MCP are <b>complementary protocols</b> that solve different problems. Understanding when to use each -- and when to use both together -- is essential for building real agent systems.</p>
  <ComparisonTable title="Detailed A2A vs MCP Comparison" columns={['Dimension','MCP','A2A']} rows={[
    ['Primary purpose','Connect AI to tools and data','Connect AI agents to each other'],
    ['Communication','Structured tool calls (name + args)','Natural language task delegation'],
    ['Discovery','Server exposes tool list via tools/list','Agent Cards at /.well-known/agent.json'],
    ['State model','Stateless (request-response)','Stateful (task lifecycle with transitions)'],
    ['Streaming','Resource subscriptions','SSE for task progress + push notifications'],
    ['Auth model','Server authenticates client','Mutual authentication between peers'],
    ['Error handling','Tool returns error in result','Task transitions to failed state'],
    ['Typical latency','Milliseconds to seconds','Seconds to hours (long-running tasks)'],
  ]}/>
  <CodeBlock language="python" label="Bridging MCP and A2A" code={`# An A2A agent that uses MCP tools internally
class HybridAgent:
    """Agent that accepts A2A tasks and uses MCP tools to fulfill them."""

    def __init__(self):
        self.mcp_manager = MCPManager()  # MCP client
        self.task_store = TaskStore()     # A2A task state

    async def setup(self):
        # Connect to MCP servers for tool access
        await self.mcp_manager.connect("github", "npx", ["-y", "@mcp/server-github"])
        await self.mcp_manager.connect("db", "npx", ["-y", "@mcp/server-postgres"])

    async def handle_a2a_task(self, task_request: dict) -> dict:
        """Handle an incoming A2A task using MCP tools."""
        task_id = task_request["id"]
        message = task_request["message"]["parts"][0]["text"]

        # Update state: working
        await self.task_store.update(task_id, state="working")

        # Use MCP tools to fulfill the A2A task
        try:
            # 1. Search for relevant data (MCP tool call)
            search_results = await self.mcp_manager.call_tool(
                "search_issues", {"query": message, "limit": 10}
            )

            # 2. Get additional context (MCP resource)
            repo_info = await self.mcp_manager.read_resource("github://repo/info")

            # 3. Generate response using LLM with MCP context
            response = await llm.generate(
                context=[search_results, repo_info],
                task=message
            )

            # Update state: completed with artifact
            await self.task_store.update(task_id,
                state="completed",
                artifacts=[{"name": "result", "parts": [{"type": "text", "text": response}]}]
            )
        except Exception as e:
            await self.task_store.update(task_id, state="failed", error=str(e))`}/>
  <ArchitectureDecision scenario="You are building a system where a user asks a question, and the system should: (1) search a database, (2) fetch relevant documents, and (3) ask a specialist AI agent to analyze the combined data. Which protocol(s) do you use?" options={[
    {label:'All MCP -- treat the specialist agent as just another tool',tradeoff:'Simpler architecture, but treating an intelligent agent as a tool limits its autonomy and cannot handle long-running analysis'},
    {label:'All A2A -- let agents handle everything including data access',tradeoff:'Clean agent boundaries, but A2A is inefficient for simple tool operations like database queries'},
    {label:'MCP for data access (steps 1-2), A2A for agent delegation (step 3)',tradeoff:'Each protocol used for its strength. MCP handles structured tool calls. A2A handles intelligent agent delegation with state tracking'},
  ]} correctIndex={2} explanation="Use the right protocol for the right job. Database queries and document fetching are structured tool operations (MCP). Delegating analysis to a specialist agent that needs to reason, potentially ask clarifying questions, and produce structured artifacts is agent-to-agent work (A2A)." onAnswer={()=>onComplete&&onComplete('deep-a2a-vs-mcp','quiz1')}/>
</div>}

function TabDeepA2ABuild({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building A2A Agents</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building an A2A-compliant agent requires: (1) an Agent Card endpoint for discovery, (2) JSON-RPC handlers for task management, and (3) task state persistence.</p>
  <CodeBlock language="python" label="Complete A2A Agent Server (Python)" code={`from starlette.applications import Starlette
from starlette.routing import Route
from starlette.requests import Request
from starlette.responses import JSONResponse
import json, uuid

# Agent Card served at /.well-known/agent.json
AGENT_CARD = {
    "name": "Analysis Agent",
    "description": "Performs data analysis and generates reports",
    "url": "https://analysis.example.com/a2a",
    "capabilities": {"streaming": True, "pushNotifications": False},
    "skills": [
        {"id": "analyze", "name": "Data Analysis", "description": "Analyze datasets and produce insights"}
    ]
}

# In-memory task store (use Redis/DB in production)
tasks = {}

async def agent_card(request: Request):
    return JSONResponse(AGENT_CARD)

async def handle_jsonrpc(request: Request):
    body = await request.json()
    method = body.get("method")
    params = body.get("params", {})
    req_id = body.get("id")

    if method == "tasks/send":
        task_id = params.get("id", str(uuid.uuid4()))
        tasks[task_id] = {
            "id": task_id,
            "status": {"state": "submitted"},
            "history": [params["message"]],
            "artifacts": []
        }
        # Process async (don't block the response)
        import asyncio
        asyncio.create_task(process_task(task_id, params["message"]))
        return JSONResponse({"jsonrpc": "2.0", "id": req_id, "result": tasks[task_id]})

    elif method == "tasks/get":
        task = tasks.get(params["id"])
        if not task:
            return JSONResponse({"jsonrpc": "2.0", "id": req_id,
                "error": {"code": -32001, "message": "Task not found"}})
        return JSONResponse({"jsonrpc": "2.0", "id": req_id, "result": task})

    return JSONResponse({"jsonrpc": "2.0", "id": req_id,
        "error": {"code": -32601, "message": "Method not found"}})

async def process_task(task_id: str, message: dict):
    """Background task processing."""
    tasks[task_id]["status"] = {"state": "working", "message": "Analyzing data..."}
    try:
        result = await run_analysis(message["parts"][0]["text"])
        tasks[task_id]["artifacts"] = [
            {"name": "report", "parts": [{"type": "text", "text": result}]}
        ]
        tasks[task_id]["status"] = {"state": "completed"}
    except Exception as e:
        tasks[task_id]["status"] = {"state": "failed", "message": str(e)}

app = Starlette(routes=[
    Route("/.well-known/agent.json", agent_card),
    Route("/a2a", handle_jsonrpc, methods=["POST"]),
])`}/>
  <Quiz question="Why does the tasks/send handler return immediately and process the task asynchronously?" options={["To avoid timeout issues","Because A2A tasks can take a long time; the requester should not block waiting for completion","For better code organization","The spec requires it"]} correctIndex={1} explanation="A2A tasks can take seconds to hours. Returning immediately with the task ID lets the requester poll for status or receive push notifications, rather than keeping an HTTP connection open indefinitely." onAnswer={()=>onComplete&&onComplete('deep-a2a-build','quiz1')}/>
  <Quiz question="In the agent above, what happens if two tasks/send requests arrive with the same task ID?" options={["The second request creates a duplicate task","The second request overwrites the first task's data","It depends on the implementation -- you should handle this case","The server crashes"]} correctIndex={2} explanation="The A2A spec does not mandate behavior for duplicate task IDs. Production implementations should handle this -- either reject duplicates, continue the existing task, or use server-generated IDs to prevent collisions." onAnswer={()=>onComplete&&onComplete('deep-a2a-build','quiz2')}/>
</div>}

function TabDeepA2AEnterprise({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Enterprise Patterns</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Enterprise A2A deployments require authentication, comprehensive audit trails, compliance controls, and multi-tenant isolation. These patterns ensure A2A systems meet enterprise security and governance requirements.</p>
  <CodeBlock language="python" label="Audit Trail for A2A Tasks" code={`import datetime, json

class AuditLogger:
    """Comprehensive audit logging for A2A task operations."""

    async def log_event(self, event_type: str, task_id: str, details: dict):
        entry = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "event_type": event_type,
            "task_id": task_id,
            "agent_id": self.agent_id,
            **details
        }
        await self.store.append(entry)
        return entry

# Usage in task handler:
audit = AuditLogger()

async def handle_task(task_id, message, requester_info):
    await audit.log_event("task_received", task_id, {
        "requester": requester_info["agent_name"],
        "requester_ip": requester_info["ip"],
        "skill_requested": message.get("skill"),
        "input_size_bytes": len(json.dumps(message)),
    })

    # Process task...
    result = await process(message)

    await audit.log_event("task_completed", task_id, {
        "output_size_bytes": len(json.dumps(result)),
        "processing_time_ms": elapsed_ms,
        "tools_used": tools_called,
        "tokens_consumed": token_count,
    })`}/>
  <ComparisonTable title="Enterprise A2A Security Layers" columns={['Layer','Implementation','Purpose']} rows={[
    ['Transport','mTLS between agents','Encrypt and authenticate all agent communication'],
    ['Identity','OAuth 2.0 + JWT tokens','Verify agent identity and authorization scopes'],
    ['Input validation','JSON Schema validation on all messages','Prevent injection and malformed data'],
    ['Rate limiting','Per-agent quotas with sliding windows','Prevent abuse and ensure fair resource sharing'],
    ['Audit','Immutable log of all task operations','Compliance, debugging, and forensics'],
    ['Data isolation','Tenant-scoped task stores','Multi-tenant data separation'],
  ]}/>
  <Quiz question="Why is mTLS (mutual TLS) recommended for A2A agent communication instead of regular TLS?" options={["mTLS is faster","mTLS verifies BOTH sides of the connection, not just the server","mTLS uses stronger encryption","Regular TLS does not work with JSON-RPC"]} correctIndex={1} explanation="Regular TLS only verifies the server's identity. mTLS ensures both the client agent and server agent prove their identity with certificates. This prevents unauthorized agents from impersonating legitimate ones." onAnswer={()=>onComplete&&onComplete('deep-a2a-enterprise','quiz1')}/>
</div>}

function TabDeepA2APlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Design and evaluate multi-agent systems using A2A.</p>
  <ExpandableSection title="Exercise 1: Multi-Agent System Design" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <p className="mb-3" style={{fontSize:13,color:GIM.bodyText}}>A company wants to build an automated customer support system with: a triage agent (classifies tickets), a technical support agent, a billing support agent, and an escalation agent (routes to human).</p>
    <ArchitectureDecision scenario="How should these 4 agents communicate?" options={[
      {label:'All agents talk directly to each other (fully connected mesh)',tradeoff:'Maximum flexibility but O(n^2) connections. Adding a new agent requires updating all others'},
      {label:'Triage agent acts as orchestrator, delegates to specialists',tradeoff:'Clean hierarchy. Triage routes to the right specialist. Specialists only need to handle their domain. Easy to add new specialists'},
      {label:'Message queue between all agents',tradeoff:'Decoupled but adds infrastructure complexity. Harder to track task state across agents'},
    ]} correctIndex={1} explanation="The triage agent is a natural orchestrator. It classifies the ticket and delegates to the appropriate specialist via A2A. Specialists focus on their domain and return results to the triage agent, which manages the customer interaction." onAnswer={()=>onComplete&&onComplete('deep-a2a-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Protocol Selection" icon={'\uD83E\uDD14'}>
    <Quiz question="A coding assistant needs to: (1) read files from disk, (2) run tests, (3) ask a code review agent for feedback. Which protocols?" options={["MCP for everything","A2A for everything","MCP for file access and test running, A2A for the code review agent","REST APIs for everything"]} correctIndex={2} explanation="File access and test running are deterministic tool operations (MCP). Code review requires intelligent analysis, may involve back-and-forth, and produces structured feedback -- this is agent-to-agent work (A2A)." onAnswer={()=>onComplete&&onComplete('deep-a2a-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Failure Handling" icon={'\u26A0\uFE0F'}>
    <Quiz question="An orchestrator delegates a task to Agent B, which crashes mid-processing. The task state in the orchestrator's records is still 'working'. How should the system handle this?" options={["Assume it will eventually complete","Implement a heartbeat/timeout mechanism that transitions stale 'working' tasks to 'failed'","Delete the task record","Send the task to a different agent immediately"]} correctIndex={1} explanation="A heartbeat or timeout mechanism detects stale tasks. If Agent B does not provide updates within a configurable window, the orchestrator marks the task as failed and can optionally retry with a different agent." onAnswer={()=>onComplete&&onComplete('deep-a2a-playground','quiz3')}/>
  </ExpandableSection>
</div>}

export function CourseA2A({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[
    {id:'why-a2a',label:'Why A2A',icon:'\uD83E\uDD1D'},
    {id:'agent-cards',label:'Agent Cards',icon:'\uD83D\uDCCB'},
    {id:'task-lifecycle',label:'Task Lifecycle',icon:'\uD83D\uDD04'},
    {id:'a2a-playground',label:'Playground',icon:'\uD83C\uDFAE'},
  ];
  const deepTabs=[
    {id:'deep-a2a-protocol',label:'Protocol Deep Dive',icon:'\uD83D\uDCE1'},
    {id:'deep-a2a-task',label:'Task Lifecycle',icon:'\uD83D\uDD04'},
    {id:'deep-a2a-multi',label:'Multi-Agent Workflows',icon:'\uD83E\uDD16'},
    {id:'deep-a2a-vs-mcp',label:'A2A vs MCP',icon:'\u2696\uFE0F'},
    {id:'deep-a2a-build',label:'Building A2A Agents',icon:'\uD83D\uDCBB'},
    {id:'deep-a2a-enterprise',label:'Enterprise Patterns',icon:'\uD83C\uDFE2'},
    {id:'deep-a2a-playground',label:'Deep Playground',icon:'\uD83C\uDFAE'},
  ];
  return <CourseShell
    id="a2a-protocol"
    progress={progress}
    onBack={onBack}
    onNavigate={onNavigate}
    onComplete={onComplete}
    depth={depth}
    onChangeDepth={onChangeDepth}
    visionaryTabs={visionaryTabs}
    deepTabs={deepTabs}
    renderTab={(tab,i,d)=>{
      if(d==='deep'){
        if(i===0) return <TabDeepA2AProtocol onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===1) return <TabDeepA2ATaskLifecycle onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===2) return <TabDeepA2AMultiAgent onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===3) return <TabDeepA2AvsMCP onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===4) return <TabDeepA2ABuild onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===5) return <TabDeepA2AEnterprise onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===6) return <TabDeepA2APlayground onNavigate={onNavigate} onComplete={onComplete}/>;
      }
      if(i===0) return <TabWhyA2A onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1) return <TabAgentCards onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2) return <TabTaskLifecycle onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3) return <TabA2APlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }}
  />;
}

// ==================== COURSE 7: FUNCTION CALLING ====================

function TabWhatFC({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is Function Calling?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Function calling lets an LLM <b>decide when to use external tools</b> and generate the structured arguments needed to call them. The LLM doesn't execute the function directly -- it outputs a JSON request that your code then executes.</p>
  <AnalogyBox emoji={'\uD83C\uDF7D\uFE0F'} title="Think of it like a restaurant waiter">The waiter (LLM) takes your order and decides which kitchen station (function) should prepare it. The waiter doesn't cook -- they route the request to the right place with the right instructions.</AnalogyBox>
  <MessageSimulator title="Function Calling Flow" messages={[
    {role:'user',label:'1. User Message',text:'"What\'s the weather in San Francisco?"'},
    {role:'ai',label:'2. LLM Decides to Call',text:'LLM recognizes it needs weather data and generates: tool_call: get_weather(city="San Francisco")'},
    {role:'system',label:'3. Your Code Executes',text:'Your application calls the actual weather API and gets: {"temp": 62, "condition": "foggy"}'},
    {role:'ai',label:'4. LLM Final Response',text:'"It\'s currently 62\u00b0F and foggy in San Francisco. Typical for the city!"'},
  ]}/>
  <Quiz question="In function calling, who actually executes the function?" options={["The LLM executes it directly","Your application code executes it","The cloud provider executes it","The user executes it"]} correctIndex={1} explanation="The LLM only generates the function call request (name + arguments). Your application code receives this, executes the actual function, and sends the result back to the LLM." onAnswer={()=>onComplete&&onComplete('what-fc','quiz1')}/>
</div>}

function TabToolDefs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tool Definitions (JSON Schema)</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>To use function calling, you define your tools using <b>JSON Schema</b>. The schema tells the LLM what functions are available, what parameters they accept, and what each parameter means.</p>
  <CodeBlock language="json" label="OpenAI Tool Definition Format" code={`{
  "type": "function",
  "function": {
    "name": "search_products",
    "description": "Search the product catalog by query",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query text"
        },
        "category": {
          "type": "string",
          "enum": ["electronics", "clothing", "food"],
          "description": "Product category filter"
        },
        "max_price": {
          "type": "number",
          "description": "Maximum price in USD"
        }
      },
      "required": ["query"]
    }
  }
}`}/>
  <Quiz question="What does the 'enum' field in a parameter definition do?" options={["Makes the parameter required","Limits the parameter to specific allowed values","Sets a default value","Marks the parameter as optional"]} correctIndex={1} explanation="'enum' constrains the parameter to a fixed list of allowed values. The LLM will only generate values from this list, preventing invalid inputs." onAnswer={()=>onComplete&&onComplete('tool-defs','quiz1')}/>
  <Quiz question="A good tool description should:" options={["Be as short as possible","Describe exactly when to use the tool and what it returns","Include the implementation code","List all possible errors"]} correctIndex={1} explanation="The description is the primary way the LLM decides WHEN to call the tool. A clear description of the tool's purpose and return value helps the LLM make better routing decisions." onAnswer={()=>onComplete&&onComplete('tool-defs','quiz2')}/>
</div>}

function TabMultiProvider({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Multi-Provider Patterns</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Different LLM providers implement function calling slightly differently. Re\u00b3 handles this with a unified <b>LLM Router</b> that translates between formats.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Provider</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Format Name</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Key Difference</th></tr></thead>
      <tbody>
        {[['OpenAI','tools / tool_choice','Supports parallel tool calls'],['Anthropic','tool_use (content block)','Tools are content blocks in response'],['Google Gemini','functionDeclarations','Uses Google-specific schema format'],['Groq (LLaMA)','OpenAI-compatible','Same format as OpenAI']].map(([p,f,d],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{p}</td><td className="p-3 font-mono" style={{color:GIM.primary,fontSize:12}}>{f}</td><td className="p-3" style={{color:GIM.mutedText}}>{d}</td></tr>)}
      </tbody>
    </table>
  </div>
  <ExpandableSection title="How Re\u00b3's LLM Router handles this" icon={'\uD83D\uDD00'}>
    <p className="mb-3">Re\u00b3's <code>llm-router.js</code> provides a uniform <code>callLLM()</code> interface that abstracts away provider differences:</p>
    <p className="mb-2">{'\u2022'} Accepts a standard tool definition format</p>
    <p className="mb-2">{'\u2022'} Translates to each provider's native format</p>
    <p className="mb-2">{'\u2022'} Normalizes responses back to a common format</p>
    <p className="mb-2">{'\u2022'} Falls back to Anthropic if a provider fails</p>
    <p className="mt-3">This means debate agents can use any LLM provider without changing their tool definitions.</p>
  </ExpandableSection>
  <Quiz question="Why would you build a multi-provider LLM router?" options={["To use the cheapest model available","For redundancy, cost optimization, and provider-specific strengths","Because one provider isn't enough","To confuse the AI"]} correctIndex={1} explanation="A multi-provider router gives you: failover if one provider is down, cost optimization by routing simple tasks to cheaper models, and the ability to use each provider's strengths." onAnswer={()=>onComplete&&onComplete('multi-provider','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's LLM Router in lib/llm-router.js implements exactly this pattern -- routing debates across Anthropic, OpenAI, Gemini, and Groq with automatic fallback." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabFCPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your function calling knowledge!</p>
  <ExpandableSection title="Exercise 1: Tool Design" icon={'\uD83D\uDD27'} defaultOpen={true}>
    <Quiz question="You're designing a 'send_email' tool. Which parameter should be required?" options={["subject","cc_list","to_address","signature"]} correctIndex={2} explanation="'to_address' is the only parameter that MUST be provided -- you can't send an email without a recipient. Subject, CC, and signature can have defaults or be optional." onAnswer={()=>onComplete&&onComplete('fc-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Flow Understanding" icon={'\uD83D\uDD04'}>
    <Quiz question="The LLM generates a tool call but the function returns an error. What should happen next?" options={["Crash the application","Send the error back to the LLM so it can handle it gracefully","Ignore the error and continue","Retry the same call 10 times"]} correctIndex={1} explanation="Send the error back to the LLM as a tool result. The LLM can then decide how to handle it -- retry with different parameters, try a different approach, or explain the issue to the user." onAnswer={()=>onComplete&&onComplete('fc-playground','quiz2')}/>
  </ExpandableSection>
</div>}

function TabDeepToolSchema({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tool Schema Design</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>JSON Schema is the foundation of every tool definition. A well-designed schema tells the LLM exactly what parameters are available, their types, constraints, and when they are required. Poor schema design leads to hallucinated parameters, wrong types, and failed tool calls.</p>
  <CodeBlock language="json" label="Advanced Tool Schema with Nested Objects" code={`{
  "name": "search_database",
  "description": "Search a structured database with filters and sorting.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Free-text search query" },
      "filters": {
        "type": "object",
        "properties": {
          "status": { "type": "string", "enum": ["active", "archived", "draft"] },
          "created_after": { "type": "string", "format": "date" },
          "tags": { "type": "array", "items": { "type": "string" } }
        }
      },
      "sort": {
        "type": "object",
        "properties": {
          "field": { "type": "string", "enum": ["created_at", "updated_at", "relevance"] },
          "order": { "type": "string", "enum": ["asc", "desc"], "default": "desc" }
        }
      },
      "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 20 }
    },
    "required": ["query"]
  }
}`}/>
  <ExpandableSection title="Schema Design Best Practices" icon={"📋"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>1. <b>Descriptive names</b>: Use verb_noun format (search_database, get_weather). The LLM uses the name to decide when to call the tool.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>2. <b>Rich descriptions</b>: Tell the LLM when to use the tool, not just what it does.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>3. <b>Use enums</b>: Constrain string parameters to valid values to eliminate hallucinated values.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>4. <b>Defaults</b>: Provide sensible defaults so the LLM does not have to specify every parameter.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>5. <b>Minimal required fields</b>: Only mark truly essential parameters as required.</p>
  </ExpandableSection>
  <Quiz question="Why are enum constraints in tool schemas important?" options={["They make the schema longer","They prevent the LLM from hallucinating invalid parameter values","They are required by JSON Schema spec","They improve response speed"]} correctIndex={1} explanation="Enums restrict parameters to a known set of valid values. Without them, the LLM might generate invalid values." onAnswer={()=>onComplete&&onComplete("deep-tool-schema","quiz1")}/>
</div>}

function TabDeepMultiProvider({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Multi-Provider Function Calling</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>OpenAI, Anthropic, and Google each implement function calling differently. Building a unified abstraction is essential for production systems that need provider flexibility or fallback.</p>
  <ComparisonTable title="Provider API Differences" columns={["Aspect","OpenAI","Anthropic","Google Gemini"]} rows={[
    ["Schema field","functions / tools","tools","function_declarations"],
    ["Call format","tool_calls[].function","content[].type=tool_use","functionCall"],
    ["Result format","tool message with tool_call_id","tool_result content block","functionResponse"],
    ["Parallel calls","Native support","Native support","Supported"],
    ["Streaming","Delta chunks","Event stream","SSE stream"],
  ]}/>
  <CodeBlock language="javascript" label="Unified Tool Calling Abstraction" code={`class ToolRouter {
  constructor(tools) {
    this.tools = tools;
  }

  formatForProvider(provider) {
    return this.tools.map(tool => {
      if (provider === "openai") return {
        type: "function",
        function: { name: tool.name, description: tool.description, parameters: tool.schema }
      };
      if (provider === "anthropic") return {
        name: tool.name, description: tool.description, input_schema: tool.schema
      };
      if (provider === "gemini") return {
        name: tool.name, description: tool.description, parameters: tool.schema
      };
    });
  }

  extractCalls(provider, response) {
    if (provider === "openai")
      return (response.choices[0].message.tool_calls || []).map(tc => ({
        id: tc.id, name: tc.function.name, args: JSON.parse(tc.function.arguments)
      }));
    if (provider === "anthropic")
      return response.content.filter(b => b.type === "tool_use")
        .map(b => ({ id: b.id, name: b.name, args: b.input }));
    if (provider === "gemini")
      return response.candidates[0].content.parts
        .filter(p => p.functionCall)
        .map(p => ({ id: p.functionCall.name, name: p.functionCall.name, args: p.functionCall.args }));
    return [];
  }
}`}/>
  <Quiz question="What is the main challenge of multi-provider function calling?" options={["Different pricing","Each provider has different schema formats and response structures","Some providers are faster","They use different languages"]} correctIndex={1} explanation="Each provider wraps tool definitions and tool call responses in different JSON structures. A unified abstraction normalizes these differences." onAnswer={()=>onComplete&&onComplete("deep-multi-provider","quiz1")}/>
  <SeeItInRe3 text="Re³'s lib/llm-router.js implements this pattern, routing tool calls across Anthropic, OpenAI, Gemini, and Groq with automatic fallback." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabDeepParallelTools({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Parallel & Sequential Tool Execution</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Modern LLMs can request multiple tool calls in a single response. Understanding when to execute them in parallel versus sequentially is critical for performance and correctness.</p>
  <ExpandableSection title="Parallel Execution" icon={"⚡"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>When the LLM requests multiple independent tool calls (e.g., fetching weather for 3 cities), execute them all simultaneously using Promise.all. This dramatically reduces latency.</p>
  </ExpandableSection>
  <ExpandableSection title="Sequential Chaining" icon={"🔗"}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>Some tool calls depend on results of previous calls. For example: search for a user, then fetch their orders. The LLM naturally handles this by issuing one call, receiving results, then issuing the next.</p>
  </ExpandableSection>
  <CodeBlock language="javascript" label="Parallel Tool Execution Engine" code={`async function executeToolCalls(toolCalls, registry) {
  // Check for dependencies between calls
  const independent = toolCalls.every(
    (call, i) => !toolCalls.slice(0, i).some(
      prev => JSON.stringify(call.args).includes(prev.name)
    )
  );

  if (independent) {
    // Execute all in parallel
    return await Promise.all(
      toolCalls.map(async (call) => {
        const tool = registry[call.name];
        if (!tool) return { id: call.id, error: "Unknown tool" };
        try {
          return { id: call.id, result: await tool.handler(call.args) };
        } catch (err) {
          return { id: call.id, error: err.message };
        }
      })
    );
  }

  // Sequential for dependent calls
  const results = [];
  for (const call of toolCalls) {
    try {
      results.push({ id: call.id, result: await registry[call.name].handler(call.args) });
    } catch (err) {
      results.push({ id: call.id, error: err.message });
    }
  }
  return results;
}`}/>
  <CodeBlock language="javascript" label="Tool-Use Loop Pattern" code={`async function agentLoop(messages, tools, maxIter = 10) {
  for (let i = 0; i < maxIter; i++) {
    const response = await callLLM(messages, tools);
    const calls = extractToolCalls(response);
    if (calls.length === 0) return response;

    const results = await executeToolCalls(calls, tools);
    messages.push({ role: "assistant", content: response });
    for (const r of results) {
      messages.push({ role: "tool", tool_call_id: r.id, content: JSON.stringify(r.result || r.error) });
    }
  }
  throw new Error("Max iterations reached");
}`}/>
  <Quiz question="When should you execute tool calls in parallel?" options={["Always","Only when calls are independent of each other","Never","Only with exactly 2 calls"]} correctIndex={1} explanation="Parallel execution is safe when tool calls are independent -- no call depends on the result of another." onAnswer={()=>onComplete&&onComplete("deep-parallel","quiz1")}/>
</div>}

function TabDeepErrorHandling({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Error Handling & Graceful Degradation</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Tool calls fail. APIs time out, parameters are invalid, permissions are denied. The key principle: <b>always return errors to the LLM</b> rather than crashing. The LLM can often recover by trying a different approach or explaining the issue to the user.</p>
  <CodeBlock language="javascript" label="Robust Error Handling Pattern" code={`class ToolExecutor {
  constructor(opts = {}) {
    this.maxRetries = opts.maxRetries || 2;
    this.timeout = opts.timeout || 30000;
  }

  async execute(tool, args) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Validate args against schema first
        const validation = this.validateArgs(tool.schema, args);
        if (!validation.valid) {
          return { error: true, message: "Invalid parameters: " + validation.errors.join(", ") };
        }

        // Execute with timeout
        const result = await Promise.race([
          tool.handler(args),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), this.timeout)
          ),
        ]);
        return { success: true, data: result };

      } catch (err) {
        if (attempt < this.maxRetries && this.isRetryable(err)) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        return {
          error: true, code: err.code || "UNKNOWN",
          message: err.message, retried: attempt > 0,
        };
      }
    }
  }

  isRetryable(err) {
    return ["ETIMEDOUT", "ECONNRESET", "RATE_LIMITED"].includes(err.code)
      || (err.status >= 500 && err.status < 600);
  }
}`}/>
  <ExpandableSection title="User Confirmation Pattern" icon={"✅"}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>For destructive operations (delete, send, publish), implement a confirmation step. The tool returns a preview, the LLM shows the user, and only proceeds after explicit confirmation.</p>
  </ExpandableSection>
  <Quiz question="When a tool call fails, what is the best practice?" options={["Crash immediately","Silently ignore the error","Return a structured error to the LLM so it can decide what to do","Retry indefinitely"]} correctIndex={2} explanation="Returning structured errors lets the LLM decide the best recovery strategy -- retry, try a fallback, or explain to the user." onAnswer={()=>onComplete&&onComplete("deep-errors","quiz1")}/>
</div>}

function TabDeepProdTools({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Production Tool System</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A production tool system goes beyond basic function calling. It includes logging, cost tracking, rate limiting, caching, and monitoring.</p>
  <CodeBlock language="javascript" label="Production Tool Registry" code={`class ProductionToolRegistry {
  constructor(config = {}) {
    this.tools = new Map();
    this.metrics = { calls: 0, errors: 0, totalLatency: 0 };
    this.cache = new Map();
  }

  register(tool) {
    if (!tool.name || !tool.handler || !tool.schema)
      throw new Error("Tool must have name, handler, and schema");
    this.tools.set(tool.name, { ...tool, callCount: 0, errorCount: 0, avgLatency: 0 });
  }

  async call(name, args, context = {}) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error("Unknown tool: " + name);

    // Cache check for idempotent tools
    const cacheKey = name + ":" + JSON.stringify(args);
    if (tool.cacheable && this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const start = Date.now();
    this.metrics.calls++;
    tool.callCount++;

    try {
      const result = await tool.handler(args, context);
      const latency = Date.now() - start;
      this.metrics.totalLatency += latency;
      tool.avgLatency = (tool.avgLatency + latency) / 2;

      if (tool.cacheable) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), 300000);
      }
      return result;
    } catch (err) {
      this.metrics.errors++;
      tool.errorCount++;
      throw err;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.calls ? this.metrics.totalLatency / this.metrics.calls : 0,
      errorRate: this.metrics.calls ? this.metrics.errors / this.metrics.calls : 0,
      tools: Array.from(this.tools.values()).map(t => ({
        name: t.name, calls: t.callCount, errors: t.errorCount, avgLatency: Math.round(t.avgLatency)
      }))
    };
  }
}`}/>
  <Quiz question="Why is caching important in a production tool system?" options={["To reduce code complexity","To avoid redundant API calls, saving latency and cost","Caching is not important","To prevent all errors"]} correctIndex={1} explanation="Many tool calls are idempotent. Caching prevents redundant API calls, reducing both latency and cost." onAnswer={()=>onComplete&&onComplete("deep-prod-tools","quiz1")}/>
  <SeeItInRe3 text="Re³ uses a tool registry pattern in its debate system -- each orchestrator (Hypatia, Socratia, Ada) has registered capabilities with logging and error handling." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabDeepFCPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your advanced function calling knowledge to real architectural decisions.</p>
  <ArchitectureDecision scenario="You are building a customer support agent that needs tools for: searching a knowledge base, creating tickets, sending emails, and escalating to humans. The agent handles 1000+ conversations per hour." options={[
    {label:"Single monolithic tool registry",tradeoff:"Simple to build, but hard to scale individual tools independently. A bug in one tool risks affecting all others."},
    {label:"Microservice tools with a gateway",tradeoff:"Each tool is its own service with independent scaling. Gateway handles routing. More complex but more resilient."},
    {label:"Serverless functions per tool",tradeoff:"Maximum scalability with pay-per-use. Cold start latency can be an issue for time-sensitive tools."},
  ]} correctIndex={1} explanation="At 1000+ conversations/hour, microservice architecture with a gateway gives the best balance. Individual tools scale independently, and the gateway handles routing and rate limiting." onAnswer={()=>onComplete&&onComplete("deep-fc-playground","arch1")}/>
  <Quiz question="An LLM requests a tool call with invalid parameters. What should your system do?" options={["Execute anyway","Return a validation error to the LLM with details about what was wrong","Crash with a stack trace","Silently fix the parameters"]} correctIndex={1} explanation="Return a clear validation error. The LLM can then self-correct and retry with valid parameters." onAnswer={()=>onComplete&&onComplete("deep-fc-playground","quiz1")}/>
  <Quiz question="Your tool system has a 15% error rate. What metric should you investigate first?" options={["Total volume","Error breakdown by tool -- which specific tools are failing?","Average response time","Cache hit rate"]} correctIndex={1} explanation="Breaking errors down by tool reveals whether one problematic tool is dragging down the average or if it is a systemic issue." onAnswer={()=>onComplete&&onComplete("deep-fc-playground","quiz2")}/>
</div>}

export function CourseFunctionCalling({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[
    {id:'what-fc',label:'What is Function Calling',icon:'\u2699\uFE0F'},
    {id:'tool-defs',label:'Tool Definitions',icon:'\uD83D\uDCDD'},
    {id:'multi-provider',label:'Multi-Provider Patterns',icon:'\uD83D\uDD00'},
    {id:'fc-playground',label:'Playground',icon:'\uD83C\uDFAE'},
  ];
  const deepTabs=[
    {id:"deep-tool-schema",label:"Tool Schema Design",icon:"📝"},
    {id:"deep-multi-provider",label:"Multi-Provider",icon:"🔀"},
    {id:"deep-parallel",label:"Parallel & Sequential",icon:"⚡"},
    {id:"deep-errors",label:"Error Handling",icon:"🛡️"},
    {id:"deep-prod-tools",label:"Production System",icon:"🏭"},
    {id:"deep-fc-playground",label:"Deep Playground",icon:"🎯"},
  ];
  return <CourseShell
    id="function-calling"
    progress={progress}
    onBack={onBack}
    onNavigate={onNavigate}
    onComplete={onComplete}
    depth={depth}
    onChangeDepth={onChangeDepth}
    visionaryTabs={visionaryTabs}
    deepTabs={deepTabs}
    renderTab={(tab,i,d)=>{
      if(d==="deep"){
        if(i===0) return <TabDeepToolSchema onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===1) return <TabDeepMultiProvider onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===2) return <TabDeepParallelTools onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===3) return <TabDeepErrorHandling onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===4) return <TabDeepProdTools onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===5) return <TabDeepFCPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
      }
      if(i===0) return <TabWhatFC onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1) return <TabToolDefs onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2) return <TabMultiProvider onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3) return <TabFCPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }}
  />;
}

// ==================== COURSE 8: AI GOVERNANCE ====================

function TabWhyGov({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why AI Governance?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>AI systems make decisions that affect people's lives -- hiring, lending, healthcare, criminal justice. Without governance, these systems can perpetuate bias, lack transparency, and cause real harm.</p>
  <AnalogyBox emoji={'\uD83D\uDEA6'} title="Think of it like traffic laws">Roads without traffic laws would be dangerous chaos. AI without governance is similar -- powerful technology that needs guardrails to ensure it benefits everyone safely.</AnalogyBox>
  <Quiz question="Why is AI governance necessary even for well-intentioned AI systems?" options={["Legal compliance only","Even good-faith AI can have biased training data and unintended consequences","Governance is just bureaucracy","It's only needed for military AI"]} correctIndex={1} explanation="Even well-designed AI systems can produce biased or harmful outcomes due to biased training data, edge cases, or unintended interactions. Governance provides systematic checks." onAnswer={()=>onComplete&&onComplete('why-gov','quiz1')}/>
</div>}

function TabFivePillars({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The 5 Pillars of AI Governance</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Most AI governance frameworks organize around five core pillars:</p>
  <ExpandableSection title="1. Fairness & Non-Discrimination" icon={'\u2696\uFE0F'} defaultOpen={true}>
    <p>AI systems should treat all people equitably. This means testing for bias across demographics, ensuring training data is representative, and monitoring outcomes for discriminatory patterns. Example: A lending model should not approve loans at different rates based on race or gender when all other factors are equal.</p>
  </ExpandableSection>
  <ExpandableSection title="2. Transparency & Explainability" icon={'\uD83D\uDD0D'}>
    <p>People affected by AI decisions should understand how those decisions were made. This includes clear documentation of what data was used, how the model works, and why specific decisions were made. Example: If an AI denies a loan, the applicant should receive a clear explanation.</p>
  </ExpandableSection>
  <ExpandableSection title="3. Accountability" icon={'\uD83D\uDCCB'}>
    <p>There must be clear ownership of AI systems and their outcomes. Someone must be responsible when things go wrong. This includes audit trails, incident response procedures, and clear lines of responsibility.</p>
  </ExpandableSection>
  <ExpandableSection title="4. Privacy & Data Protection" icon={'\uD83D\uDD12'}>
    <p>AI systems must handle personal data responsibly. This includes data minimization (only collecting what's needed), purpose limitation, consent management, and compliance with regulations like GDPR.</p>
  </ExpandableSection>
  <ExpandableSection title="5. Safety & Reliability" icon={'\uD83D\uDEE1\uFE0F'}>
    <p>AI systems must operate reliably and fail safely. This includes testing, monitoring, fallback mechanisms, and human oversight for high-stakes decisions.</p>
  </ExpandableSection>
  <Quiz question="Which pillar requires that AI decisions can be understood by affected people?" options={["Fairness","Transparency & Explainability","Privacy","Safety"]} correctIndex={1} explanation="Transparency & Explainability ensures that people can understand how and why AI decisions are made, enabling them to challenge unfair outcomes." onAnswer={()=>onComplete&&onComplete('five-pillars','quiz1')}/>
</div>}

function TabRiskAssess({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Risk Assessment</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The EU AI Act establishes a <b>risk-based framework</b> that classifies AI systems into four tiers based on potential harm.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Risk Level</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Requirements</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Examples</th></tr></thead>
      <tbody>
        {[['Unacceptable','Banned','Social scoring, mass surveillance'],['High','Strict compliance required','Medical devices, hiring, credit scoring'],['Limited','Transparency obligations','Chatbots, content recommendation'],['Minimal','No requirements','Spam filters, video games']].map(([l,r,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:['#EF4444','#F59E0B','#3B82F6','#2D8A6E'][i],fontWeight:600}}>{l}</td><td className="p-3" style={{color:GIM.bodyText}}>{r}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <RiskClassifier/>
  <Quiz question="Under the EU AI Act, what happens to unacceptable-risk AI systems?" options={["They need extra documentation","They require human oversight","They are banned","They get a warning"]} correctIndex={2} explanation="Unacceptable-risk AI systems are prohibited under the EU AI Act. This includes social credit scoring systems and real-time biometric surveillance in public spaces." onAnswer={()=>onComplete&&onComplete('risk-assess','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3 demonstrates governance through transparency -- every agent's reasoning is visible, debate arguments are attributed, and the synthesis process is traceable." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabGovPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your governance knowledge!</p>
  <ExpandableSection title="Exercise 1: Pillar Identification" icon={'\uD83C\uDFDB\uFE0F'} defaultOpen={true}>
    <Quiz question="A company's AI model approves loans at different rates for different ethnicities. Which governance pillar is violated?" options={["Transparency","Fairness & Non-Discrimination","Privacy","Safety"]} correctIndex={1} explanation="Differential treatment based on ethnicity is a violation of Fairness & Non-Discrimination, regardless of whether it was intentional or a result of biased training data." onAnswer={()=>onComplete&&onComplete('gov-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Compliance" icon={'\uD83D\uDCCB'}>
    <Quiz question="You're deploying an AI chatbot for customer service. Under the EU AI Act, what's the minimum requirement?" options={["No requirements -- chatbots are minimal risk","Disclose to users they're talking to an AI","Full bias audit and compliance report","Get government approval first"]} correctIndex={1} explanation="Chatbots are classified as limited risk under the EU AI Act. The key requirement is transparency -- users must be informed that they're interacting with an AI, not a human." onAnswer={()=>onComplete&&onComplete('gov-playground','quiz2')}/>
  </ExpandableSection>
</div>}

function TabDeepFrameworks({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Governance Frameworks</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Three major governance frameworks are shaping AI regulation worldwide: the NIST AI Risk Management Framework, the EU AI Act, and ISO/IEC 42001. Each takes a different approach to managing AI risks.</p>
  <ComparisonTable title="Framework Comparison" columns={["Framework","Scope","Approach","Enforcement"]} rows={[
    ["NIST AI RMF","Voluntary US framework","Risk-based, four functions: Govern, Map, Measure, Manage","Voluntary adoption, no penalties"],
    ["EU AI Act","Mandatory EU regulation","Risk classification: Unacceptable, High, Limited, Minimal","Fines up to 35M EUR or 7% global revenue"],
    ["ISO/IEC 42001","International standard","Management system for responsible AI development","Certification-based, market pressure"],
  ]}/>
  <ExpandableSection title="NIST AI RMF: Four Core Functions" icon={"🏛️"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>1. <b>GOVERN</b>: Establish policies, roles, and accountability structures for AI risk management.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>2. <b>MAP</b>: Identify and document AI risks in context, including intended use, stakeholders, and potential impacts.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>3. <b>MEASURE</b>: Assess identified risks using quantitative and qualitative methods.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>4. <b>MANAGE</b>: Prioritize and act on risks through mitigation, monitoring, and response plans.</p>
  </ExpandableSection>
  <ExpandableSection title="EU AI Act Risk Tiers" icon={"⚠️"}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}><b>Unacceptable Risk</b>: Banned outright -- social scoring, manipulative AI, real-time biometric surveillance.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}><b>High Risk</b>: Strict requirements -- medical devices, hiring tools, credit scoring, law enforcement.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}><b>Limited Risk</b>: Transparency obligations -- chatbots, deepfakes, emotion recognition.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}><b>Minimal Risk</b>: No specific requirements -- spam filters, video game AI.</p>
  </ExpandableSection>
  <Quiz question="Which framework can impose fines for non-compliance?" options={["NIST AI RMF","ISO/IEC 42001","EU AI Act","None of them"]} correctIndex={2} explanation="The EU AI Act is the only legally binding framework with enforcement powers. NIST is voluntary and ISO is certification-based." onAnswer={()=>onComplete&&onComplete("deep-frameworks","quiz1")}/>
</div>}

function TabDeepRiskAssess({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Risk Assessment</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>AI risk assessment involves systematically identifying, analyzing, and evaluating potential harms from AI systems. A structured taxonomy helps organizations consistently evaluate risks across different projects.</p>
  <ComparisonTable title="AI Risk Taxonomy" columns={["Risk Category","Description","Example","Mitigation"]} rows={[
    ["Bias & Discrimination","Unfair treatment of groups","Hiring model favoring one demographic","Bias audits, diverse training data"],
    ["Privacy Violation","Unauthorized data use or exposure","Model memorizing personal information","Differential privacy, data minimization"],
    ["Safety Failure","Physical or financial harm","Autonomous vehicle misclassification","Redundant safety systems, human oversight"],
    ["Transparency Gap","Inability to explain decisions","Black-box denial of medical coverage","Explainability tools, model cards"],
    ["Security Vulnerability","Adversarial attacks or data poisoning","Prompt injection in LLM applications","Input validation, red teaming"],
  ]}/>
  <CodeBlock language="javascript" label="Risk Scoring Matrix" code={`// Risk score = likelihood x impact x (1 - mitigation_effectiveness)
function calculateRiskScore(risk) {
  const likelihood = risk.likelihood;   // 1-5 scale
  const impact = risk.impact;           // 1-5 scale
  const mitigation = risk.mitigation;   // 0-1 (effectiveness)

  const rawScore = likelihood * impact;
  const mitigatedScore = rawScore * (1 - mitigation);

  return {
    raw: rawScore,
    mitigated: mitigatedScore,
    level: mitigatedScore > 15 ? "CRITICAL"
         : mitigatedScore > 10 ? "HIGH"
         : mitigatedScore > 5  ? "MEDIUM" : "LOW",
  };
}`}/>
  <Quiz question="In a risk scoring matrix, what does mitigated risk score represent?" options={["The worst-case scenario","The residual risk after applying mitigation controls","The likelihood of occurrence","The cost of the AI system"]} correctIndex={1} explanation="Mitigated risk score represents residual risk -- the remaining risk after mitigation controls are applied. It is calculated as raw risk multiplied by (1 minus mitigation effectiveness)." onAnswer={()=>onComplete&&onComplete("deep-risk-assess","quiz1")}/>
</div>}

function TabDeepModelCards({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Model Cards & Documentation</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Model cards are standardized documents that describe an AI model's intended use, performance characteristics, limitations, and ethical considerations. They serve as the primary accountability artifact for AI systems.</p>
  <CodeBlock language="json" label="Model Card Template" code={`{
  "model_name": "Customer Churn Predictor v2.1",
  "model_type": "Binary classification (gradient boosting)",
  "intended_use": {
    "primary": "Predict customer churn risk for retention campaigns",
    "users": ["Customer success team", "Marketing automation"],
    "out_of_scope": ["Credit decisions", "Employment screening"]
  },
  "training_data": {
    "source": "Internal CRM, 2022-2024",
    "size": "450,000 customer records",
    "demographics": "US customers, enterprise segment",
    "known_gaps": ["Limited APAC representation", "No SMB data"]
  },
  "performance": {
    "accuracy": 0.87,
    "precision": 0.82,
    "recall": 0.79,
    "auc_roc": 0.91,
    "fairness_metrics": {
      "demographic_parity": 0.95,
      "equal_opportunity": 0.92
    }
  },
  "limitations": [
    "Performance degrades for customers with < 3 months history",
    "Not validated for APAC markets",
    "Seasonal patterns may cause drift in Q4"
  ],
  "ethical_considerations": [
    "Model should not be used for discriminatory pricing",
    "Human review required before any account actions"
  ]
}`}/>
  <ExpandableSection title="Key Sections of a Model Card" icon={"📄"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>1. <b>Intended Use</b>: What the model is designed for and explicitly what it should NOT be used for.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>2. <b>Training Data</b>: Sources, size, demographics, and known gaps or biases in the data.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>3. <b>Performance</b>: Standard metrics plus fairness metrics across demographic groups.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>4. <b>Limitations</b>: Known failure modes, edge cases, and conditions where the model should not be trusted.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>5. <b>Ethical Considerations</b>: Potential harms and safeguards that must be in place.</p>
  </ExpandableSection>
  <Quiz question="Why should a model card include out-of-scope uses?" options={["Legal compliance only","To prevent the model from being used in contexts where it was not tested and may cause harm","To make the card longer","It is not necessary"]} correctIndex={1} explanation="Documenting out-of-scope uses prevents the model from being deployed in contexts where it was never validated, reducing the risk of unexpected harm." onAnswer={()=>onComplete&&onComplete("deep-model-cards","quiz1")}/>
</div>}

function TabDeepBiasFairness({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Bias & Fairness</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Fairness in AI is not a single metric -- there are multiple, sometimes conflicting, mathematical definitions. Choosing the right fairness criteria depends on the context and the type of harm you want to prevent.</p>
  <ComparisonTable title="Statistical Fairness Definitions" columns={["Definition","Formula","Best For","Limitation"]} rows={[
    ["Demographic Parity","P(Y=1|A=0) = P(Y=1|A=1)","Equal selection rates across groups","Ignores actual qualification rates"],
    ["Equal Opportunity","P(Y=1|A=0,Y*=1) = P(Y=1|A=1,Y*=1)","Equal true positive rates","Only considers positive outcomes"],
    ["Predictive Parity","P(Y*=1|A=0,Y=1) = P(Y*=1|A=1,Y=1)","Equal precision across groups","May not equalize error rates"],
    ["Calibration","P(Y*=1|S=s,A=0) = P(Y*=1|S=s,A=1)","Equal accuracy at each score level","Difficult to achieve perfectly"],
  ]}/>
  <ExpandableSection title="The Impossibility Theorem" icon={"⚠️"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>A fundamental result in algorithmic fairness: it is mathematically impossible to satisfy demographic parity, equal opportunity, and predictive parity simultaneously (except in trivial cases). This means every fairness decision involves tradeoffs.</p>
  </ExpandableSection>
  <ExpandableSection title="Bias Mitigation Strategies" icon={"🛠️"}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>1. <b>Pre-processing</b>: Fix training data (re-sampling, re-weighting, removing proxies for protected attributes).</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>2. <b>In-processing</b>: Add fairness constraints during model training (adversarial debiasing, regularization).</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>3. <b>Post-processing</b>: Adjust model outputs to satisfy fairness criteria (threshold adjustment, calibration).</p>
  </ExpandableSection>
  <Quiz question="Why is it impossible to satisfy all fairness definitions simultaneously?" options={["We lack the technology","Mathematical proof shows they conflict when base rates differ between groups","Nobody has tried hard enough","Only one definition is correct"]} correctIndex={1} explanation="The impossibility theorem proves that when base rates (actual qualification rates) differ between groups, satisfying one fairness criterion necessarily violates others. This makes fairness a policy choice, not just a technical one." onAnswer={()=>onComplete&&onComplete("deep-bias-fairness","quiz1")}/>
</div>}

function TabDeepCompliance({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Continuous Compliance</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>AI governance is not a one-time audit -- it requires continuous monitoring, drift detection, and audit trails. Models degrade as data distributions shift.</p>
  <CodeBlock language="javascript" label="Compliance Monitor" code={`class ComplianceMonitor {
  constructor(model, config) {
    this.model = model;
    this.alerts = [];
    this.driftThreshold = config.driftThreshold || 0.05;
  }

  async checkDrift(currentData) {
    const baseline = this.model.baselineDistribution;
    const drift = this.calculatePSI(baseline, currentData);
    if (drift > this.driftThreshold) {
      this.alerts.push({
        type: "DATA_DRIFT",
        severity: drift > 0.2 ? "CRITICAL" : "WARNING",
        metric: drift,
        timestamp: new Date().toISOString(),
      });
    }
    return drift;
  }

  async checkFairness(predictions, demographics) {
    const groups = this.groupByDemographic(predictions, demographics);
    const rates = {};
    for (const [g, preds] of Object.entries(groups)) {
      rates[g] = preds.filter(p => p > 0.5).length / preds.length;
    }
    const maxGap = Math.max(...Object.values(rates)) - Math.min(...Object.values(rates));
    if (maxGap > 0.1) this.alerts.push({ type: "FAIRNESS", details: rates });
    return { rates, maxGap };
  }
}`}/>
  <ExpandableSection title="Audit Trail Requirements" icon={"🔍"} defaultOpen={true}>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>1. <b>Decision logs</b>: Record every AI decision with inputs, outputs, model version, and timestamp.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>2. <b>Model versioning</b>: Track every model change -- training data, hyperparameters, code, and performance.</p>
    <p className="mb-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7}}>3. <b>Incident response</b>: Document all fairness violations, drift events, and corrective actions.</p>
  </ExpandableSection>
  <Quiz question="What is data drift?" options={["A database migration","When real-world data distribution changes from training data","Moving data to cloud","A backup type"]} correctIndex={1} explanation="Data drift occurs when statistical properties of real-world data change from the training distribution, causing performance to degrade silently." onAnswer={()=>onComplete&&onComplete("deep-compliance","quiz1")}/>
</div>}

function TabDeepGovPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Deep Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Apply your governance knowledge to real-world scenarios.</p>
  <ArchitectureDecision scenario="Your company is deploying an AI system that screens job applicants. Under the EU AI Act, this is classified as high-risk. You need to decide on the governance approach." options={[
    {label:"Minimal documentation with post-deployment monitoring",tradeoff:"Fast to deploy but legally non-compliant. High-risk systems require pre-deployment conformity assessment."},
    {label:"Full conformity assessment with model cards, bias audits, and human oversight",tradeoff:"Comprehensive and compliant. Requires significant upfront investment but reduces legal and reputational risk."},
    {label:"Third-party audit only, no internal governance",tradeoff:"External validation adds credibility but without internal processes, issues between audits go undetected."},
  ]} correctIndex={1} explanation="High-risk AI under the EU AI Act requires conformity assessment before deployment, including documentation, bias testing, human oversight mechanisms, and ongoing monitoring. The investment upfront prevents costly non-compliance penalties." onAnswer={()=>onComplete&&onComplete("deep-gov-playground","arch1")}/>
  <Quiz question="A model card shows 92% accuracy overall but 71% for a specific demographic group. What should you do?" options={["Ship it -- 92% is excellent","Investigate the performance gap and determine if it violates fairness requirements","Remove the demographic data","Lower the overall accuracy to match"]} correctIndex={1} explanation="A 21-point accuracy gap between groups is a significant disparity that could indicate bias. Investigate the root cause, assess whether it violates your fairness criteria, and apply targeted mitigation." onAnswer={()=>onComplete&&onComplete("deep-gov-playground","quiz1")}/>
  <Quiz question="Your compliance monitor detects data drift above the critical threshold. What is the correct first step?" options={["Immediately retrain the model","Ignore it -- models always drift a little","Alert stakeholders and assess impact on predictions before deciding on action","Shut down the system permanently"]} correctIndex={2} explanation="Data drift alerts should trigger assessment, not automatic retraining. Evaluate whether the drift actually affects prediction quality and fairness before deciding whether to retrain, adjust thresholds, or take other action." onAnswer={()=>onComplete&&onComplete("deep-gov-playground","quiz2")}/>
</div>}

export function CourseGovernance({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[
    {id:'why-gov',label:'Why Governance',icon:'\u26A0\uFE0F'},
    {id:'five-pillars',label:'The 5 Pillars',icon:'\uD83C\uDFDB\uFE0F'},
    {id:'risk-assess',label:'Risk Assessment',icon:'\uD83D\uDCCA'},
    {id:'gov-playground',label:'Playground',icon:'\uD83C\uDFAE'},
  ];
  const deepTabs=[
    {id:"deep-frameworks",label:"Governance Frameworks",icon:"🏛️"},
    {id:"deep-risk-assess",label:"Risk Assessment",icon:"📊"},
    {id:"deep-model-cards",label:"Model Cards",icon:"📄"},
    {id:"deep-bias-fairness",label:"Bias & Fairness",icon:"⚖️"},
    {id:"deep-compliance",label:"Continuous Compliance",icon:"🔍"},
    {id:"deep-gov-playground",label:"Deep Playground",icon:"🎯"},
  ];
  return <CourseShell
    id="ai-governance"
    progress={progress}
    onBack={onBack}
    onNavigate={onNavigate}
    onComplete={onComplete}
    depth={depth}
    onChangeDepth={onChangeDepth}
    visionaryTabs={visionaryTabs}
    deepTabs={deepTabs}
    renderTab={(tab,i,d)=>{
      if(d==="deep"){
        if(i===0) return <TabDeepFrameworks onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===1) return <TabDeepRiskAssess onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===2) return <TabDeepModelCards onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===3) return <TabDeepBiasFairness onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===4) return <TabDeepCompliance onNavigate={onNavigate} onComplete={onComplete}/>;
        if(i===5) return <TabDeepGovPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
      }
      if(i===0) return <TabWhyGov onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===1) return <TabFivePillars onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===2) return <TabRiskAssess onNavigate={onNavigate} onComplete={onComplete}/>;
      if(i===3) return <TabGovPlayground onNavigate={onNavigate} onComplete={onComplete}/>;
    }}
  />;
}

// ==================== COURSE 5: ACP PROTOCOL ====================
function TabACPOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>What Is ACP?</h2>
  <AnalogyBox title="Enterprise Message Bus">{`If A2A is agents exchanging business cards and having conversations, ACP is like a corporate event-driven message bus \u2014 agents publish events, subscribe to topics, and communicate asynchronously at enterprise scale.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>The Agent Communication Protocol (ACP) by IBM focuses on <b>event-driven, async-first messaging</b> for enterprise agent ecosystems. While A2A handles bilateral agent conversations, ACP handles multi-agent event streams.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\uD83D\uDCE1',title:'Event-Driven',desc:'Agents publish events, others subscribe \u2014 loose coupling at scale'},
    {icon:'\u23F0',title:'Async-First',desc:'Non-blocking message passing, agents process at their own pace'},
    {icon:'\uD83C\uDFE2',title:'Enterprise-Grade',desc:'Built for regulated environments with audit trails and compliance'},
    {icon:'\uD83D\uDD04',title:'Interoperable',desc:'Works alongside A2A, MCP, and existing enterprise systems'},
  ].map((f,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{f.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{f.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{f.desc}</p></div>)}</div>
  <Quiz question="What is the key difference between A2A and ACP?" options={["A2A is for Google, ACP is for IBM","A2A is bilateral agent conversation, ACP is event-driven multi-agent messaging","They are the same protocol with different names","A2A is async, ACP is synchronous"]} correctIndex={1} explanation="A2A focuses on bilateral agent-to-agent conversations (request/response). ACP focuses on event-driven, pub/sub style messaging where multiple agents can subscribe to event streams \u2014 better suited for complex enterprise workflows." onAnswer={()=>onComplete&&onComplete('acp-overview','quiz1')}/>
</div></FadeIn>}

function TabACPArchitecture({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ACP Architecture</h2>
  <ExpandableSection title="Message Bus Pattern" icon={'\uD83D\uDCE8'} defaultOpen>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>ACP uses a central message bus (or broker) through which all agent communication flows. Agents publish events to topics and subscribe to topics they care about. This decouples producers from consumers.</p>
  </ExpandableSection>
  <CodeBlock title="ACP Event Publishing" code={`# Agent publishes an event to the message bus
event = {
    "type": "document.analyzed",
    "source": "agent://doc-analyzer/v1",
    "subject": "doc-12345",
    "data": {
        "entities_found": 15,
        "sentiment": "neutral",
        "risk_flags": ["pii_detected", "compliance_review"]
    },
    "metadata": {
        "timestamp": "2025-01-15T10:30:00Z",
        "trace_id": "abc-123",
        "correlation_id": "workflow-789"
    }
}

# Other agents subscribed to "document.analyzed" receive this
# e.g., ComplianceAgent, SummaryAgent, NotificationAgent`}/>
  <ComparisonTable title="ACP vs A2A vs MCP" headers={['Feature','ACP','A2A','MCP']} rows={[['Communication','Pub/sub events','Bilateral conversation','Client-server tools'],['Pattern','Event-driven','Request/response','Tool invocation'],['Coupling','Loose (via message bus)','Medium (agent cards)','Tight (tool schemas)'],['Best For','Enterprise workflows','Agent collaboration','Tool integration'],['Origin','IBM','Google','Anthropic']]}/>
</div></FadeIn>}

function TabACPPatterns({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ACP Messaging Patterns</h2>
  <ExpandableSection title="Event Sourcing" icon={'\uD83D\uDCC3'} defaultOpen>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Every agent action is recorded as an immutable event. The full history of events can reconstruct system state at any point. Critical for compliance and audit trails in regulated industries.</p>
  </ExpandableSection>
  <ExpandableSection title="Saga Pattern" icon={'\uD83D\uDD04'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Long-running workflows split into a series of compensatable steps. If step 3 fails, steps 1 and 2 are rolled back via compensating events. Essential for multi-agent workflows where any agent can fail.</p>
  </ExpandableSection>
  <ExpandableSection title="Dead Letter Queue" icon={'\uD83D\uDCEA'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Messages that can't be processed go to a dead letter queue for human review. Prevents data loss when agents fail or messages are malformed.</p>
  </ExpandableSection>
  <Quiz question="In the Saga pattern, what happens when step 3 of a 5-step workflow fails?" options={["The entire workflow retries from step 1","Steps 1 and 2 are rolled back via compensating events","Step 3 retries indefinitely","The workflow continues from step 4"]} correctIndex={1} explanation="The Saga pattern uses compensating events to undo completed steps when a later step fails. This maintains data consistency across distributed agents without requiring distributed transactions." onAnswer={()=>onComplete&&onComplete('acp-patterns','quiz1')}/>
</div></FadeIn>}

function TabACPPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ACP Playground</h2>
  <ArchitectureDecision scenario="You are building a document processing pipeline for a bank. Documents arrive, need OCR, classification, entity extraction, compliance check, and human review. 500 documents/day, strict audit requirements." options={[{label:'Direct API calls between agents (synchronous pipeline)',tradeoff:'Simple but brittle \u2014 if compliance agent is down, entire pipeline stops. No audit trail.'},{label:'ACP event bus: each step publishes completion event, next agent subscribes',tradeoff:'Resilient, auditable, scalable. Each agent works independently. Full event history for compliance.'},{label:'Batch processing: collect all documents, process overnight',tradeoff:'Simplest but doesn\'t meet real-time requirements. Banks need same-day processing.'}]} correctIndex={1} explanation="ACP's event-driven architecture is ideal here. Each processing step publishes a completion event. If compliance review is slow, documents queue up without blocking OCR/extraction. The full event history satisfies audit requirements. Agents can scale independently." onAnswer={()=>onComplete&&onComplete('acp-playground','arch1')}/>
</div></FadeIn>}

function TabDeepACPEvents({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Event Schema Design</h2>
  <CodeBlock title="CloudEvents Specification" code={`# ACP uses CloudEvents as the event envelope format
{
    "specversion": "1.0",
    "type": "com.acme.agent.document.classified",
    "source": "agent://classifier/v2",
    "id": "evt-abc-123",
    "time": "2025-01-15T10:30:00Z",
    "datacontenttype": "application/json",
    "subject": "document/doc-12345",
    "data": {
        "classification": "financial_report",
        "confidence": 0.94,
        "subcategories": ["quarterly_earnings", "sec_filing"],
        "processing_time_ms": 1250
    },
    # ACP extensions
    "traceid": "trace-789",
    "correlationid": "workflow-456",
    "agentversion": "2.1.0"
}`}/>
  <ExpandableSection title="Event Design Best Practices" icon={'\uD83D\uDCA1'}>
    <div className="space-y-1">{['Use past tense for event types (document.classified, not classify.document)','Include correlation IDs for tracing across agent chains','Keep event payloads small \u2014 include references, not full data','Version your event schemas for backward compatibility','Include processing metadata (time, confidence, model used)'].map((r,i)=><p key={i} style={{fontSize:12,color:GIM.bodyText}}>{'\u2022'} {r}</p>)}</div>
  </ExpandableSection>
</div></FadeIn>}

function TabDeepACPSaga({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Saga Orchestration</h2>
  <CodeBlock title="Saga Coordinator" code={`class SagaCoordinator:
    def __init__(self, steps):
        self.steps = steps  # [{execute, compensate, agent}]
        self.completed = []

    async def run(self, context):
        for step in self.steps:
            try:
                result = await step["agent"].execute(context)
                self.completed.append(step)
                context.update(result)
                await self.publish_event(
                    f"saga.step.completed",
                    {"step": step["agent"].name, "result": result}
                )
            except Exception as e:
                await self.publish_event(
                    "saga.step.failed",
                    {"step": step["agent"].name, "error": str(e)}
                )
                # Compensate in reverse order
                for completed_step in reversed(self.completed):
                    await completed_step["agent"].compensate(context)
                    await self.publish_event(
                        "saga.step.compensated",
                        {"step": completed_step["agent"].name}
                    )
                raise SagaFailedError(f"Failed at {step['agent'].name}")
        return context`}/>
  <Quiz question="Why use the Saga pattern instead of distributed transactions for multi-agent workflows?" options={["Sagas are faster","Distributed transactions require all agents to be available simultaneously and lock resources","Sagas are simpler to implement","There is no difference"]} correctIndex={1} explanation="Distributed transactions (2PC) require all participants to be available and lock resources until commit. Sagas allow each agent to work independently and compensate on failure \u2014 much better for loosely coupled agent systems." onAnswer={()=>onComplete&&onComplete('deep-acp-saga','quiz1')}/>
</div></FadeIn>}

function TabDeepACPEnterprise({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Enterprise Integration</h2>
  <ComparisonTable title="Message Brokers for ACP" headers={['Broker','Best For','Throughput','Persistence']} rows={[['Apache Kafka','High-volume event streams','Millions/sec','Log-based (durable)'],['RabbitMQ','Complex routing, priority queues','100K/sec','Queue-based'],['Redis Streams','Low-latency, simple pub/sub','1M+/sec','In-memory + AOF'],['AWS EventBridge','Serverless, AWS ecosystem','Variable','Managed']]}/>
  <ArchitectureDecision scenario="Your enterprise has 50 AI agents across 5 departments. You need a message bus for ACP. Requirements: audit trail, exactly-once delivery, cross-region replication, 10K events/second." options={[{label:'Apache Kafka with schema registry',tradeoff:'Best for high throughput with durability. Schema registry ensures event compatibility. Complex to operate.'},{label:'RabbitMQ with persistent queues',tradeoff:'Simpler ops, good routing, but may struggle at 10K/sec with exactly-once guarantees'},{label:'AWS EventBridge + SQS',tradeoff:'Fully managed, good AWS integration, but vendor lock-in and limited cross-region replication'}]} correctIndex={0} explanation="Kafka's log-based architecture provides natural audit trails, exactly-once semantics via transactions, and built-in cross-region replication. At 10K events/sec with 50 agents, Kafka's throughput is well within capacity." onAnswer={()=>onComplete&&onComplete('deep-acp-enterprise','arch1')}/>
</div></FadeIn>}

function TabDeepACPLab({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ACP Architecture Lab</h2>
  <ArchitectureDecision scenario="Design an ACP-based workflow for insurance claims processing. Steps: document intake, damage assessment (AI vision), policy lookup, coverage determination, fraud detection, approval/denial. Each step involves a specialized agent." options={[{label:'Linear pipeline: each agent triggers the next',tradeoff:'Simple but slow \u2014 fraud detection has to wait for all prior steps'},{label:'Parallel fan-out: after intake, damage assessment + policy lookup + fraud detection run simultaneously, then converge for coverage determination',tradeoff:'Faster processing, agents work independently, but needs a convergence mechanism'},{label:'Fully reactive: each agent watches all events and decides what to do',tradeoff:'Maximum flexibility but hard to reason about, potential for circular dependencies'}]} correctIndex={1} explanation="Parallel fan-out with convergence is the sweet spot. After intake, three independent assessments run simultaneously (often cutting processing time by 60%). A saga coordinator waits for all three before triggering coverage determination. The event bus ensures full audit trail." onAnswer={()=>onComplete&&onComplete('deep-acp-lab','arch1')}/>
</div></FadeIn>}

export function CourseACP({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'acp-overview',label:'What Is ACP?',icon:'\uD83D\uDCE1'},{id:'acp-architecture',label:'Architecture',icon:'\uD83C\uDFD7\uFE0F'},{id:'acp-patterns',label:'Messaging Patterns',icon:'\uD83D\uDD04'},{id:'acp-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-acp-events',label:'Event Schema',icon:'\uD83D\uDCC3'},{id:'deep-acp-saga',label:'Saga Orchestration',icon:'\uD83D\uDD04'},{id:'deep-acp-enterprise',label:'Enterprise Integration',icon:'\uD83C\uDFE2'},{id:'deep-acp-lab',label:'Architecture Lab',icon:'\uD83C\uDFD7\uFE0F'}];
  return <CourseShell id="acp-protocol" onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(d==='visionary'){if(i===0)return <TabACPOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabACPArchitecture onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabACPPatterns onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabACPPlayground onNavigate={onNavigate} onComplete={onComplete}/>;}
    else{if(i===0)return <TabDeepACPEvents onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabDeepACPSaga onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabDeepACPEnterprise onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabDeepACPLab onNavigate={onNavigate} onComplete={onComplete}/>;}
    return null;
  }}/>;
}

// ==================== COURSE 6: AGENTIC DESIGN PATTERNS ====================
function TabAgenticOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>What Are Agentic Patterns?</h2>
  <AnalogyBox title="Recipes for AI Agents">{`Agentic patterns are like recipes in a cookbook \u2014 proven step-by-step approaches for building AI agents that can think, act, and iterate. Just as a chef picks the right recipe for the occasion, you pick the right pattern for your use case.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Agentic AI goes beyond single-shot prompting. An agent <b>observes</b>, <b>reasons</b>, <b>acts</b>, and <b>iterates</b> \u2014 using tools, checking results, and adjusting its approach.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\uD83D\uDD04',title:'ReAct',desc:'Reason + Act: think step-by-step, call tools, observe results, repeat'},
    {icon:'\uD83D\uDCCB',title:'Plan-and-Execute',desc:'Create a plan upfront, then execute each step systematically'},
    {icon:'\uD83E\uDE9E',title:'Reflection',desc:'Generate, critique, revise \u2014 self-improvement through iteration'},
    {icon:'\uD83D\uDD27',title:'Tool-Use Loops',desc:'Iteratively call tools until the task is complete or a limit is reached'},
  ].map((p,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{p.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{p.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{p.desc}</p></div>)}</div>
  <Quiz question="What makes an AI agent different from a chatbot?" options={["Agents use bigger models","Agents can observe, reason, act, and iterate \u2014 not just respond","Agents are always multi-modal","Agents don't need prompts"]} correctIndex={1} explanation="Agents go beyond single-shot responses. They can use tools, check results, adjust their approach, and iterate until the task is complete. A chatbot just responds to the last message." onAnswer={()=>onComplete&&onComplete('agentic-overview','quiz1')}/>
</div></FadeIn>}

function TabReAct({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ReAct: Reason + Act</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>The most fundamental agentic pattern. The model <b>thinks</b> about what to do, <b>acts</b> (calls a tool), <b>observes</b> the result, then <b>thinks</b> again.</p>
  <CodeBlock title="ReAct Loop" code={`def react_loop(query, tools, max_steps=5):
    messages = [{"role": "user", "content": query}]

    for step in range(max_steps):
        # THINK: model reasons about what to do
        response = call_llm(messages, tools=tools)

        if response.is_final_answer:
            return response.content  # Done!

        if response.tool_call:
            # ACT: execute the tool
            tool_result = execute_tool(
                response.tool_call.name,
                response.tool_call.arguments
            )
            # OBSERVE: add result to conversation
            messages.append({"role": "tool", "content": tool_result})
            # Loop back to THINK

    return "Max steps reached"`}/>
  <SeeItInRe3 text="Re\u00b3's agent debate system uses a form of ReAct \u2014 each agent reasons about its position, observes other agents' arguments, then refines its conclusion through multiple rounds."/>
</div></FadeIn>}

function TabPlanExecute({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Plan-and-Execute</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>For complex tasks, plan first, then execute step by step. Separating planning from execution improves reliability.</p>
  <CodeBlock title="Plan-and-Execute Pattern" code={`def plan_and_execute(task, tools, max_replans=2):
    # PLAN: Create a step-by-step plan
    plan = call_llm(
        f"Create a step-by-step plan for: {task}",
        response_format="json",
        schema={"steps": [{"description": "str", "tool": "str"}]}
    )

    results = []
    for step in plan["steps"]:
        # EXECUTE: Run each step
        result = execute_step(step, tools)
        results.append(result)

        # CHECK: Verify step succeeded
        if not result["success"]:
            # REPLAN: Adjust remaining steps
            plan = replan(task, results, remaining_steps)

    # SYNTHESIZE: Combine all results
    return synthesize(task, results)`}/>
  <Quiz question="When is Plan-and-Execute better than ReAct?" options={["Always \u2014 planning is always better","When the task has many interdependent steps that benefit from upfront planning","When the task is simple and doesn't need tools","When speed is the top priority"]} correctIndex={1} explanation="Plan-and-Execute shines for complex, multi-step tasks where the order of operations matters. For simple tasks, ReAct's step-by-step approach is faster and more flexible." onAnswer={()=>onComplete&&onComplete('agentic-plan-execute','quiz1')}/>
</div></FadeIn>}

function TabAgenticPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Pattern Selection</h2>
  <ComparisonTable title="When to Use Which Pattern" headers={['Pattern','Best For','Complexity','Reliability']} rows={[['ReAct','General tool use, information gathering','Low','Good'],['Plan-and-Execute','Multi-step tasks, research, analysis','Medium','Very Good'],['Reflection','Writing, code generation, quality-critical tasks','Medium','Excellent'],['Tool-Use Loop','Data processing, API orchestration','Low','Good'],['Multi-Agent','Complex problems needing diverse expertise','High','Variable']]}/>
  <ArchitectureDecision scenario="You need to build an agent that researches a topic, gathers data from 5 different APIs, and writes a comprehensive report. Which pattern?" options={[{label:'ReAct: reason, call APIs one by one, iterate',tradeoff:'Flexible but may lose track of the overall goal after many tool calls'},{label:'Plan-and-Execute: plan the research strategy, then execute each API call, then synthesize',tradeoff:'Structured approach ensures comprehensive coverage. Replanning handles failed API calls.'},{label:'Simple tool loop: call all 5 APIs, pass results to the model',tradeoff:'Fastest but no reasoning about what data to gather or how to combine it'}]} correctIndex={1} explanation="Research tasks with multiple data sources benefit from upfront planning. The agent plans which APIs to call, what data to extract, and how to structure the report \u2014 then executes systematically." onAnswer={()=>onComplete&&onComplete('agentic-playground','arch1')}/>
</div></FadeIn>}

function TabDeepReAct({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>ReAct Deep Dive</h2>
  <CodeBlock title="Production ReAct Agent" code={`class ReActAgent:
    def __init__(self, model, tools, max_steps=10):
        self.model = model
        self.tools = {t.name: t for t in tools}
        self.max_steps = max_steps
        self.trajectory = []  # Full reasoning trace

    async def run(self, query):
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": query}
        ]

        for step in range(self.max_steps):
            response = await self.model.generate(messages, tools=self.tools)

            # Check for final answer
            if not response.tool_calls:
                self.trajectory.append({"type": "answer", "content": response.text})
                return response.text

            # Execute tool calls (may be parallel)
            for call in response.tool_calls:
                self.trajectory.append({
                    "type": "tool_call",
                    "tool": call.name,
                    "args": call.arguments
                })
                try:
                    result = await self.tools[call.name].execute(call.arguments)
                    messages.append({"role": "tool", "content": str(result)})
                except Exception as e:
                    messages.append({"role": "tool", "content": f"Error: {e}"})

        return "Max steps reached. Partial results: " + str(self.trajectory[-1])`}/>
  <ExpandableSection title="ReAct Best Practices" icon={'\uD83D\uDCA1'}>
    <div className="space-y-1">{['Set a reasonable max_steps limit (5-15 depending on complexity)','Include error handling for tool failures \u2014 let the agent recover','Log the full trajectory for debugging and evaluation','Use streaming to show reasoning in real-time to users','Add guardrails: budget limits, dangerous action detection'].map((r,i)=><p key={i} style={{fontSize:12,color:GIM.bodyText}}>{'\u2022'} {r}</p>)}</div>
  </ExpandableSection>
</div></FadeIn>}

function TabDeepReflection({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Reflection Pattern</h2>
  <CodeBlock title="Self-Reflection Agent" code={`class ReflectionAgent:
    def __init__(self, model, max_iterations=3):
        self.model = model
        self.max_iterations = max_iterations

    async def generate_with_reflection(self, task):
        # Step 1: Initial generation
        draft = await self.model.generate(
            f"Complete this task: {task}"
        )

        for i in range(self.max_iterations):
            # Step 2: Self-critique
            critique = await self.model.generate(
                f"Critique this output for the task '{task}':\\n\\n"
                f"{draft}\\n\\n"
                "List specific issues: accuracy, completeness, "
                "clarity, edge cases missed."
            )

            # Step 3: Check if good enough
            if "no significant issues" in critique.lower():
                break

            # Step 4: Revise based on critique
            draft = await self.model.generate(
                f"Revise this output based on the critique:\\n\\n"
                f"Original: {draft}\\n\\n"
                f"Critique: {critique}\\n\\n"
                "Improved version:"
            )

        return draft`}/>
  <Quiz question="What is the main risk of reflection loops?" options={["They always improve quality","They can over-optimize and lose the original intent","They are too slow","They require multiple models"]} correctIndex={1} explanation="Reflection loops can 'over-edit' \u2014 the model keeps finding issues and revising until the output is technically correct but has lost its original clarity or intent. Set a max_iterations limit and check for convergence." onAnswer={()=>onComplete&&onComplete('deep-reflection','quiz1')}/>
</div></FadeIn>}

function TabDeepAgenticPatterns({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Advanced Patterns</h2>
  <ExpandableSection title="Router Pattern" icon={'\uD83D\uDD00'} defaultOpen>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>A lightweight model classifies the query and routes to a specialized agent or tool chain. Different queries take different paths through the system.</p>
  </ExpandableSection>
  <ExpandableSection title="Parallelization" icon={'\u26A1'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>When multiple sub-tasks are independent, run them in parallel. Fan-out to multiple agents, fan-in results. Dramatically reduces latency for complex tasks.</p>
  </ExpandableSection>
  <ExpandableSection title="Orchestrator-Worker" icon={'\uD83D\uDC68\u200D\uD83D\uDCBB'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>An orchestrator agent breaks the task into sub-tasks, assigns them to worker agents, monitors progress, and synthesizes results. The orchestrator is the brain, workers are the hands.</p>
  </ExpandableSection>
  <ComparisonTable title="Pattern Complexity Matrix" headers={['Pattern','Setup Effort','Runtime Cost','Reliability','Best Use']} rows={[['Single prompt','Minimal','Lowest','Lowest','Simple Q&A'],['ReAct','Low','Medium','Good','Tool-using tasks'],['Plan+Execute','Medium','Medium','Very good','Research, analysis'],['Reflection','Medium','Higher','Excellent','Quality-critical output'],['Multi-agent','High','Highest','Variable','Complex problems']]}/>
</div></FadeIn>}

function TabDeepAgenticLab({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Pattern Selection Lab</h2>
  <ArchitectureDecision scenario="Build an AI code review agent. It receives a PR diff, should analyze code quality, check for bugs, verify test coverage, and suggest improvements. Output: structured review with severity ratings." options={[{label:'ReAct: read diff, call linter, check tests, iterate',tradeoff:'Flexible but may miss systematic issues. Good for simple reviews.'},{label:'Plan-and-Execute + Reflection: plan review strategy, execute checks, then reflect on completeness',tradeoff:'Most thorough \u2014 planning ensures comprehensive coverage, reflection catches missed issues'},{label:'Parallel fan-out: run style check, bug detection, test analysis, security scan simultaneously',tradeoff:'Fastest but no cross-cutting analysis. Bugs that span multiple files may be missed.'}]} correctIndex={1} explanation="Code review benefits from both planning (systematic checklist) and reflection (did I miss anything?). The plan ensures style, bugs, tests, and security are all checked. Reflection catches cross-cutting concerns like architectural issues." onAnswer={()=>onComplete&&onComplete('deep-agentic-lab','arch1')}/>
</div></FadeIn>}

export function CourseAgenticPatterns({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'agentic-overview',label:'What Are Agents?',icon:'\uD83D\uDD04'},{id:'agentic-react',label:'ReAct',icon:'\uD83E\uDDE0'},{id:'agentic-plan-execute',label:'Plan & Execute',icon:'\uD83D\uDCCB'},{id:'agentic-playground',label:'Pattern Selection',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-react',label:'ReAct Deep Dive',icon:'\uD83D\uDD04'},{id:'deep-reflection',label:'Reflection',icon:'\uD83E\uDE9E'},{id:'deep-agentic-patterns',label:'Advanced Patterns',icon:'\u26A1'},{id:'deep-agentic-lab',label:'Pattern Lab',icon:'\uD83C\uDFD7\uFE0F'}];
  return <CourseShell id="agentic-patterns" onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(d==='visionary'){if(i===0)return <TabAgenticOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabReAct onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabPlanExecute onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabAgenticPlayground onNavigate={onNavigate} onComplete={onComplete}/>;}
    else{if(i===0)return <TabDeepReAct onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabDeepReflection onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabDeepAgenticPatterns onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabDeepAgenticLab onNavigate={onNavigate} onComplete={onComplete}/>;}
    return null;
  }}/>;
}

// ==================== COURSE 7: MEMORY SYSTEMS ====================
function TabMemoryOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Why Memory Matters</h2>
  <AnalogyBox title="The Goldfish Problem">{`Without memory, every conversation with an AI is like talking to a goldfish \u2014 it forgets everything after each interaction. Memory systems give AI persistent context, making it actually useful for ongoing tasks.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Memory systems let AI agents remember past interactions, learn preferences, and maintain context across sessions. There are several types:</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\u23F1\uFE0F',title:'Short-Term (Buffer)',desc:'Recent conversation turns kept in context window. Ephemeral.'},
    {icon:'\uD83D\uDCBE',title:'Long-Term (Persistent)',desc:'Facts, preferences, entities stored in a database across sessions.'},
    {icon:'\uD83E\uDDE0',title:'Semantic Memory',desc:'General knowledge extracted from interactions \u2014 facts, concepts.'},
    {icon:'\uD83D\uDCF8',title:'Episodic Memory',desc:'Specific past events and interactions \u2014 "last Tuesday\'s conversation about X".'},
  ].map((m,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{m.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{m.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{m.desc}</p></div>)}</div>
  <Quiz question="Why can't you just keep all conversation history in the context window?" options={["You can \u2014 modern models have huge context windows","Context windows have limits, old messages get expensive, and retrieval quality degrades","The model will refuse to process long conversations","There's no benefit to keeping old messages"]} correctIndex={1} explanation="Even with large context windows, keeping everything is impractical: costs grow linearly, the 'lost-in-the-middle' problem reduces quality, and most old messages aren't relevant to the current query. Smart memory systems extract and retrieve only what's needed." onAnswer={()=>onComplete&&onComplete('memory-overview','quiz1')}/>
</div></FadeIn>}

function TabMemoryTypes({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Memory Architecture</h2>
  <ExpandableSection title="Buffer Memory" icon={'\uD83D\uDCDD'} defaultOpen>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Keep the last N messages in context. Simplest approach. Good for short conversations but loses older context. Sliding window variant: keep last N turns + a summary of earlier turns.</p>
  </ExpandableSection>
  <ExpandableSection title="Entity Memory" icon={'\uD83D\uDC64'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Extract and store named entities (people, places, topics) mentioned in conversation. When a user mentions "my project" again later, the system recalls all stored facts about that project.</p>
  </ExpandableSection>
  <ExpandableSection title="Summary Memory" icon={'\uD83D\uDCDD'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Periodically summarize older conversation turns. The summary replaces the raw messages in context, preserving meaning while saving tokens. Good for long-running conversations.</p>
  </ExpandableSection>
  <ExpandableSection title="Vector Store Memory" icon={'\uD83D\uDD0E'}>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>Embed past messages and store in a vector database. When a relevant topic comes up, retrieve similar past messages. Best for cross-session recall \u2014 "What did we discuss about authentication last month?"</p>
  </ExpandableSection>
  <SeeItInRe3 text="Re\u00b3 uses localStorage-based memory for Academy progress and user preferences, keeping learning state persistent across sessions."/>
</div></FadeIn>}

function TabMemoryPatterns({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Memory Patterns</h2>
  <CodeBlock title="Hybrid Memory System" code={`class HybridMemory:
    def __init__(self, vector_store, max_recent=10):
        self.recent = []           # Buffer: last N messages
        self.entities = {}         # Entity store: {name: [facts]}
        self.vector_store = vector_store  # Long-term retrieval
        self.max_recent = max_recent

    def add_message(self, role, content):
        self.recent.append({"role": role, "content": content})

        # Extract entities from user messages
        if role == "user":
            entities = extract_entities(content)
            for entity in entities:
                self.entities.setdefault(entity.name, []).append(entity.fact)

        # When buffer overflows, archive to vector store
        if len(self.recent) > self.max_recent:
            old = self.recent.pop(0)
            self.vector_store.add(old["content"])

    def get_context(self, current_query):
        """Assemble memory context for the current query."""
        context = []

        # 1. Relevant long-term memories (semantic search)
        similar = self.vector_store.search(current_query, top_k=3)
        if similar:
            context.append({"role":"system",
                "content":"Relevant past context: " + "; ".join(similar)})

        # 2. Relevant entities
        query_entities = extract_entities(current_query)
        for ent in query_entities:
            if ent.name in self.entities:
                facts = self.entities[ent.name][-5:]  # Last 5 facts
                context.append({"role":"system",
                    "content":f"Known about {ent.name}: {'; '.join(facts)}"})

        # 3. Recent conversation (always included)
        context.extend(self.recent[-self.max_recent:])
        return context`}/>
</div></FadeIn>}

function TabMemoryPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Memory Design Playground</h2>
  <ArchitectureDecision scenario="You are building a personal AI assistant that users interact with daily for months. It should remember their preferences (communication style, favorite topics), ongoing projects, and key facts from past conversations." options={[{label:'Large context window: keep all messages forever',tradeoff:'Expensive and impractical for months of conversation (millions of tokens)'},{label:'Buffer + entity extraction + vector retrieval',tradeoff:'Balanced: recent context in buffer, important facts in entity store, past conversations searchable via vectors'},{label:'Summary memory only: summarize each conversation and store',tradeoff:'Space-efficient but loses specific details \u2014 hard to recall exact facts from past conversations'}]} correctIndex={1} explanation="A hybrid approach gives the best of all worlds. Buffer handles immediate context, entity extraction captures key facts (preferences, project names), and vector retrieval lets you surface relevant past conversations when needed." onAnswer={()=>onComplete&&onComplete('memory-playground','arch1')}/>
</div></FadeIn>}

function TabDeepMemoryImpl({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Implementation Deep Dive</h2>
  <ComparisonTable title="Memory Stores" headers={['Store','Best For','Latency','Persistence','Complexity']} rows={[['In-memory dict','Prototyping, short sessions','Instant','None','Minimal'],['Redis','Fast key-value, entity memory','1-5ms','Optional','Low'],['PostgreSQL+pgvector','Structured + vector search','5-20ms','Durable','Medium'],['Pinecone/Weaviate','Pure vector similarity search','10-50ms','Durable','Low'],['SQLite','Edge/local deployment','1-5ms','Durable','Low']]}/>
  <CodeBlock title="Entity Extraction" code={`def extract_memory_entities(message, existing_entities):
    """Extract facts worth remembering from a message."""
    prompt = f"""Extract key facts from this message that would be
useful to remember for future conversations.

Existing known entities: {json.dumps(existing_entities)}

Message: {message}

Return JSON: {{"entities": [{{"name": "entity_name", "fact": "specific fact", "type": "person|project|preference|fact"}}]}}"""

    result = call_llm(prompt, response_format="json")
    return result.get("entities", [])`}/>
</div></FadeIn>}

function TabDeepMemoryCross({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Cross-Session Memory</h2>
  <CodeBlock title="Session-Aware Memory" code={`class CrossSessionMemory:
    def __init__(self, user_id, db):
        self.user_id = user_id
        self.db = db

    def end_session(self, messages):
        """Archive session and extract key learnings."""
        # Summarize the session
        summary = summarize_conversation(messages)

        # Extract new entities/facts
        entities = extract_entities_from_session(messages)

        # Store session record
        self.db.sessions.insert({
            "user_id": self.user_id,
            "timestamp": now(),
            "summary": summary,
            "entities": entities,
            "message_count": len(messages),
            "embedding": embed(summary)  # For future retrieval
        })

        # Update user profile
        preferences = extract_preferences(messages)
        self.db.users.update(self.user_id, preferences)

    def start_session(self):
        """Load relevant context for a new session."""
        user = self.db.users.get(self.user_id)
        recent_sessions = self.db.sessions.find(
            user_id=self.user_id, limit=3, sort="-timestamp"
        )
        return {
            "preferences": user.get("preferences", {}),
            "recent_context": [s["summary"] for s in recent_sessions],
            "known_entities": user.get("entities", {})
        }`}/>
</div></FadeIn>}

function TabDeepMemoryLab({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Memory Architecture Lab</h2>
  <ArchitectureDecision scenario="You are building a customer support AI for an e-commerce company. Customers often contact support multiple times about the same order. The AI needs to remember the full history of each customer's issues across sessions." options={[{label:'Store all conversations in a vector database, retrieve by customer ID',tradeoff:'Full history searchable, but may surface irrelevant old issues. Need good filtering.'},{label:'Entity memory per customer (order history, open issues) + vector search for specific details',tradeoff:'Structured knowledge (orders, issues) always available. Details retrievable when needed. Best balance.'},{label:'Just look up the order in the database, no conversation memory',tradeoff:'Loses all context from previous support interactions \u2014 customer has to repeat themselves'}]} correctIndex={1} explanation="Entity memory captures structured facts (order status, open issues, preferences) that are always relevant. Vector search surfaces specific conversation details when needed. This prevents the 'I already explained this to your colleague' frustration." onAnswer={()=>onComplete&&onComplete('deep-memory-lab','arch1')}/>
</div></FadeIn>}

export function CourseMemorySystems({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'memory-overview',label:'Why Memory?',icon:'\uD83E\uDDE0'},{id:'memory-types',label:'Memory Types',icon:'\uD83D\uDCBE'},{id:'memory-patterns',label:'Patterns',icon:'\uD83D\uDD04'},{id:'memory-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-memory-impl',label:'Implementation',icon:'\uD83D\uDD27'},{id:'deep-memory-cross',label:'Cross-Session',icon:'\uD83D\uDD17'},{id:'deep-memory-lab',label:'Memory Lab',icon:'\uD83C\uDFD7\uFE0F'}];
  return <CourseShell id="memory-systems" onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(d==='visionary'){if(i===0)return <TabMemoryOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabMemoryTypes onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabMemoryPatterns onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabMemoryPlayground onNavigate={onNavigate} onComplete={onComplete}/>;}
    else{if(i===0)return <TabDeepMemoryImpl onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabDeepMemoryCross onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabDeepMemoryLab onNavigate={onNavigate} onComplete={onComplete}/>;}
    return null;
  }}/>;
}

// ==================== COURSE 8: HUMAN-IN-THE-LOOP ====================
function TabHITLOverview({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Why Human-in-the-Loop?</h2>
  <AnalogyBox title="The Autopilot Analogy">{`AI with human-in-the-loop is like a plane on autopilot \u2014 it handles routine operations automatically, but the pilot takes over for takeoff, landing, and turbulence. The key is knowing when to hand off control.`}</AnalogyBox>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>Not every AI decision should be automated. Human-in-the-loop (HITL) patterns keep humans in control of <b>high-stakes</b>, <b>ambiguous</b>, or <b>novel</b> decisions while automating the routine.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{[
    {icon:'\u2705',title:'Approval Gates',desc:'AI proposes, human approves before action is taken'},
    {icon:'\uD83D\uDEA8',title:'Escalation',desc:'AI handles routine cases, escalates edge cases to humans'},
    {icon:'\uD83D\uDCCA',title:'Confidence Thresholds',desc:'Auto-act when confident, ask for help when uncertain'},
    {icon:'\uD83D\uDD04',title:'Feedback Loops',desc:'Human corrections improve the AI over time'},
  ].map((p,i)=><div key={i} className="p-3 rounded-xl border" style={{borderColor:GIM.border}}><div className="flex items-center gap-2 mb-1"><span>{p.icon}</span><span className="font-semibold" style={{fontSize:13,color:GIM.headingText}}>{p.title}</span></div><p style={{fontSize:12,color:GIM.bodyText}}>{p.desc}</p></div>)}</div>
  <Quiz question="An AI customer support agent is 60% confident in its answer to a billing question that involves a $5,000 charge. What should it do?" options={["Answer anyway \u2014 60% is good enough","Escalate to a human agent for review","Ask the customer to call back later","Refuse to answer"]} correctIndex={1} explanation="For high-stakes decisions (large charges), 60% confidence is too low to act autonomously. Escalating to a human agent protects both the customer and the company." onAnswer={()=>onComplete&&onComplete('hitl-overview','quiz1')}/>
</div></FadeIn>}

function TabHITLPatterns({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>HITL Patterns</h2>
  <CodeBlock title="Confidence-Based Routing" code={`class HITLRouter:
    def __init__(self, auto_threshold=0.9, escalate_threshold=0.5):
        self.auto_threshold = auto_threshold
        self.escalate_threshold = escalate_threshold

    async def process(self, query, model):
        response = await model.generate(query)
        confidence = response.confidence

        if confidence >= self.auto_threshold:
            # High confidence: auto-respond
            return {"action": "auto", "response": response.text}

        elif confidence >= self.escalate_threshold:
            # Medium confidence: suggest to human, let them approve/edit
            return {"action": "suggest", "draft": response.text,
                    "confidence": confidence,
                    "note": "Please review before sending"}

        else:
            # Low confidence: full escalation to human
            return {"action": "escalate",
                    "context": query,
                    "note": "AI is not confident enough to respond"}`}/>
  <ComparisonTable title="HITL Pattern Comparison" headers={['Pattern','Best For','Automation Level','User Experience']} rows={[['Approval Gate','All actions reviewed','Low (0%)','Safe but slow'],['Confidence Routing','Mixed complexity workloads','Medium (60-80%)','Fast for routine, careful for complex'],['Exception Handling','Mostly routine with rare edge cases','High (90%+)','Smooth, rare interruptions'],['Active Learning','Improving AI over time','Increasing','Gets better with use']]}/>
</div></FadeIn>}

function TabHITLDesign({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Designing HITL Interfaces</h2>
  <ExpandableSection title="Good HITL Design Principles" icon={'\uD83D\uDCA1'} defaultOpen>
    <div className="space-y-1">{['Show AI reasoning \u2014 humans need to understand WHY the AI made a decision','Make approval fast \u2014 one-click approve/reject with editable drafts','Provide context \u2014 show relevant history, similar past decisions, confidence level','Track overrides \u2014 log when humans change AI decisions for future improvement','Set SLAs \u2014 escalated items need response time targets to avoid bottlenecks'].map((r,i)=><p key={i} style={{fontSize:12,color:GIM.bodyText}}>{'\u2022'} {r}</p>)}</div>
  </ExpandableSection>
  <Quiz question="What is the biggest risk of poorly designed human-in-the-loop systems?" options={["Too slow","Too many false escalations lead to 'alert fatigue' \u2014 humans start rubber-stamping approvals","Too expensive","Humans always disagree with the AI"]} correctIndex={1} explanation="Alert fatigue is the #1 killer of HITL systems. If 95% of escalations are unnecessary, humans stop reviewing carefully and start auto-approving. This defeats the entire purpose of human oversight." onAnswer={()=>onComplete&&onComplete('hitl-design','quiz1')}/>
</div></FadeIn>}

function TabHITLPlayground({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>HITL Playground</h2>
  <ArchitectureDecision scenario="You are deploying an AI that automatically responds to customer emails. Some emails involve refunds (up to $500), account changes, or sensitive issues. How do you design the HITL system?" options={[{label:'All emails get human review before sending',tradeoff:'Maximum safety but defeats the purpose of automation. Human team becomes a bottleneck.'},{label:'Auto-send for routine queries (FAQs, status), human approval for refunds and account changes, escalate sensitive issues',tradeoff:'Best balance: 70% automated, 20% human-approved, 10% fully escalated. Preserves safety for high-stakes actions.'},{label:'Auto-send everything with a confidence threshold of 85%',tradeoff:'Fast but risky \u2014 a confidently wrong refund approval could be costly. No category-based safety.'}]} correctIndex={1} explanation="Category-based routing is more robust than pure confidence routing. Some actions (refunds, account changes) always need human approval regardless of AI confidence. Routine queries can be fully automated." onAnswer={()=>onComplete&&onComplete('hitl-playground','arch1')}/>
</div></FadeIn>}

function TabDeepHITLConfidence({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Confidence Calibration</h2>
  <CodeBlock title="Calibrated Confidence Scoring" code={`class ConfidenceCalibrator:
    def __init__(self, model):
        self.model = model
        self.calibration_data = []

    async def generate_with_confidence(self, query):
        # Method 1: Ask the model to self-assess
        response = await self.model.generate(
            query + "\\n\\nAfter answering, rate your confidence 0-100."
        )
        self_assessed = extract_confidence(response)

        # Method 2: Consistency check (sample 3 responses)
        samples = [await self.model.generate(query) for _ in range(3)]
        consistency = calculate_agreement(samples)

        # Method 3: Entropy of token probabilities (if available)
        logprobs = response.logprobs
        entropy = calculate_entropy(logprobs) if logprobs else None

        # Combine signals
        confidence = weighted_average(
            self_assessed * 0.3,
            consistency * 0.5,
            (1 - entropy) * 0.2 if entropy else self_assessed * 0.2
        )

        return {
            "response": response.text,
            "confidence": confidence,
            "signals": {
                "self_assessed": self_assessed,
                "consistency": consistency,
                "entropy": entropy
            }
        }`}/>
  <Quiz question="Why is self-assessed confidence (asking the model 'how confident are you?') unreliable on its own?" options={["Models can't understand confidence","Models tend to be overconfident \u2014 they rarely express uncertainty proportional to their actual knowledge","Self-assessment is too slow","It only works with GPT-4"]} correctIndex={1} explanation="LLMs are systematically overconfident. They're trained on human feedback that rewards confident answers. Multi-signal confidence (self-assessment + consistency + entropy) is much more reliable." onAnswer={()=>onComplete&&onComplete('deep-hitl-confidence','quiz1')}/>
</div></FadeIn>}

function TabDeepHITLActive({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>Active Learning</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.7}}>The most powerful HITL pattern: human corrections don't just fix one response \u2014 they improve the AI for all future responses.</p>
  <CodeBlock title="Active Learning Loop" code={`class ActiveLearningSystem:
    def __init__(self, model, feedback_store):
        self.model = model
        self.feedback_store = feedback_store

    async def process_with_learning(self, query):
        # Check for similar past corrections
        similar_corrections = self.feedback_store.search(query, top_k=3)

        # Include past corrections as few-shot examples
        enhanced_prompt = query
        if similar_corrections:
            examples = "\\n".join(
                f"Q: {c['query']}\\nWrong: {c['ai_response']}\\nCorrect: {c['human_correction']}"
                for c in similar_corrections
            )
            enhanced_prompt = f"Learn from these past corrections:\\n{examples}\\n\\nNow answer: {query}"

        response = await self.model.generate(enhanced_prompt)
        return response

    def record_correction(self, query, ai_response, human_correction):
        """Store human correction for future learning."""
        self.feedback_store.add({
            "query": query,
            "ai_response": ai_response,
            "human_correction": human_correction,
            "timestamp": now(),
            "embedding": embed(query)  # For similarity search
        })`}/>
</div></FadeIn>}

function TabDeepHITLLab({onNavigate,onComplete}){return <FadeIn><div className="max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold mb-4" style={{color:GIM.headingText,fontFamily:GIM.fontMain}}>HITL Architecture Lab</h2>
  <ArchitectureDecision scenario="You are building an AI-powered legal document reviewer. It marks clauses as 'standard', 'needs review', or 'high risk'. Lawyers review the flagged items. After 6 months, the AI is auto-approving 85% of clauses. A partner asks: 'Can we increase auto-approval to 95%?'" options={[{label:'Yes \u2014 the AI has proven itself over 6 months',tradeoff:'Risky: legal review errors can have catastrophic consequences. The 15% reviewed may contain the hardest cases.'},{label:'Increase gradually with monitoring: 85% \u2192 88% \u2192 90%, measure error rates at each step',tradeoff:'Cautious and data-driven. Each step validates the AI can handle more. Rollback if error rate increases.'},{label:'No \u2014 maintain 85% and focus on improving quality of the 85% instead',tradeoff:'Safe but misses the opportunity to free up lawyer time. May be the right call for high-liability work.'}]} correctIndex={1} explanation="Gradual increase with monitoring is the gold standard for expanding AI autonomy. Each step validates performance on the additional cases. Error rate monitoring catches regression immediately. This is especially important in legal where a single missed clause can be catastrophic." onAnswer={()=>onComplete&&onComplete('deep-hitl-lab','arch1')}/>
</div></FadeIn>}

export function CourseHITL({onBack,onNavigate,progress,onComplete,depth,onChangeDepth}){
  const visionaryTabs=[{id:'hitl-overview',label:'Why HITL?',icon:'\uD83D\uDC64'},{id:'hitl-patterns',label:'HITL Patterns',icon:'\uD83D\uDD04'},{id:'hitl-design',label:'Interface Design',icon:'\uD83C\uDFA8'},{id:'hitl-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  const deepTabs=[{id:'deep-hitl-confidence',label:'Confidence Calibration',icon:'\uD83D\uDCCA'},{id:'deep-hitl-active',label:'Active Learning',icon:'\uD83E\uDDE0'},{id:'deep-hitl-lab',label:'HITL Lab',icon:'\uD83C\uDFD7\uFE0F'}];
  return <CourseShell id="human-in-loop" onBack={onBack} onNavigate={onNavigate} progress={progress} onComplete={onComplete} depth={depth} onChangeDepth={onChangeDepth} visionaryTabs={visionaryTabs} deepTabs={deepTabs} renderTab={(tab,i,d)=>{
    if(d==='visionary'){if(i===0)return <TabHITLOverview onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabHITLPatterns onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabHITLDesign onNavigate={onNavigate} onComplete={onComplete}/>;if(i===3)return <TabHITLPlayground onNavigate={onNavigate} onComplete={onComplete}/>;}
    else{if(i===0)return <TabDeepHITLConfidence onNavigate={onNavigate} onComplete={onComplete}/>;if(i===1)return <TabDeepHITLActive onNavigate={onNavigate} onComplete={onComplete}/>;if(i===2)return <TabDeepHITLLab onNavigate={onNavigate} onComplete={onComplete}/>;}
    return null;
  }}/>;
}

export const TIER2_REGISTRY = {
  'mcp-protocol': CourseMCP,
  'a2a-protocol': CourseA2A,
  'function-calling': CourseFunctionCalling,
  'ai-governance': CourseGovernance,
  'acp-protocol': CourseACP,
  'agentic-patterns': CourseAgenticPatterns,
  'memory-systems': CourseMemorySystems,
  'human-in-loop': CourseHITL,
};
