"use client";

export default function StepSwitcher({ step, setStep, onAuxClick, hasPositions = false, }) {
  const tabs = [
    { id: 1, label: "Aufmaß"   },
    { id: 2, label: "Rechnung" },
  ];

  const isAufmass = step === 1;
  const showPencil = isAufmass && hasPositions;

  return (
    <div className="step-switch-wrapper">
      <div className="inline-flex items-center gap-2">
        <div className="step-switch-inner">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setStep(t.id)}
              className={`step-switch-btn ${step === t.id ? "step-switch-btn--active" : "step-switch-btn--idle"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="step-mini-slot">
          <button
            type="button"
            className={`step-mini-btn ${!showPencil ? "invisible pointer-events-none" : ""}`}
            onClick={onAuxClick || (() => {})}
            aria-label="Aufmaß bearbeiten"
            title="Aufmaß bearbeiten"
            aria-hidden={!isAufmass}
            tabIndex={isAufmass ? 0 : -1}
          >
            {/* Stift-Icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l3.6-.7c.3-.06.58-.2.8-.41L20.5 6.8a2.4 2.4 0 10-3.4-3.4L4 16.5c-.2.22-.35.5-.41.8L3 21z" />
              <path d="M15.5 5.5l3 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
