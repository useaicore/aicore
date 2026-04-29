'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-[var(--text-muted)] text-xs hover:text-[var(--error)] transition-colors text-left"
    >
      Sign out
    </button>
  );
}
