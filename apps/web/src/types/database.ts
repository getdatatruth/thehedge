export type FamilyStyle = 'active' | 'creative' | 'curious' | 'bookish' | 'balanced';
export type SubscriptionTier = 'free' | 'family' | 'educator';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';
export type UserRole = 'owner' | 'member';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
export type SchoolStatus = 'mainstream' | 'homeschool' | 'considering';
export type ActivityCategory = 'nature' | 'kitchen' | 'science' | 'art' | 'movement' | 'literacy' | 'maths' | 'life_skills' | 'calm' | 'social';
export type ActivityLocation = 'indoor' | 'outdoor' | 'both' | 'car' | 'anywhere';
export type EnergyLevel = 'calm' | 'moderate' | 'active';
export type MessLevel = 'none' | 'low' | 'medium' | 'high';
export type EducationApproach = 'structured' | 'relaxed' | 'child_led' | 'blended' | 'exploratory';
export type TuslaStatus = 'not_applied' | 'applied' | 'awaiting' | 'registered' | 'review_due';
export type DailyPlanStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';
export type CommunityGroupType = 'county' | 'interest' | 'coop';
export type CommunityPostType = 'discussion' | 'question' | 'event' | 'resource';
export type CommunityMemberRole = 'admin' | 'moderator' | 'member';

export interface MaterialItem {
  name: string;
  household_common: boolean;
}

export interface PlanBlock {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  notes?: string;
  completed: boolean;
  outcome_ids?: string[];
}

export interface CurriculumAreaPriority {
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface NotificationPrefs {
  morning_idea: boolean;
  weekend_plan: boolean;
  weekly_summary: boolean;
  community: boolean;
}
