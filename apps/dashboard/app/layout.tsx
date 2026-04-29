import './globals.css';

export const metadata = {
  title: 'AICore Dashboard',
  description: 'Unified AI Infrastructure Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
