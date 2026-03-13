import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/signup-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign up — The Hedge',
  description: 'Join The Hedge — where curious families learn',
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
