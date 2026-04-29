import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getKeys } from '@/lib/queries/keys';
import { formatDate, formatNumber, relativeTime } from '@/lib/format';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import KeysPageClient from './KeysPageClient';

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
