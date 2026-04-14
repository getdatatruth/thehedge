import { TreePine } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark-auth flex min-h-screen items-center justify-center px-4 relative" style={{ background: '#0D1F12' }}>
      {/* Decorative blobs */}
      <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-[#4CAF7C]/8 blur-3xl" />
      <div className="absolute bottom-20 right-[15%] h-48 w-48 rounded-full bg-[#5B8DEF]/5 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4CAF7C] transition-transform group-hover:scale-105">
            <TreePine className="h-6 w-6 text-[#0D1F12]" />
          </div>
          <span className="font-display text-2xl font-bold text-[#F2F5F0]">
            The Hedge
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
