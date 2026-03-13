import Link from 'next/link';
import { getFamilyDetail } from '@/lib/admin/queries';
import {
  ArrowLeft,
  Users,
  Crown,
  GraduationCap,
  User,
  Calendar,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
  BookOpen,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TIER_BADGES: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  free: { icon: User, bg: 'bg-linen', color: 'text-clay/50', label: 'Free' },
  family: { icon: Crown, bg: 'bg-moss/10', color: 'text-moss', label: 'Family' },
  educator: { icon: GraduationCap, bg: 'bg-gold/10', color: 'text-gold', label: 'Educator' },
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getFamilyDetail(id);

  if (!detail) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
        <p className="text-clay/50">Family not found.</p>
      </div>
    );
  }

  const { family, members, children, recentLogs } = detail;
  const tierBadge = TIER_BADGES[family.subscription_tier] || TIER_BADGES.free;
  const TierIcon = tierBadge.icon;

  function getAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl">
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
              {family.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium ${tierBadge.bg} ${tierBadge.color}`}>
                <TierIcon className="h-3 w-3" />
                {tierBadge.label}
              </span>
              {family.onboarding_completed ? (
                <span className="inline-flex items-center gap-1 text-xs text-moss">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Onboarded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-rust/50">
                  <XCircle className="h-3.5 w-3.5" />
                  Not onboarded
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Family info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-clay/50 mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Location</span>
          </div>
          <p className="text-sm font-semibold text-forest">
            {family.county || 'Unknown'}, {family.country || 'IE'}
          </p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-clay/50 mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Joined</span>
          </div>
          <p className="text-sm font-semibold text-forest">
            {new Date(family.created_at).toLocaleDateString('en-IE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-clay/50 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Family style</span>
          </div>
          <p className="text-sm font-semibold text-forest capitalize">
            {family.family_style || 'Not set'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-moss" />
            Members ({members.length})
          </h2>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member: { id: string; name: string; email: string; role: string; created_at: string }) => (
                <div key={member.id} className="flex items-center gap-3 rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 text-sm font-bold text-forest">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest truncate">{member.name}</p>
                    <p className="text-xs text-clay/40 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clay/30 capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No members found.</p>
          )}
        </div>

        {/* Children */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-moss" />
            Children ({children.length})
          </h2>
          {children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child: { id: string; name: string; date_of_birth: string; school_status: string; interests: string[] }) => (
                <div key={child.id} className="rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-forest">{child.name}</p>
                    <span className="text-xs text-clay/40">{getAge(child.date_of_birth)} years old</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-moss/10 text-moss capitalize">
                      {child.school_status?.replace('_', ' ')}
                    </span>
                    {(child.interests || []).slice(0, 5).map((interest: string) => (
                      <span key={interest} className="rounded px-2 py-0.5 text-[10px] font-medium bg-linen text-clay/50">
                        {interest}
                      </span>
                    ))}
                    {(child.interests || []).length > 5 && (
                      <span className="text-[10px] text-clay/30">+{child.interests.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No children recorded.</p>
          )}
        </div>
      </div>

      {/* Recent activity logs */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-bold text-forest mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-moss" />
          Recent Activity Logs ({recentLogs.length})
        </h2>
        {recentLogs.length > 0 ? (
          <div className="space-y-2">
            {recentLogs.map((log: { id: string; date: string; activity_title: string; duration_minutes: number | null; rating: number | null; notes: string | null }) => (
              <div key={log.id} className="flex items-center gap-3 rounded-[14px] bg-parchment/50 p-3">
                <span className="text-xs font-semibold text-clay/40 w-20 shrink-0">
                  {new Date(log.date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-sm font-medium text-forest flex-1 truncate">
                  {log.activity_title || 'Unknown activity'}
                </span>
                {log.duration_minutes && (
                  <span className="text-xs text-clay/40">{log.duration_minutes}m</span>
                )}
                {log.rating && (
                  <span className="text-xs text-gold">{log.rating}/5</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-clay/40">No activity logs yet.</p>
        )}
      </div>
    </div>
  );
}
