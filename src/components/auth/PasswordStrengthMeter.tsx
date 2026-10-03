import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export interface PasswordRule {
  id: string;
  label: string;
  valid: boolean;
}

export function evaluatePasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: 'min-length',
      label: 'Minimum 8 characters',
      valid: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      valid: /[A-Z]/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      valid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const rules = evaluatePasswordRules(password);
  const validCount = rules.filter((r) => r.valid).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let textColor = 'text-rose-600 dark:text-rose-400';

  if (validCount === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (validCount >= 2) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
        <span className={`font-semibold ${textColor}`}>{strengthLabel}</span>
      </div>

      {/* 4 segment bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index < validCount
                ? strengthColor
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-1.5 transition-colors ${
              rule.valid
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {rule.valid ? (
              <Check className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <X className="h-3 w-3 stroke-[2]" />
            )}
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
