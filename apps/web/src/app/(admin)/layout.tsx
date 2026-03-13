'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  FolderOpen,
  Calendar,
  TreePine,
  ArrowLeft,
  Settings,
  MessageSquare,
  Bell,
  CreditCard,
  GraduationCap,
  ScrollText,
} from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Activities', href: '/admin/activities', icon: BookOpen },
  { label: 'Collections', href: '/admin/collections', icon: FolderOpen },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Community', href: '/admin/community', icon: MessageSquare },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Educator', href: '/admin/educator', icon: GraduationCap },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Content Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-parchment">
      {/* Admin sidebar */}
      <aside className="hidden w-[240px] shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-[240px] bg-ink text-parchment/80">
          <div className="flex h-full flex-col">
            <div className="px-5 pt-6 pb-4">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <TreePine className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <span className="font-display text-sm font-bold text-parchment">The Hedge</span>
                  <span className="ml-1.5 rounded bg-rust/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Admin
                  </span>
                </div>
              </Link>
            </div>

            <div className="mx-4 h-px bg-white/8" />

            <nav className="flex-1 px-3 pt-4 space-y-0.5">
              {adminNav.map(({ label, href, icon: Icon }) => {
                const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-parchment/10 text-parchment'
                        : 'text-parchment/40 hover:bg-parchment/5 hover:text-parchment/70'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-sage' : ''}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-4">
              <div className="mx-1 mb-3 h-px bg-white/8" />
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-parchment/40 hover:bg-parchment/5 hover:text-parchment/70 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
