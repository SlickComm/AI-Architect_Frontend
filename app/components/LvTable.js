"use client";

export default function LvTable({ rows = [], selectedKey, onSelect }) {
  const mkKey = (r) => `${r.T1}-${r.T2}-${r.Pos}`;

  return (
    <div className="lv-table">
      <div className="lv-thead">
        <div className="lv-tr">
          <div className="lv-th w-10"></div>
          <div className="lv-th">T1</div>
          <div className="lv-th">T2</div>
          <div className="lv-th">Pos</div>
          <div className="lv-th flex-1">Beschreibung</div>
          <div className="lv-th">Einheit</div>
          <div className="lv-th text-right">Preis</div>
        </div>
      </div>

      <div className="lv-tbody">
        {rows.map((r, i) => {
          const key = mkKey(r);
          const checked = selectedKey === key;
          return (
            <label
              key={i}
              className={`lv-tr lv-row ${checked ? "lv-row--active" : ""}`}
            >
              <div className="lv-td w-10">
                <input
                  type="checkbox"
                  className="lv-checkbox"
                  checked={checked}
                  onChange={() => onSelect(checked ? null : key, r)}
                />
              </div>
              <div className="lv-td">{r.T1}</div>
              <div className="lv-td">{r.T2}</div>
              <div className="lv-td">{r.Pos}</div>
              <div className="lv-td flex-1">{r.description}</div>
              <div className="lv-td">{r.unit ?? "—"}</div>
              <div className="lv-td text-right">
                {r.price != null ? r.price : "—"}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
