import { getKeys } from '@/lib/queries/keys';
import KeysPageClient from '@/app/(dashboard)/keys/KeysPageClient';

export default async function KeysSection({ workspaceId }: { workspaceId: string }) {
  const keys = await getKeys(workspaceId);
  return <KeysPageClient initialKeys={keys} />;
}
