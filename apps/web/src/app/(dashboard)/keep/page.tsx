import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Heart, Sprout, FileText, FolderOpen, ChevronRight } from 'lucide-react';

export const metadata = { title: 'Keep - The Hedge' };

// Keep: one shelf for everything that accumulates. The same logged moments,
// read four ways. (First pass: a calm landing that routes into the existing
// surfaces; these become real in-place tabs as Keep is built out.)
const SHELVES = [
  { tab: 'Journal', href: '/timeline', icon: BookOpen, blurb: 'The unfolding story of what you actually did together.' },
  { tab: 'Portfolio', href: '/educator/portfolio', icon: FolderOpen, blurb: 'The moments you star as keepers, gathered per child.' },
  { tab: 'Story', href: '/progress', icon: Sprout, blurb: 'How your year is growing, area by area. No scores.' },
  { tab: 'Evidence', href: '/educator/tusla', icon: FileText, blurb: 'An honest record for a Tusla conversation, already written.' },
  { tab: 'Saved', href: '/favourites', icon: Heart, blurb: 'Activities and collections you want to come back to.' },
];

export default async function KeepPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-16">
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">Your shelf</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink mt-2">The Keep</h1>
        <p className="text-[14px] text-clay mt-2">Everything you have gathered, kept in one place and read in whatever way helps.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {SHELVES.map(({ tab, href, icon: Icon, blurb }) => (
          <Link
            key={tab}
            href={href}
            className="group flex items-start gap-4 rounded-2xl bg-white border border-stone/40 p-5 transition-all hover:border-moss/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss/10">
              <Icon className="h-5 w-5 text-moss" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-ink">{tab}</p>
              <p className="text-[13px] text-clay leading-relaxed mt-0.5">{blurb}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-stone shrink-0 mt-1 transition-all group-hover:text-moss group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
