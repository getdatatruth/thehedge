import { getAllActivities } from '@/lib/admin/queries';
import { AdminActivitiesClient } from './activities-client';

export const dynamic = 'force-dynamic';

export default async function AdminActivitiesPage() {
  const activities = await getAllActivities();
  return <AdminActivitiesClient initialActivities={activities} />;
}
