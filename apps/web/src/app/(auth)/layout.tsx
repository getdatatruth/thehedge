import { TreePine } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center mesh-gradient-hero px-4 relative">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-moss/8 blur-3xl" />
      <div className="absolute bottom-20 right-[15%] h-48 w-48 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest transition-transform group-hover:scale-105">
            <TreePine className="h-6 w-6 text-sage" />
          </div>
          <span className="font-display text-2xl font-bold text-ink">
            The Hedge
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
