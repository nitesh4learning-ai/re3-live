"use client";
// Orchestration Canvas — Real-time visual flow diagram showing the orchestration pipeline.
// Uses React Flow to render use case → agents → synthesis as a live DAG.
// Supports live updates via boardSnapshot changes and linked highlighting.

import { useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import UseCaseNode from "./nodes/UseCaseNode";
import AgentNode from "./nodes/AgentNode";
import SynthesisNode from "./nodes/SynthesisNode";

const nodeTypes = {
  useCase: UseCaseNode,
  agent: AgentNode,
  synthesis: SynthesisNode,
};

const EDGE_STYLE = {
  stroke: "#D1D5DB",
  strokeWidth: 2,
};

const ANIMATED_EDGE_STYLE = {
  stroke: "#9333EA",
  strokeWidth: 2,
};

/**
 * Build React Flow nodes and edges from orchestration state.
 *
 * @param {object} boardSnapshot - From blackboard.snapshot()
 * @param {object} budget - From budget.toJSON()
 * @param {string|null} highlightedNodeId - Node to highlight for linked interaction
 * @returns {{ nodes: object[], edges: object[] }}
 */
function buildGraph(boardSnapshot, budget, highlightedNodeId) {
  if (!boardSnapshot) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];
  const uc = boardSnapshot.useCase || {};
  const team = boardSnapshot.team || [];
  const entries = boardSnapshot.stateEntries || {};
  const status = boardSnapshot.status || "initialized";

  // 1. Use Case node (top center)
  nodes.push({
    id: "usecase",
    type: "useCase",
    position: { x: 300, y: 0 },
    data: { title: uc.title, description: uc.description, type: uc.type, highlighted: highlightedNodeId === "usecase" },
    draggable: true,
  });

  // 2. Agent nodes (arranged in layers)
  // Parse execution plan if available
  const execPlan = entries["execution_plan"]?.valuePreview;
  let layers = null;
  try {
    const planData = entries["execution_plan"];
    if (planData && planData.valuePreview) {
      // Try to reconstruct layers from the state
      const parsed = JSON.parse(planData.valuePreview);
      if (parsed.layers) layers = parsed.layers;
    }
  } catch {
    // Fall through to simple layout
  }

  // Determine agent statuses from episodic log
  const agentStatuses = {};
  for (const event of boardSnapshot.episodicLog || []) {
    if (event.taskId) {
      if (event.action === "started") agentStatuses[event.taskId] = "running";
      else if (event.action === "completed") agentStatuses[event.taskId] = "completed";
      else if (event.action === "failed") agentStatuses[event.taskId] = "failed";
    }
  }

  // Layout agents
  const agentSpacing = 260;
  const layerSpacing = 160;
  const startY = 140;

  if (team.length > 0) {
    // Group by assigned task for layout
    const agentsByTask = {};
    for (const member of team) {
      const key = member.assignedTask || "unassigned";
      if (!agentsByTask[key]) agentsByTask[key] = [];
      agentsByTask[key].push(member);
    }

    // Simple horizontal layout of all agents
    const totalWidth = team.length * agentSpacing;
    const startX = 300 - totalWidth / 2 + agentSpacing / 2;

    team.forEach((member, i) => {
      const taskId = member.assignedTask;
      const taskStatus = taskId ? agentStatuses[taskId] || "idle" : "idle";

      // Determine if agent is waiting (has dependencies not yet completed)
      let displayStatus = taskStatus;
      if (
        status === "executing" &&
        taskStatus === "idle"
      ) {
        displayStatus = "waiting";
      }
      if (status === "assembling" || status === "decomposing" || status === "intake") {
        displayStatus = "idle";
      }

      const nodeId = `agent_${member.agentId}`;
      nodes.push({
        id: nodeId,
        type: "agent",
        position: { x: startX + i * agentSpacing, y: startY },
        data: {
          agentName: member.name,
          agentAvatar: member.avatar,
          agentColor: member.color,
          domain: member.domain,
          specialization: member.specialization,
          taskTitle: member.taskTitle || member.assignedTask,
          model: member.model,
          status: displayStatus,
          highlighted: highlightedNodeId === nodeId,
        },
        draggable: true,
      });

      // Edge from use case to agent
      edges.push({
        id: `uc-${member.agentId}`,
        source: "usecase",
        target: `agent_${member.agentId}`,
        style: displayStatus === "completed" ? ANIMATED_EDGE_STYLE : EDGE_STYLE,
        animated: displayStatus === "running",
      });

      // Edge from agent to synthesis
      edges.push({
        id: `${member.agentId}-synth`,
        source: `agent_${member.agentId}`,
        target: "synthesis",
        style: displayStatus === "completed" ? ANIMATED_EDGE_STYLE : EDGE_STYLE,
        animated: displayStatus === "running",
      });
    });
  }

  // 3. Synthesis node (bottom center)
  const completedCount = Object.values(agentStatuses).filter(
    (s) => s === "completed"
  ).length;
  const totalTasks = team.filter((m) => m.assignedTask).length;

  let synthStatus = "idle";
  if (status === "synthesizing") synthStatus = "running";
  else if (status === "completed") synthStatus = "completed";
  else if (status === "failed") synthStatus = "failed";

  nodes.push({
    id: "synthesis",
    type: "synthesis",
    position: { x: 300, y: startY + layerSpacing + 40 },
    data: {
      status: synthStatus,
      completedTasks: completedCount,
      totalTasks: totalTasks || team.length,
      successRate:
        totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
      highlighted: highlightedNodeId === "synthesis",
    },
    draggable: true,
  });

  return { nodes, edges };
}

export default function OrchestrationCanvas({
  boardSnapshot,
  budget,
  highlightedNodeId = null,
  onNodeClick,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Re-build graph when snapshot, budget, or highlight changes.
  // Preserves user-dragged positions by merging with existing node positions.
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraph(boardSnapshot, budget, highlightedNodeId);

    setNodes((currentNodes) => {
      if (currentNodes.length === 0) return newNodes;
      const posMap = new Map(currentNodes.map((n) => [n.id, n.position]));
      return newNodes.map((n) => ({
        ...n,
        position: posMap.get(n.id) || n.position,
      }));
    });

    setEdges(newEdges);
  }, [boardSnapshot, budget, highlightedNodeId, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (onNodeClick) onNodeClick(node.id);
    },
    [onNodeClick]
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: "#FAFAFA" }}
      >
        <Background color="#E5E7EB" gap={20} size={1} />
        <Controls
          showInteractive={false}
          style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
