import NavBar from '@/components/marketing/NavBar';
import Footer from '@/components/marketing/Footer';
import AnnouncementBar from '@/components/marketing/AnnouncementBar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-base)]">
      <AnnouncementBar />
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
