import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  real,
  date,
  jsonb,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────

export const familyStyleEnum = pgEnum('family_style', [
  'active', 'creative', 'curious', 'bookish', 'balanced',
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free', 'family', 'educator',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'trialing', 'past_due', 'cancelled',
]);

export const userRoleEnum = pgEnum('user_role', ['owner', 'member']);

export const learningStyleEnum = pgEnum('learning_style', [
  'visual', 'auditory', 'kinesthetic', 'mixed',
]);

export const schoolStatusEnum = pgEnum('school_status', [
  'mainstream', 'homeschool', 'considering',
]);

export const activityCategoryEnum = pgEnum('activity_category', [
  'nature', 'kitchen', 'science', 'art', 'movement',
  'literacy', 'maths', 'life_skills', 'calm', 'social',
]);

export const activityLocationEnum = pgEnum('activity_location', [
  'indoor', 'outdoor', 'both', 'car', 'anywhere',
]);

export const energyLevelEnum = pgEnum('energy_level', [
  'calm', 'moderate', 'active',
]);

export const messLevelEnum = pgEnum('mess_level', [
  'none', 'low', 'medium', 'high',
]);

export const educationApproachEnum = pgEnum('education_approach', [
  'structured', 'relaxed', 'child_led', 'blended', 'exploratory',
]);

export const tuslaStatusEnum = pgEnum('tusla_status', [
  'not_applied', 'applied', 'awaiting', 'registered', 'review_due',
]);

export const dailyPlanStatusEnum = pgEnum('daily_plan_status', [
  'planned', 'in_progress', 'completed', 'skipped',
]);

export const communityGroupTypeEnum = pgEnum('community_group_type', [
  'county', 'interest', 'coop',
]);

export const communityPostTypeEnum = pgEnum('community_post_type', [
  'discussion', 'question', 'event', 'resource',
]);

export const communityMemberRoleEnum = pgEnum('community_member_role', [
  'admin', 'moderator', 'member',
]);

// ─── Core Tables ─────────────────────────────────────────

export const families = pgTable('families', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  country: text('country').notNull().default('IE'),
  county: text('county'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  familyStyle: familyStyleEnum('family_style').default('balanced'),
  timezone: text('timezone').notNull().default('Europe/Dublin'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('active'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // references auth.users
  familyId: uuid('family_id').references(() => families.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull().default('owner'),
  avatarUrl: text('avatar_url'),
  notificationPrefs: jsonb('notification_prefs').$type<{
    morning_idea: boolean;
    weekend_plan: boolean;
    weekly_summary: boolean;
    community: boolean;
  }>().default({
    morning_idea: true,
    weekend_plan: true,
    weekly_summary: true,
    community: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
]);

export const children = pgTable('children', {
  id: uuid('id').primaryKey().defaultRandom(),
  familyId: uuid('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  interests: text('interests').array().notNull().default([]),
  senFlags: text('sen_flags').array().default([]),
  learningStyle: learningStyleEnum('learning_style'),
  schoolStatus: schoolStatusEnum('school_status').notNull().default('mainstream'),
  curriculumStage: text('curriculum_stage'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull(),
  instructions: jsonb('instructions').$type<{ steps: string[]; variations?: string[]; tips?: string[] }>().notNull(),
  parentGuide: jsonb('parent_guide').$type<{
    knowledge: { topic: string; content: string }[];
    conversation_starters: string[];
    watch_for: string[];
  }>(),
  category: activityCategoryEnum('category').notNull(),
  ageMin: integer('age_min').notNull(),
  ageMax: integer('age_max').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  location: activityLocationEnum('location').notNull(),
  weather: text('weather').array().notNull().default([]),
  season: text('season').array().notNull().default([]),
  materials: jsonb('materials').$type<{ name: string; household_common: boolean }[]>().notNull().default([]),
  learningOutcomes: text('learning_outcomes').array().notNull().default([]),
  curriculumTags: jsonb('curriculum_tags'),
  energyLevel: energyLevelEnum('energy_level').notNull().default('moderate'),
  messLevel: messLevelEnum('mess_level').notNull().default('low'),
  screenFree: boolean('screen_free').notNull().default(true),
  premium: boolean('premium').notNull().default(false),
  countrySpecific: text('country_specific').array(),
  imageUrl: text('image_url'),
  printableUrl: text('printable_url'),
  createdBy: text('created_by').notNull().default('system'),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('activities_slug_idx').on(table.slug),
]);

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  familyId: uuid('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'set null' }),
  childIds: uuid('child_ids').array().notNull().default([]),
  date: date('date').notNull(),
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  photos: text('photos').array().notNull().default([]),
  rating: integer('rating'),
  curriculumAreasCovered: text('curriculum_areas_covered').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Educator Tables ─────────────────────────────────────

export const educationPlans = pgTable('education_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  familyId: uuid('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  childId: uuid('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  approach: educationApproachEnum('approach').notNull().default('blended'),
  hoursPerDay: real('hours_per_day').notNull().default(4),
  daysPerWeek: integer('days_per_week').notNull().default(5),
  curriculumAreas: jsonb('curriculum_areas').$type<Record<string, { priority: string; notes?: string }>>(),
  tuslaStatus: tuslaStatusEnum('tusla_status').notNull().default('not_applied'),
  planDocumentUrl: text('plan_document_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dailyPlans = pgTable('daily_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  educationPlanId: uuid('education_plan_id').notNull().references(() => educationPlans.id, { onDelete: 'cascade' }),
  childId: uuid('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  blocks: jsonb('blocks').$type<{
    time: string;
    subject: string;
    activity_id?: string;
    title: string;
    duration: number;
    notes?: string;
    completed: boolean;
    outcome_ids?: string[];
  }[]>().notNull().default([]),
  status: dailyPlanStatusEnum('status').notNull().default('planned'),
  attendanceLogged: boolean('attendance_logged').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const curriculumOutcomes = pgTable('curriculum_outcomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: text('country').notNull(),
  curriculumArea: text('curriculum_area').notNull(),
  stage: text('stage').notNull(),
  strand: text('strand').notNull(),
  outcomeCode: text('outcome_code').notNull(),
  outcomeText: text('outcome_text').notNull(),
});

export const portfolioEntries = pgTable('portfolio_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  childId: uuid('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  curriculumAreas: text('curriculum_areas').array().notNull().default([]),
  outcomeIds: uuid('outcome_ids').array().notNull().default([]),
  photos: text('photos').array().notNull().default([]),
  activityLogId: uuid('activity_log_id').references(() => activityLogs.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Community Tables ────────────────────────────────────

export const communityGroups = pgTable('community_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  county: text('county'),
  type: communityGroupTypeEnum('type').notNull().default('county'),
  memberCount: integer('member_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  familyId: uuid('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => communityGroups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: communityPostTypeEnum('type').notNull().default('discussion'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const communityMemberships = pgTable('community_memberships', {
  familyId: uuid('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => communityGroups.id, { onDelete: 'cascade' }),
  role: communityMemberRoleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Collections ─────────────────────────────────────

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  emoji: text('emoji'),
  activityIds: jsonb('activity_ids').$type<string[]>().notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  seasonal: boolean('seasonal').notNull().default(false),
  eventDate: text('event_date'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('collections_slug_idx').on(table.slug),
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => communityGroups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  capacity: integer('capacity'),
  rsvpCount: integer('rsvp_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
