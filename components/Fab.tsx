'use client';

export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Brain dump"
      className="fixed bottom-[max(env(safe-area-inset-bottom),16px)] right-4 w-16 h-16 rounded-full bg-orange-500 text-white shadow-lg active:scale-95 transition flex items-center justify-center"
    >
      {/* mic icon */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3"/>
        <path d="M5 10v2a7 7 0 0 0 14 0v-2"/>
        <path d="M12 19v3"/>
      </svg>
    </button>
  );
}
