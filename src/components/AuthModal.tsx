import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  Loader2,
  Database,
} from "lucide-react";
import { UserProfile, UserFullProgressData } from "../types";
import { registerAccount, loginAccount, signInWithGoogle } from "../services/userService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onLoginSuccess: (user: UserProfile, progress?: UserFullProgressData) => void;
  initialMode?: "signin" | "signup";
}

const OPTIONAL_SUBJECTS = [
  "Public Administration",
  "Political Science & IR (PSIR)",
  "Sociology",
  "Geography",
  "History",
  "Anthropology",
  "Philosophy",
  "Economics",
  "Law",
  "Psychology",
];

const TARGET_YEARS = ["UPSC CSE 2025", "UPSC CSE 2026", "UPSC CSE 2027", "UPSC CSE 2028"];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState<string>(currentUser?.email || "");
  const [signInPassword, setSignInPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Keep signInEmail synced if currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      setSignInEmail(currentUser.email);
    }
  }, [currentUser?.email]);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState<string>("");
  const [signUpEmail, setSignUpEmail] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>("");
  const [signUpTarget, setSignUpTarget] = useState<string>("UPSC CSE 2026");
  const [signUpOptional, setSignUpOptional] = useState<string>("Public Administration");

  // Validation / Message feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        setSuccessMsg(`Authenticated as ${res.user.name}! Synchronizing Firestore progress...`);
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(res.user!, res.progress);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.message || "Google sign-in was cancelled or failed.");
        setIsLoading(false);
      }
    } catch {
      setErrorMsg("Google authentication failed. Please try email sign in.");
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signInEmail.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAccount({
        email: signInEmail.trim(),
        password: signInPassword,
      });

      if (!res.success || !res.user) {
        setErrorMsg(res.message || "Failed to sign in. Please verify your email and password.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Welcome back, ${res.user.name}! Restoring your saved progress...`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(res.user!, res.progress);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg("Failed to sign in. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signUpName.trim()) {
      setErrorMsg("Please enter your aspirant name.");
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }
    if (signUpPassword && signUpPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerAccount({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        target: signUpTarget,
        optionalSubject: signUpOptional,
      });

      if (!res.success || !res.user) {
        setErrorMsg(res.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Account created for ${res.user.name}! Initializing your clean dashboard...`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(res.user!, res.progress);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg("Failed to create account. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Aspirant Account</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === "signin" ? "Sign In & Restore Progress" : "Create New Aspirant Profile"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "signin"
              ? "All your completed syllabus topics, timers, answer reviews, and scores will be loaded exactly as you left them."
              : "Register your personalized account. Your study progress and analytics will be permanently saved."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-[#121826] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              mode === "signin"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              mode === "signup"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Google One-Click Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all flex items-center justify-center space-x-2 border border-slate-200 shadow-sm disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0B0F19] px-3 text-[11px] text-slate-500 uppercase tracking-wider relative">
            Or with email
          </span>
        </div>

        {/* Alerts / Error messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="e.g. mohamedunaiz001@gmail.com"
                className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Password</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">Min 6 characters</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Auto-sync enabled</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Load Saved Progress</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                required
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="e.g. Mohamed Unaiz"
                className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="e.g. mohamedunaiz001@gmail.com"
                className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Target Year & Optional Subject in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Year</label>
                <select
                  value={signUpTarget}
                  onChange={(e) => setSignUpTarget(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {TARGET_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#121826]">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Optional Subject</label>
                <select
                  value={signUpOptional}
                  onChange={(e) => setSignUpOptional(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {OPTIONAL_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub} className="bg-[#121826]">
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Preparing</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
