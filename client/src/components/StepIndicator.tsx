import React from "react";

type StepIndicatorProps = {
  steps: string[];
  current: number; // zero-based
  className?: string;
};

export default function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <nav className={className ?? ""} aria-label="Progress">
      <ol className="flex items-center space-x-4">
        {steps.map((label, idx) => {
          const isDone = idx < current;
          const isCurrent = idx === current;

          return (
            <li key={label} className="flex items-center space-x-3">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-sky-500 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-slate-300 mx-3" aria-hidden />
                )}
              </div>

              <span className={`text-sm ${isCurrent ? "font-semibold" : "text-slate-600"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
