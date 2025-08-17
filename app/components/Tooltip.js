"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HelpTooltip() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // ESC & Click-Outside schließen
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="help-wrap">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="help-tooltip"
        title="Befehls-Hilfe"
        className="help-btn"
        onClick={() => setOpen(o => !o)}
      >
        {/* ?-Icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.9 2.05c-.76.5-1.4 1.12-1.4 2.2v.25"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="17.5" r="1" fill="currentColor" />
        </svg>
      </button>

      {/* Tooltip / Popover */}
      <div
        id="help-tooltip"
        role="dialog"
        aria-modal="false"
        className={`tt tt-top-start ${open ? "tt--open" : "pointer-events-none"}`}
      >
        <div className="space-y-3">
            <p className="font-semibold">Folgende Befehle sind möglich</p>

            {/* Grundbefehle */}
            <div className="space-y-1">
            <div className="uppercase tracking-wide text-[11px] text-gray-400">Grundbefehle</div>
            <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-mono">Erstelle</span> / <span className="font-mono">Generiere</span> / <span className="font-mono">Zeichne</span> …</li>
                <li>Baugraben: <span className="font-mono bg-gray-700/40 px-1 rounded">Länge × Breite × Tiefe</span></li>
                <li>Rohr: <span className="font-mono bg-gray-700/40 px-1 rounded">DN150</span> + <span className="font-mono bg-gray-700/40 px-1 rounded">Länge Y m</span></li>
                <li>Oberflächenbefestigung: <span className="font-mono bg-gray-700/40 px-1 rounded">Randzone 0,2 m</span>, <span className="font-mono bg-gray-700/40 px-1 rounded">Material: Verbundpflaster</span></li>
            </ul>
            </div>

            <div className="border-t border-gray-700/60" />

            {/* Mehrere Elemente */}
            <div className="space-y-1">
            <div className="uppercase tracking-wide text-[11px] text-gray-400">Mehrere Elemente</div>
            <p>
                Mit Indexierung <span className="font-mono bg-gray-700/40 px-1 rounded">… 1, 2, 3 …</span> können mehrere
                Baugräben und Oberflächen erzeugt werden.
            </p>
            <p className="text-[11px] text-gray-300">
                Beispiel: <span className="font-mono bg-gray-700/40 px-1 rounded">Baugraben 1 …</span>,{" "}
                <span className="font-mono bg-gray-700/40 px-1 rounded">Baugraben 2 …</span>
            </p>
            </div>

            {/* Durchstich */}
            <div className="space-y-1">
            <div className="uppercase tracking-wide text-[11px] text-gray-400">Durchstich</div>
            <p>
                Verbinde <span className="font-mono bg-gray-700/40 px-1 rounded">Baugraben 1</span> und{" "}
                <span className="font-mono bg-gray-700/40 px-1 rounded">Baugraben 2</span> mit einem Durchstich{" "}
                <span className="font-mono bg-gray-700/40 px-1 rounded">Länge X m</span>.
            </p>
            </div>

            {/* Mehrere Oberflächen in einem Baugraben */}
            <div className="space-y-1">
            <div className="uppercase tracking-wide text-[11px] text-gray-400">Mehrere Oberflächen pro Baugraben</div>
            <p>
                Baugraben 1 hat mehrere Oberflächen.<br/>
                Oberfläche 1: <span className="font-mono bg-gray-700/40 px-1 rounded">Randzone 0,2</span>,{" "}
                <span className="font-mono bg-gray-700/40 px-1 rounded">Länge 5 m</span>, Material: Mosaiksteine.<br/>
                Oberfläche 2: <span className="font-mono bg-gray-700/40 px-1 rounded">Randzone 0,4</span>,{" "}
                <span className="font-mono bg-gray-700/40 px-1 rounded">Länge 3 m</span>, Material: Gehwegplatten.
            </p>
            </div>

            <div className="border-t border-gray-700/60" />

            {/* Hinweis */}
            <p className="text-gray-300">
            Abweichende Befehle können funktionieren, sind aber fehleranfällig.
            </p>
        </div>
      </div>
    </div>
  );
}
