"use client";

import { useEffect, useState, useRef } from "react";

import LvTable from "./LvTable";

export default function EditAssignmentModal({ open, onClose, item, onSave }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const closeRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [lvTabs, setLvTabs] = useState([]);
  const [lvLoading, setLvLoading] = useState(false);
  const [lvError, setLvError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setSelectedKey(null);
      setSelectedRow(null);
      setLvLoading(true);
      setLvError(null);
      const url = new URL(`${baseUrl}/lv`);
      url.searchParams.set("format", "catalogs");
      if (search) url.searchParams.set("q", search);
      fetch(url.toString())
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(data => setLvTabs(data.tabs || []))
        .catch(async e => {
          let msg = "LV konnte nicht geladen werden.";
          try { msg = await e.text(); } catch {}
          setLvError(msg);
        })
        .finally(() => setLvLoading(false));
    }
  }, [open, search]);

  // ESC schließt; Fokus setzen
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const posLabel = item?.match
    ? `${item.match.T1}.${item.match.T2}.${item.match.Pos}`
    : "—";

  const handleSelect = (key, row) => {
    setSelectedKey(key);
    setSelectedRow(row || null);
  };

  const handleSave = () => {
    if (!selectedRow) return;
    onSave?.(selectedRow);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} aria-hidden>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            Zuordnung bearbeiten
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

        {/* Info zur aktuellen Position */}
        <div className="modal-body">
          <div className="mb-4">
            <div className="text-xs text-gray-400">Aufmaß</div>
            <div className="font-mono text-sm text-gray-100 break-words">
              {item?.aufmass || "—"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400">Aktuelle Position</div>
              <div className="font-mono text-sm text-blue-200">{posLabel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Beschreibung</div>
              <div className="text-sm text-gray-200">
                {item?.match?.description || item?.preview || "—"}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="modal-tabs">
            {lvTabs.map((t, idx) => (
              <button
                key={idx}
                type="button"
                className={`tab-btn ${activeTab === idx ? "tab-btn--active" : "tab-btn--idle"}`}
                onClick={() => setActiveTab(idx)}
              >
                {t.title}
              </button>
            ))}
          </div>
          
          {lvLoading ? (
            <div className="text-sm text-gray-400 mt-2">LV wird geladen…</div>
          ) : lvError ? (
            <div className="text-sm text-red-400 mt-2">{lvError}</div>
          ) : (
            <LvTable
              rows={lvTabs[activeTab]?.rows || []}
              selectedKey={selectedKey}
              onSelect={handleSelect}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={!selectedRow}
          >
            Speichern & Ersetzen
          </button>
        </div>
      </div>
    </div>
  );
}
