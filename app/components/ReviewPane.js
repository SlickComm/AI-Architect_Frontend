"use client";

export default function ReviewPane({ assigned, toReview, onSelect, onInvoice, onDownloadPDF, pdfReady }) {
  return (
    <section className="review-pane">
      {/* sichere Treffer */}
      <h2 className="rp-heading">Sichere Zuordnungen</h2>
      <ul className="rp-list">
        {assigned.map((r, i) => (
          <li key={i} className="rp-row rp-row-ok">
            <span className="rp-aufmass">{r.aufmass}</span>
            <span className="rp-pos">
              {r.match.T1}.{r.match.T2}.{r.match.Pos}
            </span>
            <span className="rp-desc">{r.match.description}</span>
          </li>
        ))}
      </ul>

      {/* unsichere Treffer */}
      <h2 className="rp-heading">Bitte prüfen</h2>
      <ul className="rp-list">
        {toReview.map((r, i) => (
          <li key={i} className="rp-row">
            <span className="rp-aufmass">{r.aufmass}</span>

            <select
              className="rp-select"
              defaultValue=""
              onChange={e => {
                const pos = r.alternatives.find(a => a.Pos === e.target.value);
                pos && onSelect(i, pos);
              }}
            >
              <option value="" disabled>Position wählen …</option>
              {r.alternatives.map((alt, j) => (
                <option key={j} value={alt.Pos}>
                  {alt.T1}.{alt.T2}.{alt.Pos} · {alt.description}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onInvoice} className="btn-primary">
            Rechnung erzeugen
        </button>
        {pdfReady && (
            <button onClick={onDownloadPDF} className="btn-secondary">
                PDF downloaden
            </button>
        )}
      </div>
    </section>
  );
}
