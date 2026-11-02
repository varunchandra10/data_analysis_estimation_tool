import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { StatusBadge } from '../common';

/**
 * Enterprise Authentication Modal
 * Supports seamless Sign In and Account Registration with empty initial fields,
 * real-time validation, password visibility toggles, and secure JWT session management.
 */
export default function LoginModal({ isOpen, onClose }) {
  const { login, register } = useAuthContext();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccessMessage('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Handle Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Client-side validations
    if (!cleanUsername) {
      setError('Username is required.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!cleanPassword) {
      setError('Password is required.');
      return;
    }

    if (mode === 'register') {
      if (!cleanEmail) {
        setError('Email address is required.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (cleanPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(cleanUsername, cleanPassword);
        onClose();
      } else {
        // Register and automatically sign in
        await register(cleanUsername, cleanEmail, cleanPassword);
        setSuccessMessage('Account registered successfully! Logging you in...');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        (mode === 'login' ? 'Login failed. Please verify credentials.' : 'Registration failed.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl transition-all font-sans text-slate-800 dark:text-slate-100 animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Subtle Top Ambient Gradient Strip */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs shrink-0">
              {mode === 'login' ? <Lock size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  DAET Security Access
                </span>
                <StatusBadge variant="emerald" size="xs" dot>
                  Online
                </StatusBadge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight font-mono">
                {mode === 'login' ? 'Sign In to Platform' : 'Create New Account'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Segment Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 mt-4 text-xs font-semibold font-mono">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus size={13} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 p-3 text-xs rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 animate-in fade-in duration-150">
            <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-4 flex items-start gap-2.5 p-3 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-150">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-500 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
              Username
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder={mode === 'login' ? 'Enter your username' : 'Choose a unique username'}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Email Field (Register Mode Only) */}
          {mode === 'register' && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="analyst@organization.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <>
                    <EyeOff size={11} /> Hide
                  </>
                ) : (
                  <>
                    <Eye size={11} /> Show
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-wider"
                placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                required
              />
            </div>
          </div>

          {/* Confirm Password Field (Register Mode Only) */}
          {mode === 'register' && (
            <div className="animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? (
                    <>
                      <EyeOff size={11} /> Hide
                    </>
                  ) : (
                    <>
                      <Eye size={11} /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <KeyRound
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-wider"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20 font-mono uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Registering Account...'}</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={14} />
                  <span>Establish Session</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Alternate Action Link */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>256-Bit JWT Session Token • Multi-Tenant Protected</span>
        </div>
      </div>
    </div>
  );
}
