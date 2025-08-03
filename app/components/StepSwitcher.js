"use client";

export default function StepSwitcher({ step, setStep }) {
  const tabs = [
    { id: 1, label: "Aufmaß"   },
    { id: 2, label: "Rechnung" },
  ];

  return (
    <div className="step-switch-wrapper">
      <div className="step-switch-inner">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setStep(t.id)}
            className={`step-switch-btn ${
              step === t.id
                ? "step-switch-btn--active"
                : "step-switch-btn--idle"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
