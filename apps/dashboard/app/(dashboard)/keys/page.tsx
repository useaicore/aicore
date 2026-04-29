import { headers } from 'next/headers';
import { auth } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import { getKeys } from '@/lib/queries/keys.js';
import { formatDate, formatNumber, relativeTime } from '@/lib/format.js';
import Badge from '@/components/ui/Badge.js';
import EmptyState from '@/components/ui/EmptyState.js';
import KeysPageClient from './KeysPageClient.js';

export default async function KeysPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  const keys = await getKeys(session.user.id);

  return (
    <div className="max-w-7xl">
      <KeysPageClient initialKeys={keys} />
    </div>
  );
}
