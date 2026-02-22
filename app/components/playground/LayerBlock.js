"use client";
// LayerBlock — Collapsible layer within the Execute stage.
// Shows layer header with descriptive name, aggregate stats, and task list.
// Click header or expand icon to toggle task visibility.

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME, StatusBadge } from "./shared";
import {
  deriveLayerDescription,
  deriveLayerTasks,
  buildTaskMap,
} from "./pipeline-utils";
import TaskRow from "./TaskRow";

export default function LayerBlock({ layer, events, team, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isRunning = layer.status === "running";
  const isCompleted = layer.status === "completed";
  const layerIndex = (layer.layerIndex || 1) - 1; // 0-based for description lookup

  // Auto-expand when running
  useEffect(() => {
    if (isRunning) setExpanded(true);
  }, [isRunning]);

  // Build task map and derive tasks
  const taskMap = useMemo(() => buildTaskMap(events), [events]);
  const tasks = useMemo(
    () => deriveLayerTasks(layer.events, taskMap, team),
    [layer.events, taskMap, team]
  );

  // Layer description from task titles
  const taskTitles = layer.header?.data?.taskTitles || tasks.map((t) => t.name);
  const description = useMemo(
    () => deriveLayerDescription(taskTitles, layerIndex),
    [taskTitles, layerIndex]
  );

  // Aggregate stats
  const successCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const totalTime = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

  const statusColor = isCompleted ? THEME.success : isRunning ? THEME.cyan : THEME.textMuted;

  return (
    <div
      style={{
        background: THEME.bgSurface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color 0.2s",
        borderLeft: `3px solid ${statusColor}`,
      }}
    >
      {/* Layer header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Expand indicator */}
        <span
          style={{
            fontSize: 12,
            color: THEME.textMuted,
            width: 14,
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: expanded ? "rotate(90deg)" : "rotate(0)",
          }}
        >
          {"\u25B6"}
        </span>

        {/* Layer name with description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: THEME.text,
              fontFamily: THEME.fontUI,
            }}
          >
            Layer {layer.layerIndex || 1}
          </span>
          <span
            style={{
              fontSize: 14,
              color: THEME.textSecondary,
              fontFamily: THEME.fontUI,
              marginLeft: 8,
            }}
          >
            ({description})
          </span>
        </div>

        {/* Aggregate stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>
            {totalCount} task{totalCount !== 1 ? "s" : ""}
          </span>
          {isCompleted && (
            <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>
              {successCount === totalCount ? "All succeeded" : `${successCount}/${totalCount} succeeded`}
            </span>
          )}
          {totalTime > 0 && (
            <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              {totalTime.toFixed(1)}s
            </span>
          )}
          <StatusBadge status={isCompleted ? "done" : isRunning ? "running" : "pending"} size="small" />
        </div>
      </button>

      {/* Task list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {tasks.length > 0 ? (
                tasks.map((task) => <TaskRow key={task.id} task={task} />)
              ) : (
                <div style={{ fontSize: 13, color: THEME.textMuted, fontStyle: "italic", padding: "8px 0" }}>
                  Waiting for tasks to start
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
