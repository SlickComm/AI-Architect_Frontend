"use client";

import dynamic from "next/dynamic";

import { useEffect, useRef, useState } from "react";

const EditableAufmassTable = dynamic(
  () => import('./EditAufmassTable'),
  { ssr: false }
);

export default function AufmassEditorModal({ open, onClose, rows = [], onSave, rawText = "" }) {
  const closeRef = useRef(null);
  const [localRows, setLocalRows] = useState([]);

  // Hilfsfunktion: Egal ob Strings oder Objekte – immer in {text, note} wandeln
  function normalizeRows(input) {
    if (!Array.isArray(input)) return [];
    return input.map((r) =>
      typeof r === "string"
        ? { text: r, note: "" }
        : { text: r?.text ?? "", note: r?.note ?? "" }
    );
  }

  /** Aufmaß-Block → Array von { text, note } (STRICT: nur echte Zeilenumbrüche) */
  function parseAufmassRaw(raw = "") {
    if (!raw) return [];
    const lines = raw
      .replace(/\r/g, "\n")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((l) => !/^aufmaß:?$/i.test(l)); // "Aufmaß:"-Header entfernen

    return normalizeRows(lines); // z. B. [{ text: "Baugraben 1: l=5,0m b=2,0 t=2,0m", note: "" }]
  }

  // Beim Öffnen: direkt vorbefüllen (ohne Preview-Block)
  useEffect(() => {
    if (!open) return;
    const fromProps = normalizeRows(rows);
    const prefill = fromProps.length ? fromProps : parseAufmassRaw(rawText);
    setLocalRows(prefill.length ? prefill : [{ text: "", note: "" }]);
  }, [open, rows, rawText]);

  // ESC & Fokus
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} aria-hidden>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aufmass-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="aufmass-modal-title" className="modal-title">
            Aufmaß bearbeiten
          </h3>
          <button
            ref={closeRef}
            type="button"
            className="icon-btn"
            aria-label="Schließen"
            onClick={onClose}
            title="Schließen"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* nur noch die editierbare Tabelle */}
          <EditableAufmassTable rows={localRows} onChange={setLocalRows} />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              // leere/Whitespace-Zeilen raus
              const cleaned = localRows
                .map((r) => ({ text: (r.text ?? "").trim(), note: r.note ?? "" }))
                .filter((r) => r.text.length > 0);
              onSave?.(cleaned); // -> gibt [{text, note}, ...] zurück
              onClose();
            }}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
