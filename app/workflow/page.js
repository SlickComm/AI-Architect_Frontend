"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const AgentFlow = dynamic(() => import("../components/AgentFlow.js"), {
  ssr: false,
});

export default function AgentsPage() {
  const flow = useMemo(
    () => ({
      nodes: [
        {
          id: "draw",
          label: "✏️ Technische Zeichnung",
          status: "success",
          duration: 42,
          x: 0,
          y: 0,
        },
        {
          id: "bill",
          label: "💶 Rechnungserstellung",
          status: "queued",
          duration: null,
          x: 300,
          y: 0,
        },
      ],
      edges: [
        { id: "edge1", source: "draw", target: "bill" },
      ],
    }),
    []
  );
  

  return (
    <main className="flex h-screen flex-col p-6">
      <h1 className="mb-4 text-2xl font-semibold">Agent-Pipeline Preview</h1>

      {/* ❸ Container – füllt den restlichen Platz */}
      <div className="flex-1 rounded-2xl border border-slate-300">
        <AgentFlow flow={flow} />
      </div>
    </main>
  );
}
