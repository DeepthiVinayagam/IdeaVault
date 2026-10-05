import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lightbulb, 
  FolderGit2, 
  History, 
  ShieldCheck, 
  Users, 
  LogOut, 
  Sparkles, 
  Menu, 
  X,
  FileText,
  User
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  // Role-based navigation items
  const navItems = [];

  if (user.role === 'student') {
    navItems.push(
      { id: 'dashboard', label: 'Idea Workspace', icon: Lightbulb, badge: 'Active' },
      { id: 'analyses', label: 'Analysis History', icon: History },
      { id: 'catalog', label: 'Approved Projects', icon: FolderGit2 }
    );
  } else if (user.role === 'faculty') {
    navItems.push(
      { id: 'faculty-hub', label: 'Faculty Review Hub', icon: ShieldCheck, badge: 'Faculty' },
      { id: 'catalog', label: 'Approved Projects', icon: FolderGit2 }
    );
  } else if (user.role === 'admin') {
    navItems.push(
      { id: 'admin-users', label: 'User Management', icon: Users, badge: 'Admin' },
      { id: 'faculty-hub', label: 'Faculty Hub & Approvals', icon: ShieldCheck },
      { id: 'catalog', label: 'Approved Projects', icon: FolderGit2 },
      { id: 'admin-ideas', label: 'All Student Ideas', icon: FileText }
    );
  }

  const roleColor = 
    user.role === 'student' ? 'text-vault-cyan bg-vault-cyan/10 border-vault-cyan/30' :
    user.role === 'faculty' ? 'text-vault-violetLight bg-vault-violet/10 border-vault-violet/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vault-violet to-vault-cyan flex items-center justify-center shadow-lg shadow-vault-violet/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-white tracking-wide block">
              Idea<span className="text-transparent bg-clip-text bg-gradient-to-r from-vault-violetLight to-vault-cyan">Vault</span>
            </span>
            <span className="text-[10px] text-vault-textMuted tracking-wider font-medium uppercase block">
              Small Ideas ✦ Big Innovations
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-vault-textMuted uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-vault-violet/20 to-vault-cyan/10 text-vault-cyan border border-vault-cyan/30 shadow-sm'
                    : 'text-vault-textMuted hover:text-white hover:bg-vault-cardHover border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-vault-cyan' : 'text-vault-textMuted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Card */}
      <div className="pt-4 border-t border-vault-border/80">
        <div className="p-3 rounded-xl bg-vault-card/70 border border-vault-border/60 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-vault-violet/20 border border-vault-violet/30 flex items-center justify-center text-vault-violetLight font-semibold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-vault-textMuted truncate">{user.email}</div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-vault-border/40 flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleColor}`}>
              {user.role}
            </span>
            {user.department && (
              <span className="text-[11px] text-vault-textMuted truncate max-w-[120px]">
                {user.department}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-vault-bg/90 backdrop-blur-md border-b border-vault-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-vault-violet to-vault-cyan flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white tracking-wide">
            Idea<span className="text-vault-cyan">Vault</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-vault-card border border-vault-border text-vault-text"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="w-72 max-w-[80vw] h-full bg-vault-bg border-r border-vault-border shadow-2xl">
            <NavContent />
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 h-screen sticky top-0 flex-col bg-vault-bg/95 border-r border-vault-border/80">
        <NavContent />
      </aside>
    </>
  );
}
