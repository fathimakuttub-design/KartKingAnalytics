import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Users,
  ShieldAlert,
  Loader2,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthInput } from './AuthInput';
import { SocialButton, GoogleIcon } from './SocialButton';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin, demoLogin, isLockedOut, lockoutSeconds, isFirebaseConfigured, websiteName } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Field validation states
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Validation functions
  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    return '';
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (emailErr || passErr) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsGoogleSubmitting(true);
    try {
      await googleLogin();
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Google sign in failed.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Left side: Branded panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-slate-200/80 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 p-12 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {websiteName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                E-Commerce Intelligence Platform
              </p>
            </div>
          </div>

          <div className="mt-16 space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Turn sales data <br />
              <span className="text-amber-600 dark:text-amber-400">into decisive growth.</span>
            </h1>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
              The purpose-built executive analytics dashboard for Indian retail. Monitor regional demand, festive seasonality, reverse logistics, and customer RFM lifetime value in one unified view.
            </p>
          </div>

          {/* 3 Feature Highlights */}
          <div className="mt-12 space-y-6 max-w-md">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Real-Time Sales & Festive Seasonality
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Analyze daily, weekly, and monthly spikes around Diwali, Republic Day, and metro sales corridors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Gemini AI Executive Decision Support
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Generate 5 business insights, 3 prioritized actions, or ask freeform questions answered with grounded stats.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  RFM Customer Loyalty & Retention Engine
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Segment shoppers into Champions, Loyal, At Risk, and Lost to protect high-AOV customer value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          KartKing Portfolio Analytics Suite · Production Portfolio Project
        </div>
      </div>

      {/* Right side: Login card */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="flex items-center gap-2.5 lg:hidden mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{websiteName}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to your {websiteName} workspace to access commercial intelligence.
            </p>
          </div>

          {/* Rate-limit lockout warning */}
          {isLockedOut && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <span className="font-semibold">Security Lockout Active:</span> Too many failed login attempts. Please wait{' '}
                <span className="font-bold tabular-nums">{lockoutSeconds}s</span> before retrying.
              </div>
            </div>
          )}

          {/* Form error alert */}
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="e.g. analyst@kartking.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              error={emailError}
              touched={emailTouched}
              disabled={isLockedOut || isSubmitting}
            />

            <AuthInput
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              error={passwordError}
              touched={passwordTouched}
              disabled={isLockedOut || isSubmitting}
            />

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500/20 dark:border-slate-700"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign in primary submit */}
            <button
              type="submit"
              disabled={isLockedOut || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-slate-50 px-3 text-[11px] font-medium uppercase text-slate-400 dark:bg-slate-950 dark:text-slate-500">
              or
            </span>
          </div>

          {/* Social & Demo login buttons */}
          <div className="space-y-2.5">
            <SocialButton
              icon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              loading={isGoogleSubmitting}
              disabled={isLockedOut || isSubmitting}
            >
              Continue with Google
            </SocialButton>

            {/* Demo user button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/70 py-2.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/70 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/40 transition-all"
            >
              <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Continue as Demo User (No signup required)</span>
            </button>
          </div>

          {/* Sign up prompt */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-amber-600 hover:underline dark:text-amber-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
