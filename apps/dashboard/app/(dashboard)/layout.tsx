import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth.js';
import Sidebar from '@/components/sidebar/Sidebar.js';
import MobileNav from '@/components/layout/MobileNav.js';
import DashboardHeader from '@/components/layout/DashboardHeader.js';
import { CommandBarProvider } from '@/components/command/CommandBarProvider.js';
import { CommandBarModal } from '@/components/command/CommandBarModal.js';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  // TODO: Implement a clean way to pass page-specific titles.
  const title = "Overview";

  return (
    <CommandBarProvider workspaceId={session.user.id}>
      <CommandBarModal />
      <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
        <div className="hidden lg:block">
          <Sidebar userName={session.user.name} />
        </div>
        <MobileNav userName={session.user.name} />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-[240px]">
          <DashboardHeader title={title} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 text-[var(--text-primary)]">
            {children}
          </main>
        </div>
      </div>
    </CommandBarProvider>
  );
}
