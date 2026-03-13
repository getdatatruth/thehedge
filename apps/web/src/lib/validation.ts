import { z } from 'zod/v4';
import { NextResponse } from 'next/server';

// ─── Auth Schemas ─────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  plan: z.enum(['free', 'family', 'educator']).optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Onboarding Schemas ──────────────────────────────────

const childOnboardingSchema = z.object({
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  interests: z.array(z.string()).default([]),
  senFlags: z.array(z.string()).default([]),
  learningStyle: z
    .enum(['visual', 'auditory', 'kinesthetic', 'mixed'])
    .optional(),
  schoolStatus: z
    .enum(['mainstream', 'homeschool', 'considering'])
    .default('mainstream'),
});

export const onboardingSchema = z.object({
  familyName: z.string().min(1, 'Family name is required').max(100),
  county: z.string().optional(),
  familyStyle: z
    .enum(['active', 'creative', 'curious', 'bookish', 'balanced'])
    .default('balanced'),
  children: z.array(childOnboardingSchema).min(1, 'At least one child is required'),
  // Availability / preferences
  availableDays: z.array(z.string()).optional(),
  preferredTimes: z.array(z.string()).optional(),
  hasGarden: z.boolean().optional(),
  hasTransport: z.boolean().optional(),
});

// ─── Activity Log Schema ─────────────────────────────────

export const activityLogSchema = z.object({
  activityId: z.string().uuid().optional(),
  childIds: z.array(z.string().uuid()).default([]),
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().int().min(1).max(480).optional(),
  notes: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).default([]),
  rating: z.number().int().min(1).max(5).optional(),
  curriculumAreasCovered: z.array(z.string()).optional(),
});

// ─── Favourite Schema ────────────────────────────────────

export const favouriteSchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
});

// ─── Planner Schemas ─────────────────────────────────────

export const plannerAddSchema = z.object({
  activityId: z.string().uuid(),
  date: z.string().min(1, 'Date is required'),
  childId: z.string().uuid().optional(),
  time: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const plannerRemoveSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

// ─── Settings Schemas ────────────────────────────────────

export const settingsProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  familyName: z.string().min(1).max(100).optional(),
  county: z.string().max(50).optional(),
  timezone: z.string().max(50).optional(),
});

export const settingsChildSchema = z.object({
  id: z.string().uuid().optional(), // omit for new child
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1),
  interests: z.array(z.string()).default([]),
  senFlags: z.array(z.string()).default([]),
  learningStyle: z
    .enum(['visual', 'auditory', 'kinesthetic', 'mixed'])
    .optional(),
  schoolStatus: z
    .enum(['mainstream', 'homeschool', 'considering'])
    .default('mainstream'),
});

// ─── Community Schemas ───────────────────────────────────

export const communityPostSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(5000),
  type: z.enum(['discussion', 'question', 'event', 'resource']).default('discussion'),
});

export const communityGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  county: z.string().max(50).optional(),
  type: z.enum(['county', 'interest', 'coop']).default('county'),
});

// ─── Notification Preferences ────────────────────────────

export const notificationPrefsSchema = z.object({
  morning_idea: z.boolean(),
  weekend_plan: z.boolean(),
  weekly_summary: z.boolean(),
  community: z.boolean(),
});

// ─── Admin Activity Schema ───────────────────────────────

export const adminActivitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  instructions: z.array(z.string()).default([]),
  category: z.enum([
    'nature', 'kitchen', 'science', 'art', 'movement',
    'literacy', 'maths', 'life_skills', 'calm', 'social',
  ]),
  age_min: z.number().int().min(0).max(18).default(3),
  age_max: z.number().int().min(0).max(18).default(10),
  duration_minutes: z.number().int().min(1).max(480).default(30),
  location: z.enum(['indoor', 'outdoor', 'both', 'car', 'anywhere']).default('indoor'),
  energy_level: z.enum(['calm', 'moderate', 'active']).default('moderate'),
  mess_level: z.enum(['none', 'low', 'medium', 'high']).default('low'),
  screen_free: z.boolean().default(true),
  premium: z.boolean().default(false),
  materials: z.array(z.object({
    name: z.string(),
    household_common: z.boolean(),
  })).default([]),
  learning_outcomes: z.array(z.string()).default([]),
  weather: z.array(z.string()).default([]),
  season: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

// ─── Request Validation Helper ───────────────────────────

/**
 * Parse and validate a request body against a Zod schema.
 *
 * Returns `{ success: true, data }` on success, or
 * `{ success: false, response }` with a 400 NextResponse on failure.
 *
 * Usage:
 * ```ts
 * const result = await validateRequest(request, mySchema);
 * if (!result.success) return result.response;
 * const data = result.data;
 * ```
 */
export async function validateRequest<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: issues,
            },
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON body',
            code: 'INVALID_JSON',
          },
        },
        { status: 400 }
      ),
    };
  }
}
