"use client";

import { useState, useRef } from "react";
import EditAssignmentModal from "./EditAssignmentModal";

export default function ReviewPane({
  assigned,
  toReview,
  onReplace,
  onGeneratePdf,
  isGenerating,
  loadingAssigned = false,
  loadingReview = false,
}) {
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

  function MatchDetails({ match }) {
    if (!match) return null;
    return (
      <div className="rp-desc">
        {/* volle Beschreibung inkl. Zeilenumbrüche */}
        <div style={{ whiteSpace: "pre-wrap" }}>{match.description}</div>

        {/* optionale Metadaten */}
        <ul className="rp-meta mt-2 space-y-0.5">
          {match.dn && (
            <li>
              <strong>DN:</strong> {match.dn}
            </li>
          )}
          {match.category && (
            <li>
              <strong>Kategorie:</strong> {match.category}
            </li>
          )}
          {match.unit && (
            <li>
              <strong>Einheit:</strong> {match.unit}
            </li>
          )}
          {match.price != null && (
            <li>
              <strong>EP:</strong> {match.price}
            </li>
          )}
        </ul>
      </div>
    );
  }

  function PosCode({ match }) {
    if (!match) return null;
    return (
      <span className="rp-pos">
        {match.T1}.{match.T2}.{match.Pos}{match.sub ? <span className="rp-sub">.{match.sub}</span> : null}
      </span>
    );
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
                <PosCode match={r.match} />
              </div>

              <MatchDetails match={r.match} />
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
                {/* falls es bereits einen Top-Vorschlag gibt, zeige Code + sub */}
                <PosCode match={r.match} />
              </div>

              {/* vollen Text des Top-Vorschlags anzeigen, wenn vorhanden */}
              <MatchDetails match={r.match} />
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
