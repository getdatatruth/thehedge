import Link from 'next/link';
import { TreePine, Sparkles, Sun, BookOpen, CloudRain, Brain, Users, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest">
              <TreePine className="h-5 w-5 text-sage" />
            </div>
            <span className="font-display text-xl font-light text-forest">The Hedge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm font-medium text-clay/60 hover:text-forest transition-colors hidden sm:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="btn-secondary hidden sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mesh-gradient-hero overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Decorative floating elements */}
        <div className="absolute top-32 left-[10%] h-64 w-64 rounded-full bg-moss/5 blur-3xl animate-float" />
        <div className="absolute top-48 right-[15%] h-48 w-48 rounded-full bg-gold/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-[30%] h-56 w-56 rounded-full bg-moss/5 blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="animate-fade-up">
            <div className="mb-8 inline-flex items-center gap-2 rounded glass px-5 py-2 text-sm font-medium text-forest">
              <Sparkles className="h-4 w-4 text-gold" />
              Inspired by Ireland&apos;s hedge schools
            </div>
          </div>

          <h1 className="animate-fade-up font-display text-5xl font-light leading-[1.1] tracking-tight sm:text-7xl text-balance" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text">Know what to do</span>
            <br />
            <span className="text-forest">with your kids today</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-clay/80 font-serif sm:text-xl" style={{ animationDelay: '0.2s' }}>
            Personalised, screen-free activity ideas based on your children&apos;s ages,
            the weather outside, and what you did yesterday.
          </p>

          <div className="animate-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup" className="btn-primary text-base px-8 py-3">
              Start your family journey
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>

          <p className="animate-fade-up mt-4 text-sm text-clay/50" style={{ animationDelay: '0.4s' }}>
            Free forever for families. No credit card needed.
          </p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-stone bg-linen/50">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { num: '200+', label: 'Activities' },
            { num: '10', label: 'Categories' },
            { num: '100%', label: 'Screen-free' },
            { num: 'New', label: 'Every week' },
          ].map(({ num, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-light text-forest">{num}</span>
              <span className="text-sm text-clay/60">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-light sm:text-4xl text-balance">
              Everything a family needs,
              <br className="hidden sm:block" /> nothing they don&apos;t
            </h2>
            <p className="mt-3 text-clay/70 font-serif text-lg max-w-lg mx-auto">
              Built for real Irish families with real schedules, real weather, and real kids.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large feature card */}
            <div className="card-elevated sm:col-span-2 lg:col-span-2 p-8 relative overflow-hidden noise">
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss">
                  <Brain className="h-6 w-6 text-parchment" />
                </div>
                <h3 className="font-display text-xl font-light mb-2">AI that knows your family</h3>
                <p className="text-clay/70 font-serif max-w-md leading-relaxed">
                  Ask The Hedge for ideas and get suggestions tailored to your children&apos;s
                  ages, interests, the weather, and what you&apos;ve done before. Powered by HedgeAI.
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-moss/5 blur-2xl" />
            </div>

            {/* Weather card */}
            <div className="card-elevated p-8 relative overflow-hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-sky/60">
                <CloudRain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-light mb-2">Weather-aware</h3>
              <p className="text-clay/70 font-serif text-sm leading-relaxed">
                Raining in Cork? We&apos;ll show indoor activities. Sunny in Galway?
                Let&apos;s get outside.
              </p>
            </div>

            {/* Screen free */}
            <div className="card-elevated p-8 relative overflow-hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-light mb-2">100% screen-free</h3>
              <p className="text-clay/70 font-serif text-sm leading-relaxed">
                Every activity is designed for hands-on, real-world fun.
                No guilt, no judgment.
              </p>
            </div>

            {/* Learning */}
            <div className="card-elevated p-8 relative overflow-hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-berry to-berry/60">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-light mb-2">Learning built in</h3>
              <p className="text-clay/70 font-serif text-sm leading-relaxed">
                Every activity has learning outcomes mapped to real skills.
                Education that doesn&apos;t feel like school.
              </p>
            </div>

            {/* Community */}
            <div className="card-elevated p-8 relative overflow-hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-moss to-sage">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-light mb-2">Community</h3>
              <p className="text-clay/70 font-serif text-sm leading-relaxed">
                Connect with other families, share ideas, and find local groups
                near you across Ireland.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 mesh-gradient relative noise">
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-light sm:text-4xl">
              Up and running in 2 minutes
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Tell us about your family',
                desc: 'Children\'s ages, interests, and your family style.',
              },
              {
                step: '02',
                title: 'Get today\'s ideas',
                desc: 'Personalised activities based on weather, season, and your kids.',
              },
              {
                step: '03',
                title: 'Do, log, repeat',
                desc: 'Complete activities, log memories, and build your family timeline.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center sm:text-left">
                <span className="font-display text-5xl font-light text-forest/10">{step}</span>
                <h3 className="font-display text-lg font-light -mt-3">{title}</h3>
                <p className="mt-2 text-clay/70 font-serif text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-light sm:text-4xl mb-6">
            Free for families. Always.
          </h2>
          <div className="card-elevated p-8 sm:p-10 max-w-md mx-auto">
            <div className="text-sm font-heading text-moss uppercase tracking-wider mb-2">Family Plan</div>
            <div className="font-display text-5xl font-light text-forest mb-1">Free</div>
            <p className="text-clay/60 text-sm mb-6">Everything you need to get started</p>
            <ul className="space-y-3 text-left mb-8">
              {[
                'Personalised daily activity ideas',
                'Weather-aware suggestions',
                'Family timeline & photos',
                '5 AI conversations per week',
                'Browse 200+ activities',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-ink">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/10">
                    <Check className="h-3 w-3 text-moss" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary w-full justify-center">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-linen/50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-light sm:text-4xl">
              Families love The Hedge
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                quote: 'Finally, I don\'t have to think about what to do on a rainy Sunday. The Hedge just knows.',
                name: 'Sinead M.',
                location: 'Cork',
                initials: 'SM',
              },
              {
                quote: 'My kids are 3 and 7 — it\'s hard to find activities for both. The Hedge nails it every time.',
                name: 'Roisin K.',
                location: 'Galway',
                initials: 'RK',
              },
              {
                quote: 'The educator plan saved me hours of Tusla paperwork. Genuinely life-changing for our homeschool.',
                name: 'Ciaran D.',
                location: 'Dublin',
                initials: 'CD',
              },
            ].map(({ quote, name, location, initials }) => (
              <div key={name} className="card-elevated p-6 flex flex-col">
                <p className="text-clay/70 font-serif text-sm leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-stone">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moss/10 text-xs font-heading text-moss">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="text-xs text-clay/50">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educator callout */}
      <section className="py-16 sm:py-20 mesh-gradient">
        <div className="mx-auto max-w-5xl px-6">
          <div className="card-elevated p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/5 blur-3xl" />
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 rounded bg-gold/10 px-3 py-1 text-xs font-heading text-gold uppercase tracking-wider mb-4">
                <BookOpen className="h-3.5 w-3.5" />
                For home educators
              </div>
              <h3 className="font-display text-2xl font-light text-forest mb-3">
                Homeschooling in Ireland?
              </h3>
              <p className="text-clay/70 font-serif leading-relaxed max-w-lg">
                The Hedge Educator plan gives you curriculum-aligned planning, Tusla compliance
                tracking, portfolio management, and daily schedules — all in one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-primary">
                  See Educator plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/15">
              <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 text-gold/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest to-moss" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-light text-parchment sm:text-5xl text-balance">
            Your kids won&apos;t remember the screens.
            <br />
            They&apos;ll remember the adventures.
          </h2>
          <p className="mt-4 text-sage/80 font-serif text-lg">
            Join families across Ireland who are discovering something new every day.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded bg-parchment text-forest px-8 py-3 text-base font-semibold hover:bg-white transition-all hover:-translate-y-0.5"
            >
              Start your family journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone py-8">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-sm text-clay/50">
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            <span className="font-display font-light">The Hedge</span>
          </div>
          <p>Made in Ireland</p>
        </div>
      </footer>
    </div>
  );
}
