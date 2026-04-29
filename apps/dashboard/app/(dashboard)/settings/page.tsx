import { headers } from 'next/headers';
import { auth } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/format.js';
import CopyButton from '@/components/ui/CopyButton.js';
import Badge from '@/components/ui/Badge.js';
import SettingsPageClient from './SettingsPageClient.js';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  const { user } = session;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-8">Settings</h1>

      <div className="space-y-12">
        {/* Account Section */}
        <section>
          <h3 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.1em] mb-4">Account</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="p-5 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)] text-xs font-medium">Name</span>
                <span className="text-[var(--text-primary)] text-sm">{user.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)] text-xs font-medium">Email</span>
                <span className="text-[var(--text-primary)] text-sm">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)] text-xs font-medium">Member since</span>
                <span className="text-[var(--text-primary)] text-sm">{formatDate(user.createdAt).split(' · ')[0]}</span>
              </div>
            </div>
            <div className="bg-[var(--bg-subtle)]/30 px-5 py-3 border-t border-[var(--text-faint)]">
              <button disabled className="text-[var(--text-muted)] text-xs font-medium cursor-not-allowed">
                Edit profile (coming soon)
              </button>
            </div>
          </div>
        </section>

        {/* Workspace Section */}
        <section>
          <h3 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.1em] mb-4">Workspace</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-5">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--text-muted)] text-xs font-medium">Workspace ID</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[var(--sky-bright)] text-xs font-mono">{user.id}</code>
                    <CopyButton value={user.id} size="xs" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--text-muted)] text-xs font-medium">Current Plan</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="success" label="Free Tier" size="sm" />
                    <Link href="#" className="text-[var(--gold-mid)] text-xs font-medium hover:underline">
                      Upgrade →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SettingsPageClient />
      </div>
    </div>
  );
}
