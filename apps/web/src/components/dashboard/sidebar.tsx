'use client';

import { useState } from 'react';
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
  CreditCard,
  Menu,
  Sparkles,
  CalendarDays,
  Heart,
  Trophy,
  Bell,
  FolderOpen,
  ChevronsLeft,
  ChevronsRight,
  Command,
  User,
  ChevronDown,
  HelpCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNav: NavItem[] = [
  { label: 'Today', href: '/dashboard', icon: Sun },
  { label: 'Browse', href: '/browse', icon: Search },
  { label: 'Weekly Plan', href: '/planner', icon: CalendarDays },
  { label: 'Ask AI', href: '/chat', icon: Sparkles },
  { label: 'Favourites', href: '/favourites', icon: Heart },
  { label: 'Timeline', href: '/timeline', icon: Clock },
];

const familyNav: NavItem[] = [
  { label: 'Progress', href: '/progress', icon: Trophy },
  { label: 'Community', href: '/community', icon: Users },
];

const educatorNav: NavItem[] = [
  { label: 'Curriculum', href: '/educator', icon: GraduationCap },
  { label: 'Schedule', href: '/educator/schedule', icon: CalendarDays },
  { label: 'Portfolio', href: '/educator/portfolio', icon: FolderOpen },
  { label: 'Plans', href: '/educator/plans', icon: BookOpen },
  { label: 'Tusla', href: '/educator/tusla', icon: ClipboardCheck },
];

interface SidebarProps {
  isEducator?: boolean;
  familyName?: string;
  userName?: string;
  unreadCount?: number;
}

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive =
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      key={item.href}
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-parchment/12 text-parchment'
          : 'text-parchment/45 hover:bg-parchment/6 hover:text-parchment/80'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon
        className={`h-[16px] w-[16px] shrink-0 transition-colors ${
          isActive ? 'text-sage' : 'text-parchment/30 group-hover:text-parchment/60'
        }`}
        strokeWidth={isActive ? 2 : 1.6}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-sm bg-terracotta/80 px-1 text-[9px] font-bold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-terracotta" />
      )}
    </Link>
  );
}

function NavSection({
  items,
  pathname,
  label,
  collapsed,
}: {
  items: NavItem[];
  pathname: string;
  label?: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {label && !collapsed && (
        <p className="px-2.5 pb-1.5 pt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-parchment/20">
          {label}
        </p>
      )}
      {label && collapsed && <div className="mx-2 my-3 h-px bg-parchment/6" />}
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>
    </div>
  );
}

function SidebarContent({
  pathname,
  isEducator,
  familyName,
  userName,
  collapsed,
  setCollapsed,
  onSignOut,
  unreadCount = 0,
}: {
  pathname: string;
  isEducator?: boolean;
  familyName?: string;
  userName?: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onSignOut: () => void;
  unreadCount?: number;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const notifItems: NavItem[] = [
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
  ];

  return (
    <div className="flex h-full flex-col bg-forest relative">
      {/* Subtle right edge line */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-parchment/6" />

      {/* ─── Logo + Collapse ─── */}
      <div className={`flex items-center gap-2.5 px-3 pt-4 pb-3 ${collapsed ? 'justify-center' : ''}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-parchment/8 transition-colors group-hover:bg-parchment/12">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-sage" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-1.5 2-4 4-4 8s4 10 4 10 4-6 4-10-2.5-6-4-8z" />
              <circle cx="12" cy="10" r="1.5" />
            </svg>
          </div>
          {!collapsed && (
            <span className="font-display text-[16px] font-semibold text-parchment tracking-tight truncate">
              The Hedge
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 text-parchment/20 hover:text-parchment/50 transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ─── Search / Command Bar ─── */}
      {!collapsed ? (
        <div className="px-3 pb-3">
          <button className="flex w-full items-center gap-2.5 rounded-md bg-parchment/5 border border-parchment/6 px-3 py-2 text-[12px] text-parchment/30 hover:bg-parchment/8 hover:text-parchment/45 transition-all">
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded bg-parchment/6 px-1.5 py-0.5 text-[9px] font-mono text-parchment/25">⌘K</kbd>
          </button>
        </div>
      ) : (
        <div className="px-2 pb-2">
          <button
            onClick={() => setCollapsed(false)}
            className="flex w-full items-center justify-center rounded-md p-2 text-parchment/25 hover:bg-parchment/6 hover:text-parchment/45 transition-all"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-none">
        <NavSection items={mainNav} pathname={pathname} collapsed={collapsed} />
        <NavSection items={familyNav} pathname={pathname} label="Family" collapsed={collapsed} />
        {isEducator && (
          <NavSection items={educatorNav} pathname={pathname} label="Educator" collapsed={collapsed} />
        )}
        <NavSection items={notifItems} pathname={pathname} collapsed={collapsed} />
      </div>

      {/* ─── User Menu ─── */}
      <div className="relative px-2 pb-3 pt-2">
        <div className="h-px bg-parchment/6 mb-2 mx-0.5" />

        {userMenuOpen && !collapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-lg bg-[#1a3520] border border-parchment/8 py-1 shadow-xl shadow-black/30 animate-scale-in z-50">
            <Link
              href="/settings"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-parchment/60 hover:bg-parchment/6 hover:text-parchment/90 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
            <Link
              href="/settings?tab=profile"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-parchment/60 hover:bg-parchment/6 hover:text-parchment/90 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </Link>
            <Link
              href="/settings?tab=children"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-parchment/60 hover:bg-parchment/6 hover:text-parchment/90 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              Children
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-parchment/60 hover:bg-parchment/6 hover:text-parchment/90 transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing & Plans
            </Link>
            <a
              href="mailto:hello@thehedge.ie"
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-parchment/60 hover:bg-parchment/6 hover:text-parchment/90 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help & Support
            </a>
            <div className="h-px bg-parchment/6 my-1 mx-2" />
            <button
              onClick={() => { setUserMenuOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-terracotta/70 hover:bg-terracotta/8 hover:text-terracotta transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}

        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-all hover:bg-parchment/6 ${
            userMenuOpen ? 'bg-parchment/8' : ''
          } ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage/20 text-[10px] font-bold text-sage">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-medium text-parchment/80 truncate">{userName || 'Account'}</p>
                {familyName && (
                  <p className="text-[10px] text-parchment/30 truncate">{familyName}</p>
                )}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-parchment/20 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ isEducator = false, familyName = '', userName = '', unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[56px]' : 'w-[240px]'
        }`}
      >
        <div
          className={`fixed inset-y-0 left-0 transition-all duration-200 ${
            collapsed ? 'w-[56px]' : 'w-[240px]'
          }`}
        >
          <SidebarContent
            pathname={pathname}
            isEducator={isEducator}
            familyName={familyName}
            userName={userName}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onSignOut={handleSignOut}
            unreadCount={unreadCount}
          />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-13 items-center justify-between glass px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg hover:bg-linen transition-colors">
              <Menu className="h-5 w-5 text-ink" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0 border-0">
              <SidebarContent
                pathname={pathname}
                isEducator={isEducator}
                familyName={familyName}
                userName={userName}
                collapsed={false}
                setCollapsed={() => {}}
                onSignOut={handleSignOut}
                unreadCount={unreadCount}
              />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1.5 2-4 4-4 8s4 10 4 10 4-6 4-10-2.5-6-4-8z" />
              </svg>
            </div>
            <span className="font-display text-[16px] font-semibold text-ink">The Hedge</span>
          </Link>
        </div>
        <Link href="/notifications" className="relative p-2">
          <Bell className="h-5 w-5 text-clay" strokeWidth={1.6} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-terracotta" />
          )}
        </Link>
      </div>
    </>
  );
}
