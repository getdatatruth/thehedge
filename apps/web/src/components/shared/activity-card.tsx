'use client';

import Link from 'next/link';
import {
  TreePine,
  UtensilsCrossed,
  FlaskConical,
  Palette,
  Dumbbell,
  BookOpen,
  Calculator,
  Wrench,
  Heart,
  HandHeart,
  Clock,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { FavouriteButton } from '@/components/shared/favourite-button';

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; gradient: string; label: string }
> = {
  nature: { icon: TreePine, color: 'text-moss', bg: 'bg-sage/15', gradient: 'from-sage/20 to-sage/5', label: 'Nature' },
  kitchen: { icon: UtensilsCrossed, color: 'text-amber', bg: 'bg-amber/10', gradient: 'from-amber/20 to-amber/5', label: 'Kitchen' },
  science: { icon: FlaskConical, color: 'text-sky', bg: 'bg-sky/12', gradient: 'from-sky/20 to-sky/5', label: 'Science' },
  art: { icon: Palette, color: 'text-berry', bg: 'bg-berry/10', gradient: 'from-berry/15 to-berry/5', label: 'Art' },
  movement: { icon: Dumbbell, color: 'text-terracotta', bg: 'bg-terracotta/10', gradient: 'from-terracotta/15 to-terracotta/5', label: 'Movement' },
  literacy: { icon: BookOpen, color: 'text-forest', bg: 'bg-forest/8', gradient: 'from-forest/15 to-forest/5', label: 'Literacy' },
  maths: { icon: Calculator, color: 'text-amber', bg: 'bg-amber/10', gradient: 'from-amber/15 to-amber/5', label: 'Maths' },
  life_skills: { icon: Wrench, color: 'text-umber', bg: 'bg-umber/8', gradient: 'from-umber/10 to-umber/5', label: 'Life Skills' },
  calm: { icon: Heart, color: 'text-berry', bg: 'bg-berry/10', gradient: 'from-berry/15 to-berry/5', label: 'Calm' },
  social: { icon: HandHeart, color: 'text-moss', bg: 'bg-sage/12', gradient: 'from-sage/15 to-sage/5', label: 'Social' },
};

const ENERGY_COLORS: Record<string, string> = {
  calm: 'bg-sky/10 text-sky',
  moderate: 'bg-amber/10 text-amber',
  active: 'bg-terracotta/10 text-terracotta',
};

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    age_min: number;
    age_max: number;
    duration_minutes: number;
    energy_level: string;
    mess_level: string;
    location: string;
    premium: boolean;
    screen_free: boolean;
    is_new?: boolean;
  };
  showPremiumLock?: boolean;
}

export function ActivityCard({ activity, showPremiumLock }: ActivityCardProps) {
  const config = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.nature;
  const Icon = config.icon;
  const isLocked = activity.premium && showPremiumLock;

  return (
    <Link href={isLocked ? '/settings/billing?upgrade=family' : `/activity/${activity.slug}`}>
      <div
        className={`category-strip card-interactive group h-full flex flex-col relative ${isLocked ? 'opacity-75' : ''}`}
        data-category={activity.category}
      >
        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-parchment/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-center px-4">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-forest/10 mb-2">
                <Lock className="h-4 w-4 text-forest" />
              </div>
              <p className="text-[12px] font-bold text-forest">Upgrade to unlock</p>
            </div>
          </div>
        )}

        {/* Favourite + New badge + Pro badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {isLocked && (
            <span className="inline-flex items-center gap-1 tag bg-amber/15 text-amber">
              <Lock className="h-2.5 w-2.5" />
              Pro
            </span>
          )}
          {activity.is_new && (
            <div className="tag tag-terra flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              NEW
            </div>
          )}
          {!isLocked && <FavouriteButton activityId={activity.id} size="sm" />}
        </div>

        {/* Category header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bg} transition-transform group-hover:scale-110`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-clay">
                {config.label}
              </span>
            </div>
            <ArrowUpRight className={`h-4 w-4 transition-all ${isLocked ? 'text-stone/50' : 'text-stone group-hover:text-terracotta group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
          </div>

          <h3 className="font-display text-[17px] font-light leading-snug text-ink group-hover:text-moss transition-colors">
            {activity.title}
          </h3>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 flex-1 flex flex-col">
          <p className={`text-[13px] text-clay line-clamp-2 font-serif leading-relaxed mb-4 flex-1 ${isLocked ? 'select-none' : ''}`}>
            {isLocked
              ? activity.description.slice(0, 60) + '...'
              : activity.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 tag bg-stone/30 text-umber">
              <Clock className="h-3 w-3" />
              {activity.duration_minutes}m
            </span>
            <span className="tag bg-stone/30 text-umber">
              {activity.age_min}–{activity.age_max}y
            </span>
            <span className={`tag ${ENERGY_COLORS[activity.energy_level] || 'bg-stone/30 text-umber'}`}>
              {activity.energy_level}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { CATEGORY_CONFIG };
