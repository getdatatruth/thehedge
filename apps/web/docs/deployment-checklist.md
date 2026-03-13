# The Hedge — Vercel Deployment Checklist

## 1. Vercel Project Setup

- [ ] Create new project on Vercel, connect GitHub repo
- [ ] Set **Root Directory** to `apps/web` (monorepo setting)
- [ ] Framework preset: **Next.js** (auto-detected)
- [ ] Build command: `next build` (default from package.json)
- [ ] Output directory: `.next` (default)
- [ ] Node.js version: 20.x (recommended)

## 2. Environment Variables

Set all of the following in Vercel > Project Settings > Environment Variables.
Mark variables as available for **Production**, **Preview**, and **Development** as appropriate.

### Supabase (required)

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Public, all environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Public, all environments |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-only, never expose to client |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` | Direct connection for Drizzle ORM |

### Anthropic / HedgeAI (required)

| Variable | Example | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Server-only |

### Stripe (required for billing)

| Variable | Example | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Use live key for production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Public, use live key for production |
| `STRIPE_PRICE_FAMILY` | `price_...` | Family plan Stripe Price ID |
| `STRIPE_PRICE_EDUCATOR` | `price_...` | Educator plan Stripe Price ID |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook setup (step 3) |

### Email / Resend (required for alerts and transactional email)

| Variable | Example | Notes |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Server-only |

### Monitoring & Cron (required)

| Variable | Example | Notes |
|---|---|---|
| `CRON_SECRET` | random 32+ char string | Vercel cron auth; generate with `openssl rand -hex 32` |
| `ALERT_EMAIL` | `admin@thehedge.ie` | Receives monitoring alerts |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Optional, for Slack alerts |

### App URL (required)

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://thehedge.ie` | Production URL. Set to Vercel preview URL for preview env |

## 3. Stripe Webhook Setup

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL to: `https://thehedge.ie/api/stripe/webhooks`
   - For preview deployments, use the Vercel preview URL instead
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in Vercel env vars
7. Verify the webhook is correctly configured:
   - The route at `src/app/api/stripe/webhooks/route.ts` reads the raw body via `request.text()` (correct for Next.js App Router on Vercel)
   - Stripe signature verification uses `stripe.webhooks.constructEvent(body, signature, secret)`
   - No additional body parser config is needed (App Router does not parse request bodies by default)

### Stripe Price IDs

The webhook route has hardcoded price-to-tier mapping in `PRICE_TO_TIER`. After creating your live Stripe products/prices, update:
- `src/app/api/stripe/webhooks/route.ts` — `PRICE_TO_TIER` map
- Vercel env vars: `STRIPE_PRICE_FAMILY`, `STRIPE_PRICE_EDUCATOR`

## 4. DNS / Domain Setup

- [ ] Add custom domain `thehedge.ie` in Vercel > Project Settings > Domains
- [ ] Add `www.thehedge.ie` and configure redirect (www -> apex or vice versa)
- [ ] Update DNS records at your registrar:
  - `A` record: `76.76.21.21` (Vercel)
  - `CNAME` for `www`: `cname.vercel-dns.com`
- [ ] Verify SSL certificate is provisioned (Vercel handles this automatically)
- [ ] Add domain to Supabase Auth > URL Configuration > Site URL: `https://thehedge.ie`
- [ ] Add `https://thehedge.ie/auth/callback` to Supabase Auth > Redirect URLs
- [ ] Add domain to Resend for email sending (DNS verification required)

## 5. Supabase Configuration

- [ ] Ensure Supabase project is in EU region (eu-west-1) for GDPR compliance
- [ ] Set Site URL in Supabase Auth settings to `https://thehedge.ie`
- [ ] Add redirect URLs: `https://thehedge.ie/auth/callback`, `https://thehedge.ie/**`
- [ ] Run database migrations: `npm run db:push` or `npm run db:migrate`
- [ ] Verify RLS policies are enabled on all tables
- [ ] Set up Supabase database backups (enabled by default on Pro plan)

## 6. Vercel Cron Jobs

The following crons are configured in `vercel.json`:

| Schedule | Path | Purpose |
|---|---|---|
| `*/5 * * * *` | `/api/cron/monitor` | Health monitoring (every 5 min) |
| `0 6 * * 1` | `/api/cron/generate-activities` | Weekly activity generation (Mon 6am UTC) |

- Cron jobs are only available on Vercel Pro plan or higher
- Both routes verify `CRON_SECRET` via the `Authorization: Bearer <secret>` header
- Vercel automatically sends the `CRON_SECRET` env var as the auth header

## 7. Security Checklist

- [ ] Verify `NODE_ENV=production` is set (Vercel sets this automatically)
- [ ] Dev test-user endpoint (`/api/dev/create-test-user`) is gated by `NODE_ENV !== 'production'`
- [ ] CSP headers are configured in `next.config.ts` (includes Stripe, Supabase, Anthropic domains)
- [ ] HSTS, X-Frame-Options, X-Content-Type-Options headers are set
- [ ] Supabase service role key is server-only (not prefixed with `NEXT_PUBLIC_`)
- [ ] Stripe secret key is server-only
- [ ] Anthropic API key is server-only
- [ ] Admin routes require admin role verification via `@/lib/admin-auth.ts`

## 8. Post-Deploy Verification

Run through these checks after the first production deploy:

### Core Functionality
- [ ] Visit `https://thehedge.ie` — landing page loads
- [ ] Visit `https://thehedge.ie/api/health` — returns `{ "status": "healthy" }` with all services green
- [ ] Sign up a new account — email confirmation works
- [ ] Complete onboarding wizard — redirects to dashboard
- [ ] Browse activities — search and category filters work
- [ ] Log an activity — appears in timeline
- [ ] Test HedgeAI chat — Claude responses work

### Stripe / Billing
- [ ] Visit settings > billing — subscription page loads
- [ ] Start a test checkout (use Stripe test mode first if needed)
- [ ] Verify webhook receives events: check Stripe Dashboard > Webhooks > endpoint > Recent attempts
- [ ] Test subscription upgrade/downgrade flow

### Cron & Monitoring
- [ ] Check Vercel > Project > Cron Jobs — both crons should appear
- [ ] Manually trigger `/api/cron/monitor` — verify it returns health status
- [ ] Check that monitoring alerts fire correctly (trigger a degraded state if possible)

### Edge Cases
- [ ] Unauthenticated user accessing `/dashboard` — redirects to `/login`
- [ ] Authenticated user accessing `/login` — redirects to `/dashboard`
- [ ] User without completed onboarding accessing `/dashboard` — redirects to `/onboarding`

## 9. Production Readiness Notes

- **Stripe Price IDs**: The webhook route (`src/app/api/stripe/webhooks/route.ts`) has a `PRICE_TO_TIER` mapping with test price IDs. Update these to your live Stripe price IDs before going live.
- **Vercel Pro**: Cron jobs require Vercel Pro plan. The monitoring cron runs every 5 minutes.
- **Database**: Run `npm run db:push` against the production Supabase instance before deploying.
- **Email (Resend)**: Verify your sending domain in Resend dashboard and add required DNS records (SPF, DKIM, DMARC).
