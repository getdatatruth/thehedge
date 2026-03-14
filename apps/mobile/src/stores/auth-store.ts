import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

export interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  interests: string[];
  school_status: string;
  age: number;
}

export interface Family {
  id: string;
  name: string;
  county: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  family_style: string | null;
  subscription_tier: 'free' | 'family' | 'educator';
  subscription_status: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  family_id: string;
  onboarding_completed: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  family: Family | null;
  children: Child[];
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setFamily: (family: Family | null) => void;
  setChildren: (children: Child[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;

  // Computed
  isAuthenticated: () => boolean;
  isPaidUser: () => boolean;
  isEducator: () => boolean;
  effectiveTier: () => 'free' | 'family' | 'educator';
  trialDaysLeft: () => number | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  family: null,
  children: [],
  isLoading: true,
  isInitialized: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setFamily: (family) => set({ family }),
  setChildren: (children) => set({ children }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () =>
    set({
      session: null,
      user: null,
      profile: null,
      family: null,
      children: [],
      isLoading: false,
    }),

  isAuthenticated: () => !!get().session,
  isPaidUser: () => {
    const tier = get().effectiveTier();
    return tier === 'family' || tier === 'educator';
  },
  isEducator: () => get().effectiveTier() === 'educator',
  effectiveTier: () => {
    const family = get().family;
    if (!family) return 'free';

    let tier = family.subscription_tier || 'free';
    if (family.subscription_status === 'trialing' && family.trial_ends_at) {
      if (new Date() > new Date(family.trial_ends_at)) tier = 'free';
    } else if (
      family.subscription_status === 'cancelled' ||
      family.subscription_status === 'past_due'
    ) {
      tier = 'free';
    }
    return tier;
  },
  trialDaysLeft: () => {
    const family = get().family;
    if (family?.subscription_status !== 'trialing' || !family?.trial_ends_at)
      return null;
    const diff = new Date(family.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },
}));
