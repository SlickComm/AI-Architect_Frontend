// app/components/PayConfirmPopup.jsx
"use client";

export default function PayConfirmPopup({ open, tokensLeft, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24">
      <div className="mx-4 rounded-xl border border-green-500/40 bg-gray-900/90 backdrop-blur p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white">✓</span>
          <div className="text-sm text-gray-100">
            <div className="font-semibold">Zahlung bestätigt – 1 Token eingelöst.</div>
            <div className="opacity-90">
              Großartig! ChatCAD hat dir gerade Zeit & Kosten gespart.
              Verbleibendes Guthaben: <b>{tokensLeft}</b> Token.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10"
            aria-label="Popup schließen"
            title="Schließen"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
