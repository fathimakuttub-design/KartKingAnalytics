import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Loader2,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthInput } from './AuthInput';
import { PasswordStrengthMeter, evaluatePasswordRules } from './PasswordStrengthMeter';
import { SocialButton, GoogleIcon } from './SocialButton';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, googleLogin, demoLogin, websiteName } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Field validation touched states
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [termsError, setTermsError] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Validation functions
  const validateName = (val: string) => {
    if (!val.trim()) return 'Full name is required.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    const rules = evaluatePasswordRules(val);
    const validCount = rules.filter((r) => r.valid).length;
    if (validCount < 4) {
      return 'Please satisfy all 4 password strength requirements.';
    }
    return '';
  };

  const validateConfirmPassword = (val: string, passVal: string) => {
    if (!val) return 'Please confirm your password.';
    if (val !== passVal) return 'Passwords do not match.';
    return '';
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    setNameError(validateName(name));
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    setConfirmPasswordError(validateConfirmPassword(confirmPassword, password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);

    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!agreeTerms) {
      setTermsError('You must agree to the Terms of Service to continue.');
      return;
    } else {
      setTermsError('');
    }

    if (nameErr || emailErr || passErr || confirmErr) return;

    setIsSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password, companyName.trim() || 'KartKing');
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account.');
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
      setFormError(err.message || 'Google sign-up failed.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 sm:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Start analyzing sales, customers, and operations with {websiteName}.
            </p>
          </div>
        </div>

        {/* Global error alert */}
        {formError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Sign up form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Aarav Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            error={nameError}
            touched={nameTouched}
            disabled={isSubmitting}
          />

          <AuthInput
            label="Company / Brand Name (Optional)"
            type="text"
            placeholder="e.g. Nykaa, Zomato, or your brand (defaults to KartKing)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isSubmitting}
          />

          <AuthInput
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="analyst@kartking.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            error={emailError}
            touched={emailTouched}
            disabled={isSubmitting}
          />

          <div className="space-y-1">
            <AuthInput
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPasswordTouched) {
                  setConfirmPasswordError(validateConfirmPassword(confirmPassword, e.target.value));
                }
              }}
              onBlur={handlePasswordBlur}
              error={passwordError}
              touched={passwordTouched}
              disabled={isSubmitting}
            />
            {/* Live Password Strength Meter */}
            <PasswordStrengthMeter password={password} />
          </div>

          <AuthInput
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleConfirmPasswordBlur}
            error={confirmPasswordError}
            touched={confirmPasswordTouched}
            disabled={isSubmitting}
          />

          {/* Terms Checkbox */}
          <div className="space-y-1 pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (e.target.checked) setTermsError('');
                }}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20 dark:border-slate-700"
              />
              <span>
                I agree to the{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  KartKing Terms of Service
                </span>{' '}
                and Privacy Policy.
              </span>
            </label>
            {termsError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">{termsError}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
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
            disabled={isSubmitting}
          >
            Sign up with Google
          </SocialButton>

          <button
            type="button"
            onClick={handleDemoSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/70 py-2.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/70 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/40 transition-all"
          >
            <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Continue as Demo User (Instant preview)</span>
          </button>
        </div>

        {/* Sign in prompt */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-amber-600 hover:underline dark:text-amber-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
