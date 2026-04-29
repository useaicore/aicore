import '../globals.css';
import { type ReactNode } from 'react';

export const metadata = {
  title: 'AICore | Authentication',
  description: 'Log in or sign up for AICore Dashboard',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">AICore</h1>
          <p className="text-slate-400 mt-2">Unified AI Infrastructure</p>
        </div>
        {children}
      </div>
    </div>
  );
}
