// components/AgentFlow.jsx
"use client";

import React, { memo, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ───────── Status-abhängige Farben ───────── */
const statusStyles = {
  queued:   { bg: "bg-slate-100 border-slate-300", bar: "bg-slate-400" },
  running:  { bg: "bg-blue-50 border-blue-400",    bar: "bg-blue-500"  },
  success:  { bg: "bg-green-50 border-green-500",  bar: "bg-green-500" },
  error:    { bg: "bg-red-50 border-red-500",      bar: "bg-red-500"   },
};

/* ───────── Fortschritts-Balken ───────── */
const ProgressBar = ({ value = 0, color }) => (
  <div className="w-full h-1 rounded bg-gray-200 overflow-hidden">
    <div
      className={`h-full transition-all duration-300 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

/* ───────── Custom Node ───────── */
const StatusNode = memo(({ data }) => {
  const style = statusStyles[data.status] || statusStyles.queued;
  const cls =
    `rounded-xl px-4 py-2 shadow-md border-2 text-sm font-medium whitespace-pre ${style.bg}`;

  // Progress in Prozent (0‑100). Fällt auf 100 %, wenn status==success ohne explicit progress.
  const progressPercent =
    data.progress != null ? data.progress * 100 : data.status === "success" ? 100 : 0;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!opacity-0" />

      <div className={cls}>
        <div className="font-semibold leading-tight break-words">{data.label}</div>

        {/* Progress */}
        {progressPercent > 0 && (
          <div className="mt-1">
            <ProgressBar value={progressPercent} color={style.bar} />
          </div>
        )}

        {/* Dauer */}
        {data.duration != null && (
          <div className="mt-1 text-xs text-gray-500">{data.duration} ms</div>
        )}

        {/* Download */}
        {data.downloadUrl && (
          <a
            href={data.downloadUrl}
            download
            className="mt-2 inline-block rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Download
          </a>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </>
  );
});

const nodeTypes = { statusNode: StatusNode };

export default function AgentFlow({ flow }) {
  const initialNodes = useMemo(
    () =>
      flow.nodes.map((n) => ({
        id: n.id,
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: { ...n },
        type: "statusNode",
      })),
    [flow.nodes]
  );

  const initialEdges = useMemo(
    () =>
      flow.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
      })),
    [flow.edges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap pannable zoomable />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}