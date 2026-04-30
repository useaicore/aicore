'use client';

import { useState } from 'react';
import { deleteAccountAction, signOutAllSessionsAction } from '@/app/actions/account';
import { cn } from '@/lib/utils';
import { LogOut, Trash2, AlertCircle, ShieldAlert, X } from 'lucide-react';

export default function SettingsPageClient() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteAccountAction();
    } catch (err) {
      alert('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleSignOutAll = async () => {
    if (confirm('Sign out of all other sessions?')) {
      await signOutAllSessionsAction();
    }
  };

  return (
    <div className="max-w-4xl space-y-12 animate-float-up">
      {/* Account Settings Header */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-mid to-transparent rounded-full opacity-50" />
        <h2 className="text-gold-cream text-2xl font-black tracking-tight mb-1">Account Security</h2>
        <p className="text-text-secondary/60 text-sm font-medium">Manage your account access and security preferences.</p>
      </div>

      {/* Danger Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="w-8 h-8 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error">
            <ShieldAlert size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-error text-[10px] font-black uppercase tracking-[0.25em]">Critical Actions</h3>
            <p className="text-text-muted text-[10px] font-bold">Actions here are permanent and irreversible.</p>
          </div>
        </div>
        
        <div className="glass-strong border-error/20 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          <div className="divide-y divide-white/5">
            {/* Sign Out Section */}
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/[0.01] transition-all group">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-primary group-hover:border-white/20 transition-colors">
                    <LogOut size={20} />
                  </div>
                  <div>
                    <p className="text-text-primary text-base font-bold tracking-tight">Sign out of all sessions</p>
                    <p className="text-text-secondary/50 text-xs leading-relaxed max-w-sm mt-0.5">
                      Revoke access for all devices currently logged into this account. 
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSignOutAll}
                className="btn-ghost text-xs px-6 py-3 font-bold shrink-0 self-start md:self-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign out all
              </button>
            </div>

            {/* Delete Account Section */}
            <div className={cn(
              "p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-500",
              isConfirmingDelete ? "bg-error/[0.03]" : "hover:bg-error/[0.01]"
            )}>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                    isConfirmingDelete ? "bg-error text-white scale-110 rotate-12 shadow-lg shadow-error/20" : "bg-error/10 border border-error/20 text-error"
                  )}>
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="text-text-primary text-base font-bold tracking-tight">Delete Account</p>
                    <p className="text-text-secondary/50 text-xs leading-relaxed max-w-sm mt-0.5">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 self-start md:self-center min-w-[200px] flex justify-end">
                {isConfirmingDelete ? (
                  <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-8 duration-500 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                       <input 
                        type="text" 
                        placeholder="Type DELETE to confirm"
                        autoFocus
                        value={deleteInput}
                        className="bg-bg-base border-2 border-error/20 rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-error/60 focus:ring-8 focus:ring-error/5 transition-all w-full md:w-48 font-mono placeholder:text-text-muted/40"
                        onChange={(e) => setDeleteInput(e.target.value)}
                      />
                      <button 
                        onClick={() => {
                          setIsConfirmingDelete(false);
                          setDeleteInput('');
                        }}
                        className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={handleDelete}
                      disabled={deleteInput !== 'DELETE' || isDeleting}
                      className={cn(
                        "text-xs font-black rounded-xl px-6 py-3 transition-all uppercase tracking-widest",
                        deleteInput === 'DELETE' 
                          ? "bg-error text-white shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-[0.98]" 
                          : "bg-error/10 text-error/30 cursor-not-allowed border border-error/10"
                      )}
                    >
                      {isDeleting ? 'Processing...' : 'Permanently Delete'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsConfirmingDelete(true)}
                    className="border-2 border-error/20 text-error text-xs font-black uppercase tracking-widest rounded-xl px-6 py-3 hover:bg-error hover:text-white hover:border-error hover:shadow-[0_8px_24px_rgba(239,68,68,0.3)] transition-all active:scale-95"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-text-muted font-medium">
          <AlertCircle size={14} className="text-warning/60" />
          <p>Security Warning: You are modifying sensitive account parameters. Ensure you have backups of your API keys.</p>
        </div>
      </section>
    </div>
  );
}
