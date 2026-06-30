import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark-auth flex min-h-screen items-center justify-center px-4 relative" style={{ background: '#0D1F12' }}>
      {/* Decorative blobs */}
      <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-[#55753F]/8 blur-3xl" />
      <div className="absolute bottom-20 right-[15%] h-48 w-48 rounded-full bg-[#5B8DEF]/5 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-full-light.svg"
            alt="The Hedge"
            className="h-9 w-auto transition-transform group-hover:scale-105"
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
