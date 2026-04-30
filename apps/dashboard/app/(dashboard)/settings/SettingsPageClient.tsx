'use client';

import { useState } from 'react';
import { deleteAccountAction, signOutAllSessionsAction } from '@/app/actions/account';
import { cn } from '@/lib/utils';
import { LogOut, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';

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
    <div className="max-w-4xl space-y-10 animate-float-up">
      {/* Account Settings Header */}
      <div>
        <h2 className="text-gold-cream text-xl font-bold tracking-tight mb-1">Account Security</h2>
        <p className="text-text-secondary/60 text-sm">Manage your account access and security preferences.</p>
      </div>

      {/* Danger Zone */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={14} className="text-error" />
          <h3 className="text-error text-[10px] font-black uppercase tracking-[0.2em]">Danger Zone</h3>
        </div>
        
        <div className="glass-strong border-error/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {/* Sign Out Section */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <LogOut size={16} className="text-text-primary" />
                  <p className="text-text-primary text-sm font-bold tracking-tight">Sign out of all sessions</p>
                </div>
                <p className="text-text-secondary/60 text-xs leading-relaxed max-w-sm">
                  Revoke access for all devices currently logged into this account. You will be signed out everywhere except here.
                </p>
              </div>
              <button 
                onClick={handleSignOutAll}
                className="btn-ghost text-xs px-5 py-2.5 font-bold shrink-0 self-start md:self-center"
              >
                Sign out all
              </button>
            </div>

            {/* Delete Account Section */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-error/[0.02] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} className="text-error" />
                  <p className="text-error text-sm font-bold tracking-tight">Delete Account</p>
                </div>
                <p className="text-text-secondary/60 text-xs leading-relaxed max-w-sm">
                  Permanently delete your account and all associated keys, logs, and data. This action is irreversible.
                </p>
              </div>
              
              <div className="shrink-0 self-start md:self-center">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                    <input 
                      type="text" 
                      placeholder="Type DELETE"
                      autoFocus
                      value={deleteInput}
                      className="bg-bg-base border border-error/30 rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-error/60 focus:ring-4 focus:ring-error/5 transition-all w-32"
                      onChange={(e) => setDeleteInput(e.target.value)}
                    />
                    <button 
                      onClick={handleDelete}
                      disabled={deleteInput !== 'DELETE' || isDeleting}
                      className={cn(
                        "text-xs font-black rounded-xl px-5 py-2.5 transition-all",
                        deleteInput === 'DELETE' 
                          ? "bg-error text-white shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-[0.98]" 
                          : "bg-error/20 text-error/40 cursor-not-allowed"
                      )}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setDeleteInput('');
                      }}
                      className="text-text-secondary/60 text-xs font-bold hover:text-text-primary transition-colors px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsConfirmingDelete(true)}
                    className="border border-error/30 text-error text-xs font-bold rounded-xl px-5 py-2.5 hover:bg-error/10 hover:border-error/50 transition-all"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 text-[11px] text-text-muted">
          <AlertCircle size={12} />
          <p>Careful: actions in this section cannot be undone.</p>
        </div>
      </section>
    </div>
  );
}

