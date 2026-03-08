import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-green-800 sm:text-5xl">
          The Hedge
        </h1>
        <p className="mt-2 text-lg text-green-600">
          Where curious families learn
        </p>
        <p className="mx-auto mt-6 max-w-lg text-lg text-stone-600">
          Personalised activity ideas for your family — based on your
          children&apos;s ages, the weather, and what you did yesterday. For
          homeschool families, the complete education system Ireland has been
          missing.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-green-700 px-4 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-stone-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
