import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Shield,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  LogIn,
  Database,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    users,
    loginWithCredentials,
    loginAsUser,
    signInWithGoogle,
    isFirebaseConnected,
    saveSampleAccountsToFirebase,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSample, setIsSavingSample] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Authorized Personnel Sample Accounts
  const demoAccounts = [
    {
      role: 'admin' as Role,
      title: 'Administrator',
      name: 'Engr. Elena Santos, PECE',
      username: 'admin',
      password: 'admin123',
      email: 'esantos@bscpe.edu.ph',
      icon: Shield,
      color: 'text-primary-300 bg-primary-600/15 border-primary-500/40',
      badge: 'bg-primary-600/20 text-primary-300 border-primary-500/40',
    },
    {
      role: 'admin' as Role,
      title: 'Lead Administrator',
      name: 'Department Administrator',
      username: 'jcos83531',
      password: 'admin123',
      email: 'jcos83531@gmail.com',
      icon: Shield,
      color: 'text-primary-300 bg-primary-600/15 border-primary-500/40',
      badge: 'bg-primary-600/20 text-primary-300 border-primary-500/40',
    },
    {
      role: 'faculty' as Role,
      title: 'Faculty (Hardware)',
      name: 'Engr. Marcus Vance, M.Eng.',
      username: 'mvance',
      password: 'faculty123',
      email: 'mvance@bscpe.edu.ph',
      icon: BookOpen,
      color: 'text-info bg-info/10 border-info/20 hover:border-info-accent',
      badge: 'bg-info/20 text-info-accent border-info/30',
    },
    {
      role: 'faculty' as Role,
      title: 'Faculty (Software)',
      name: 'Engr. Sarah Chen, MSCS',
      username: 'schen',
      password: 'faculty123',
      email: 'schen@bscpe.edu.ph',
      icon: BookOpen,
      color: 'text-info bg-info/10 border-info/20 hover:border-info-accent',
      badge: 'bg-info/20 text-info-accent border-info/30',
    },
    {
      role: 'reviewer' as Role,
      title: 'Reviewer',
      name: 'Dr. Roberto Gomez, PhD',
      username: 'reviewer',
      password: 'reviewer123',
      email: 'rgomez@bscpe.edu.ph',
      icon: CheckCircle,
      color: 'text-warning bg-warning/10 border-warning/20 hover:border-warning-accent',
      badge: 'bg-warning/20 text-warning-accent border-warning/30',
    },
    {
      role: 'examiner' as Role,
      title: 'Examiner',
      name: 'Engr. Patricia Reyes, M.Eng.',
      username: 'examiner',
      password: 'examiner123',
      email: 'preyes@bscpe.edu.ph',
      icon: FileSpreadsheet,
      color: 'text-success bg-success/10 border-success/20 hover:border-success-accent',
      badge: 'bg-success/20 text-success-accent border-success/30',
    },
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
    setSaveSuccessMessage(null);
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
    setSaveSuccessMessage(null);
    setIsSubmitting(true);
    loginWithCredentials(username, pass).then((res) => {
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed');
      }
    });
  };

  const handleSaveSampleAccounts = async () => {
    setIsSavingSample(true);
    setSaveSuccessMessage(null);
    setErrorMessage(null);

    const success = await saveSampleAccountsToFirebase();
    setIsSavingSample(false);

    if (success) {
      setSaveSuccessMessage('Sample Authorized Personnel Accounts saved and synchronized directly to your Firebase Firestore database!');
      setTimeout(() => setSaveSuccessMessage(null), 8000);
    } else {
      setErrorMessage('Could not save sample accounts to Firebase. Check network or database rules.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-navy-text flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle brand wash - restrained depth cue, not a decorative gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-700/20 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-xl mx-auto w-full space-y-6">
        {/* Header Institution Title */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <img
              src="/Computer_Engineer_Logo.png"
              alt="Computer Engineering logo"
              className="w-24 h-24 rounded-2xl object-contain bg-white ring-1 ring-navy-800 shadow-lg p-1"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-navy-800 text-navy-text text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-success-accent animate-pulse" />
            <span>COLLEGE OF ENGINEERING · BSCpE DEPARTMENT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Examination Question Data Bank
          </h1>
          <p className="text-xs sm:text-sm text-navy-muted max-w-md mx-auto leading-relaxed">
            Centralized academic repository for faculty question authoring, multi-stage peer review, and examination generation.
          </p>

          {/* Cloud Database Status */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-navy-muted font-mono pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-navy-900/90 border border-navy-800">
              <Database className="w-3.5 h-3.5 text-success-accent" />
              <span>Firebase Database: {isFirebaseConnected ? 'Connected (ivory-chalice-fhl8x)' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Primary Login Card */}
        <div className="bg-navy-900/95 border border-navy-800 rounded-xl p-6 sm:p-7 shadow-lg backdrop-blur-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary-600/20 border border-primary-500/30 text-primary-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Sign In with Credentials</h2>
            </div>
            <span className="text-[11px] text-navy-muted font-mono">Authorized Access Only</span>
          </div>

          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success-accent text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-success-accent" />
              <p className="leading-snug">{saveSuccessMessage}</p>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger-accent text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger-accent" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-muted">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. admin, mvance, or esantos@bscpe.edu.ph"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-800 bg-navy-900/80 text-white placeholder-navy-muted focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-navy-text">
                  Password
                </label>
                <span className="text-[10px] text-navy-muted font-mono">Sample: admin123 / faculty123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-navy-800 bg-navy-900/80 text-white placeholder-navy-muted focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy-muted hover:text-navy-text transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 active:bg-primary-700 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Question Bank</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Section with Save Sample to Firebase Button */}
          <div className="pt-4 border-t border-navy-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold text-navy-text uppercase tracking-wider block">
                  Authorized Personnel Accounts
                </span>
                <span className="text-[10px] text-navy-muted font-mono">Sample accounts ready for testing</span>
              </div>

              {/* Explicit Button: Save the Sample Accounts to Firebase */}
              <button
                type="button"
                onClick={handleSaveSampleAccounts}
                disabled={isSavingSample}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-success-accent hover:text-white bg-success/10 hover:bg-success border border-success/30 hover:border-success rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 self-start sm:self-auto"
                title="Save all sample authorized personnel accounts directly to your Firebase Firestore database"
              >
                {isSavingSample ? (
                  <>
                    <span className="w-3 h-3 border-2 border-success-accent/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span>Saving to Firebase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Sample to Firebase</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = identifier.toLowerCase() === acc.username.toLowerCase();

                return (
                  <div
                    key={`${acc.role}-${acc.username}`}
                    className={`p-2.5 rounded-xl border transition-all text-left flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-primary-500 bg-navy-900/90'
                        : 'border-navy-800 bg-navy-900/60 hover:bg-navy-900/60 hover:border-navy-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`p-1 rounded-md border ${acc.color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-white truncate">{acc.title}</span>
                      </div>
                      <p className="text-[11px] text-navy-muted mt-1 truncate">{acc.name.split(',')[0]}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-navy-muted">
                        <span>User: <strong className="text-navy-text">{acc.username}</strong></span>
                        <span>·</span>
                        <span>Pass: <strong className="text-navy-text">{acc.password}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFillDemo(acc.username, acc.password)}
                        className="px-2 py-1 rounded bg-navy-900 hover:bg-navy-800 border border-navy-800 text-[10px] font-medium text-navy-text transition-colors cursor-pointer"
                        title="Fill fields above"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin(acc.username, acc.password)}
                        className="px-2 py-1 rounded bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-[10px] font-bold text-white transition-colors cursor-pointer"
                        title="Direct sign in"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alternate Google Authentication */}
          <div className="pt-2 border-t border-navy-800/80">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs font-medium text-navy-text hover:text-white bg-navy-900/50 hover:bg-navy-900 border border-navy-800 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Or Authenticate with Institutional Google Account</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-navy-muted font-mono space-y-1">
          <p>BSCpE Curriculum Quality Assurance & Accreditation System</p>
          <p>Commission on Higher Education (CHED) CMO 92 Compliant</p>
        </div>
      </div>
    </div>
  );
};
