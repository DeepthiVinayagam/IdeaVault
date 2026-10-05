import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlowingButterflies from '../components/GlowingButterflies';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, BookOpen, Cpu, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo accounts
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#070A14] via-[#0B1020] to-[#120B24] flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden select-none">
      {/* Background Night-Sky & Glowing Butterflies */}
      <GlowingButterflies />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand Hero */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vault-violet/10 border border-vault-violet/30 text-vault-cyanLight text-xs font-semibold tracking-wide w-fit backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-vault-cyan animate-pulse" />
            <span>AI-Driven Academic Project Intelligence</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Idea<span className="text-transparent bg-clip-text bg-gradient-to-r from-vault-violetLight via-vault-cyan to-vault-cyanLight">Vault</span>
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-medium text-vault-cyan tracking-wide font-heading">
              Small Ideas ✦ Big Innovations
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-vault-textMuted leading-relaxed max-w-xl">
            Compare your capstone and research ideas against faculty-approved completed projects in real time. Refine your methodology, eliminate unintentional duplication, and discover high-impact novel engineering angles.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-vault-card/60 border border-vault-border/50 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-vault-cyan/10 border border-vault-cyan/20 flex items-center justify-center text-vault-cyan mb-2">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">TF-IDF Similarity</div>
              <div className="text-[11px] text-vault-textMuted mt-0.5">Semantic cosine overlap scoring</div>
            </div>

            <div className="p-3.5 rounded-xl bg-vault-card/60 border border-vault-border/50 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-vault-violet/10 border border-vault-violet/20 flex items-center justify-center text-vault-violetLight mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">Advisory Guidance</div>
              <div className="text-[11px] text-vault-textMuted mt-0.5">Actionable improvement tips</div>
            </div>

            <div className="p-3.5 rounded-xl bg-vault-card/60 border border-vault-border/50 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">Faculty Approved</div>
              <div className="text-[11px] text-vault-textMuted mt-0.5">Verified university repository</div>
            </div>
          </div>
        </div>

        {/* Right Column: Glass Login Card */}
        <div className="lg:col-span-5 w-full">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-vault-borderLight/40 relative">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-heading">Sign In</h2>
              <p className="text-xs text-vault-textMuted mt-1">
                Access your IdeaVault workspace and historical analyses.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-vault-textMuted mb-1.5">
                  Academic Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-vault-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ideavault.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vault-bg/70 border border-vault-border text-white text-sm placeholder-vault-textMuted/50 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-vault-textMuted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-vault-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vault-bg/70 border border-vault-border text-white text-sm placeholder-vault-textMuted/50 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-vault-violet via-vault-violetDark to-vault-cyan text-white text-sm font-semibold hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-vault-violet/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick-fill Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-vault-border/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-vault-textMuted block mb-2.5 text-center">
                Demo Accounts (One-Click Auto Fill)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student@ideavault.edu', 'password123')}
                  className="px-2.5 py-2 rounded-xl bg-vault-bg/60 border border-vault-border/80 hover:border-vault-cyan/50 text-[11px] font-medium text-vault-cyan transition-all text-center"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('faculty@ideavault.edu', 'password123')}
                  className="px-2.5 py-2 rounded-xl bg-vault-bg/60 border border-vault-border/80 hover:border-vault-violet/50 text-[11px] font-medium text-vault-violetLight transition-all text-center"
                >
                  🏛️ Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@ideavault.edu', 'password123')}
                  className="px-2.5 py-2 rounded-xl bg-vault-bg/60 border border-vault-border/80 hover:border-amber-400/50 text-[11px] font-medium text-amber-300 transition-all text-center"
                >
                  ⚡ Admin
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
