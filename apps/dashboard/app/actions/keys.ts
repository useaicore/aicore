'use server';

import { auth } from '@/lib/auth.js';
import { headers } from 'next/headers';
import { createKey, revokeKey } from '@/lib/queries/keys.js';
import { revalidatePath } from 'next/cache';

export async function createKeyAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const environment = formData.get('environment') as 'live' | 'development';

  if (!name || name.length > 50) {
    throw new Error('Name is required and must be under 50 characters');
  }

  const result = await createKey({
    workspaceId: session.user.id,
    name,
    environment,
  });

  revalidatePath('/keys');
  return result;
}

export async function revokeKeyAction(keyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  await revokeKey(keyId, session.user.id);
  revalidatePath('/keys');
}
