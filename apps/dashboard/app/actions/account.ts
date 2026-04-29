'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';

export async function deleteAccountAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const db = getDb();
  
  // TODO: Add hard delete for associated data in Phase 4.
  // For now, we sign out and mark the user (handled via custom logic if needed, 
  // but Better Auth core handles session revocation well).
  
  await auth.api.revokeSessions({
    headers: await headers(),
  });

  // Since we are not doing a hard delete yet, we just redirect.
  // In a real app, you'd update a 'deleted_at' column in your users table.
  
  redirect('/auth/login');
}

export async function signOutAllSessionsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  await auth.api.revokeSessions({
    headers: await headers(),
  });

  redirect('/auth/login');
}
