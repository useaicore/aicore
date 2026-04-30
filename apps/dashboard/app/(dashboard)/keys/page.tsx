import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import KeysSection from '../../../components/keys/KeysSection';
import { TableSkeleton } from '../../../components/ui/DashboardSkeletons';

export default async function KeysPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  const workspaceId = session.user.id;

  return (
    <div className="max-w-7xl animate-float-up">
      <div className="mb-10">
        <h1 className="text-gold-cream text-3xl font-black tracking-tight mb-2">API Keys</h1>
        <p className="text-text-muted text-sm font-medium">Manage your secret keys and environment access.</p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <KeysSection workspaceId={workspaceId} />
      </Suspense>
    </div>
  );
}
