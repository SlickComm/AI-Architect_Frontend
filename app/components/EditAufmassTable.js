"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableRow from "./SortableRow";

export default function EditableAufmassTable({ rows = [], onChange }) {
  function updateRow(idx, patch) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function addRow() {
    onChange([...rows, { text: "", note: "" }]);
  }
  function removeRow(idx) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  // stabile IDs für DnD (hier ausreichend: Index-basiert)
  const ids = rows.map((_, i) => `row-${i}`);

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    onChange(arrayMove(rows, oldIndex, newIndex));
  }

  return (
    <div className="tbl">
      <div className="tbl-head">
        <div className="tbl-th w-8" />
        <div className="tbl-th w-14">Pos.</div>
        <div className="tbl-th">Aufmaßtext</div>
        <div className="tbl-th w-12" />
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="tbl-body">
            {rows.map((row, i) => (
              <SortableRow
                key={ids[i]}
                id={ids[i]}
                index={i}
                row={row}
                onChange={(patch) => updateRow(i, patch)}
                onRemove={() => removeRow(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3">
        <button type="button" className="btn-secondary" onClick={addRow}>
          + Zeile hinzufügen
        </button>
      </div>
    </div>
  );
}