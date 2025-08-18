"use client";

import { useState, useRef } from "react";

import EditAssignmentModal from "./EditAssignmentModal";

export default function ReviewPane({ assigned, toReview, onReplace, onGeneratePdf, isGenerating, loadingAssigned = false, loadingReview = false }) {
  const savingRef = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function openModal(source, index, item) {
    setEditing({ source, index, item });
    setModalOpen(true);
  }

  function handleSave(newRow) {
    if (!editing || savingRef.current) return;
    savingRef.current = true;
    try {
      onReplace?.({ source: editing.source, index: editing.index }, newRow);
    } finally {
      savingRef.current = false;
      setModalOpen(false);
      setEditing(null);
    }
  }

  return (
    <section className="review-pane">
      {/* sichere Treffer */}
      <h2 className="rp-heading">Sichere Zuordnungen</h2>
      {loadingAssigned && <span className="spinner ml-2" />}
      <ul className="rp-list">
        {assigned.map((r, i) => (
          <li key={i} className="rp-row rp-row-ok">
            <div className="rp-left">
              <div className="rp-header">
                <span className="rp-aufmass">{r.aufmass}</span>
                <span className="rp-pos">
                  {r.match.T1}.{r.match.T2}.{r.match.Pos}
                </span>
              </div>
              <p className="rp-desc">{r.match.description}</p>
            </div>

            <div className="rp-action-cell">
              <button
                type="button"
                className="rp-action-btn"
                aria-label="Bearbeiten"
                title="Bearbeiten"
                onClick={() => openModal("assigned", i, r)}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 21l3.6-.7c.3-.06.58-.2.8-.41L20.5 6.8a2.4 2.4 0 10-3.4-3.4L4 16.5c-.2.22-.35.5-.41.8L3 21z" />
                  <path d="M15.5 5.5l3 3" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* unsichere Treffer */}
      <h2 className="rp-heading">Bitte prüfen</h2>
      {loadingReview && <span className="spinner ml-2" />}
      <ul className="rp-list">
        {toReview.map((r, i) => (
          <li key={i} className="rp-row">
            <div className="rp-left">
              <div className="rp-header">
                <span className="rp-aufmass">{r.aufmass}</span>
                {/*<select
                  className="rp-select"
                  defaultValue=""
                  onChange={(e) => {
                    const pos = r.alternatives.find((a) => a.Pos === e.target.value);
                    pos && onSelect(i, pos);
                  }}
                >
                  <option value="" disabled>Position wählen …</option>
                  {r.alternatives.map((alt, j) => (
                    <option key={j} value={alt.Pos}>
                      {alt.T1}.{alt.T2}.{alt.Pos} · {alt.description}
                    </option>
                  ))}
                </select>*/}
              </div>
            </div>

            <div className="rp-action-cell">
              <button
                type="button"
                className="rp-action-btn"
                aria-label="Bearbeiten"
                title="Bearbeiten"
                onClick={() => openModal("toReview", i, r)}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 21l3.6-.7c.3-.06.58-.2.8-.41L20.5 6.8a2.4 2.4 0 10-3.4-3.4L4 16.5c-.2.22-.35.5-.41.8L3 21z" />
                  <path d="M15.5 5.5l3 3" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end mt-6">
        <button
          onClick={onGeneratePdf}
          disabled={isGenerating}
          className="btn-primary flex items-center gap-2"
        >
          {isGenerating && <span className="spinner w-4 h-4" />}
          Rechnung erzeugen
        </button>
      </div>

      {/* Modal */}
      <EditAssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editing?.item}
        onSave={handleSave}
      />
    </section>
  );
}
