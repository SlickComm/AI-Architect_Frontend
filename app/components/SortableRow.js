"use client";

export default function SortableRow({
  id,
  index,
  row,
  onChange,
  onRemove,
  onDragStart,
  onDragOverRow,
  onDropRow,
  onDragEnd,
  isDragging = false,
  isOver = false,
}) {
  return (
    /*<div
      className={[
        "grid grid-cols-[36px_56px_1fr_44px] gap-x-3 items-center",
        "rounded-md",
        isOver ? "ring-1 ring-white/20" : "",
        isDragging ? "opacity-50" : "",
      ].join(" ")}
      onDragOver={(e) => { e.preventDefault(); onDragOverRow?.(id); }}
      onDrop={(e) => { e.preventDefault(); onDropRow?.(id, e); }}
    >
      <div className="w-9 flex items-center">
        <button
          type="button"
          className="btn-ghost select-none cursor-grab active:cursor-grabbing"
          title="Ziehen zum Sortieren"
          aria-label="Ziehen zum Sortieren"
          draggable
          onDragStart={(e) => onDragStart?.(id, e)}
          onDragEnd={onDragEnd}
        >
          ⋮⋮
        </button>
      </div>

      <div className="font-mono text-xs text-gray-400">{index + 1}</div>

      <div>
        <input
          className="tbl-input w-full"
          value={row.text ?? ""}
          placeholder='z. B. "Baugraben 1: l=5,0 m  b=2,0 m  t=2,0 m"'
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 group"
          aria-label="Zeile löschen"
          title="Zeile löschen"
          onClick={onRemove}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px] group-hover:stroke-[#ff6b6b]"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1.2 13.5A2 2 0 0 1 15.82 21H8.18a2 2 0 0 1-1.98-1.5L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>*/
    <div>Test</div>
  );
}