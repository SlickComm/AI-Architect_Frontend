"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableRow({ id, index, row, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="tbl-row">
      <div className="tbl-td w-8 flex items-center">
        <button
          type="button"
          className="btn-ghost"
          title="Ziehen zum Sortieren"
          aria-label="Ziehen zum Sortieren"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      </div>

      <div className="tbl-td font-mono text-xs text-gray-400">{index + 1}</div>

      <div className="tbl-td">
        <input
          className="tbl-input"
          value={row.text ?? ""}
          placeholder='z. B. "Baugraben 1: l=5,0m b=2,0 t=2,0m"'
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>

      <div className="tbl-td flex justify-end">
        <button
            type="button"
            className="btn-icon danger"
            aria-label="Zeile löschen"
            title="Zeile löschen"
            onClick={onRemove}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1.2 13.5A2 2 0 0 1 15.82 21H8.18a2 2 0 0 1-1.98-1.5L5 6" />
            <path d="M10 11v6M14 11v6" />
            </svg>
        </button>
        </div>
    </div>
  );
}