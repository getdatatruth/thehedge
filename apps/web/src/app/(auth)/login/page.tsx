import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in — The Hedge',
  description: 'Sign in to your Hedge family account',
};

export default function LoginPage() {
  return <LoginForm />;
}
