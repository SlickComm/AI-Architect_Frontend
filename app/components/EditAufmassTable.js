"use client";

import { useState, useMemo } from "react";

import SortableRow from "./SortableRow";

export default function EditableAufmassTable({ rows = [], onChange }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const ids = useMemo(() => rows.map((_, i) => `row-${i}`), [rows]);

  function arrayMove(arr, from, to) {
    const copy = arr.slice();
    const [it] = copy.splice(from, 1);
    copy.splice(to, 0, it);
    return copy;
  }

  function updateRow(idx, patch) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function addRow() {
    onChange([...rows, { text: "", note: "" }]);
  }
  function removeRow(idx) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  function handleDragStart(id, e) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOverRow(id) {
    if (id !== overId) setOverId(id);
  }

  function handleDropRow(id, e) {
    const fromId = e.dataTransfer.getData("text/plain") || draggingId;
    if (!fromId) return;

    const oldIndex = ids.indexOf(fromId);
    const newIndex = ids.indexOf(id);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onChange(arrayMove(rows, oldIndex, newIndex));
    }
    setDraggingId(null);
    setOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setOverId(null);
  }

  return (
    <div className="tbl">
      <div className="tbl-head">
        <div className="tbl-th w-8" />
        <div className="tbl-th w-14">Pos.</div>
        <div className="tbl-th">Aufmaßtext</div>
        <div className="tbl-th w-12" />
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => {
          const id = ids[i];
          return (
            <SortableRow
              key={id}
              id={id}
              index={i}
              row={row}
              onChange={(patch) => updateRow(i, patch)}
              onRemove={() => removeRow(i)}
              onDragStart={handleDragStart}
              onDragOverRow={handleDragOverRow}
              onDropRow={handleDropRow}
              onDragEnd={handleDragEnd}
              isDragging={draggingId === id}
              isOver={overId === id}
            />
          );
        })}

        {rows.length > 0 && (
          <div
            className={[
              "h-6 rounded-md",
              overId === "__end__" ? "ring-1 ring-white/20" : "ring-1 ring-transparent",
            ].join(" ")}
            onDragOver={(e) => { e.preventDefault(); setOverId("__end__"); }}
            onDrop={(e) => {
              e.preventDefault();
              const fromId = e.dataTransfer.getData("text/plain") || draggingId;
              const oldIndex = ids.indexOf(fromId);
              if (oldIndex !== -1 && oldIndex !== rows.length - 1) {
                onChange(arrayMove(rows, oldIndex, rows.length - 1));
              }
              setDraggingId(null);
              setOverId(null);
            }}
          />
        )}
      </div>

      <div className="mt-3">
        <button type="button" className="btn-secondary" onClick={addRow}>
          + Zeile hinzufügen
        </button>
      </div>
    </div>
  );
}