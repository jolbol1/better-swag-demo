import { ReactNode } from 'react';
import StoreFooter from './StoreFooter';
import StoreHeader from './StoreHeader';

export default function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_25%),linear-gradient(180deg,rgba(5,10,18,0.8),rgba(5,10,18,0.98))]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <StoreHeader />
        {children}
        <StoreFooter />
      </div>
    </div>
  );
}
