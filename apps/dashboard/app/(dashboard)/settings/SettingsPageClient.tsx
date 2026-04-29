'use client';

import { useState } from 'react';
import { deleteAccountAction, signOutAllSessionsAction } from '@/app/actions/account.js';

export default function SettingsPageClient() {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
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
    <div className="space-y-12">
      {/* Danger Zone */}
      <section>
        <h3 className="text-[var(--error)] text-[10px] font-bold uppercase tracking-[0.1em] mb-4">Danger Zone</h3>
        <div className="bg-[var(--bg-surface)] border border-[var(--error)]/40 rounded-[var(--radius-lg)] p-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[var(--text-primary)] text-sm font-medium mb-1">Sign out of all sessions</p>
                <p className="text-[var(--text-muted)] text-xs">Revoke access for all devices logged into this account.</p>
              </div>
              <button 
                onClick={handleSignOutAll}
                className="text-[var(--text-muted)] text-xs font-medium hover:text-white border border-[var(--text-faint)] rounded-md px-4 py-2 hover:bg-[var(--bg-elevated)] transition-all"
              >
                Sign out all
              </button>
            </div>

            <div className="h-px bg-[var(--text-faint)] opacity-40" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[var(--error)] text-sm font-medium mb-1">Delete Account</p>
                <p className="text-[var(--text-muted)] text-xs">Permanently remove your account and all associated data.</p>
              </div>
              
              {deleteConfirm === 'CONFIRM_FLOW' ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Type DELETE"
                    className="bg-[var(--bg-base)] border border-[var(--error)]/40 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
                    value={deleteConfirm === 'CONFIRM_FLOW' ? '' : deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                  <button 
                    onClick={handleDelete}
                    disabled={deleteConfirm !== 'DELETE' || isDeleting}
                    className="bg-[var(--error)] text-white text-xs font-bold rounded-md px-4 py-1.5 hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm('')}
                    className="text-[var(--text-muted)] text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeleteConfirm('CONFIRM_FLOW')}
                  className="border border-[var(--error)]/40 text-[var(--error)] text-xs font-medium rounded-md px-4 py-2 hover:bg-[var(--error)]/10 transition-all"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
