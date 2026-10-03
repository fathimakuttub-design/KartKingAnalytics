import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  touched,
  type = 'text',
  id,
  className = '',
  value,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = Boolean(touched && error);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          {label}
        </label>
        {isPassword && Boolean(value) && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {showPassword ? 'Password visible' : 'Password masked'}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          id={inputId}
          type={effectiveType}
          value={value}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal focus:ring-2 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 ${
            hasError
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800 dark:focus:border-rose-500'
              : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 dark:border-slate-700 dark:focus:border-amber-400 dark:focus:ring-amber-400/20'
          } ${isPassword ? 'pr-12' : ''} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              showPassword
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 stroke-[2.2]" />
            ) : (
              <Eye className="h-4 w-4 stroke-[2]" />
            )}
          </button>
        )}
      </div>

      {hasError && (
        <div
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 pt-0.5"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
