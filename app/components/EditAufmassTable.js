"use client";

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

  return (
    <div className="tbl">
      <div className="tbl-head">
        <div className="tbl-th w-14">Pos.</div>
        <div className="tbl-th">Aufmaßtext</div>
        <div className="tbl-th w-12" />
      </div>

      <div className="tbl-body">
        {rows.map((row, i) => (
          <div key={i} className="tbl-row">
            <div className="tbl-td font-mono text-xs text-gray-400">{i + 1}</div>
            <div className="tbl-td">
              <input
                className="tbl-input"
                value={row.text ?? ""}
                placeholder='z. B. "Baugraben 1: l=5,0m b=2,0 t=2,0m"'
                onChange={(e) => updateRow(i, { text: e.target.value })}
              />
            </div>
            <div className="tbl-td flex justify-end">
              <button
                type="button"
                className="btn-ghost"
                aria-label="Zeile löschen"
                title="Zeile löschen"
                onClick={() => removeRow(i)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6h10z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button type="button" className="btn-secondary" onClick={addRow}>
          + Zeile hinzufügen
        </button>
      </div>
    </div>
  );
}
