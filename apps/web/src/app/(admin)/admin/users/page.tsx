import { getAllFamilies } from '@/lib/admin/queries';
import { AdminUsersClient } from './users-client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const families = await getAllFamilies();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AdminUsersClient initialFamilies={families as any} />;
}
