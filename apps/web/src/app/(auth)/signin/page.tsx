import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in - The Hedge',
  description: 'Sign in to your Hedge family account',
};

export default function SigninPage() {
  redirect('/login');
}
