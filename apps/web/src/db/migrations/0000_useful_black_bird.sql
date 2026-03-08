CREATE TYPE "public"."activity_category" AS ENUM('nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social');--> statement-breakpoint
CREATE TYPE "public"."activity_location" AS ENUM('indoor', 'outdoor', 'both', 'car', 'anywhere');--> statement-breakpoint
CREATE TYPE "public"."community_group_type" AS ENUM('county', 'interest', 'coop');--> statement-breakpoint
CREATE TYPE "public"."community_member_role" AS ENUM('admin', 'moderator', 'member');--> statement-breakpoint
CREATE TYPE "public"."community_post_type" AS ENUM('discussion', 'question', 'event', 'resource');--> statement-breakpoint
CREATE TYPE "public"."daily_plan_status" AS ENUM('planned', 'in_progress', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."education_approach" AS ENUM('structured', 'relaxed', 'child_led', 'blended', 'exploratory');--> statement-breakpoint
CREATE TYPE "public"."energy_level" AS ENUM('calm', 'moderate', 'active');--> statement-breakpoint
CREATE TYPE "public"."family_style" AS ENUM('active', 'creative', 'curious', 'bookish', 'balanced');--> statement-breakpoint
CREATE TYPE "public"."learning_style" AS ENUM('visual', 'auditory', 'kinesthetic', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."mess_level" AS ENUM('none', 'low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."school_status" AS ENUM('mainstream', 'homeschool', 'considering');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'family', 'educator');--> statement-breakpoint
CREATE TYPE "public"."tusla_status" AS ENUM('not_applied', 'applied', 'awaiting', 'registered', 'review_due');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"instructions" jsonb NOT NULL,
	"category" "activity_category" NOT NULL,
	"age_min" integer NOT NULL,
	"age_max" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"location" "activity_location" NOT NULL,
	"weather" text[] DEFAULT '{}' NOT NULL,
	"season" text[] DEFAULT '{}' NOT NULL,
	"materials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"learning_outcomes" text[] DEFAULT '{}' NOT NULL,
	"curriculum_tags" jsonb,
	"energy_level" "energy_level" DEFAULT 'moderate' NOT NULL,
	"mess_level" "mess_level" DEFAULT 'low' NOT NULL,
	"screen_free" boolean DEFAULT true NOT NULL,
	"premium" boolean DEFAULT false NOT NULL,
	"country_specific" text[],
	"image_url" text,
	"printable_url" text,
	"created_by" text DEFAULT 'system' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"activity_id" uuid,
	"child_ids" uuid[] DEFAULT '{}' NOT NULL,
	"date" date NOT NULL,
	"duration_minutes" integer,
	"notes" text,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"rating" integer,
	"curriculum_areas_covered" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"sen_flags" text[] DEFAULT '{}',
	"learning_style" "learning_style",
	"school_status" "school_status" DEFAULT 'mainstream' NOT NULL,
	"curriculum_stage" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"county" text,
	"type" "community_group_type" DEFAULT 'county' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_memberships" (
	"family_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"role" "community_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" "community_post_type" DEFAULT 'discussion' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" text NOT NULL,
	"curriculum_area" text NOT NULL,
	"stage" text NOT NULL,
	"strand" text NOT NULL,
	"outcome_code" text NOT NULL,
	"outcome_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"education_plan_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"date" date NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "daily_plan_status" DEFAULT 'planned' NOT NULL,
	"attendance_logged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"academic_year" text NOT NULL,
	"approach" "education_approach" DEFAULT 'blended' NOT NULL,
	"hours_per_day" real DEFAULT 4 NOT NULL,
	"days_per_week" integer DEFAULT 5 NOT NULL,
	"curriculum_areas" jsonb,
	"tusla_status" "tusla_status" DEFAULT 'not_applied' NOT NULL,
	"plan_document_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"date" timestamp with time zone NOT NULL,
	"capacity" integer,
	"rsvp_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text DEFAULT 'IE' NOT NULL,
	"county" text,
	"latitude" real,
	"longitude" real,
	"family_style" "family_style" DEFAULT 'balanced',
	"timezone" text DEFAULT 'Europe/Dublin' NOT NULL,
	"stripe_customer_id" text,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'active' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"date" date NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"curriculum_areas" text[] DEFAULT '{}' NOT NULL,
	"outcome_ids" uuid[] DEFAULT '{}' NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"activity_log_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"family_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'owner' NOT NULL,
	"avatar_url" text,
	"notification_prefs" jsonb DEFAULT '{"morning_idea":true,"weekend_plan":true,"weekly_summary":true,"community":true}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_group_id_community_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."community_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_group_id_community_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."community_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_education_plan_id_education_plans_id_fk" FOREIGN KEY ("education_plan_id") REFERENCES "public"."education_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_plans" ADD CONSTRAINT "education_plans_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_plans" ADD CONSTRAINT "education_plans_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_group_id_community_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."community_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_activity_log_id_activity_logs_id_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_slug_idx" ON "activities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");