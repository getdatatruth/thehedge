-- Add stripe_subscription_id column to families table
ALTER TABLE "families" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
