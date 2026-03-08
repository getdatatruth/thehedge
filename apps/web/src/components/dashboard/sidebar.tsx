'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sun,
  Search,
  Clock,
  Users,
  Settings,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { label: 'Today', href: '/dashboard', icon: Sun },
  { label: 'Browse', href: '/browse', icon: Search },
  { label: 'Timeline', href: '/timeline', icon: Clock },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const educatorNav: NavItem[] = [
  { label: 'Curriculum', href: '/educator', icon: GraduationCap },
  { label: 'Daily Plans', href: '/educator/plans', icon: BookOpen },
  { label: 'Tusla Compliance', href: '/educator/tusla', icon: ClipboardCheck },
];

interface SidebarContentProps {
  pathname: string;
  isEducator?: boolean;
  onSignOut: () => void;
}

function SidebarNavContent({ pathname, isEducator, onSignOut }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-green-800">The Hedge</h1>
          <p className="text-xs text-muted-foreground">
            Where curious families learn
          </p>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {mainNav.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-800'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {isEducator && (
          <>
            <Separator className="my-4" />
            <div className="px-3 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Educator
              </p>
            </div>
            <nav className="space-y-1">
              {educatorNav.map(({ label, href, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-800'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </ScrollArea>

      <div className="border-t px-3 py-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ isEducator = false }: { isEducator?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:block">
        <SidebarNavContent
          pathname={pathname}
          isEducator={isEducator}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile sidebar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b bg-white px-4 lg:hidden">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="sm" render={<span />}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarNavContent
              pathname={pathname}
              isEducator={isEducator}
              onSignOut={handleSignOut}
            />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="ml-3">
          <span className="text-lg font-bold text-green-800">The Hedge</span>
        </Link>
      </div>
    </>
  );
}
