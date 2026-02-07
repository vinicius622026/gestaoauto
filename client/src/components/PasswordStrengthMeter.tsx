import React from "react";

type Props = {
  password: string;
  minLength?: number;
  className?: string;
};

function scorePassword(pw: string, minLength = 8) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= minLength) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.round((score / 5) * 100);
}

function strengthLabel(score: number) {
  if (score === 0) return "Muito fraca";
  if (score < 40) return "Fraca";
  if (score < 60) return "Razoável";
  if (score < 80) return "Boa";
  return "Forte";
}

function colorClass(score: number) {
  if (score < 40) return "bg-red-500";
  if (score < 60) return "bg-orange-400";
  if (score < 80) return "bg-sky-500";
  return "bg-emerald-500";
}

export default function PasswordStrengthMeter({
  password,
  minLength = 8,
  className,
}: Props) {
  const score = scorePassword(password, minLength);
  const label = strengthLabel(score);
  const barClass = colorClass(score);

  return (
    <div className={className ?? ""}>
      <div className="flex items-center justify-between mb-2">
        <small className="text-xs text-muted-foreground">Força da senha</small>
        <small className="text-xs font-medium">{label}</small>
      </div>

      <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`${barClass} h-2 rounded transition-all duration-200`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <span>{password.length} caractere(s)</span>
        <span className="mx-2">•</span>
        <span>mínimo {minLength}</span>
      </div>
    </div>
  );
}
