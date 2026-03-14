import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export const metadata = {
  title: 'Set up your family - The Hedge',
  description: 'Tell us about your family so we can personalise your experience',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-parchment px-4 py-12">
      <OnboardingWizard />
    </div>
  );
}
