import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - The Hedge',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-cat-nature hover:text-forest transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-4xl font-bold text-ink mb-2">Privacy Policy</h1>
        <p className="text-clay mb-12">Last updated: April 2026</p>

        <div className="prose prose-lg max-w-none space-y-8 text-umber">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Who we are</h2>
            <p>The Hedge ("we", "us", "our") is a family learning platform operated from Ireland. We are committed to protecting your family's privacy and your children's data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. What data we collect</h2>
            <p>We collect the following information when you use The Hedge:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> Your name, email address, and password (encrypted)</li>
              <li><strong>Family information:</strong> Family name, county, family style preferences</li>
              <li><strong>Children's information:</strong> First names, dates of birth, interests, and school status. We never collect surnames or identifying information about children beyond first names.</li>
              <li><strong>Activity data:</strong> Which activities you log, ratings, notes, and photos you choose to upload</li>
              <li><strong>Usage data:</strong> How you interact with the app to improve our service</li>
              <li><strong>Location:</strong> Your county (not precise location) for weather-aware activity suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. How we use your data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To personalise activity recommendations based on your children's ages and interests</li>
              <li>To provide weather-appropriate activity suggestions for your area</li>
              <li>To track your family's learning progress and Hedge Score</li>
              <li>To generate curriculum-aligned weekly plans for homeschool families</li>
              <li>To send you activity reminders and progress updates (with your permission)</li>
              <li>To improve our service and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Children's privacy</h2>
            <p>We take children's privacy extremely seriously. The Hedge is designed for parents and guardians - children do not create their own accounts or interact directly with the service.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We only store children's first names - never surnames or full names</li>
              <li>Children's data is always associated with a parent's account</li>
              <li>We do not share children's data with third parties</li>
              <li>Photos uploaded to activity logs are stored securely and only visible to the family</li>
              <li>Parents can delete all children's data at any time from Settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Data storage and security</h2>
            <p>Your data is stored securely on servers in the European Union (Supabase, EU region). We use industry-standard encryption for data in transit and at rest. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. AI features</h2>
            <p>The Hedge uses AI (Anthropic Claude) to generate activity suggestions and insights. When you use AI features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your children's first names and ages are sent to generate personalised suggestions</li>
              <li>Your location (county) and weather data may be included for contextual recommendations</li>
              <li>AI conversations are not stored beyond your current session</li>
              <li>We do not use your data to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">7. Third-party services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication (EU region)</li>
              <li><strong>Stripe:</strong> Payment processing for subscriptions</li>
              <li><strong>Anthropic:</strong> AI-powered activity suggestions and insights</li>
              <li><strong>Expo:</strong> Mobile app delivery and push notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">8. Your rights (GDPR)</h2>
            <p>As an EU resident, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your data - export it from Settings at any time</li>
              <li>Correct your data - edit your profile and children's details in Settings</li>
              <li>Delete your data - permanently delete your account from Settings</li>
              <li>Data portability - download your data in a standard format</li>
              <li>Withdraw consent - disable notifications or delete your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">9. Cookies</h2>
            <p>The Hedge web platform uses essential cookies for authentication only. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">10. Contact us</h2>
            <p>If you have questions about this privacy policy or your data, contact us at <a href="mailto:privacy@thehedge.ie" className="text-cat-nature hover:underline">privacy@thehedge.ie</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
