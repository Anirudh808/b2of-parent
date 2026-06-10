import React from "react";

interface PinPadProps {
  enteredPin: string;
  onNumberClick: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  error?: string;
}

export default function PinPad({
  enteredPin,
  onNumberClick,
  onClear,
  onDelete,
  error,
}: PinPadProps) {
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <span className="text-xs font-bold text-slate-500 tracking-wide">ENTER YOUR 6-DIGIT PASSCODE</span>
      
      {/* Pin Dot indicators */}
      <div className="flex gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
              enteredPin.length > i
                ? "bg-indigo-600 scale-110 shadow-lg shadow-indigo-600/30"
                : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>

      {error && (
        <span className="text-rose-500 text-xs font-bold tracking-wide text-center">
          {error}
        </span>
      )}

      {/* PIN PAD KEYPAD */}
      <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full max-w-[280px] mt-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onNumberClick(n)}
            className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-black transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 tracking-wide cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onNumberClick("0")}
          className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-black transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414A2 2 0 0010.828 19H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
