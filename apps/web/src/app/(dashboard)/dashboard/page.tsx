import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sun, Cloud, TreePine } from 'lucide-react';

export const metadata = {
  title: 'Today — The Hedge',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('name, families(name, county)')
    .eq('id', user!.id)
    .single();

  const family = (
    Array.isArray(profile?.families)
      ? profile.families[0]
      : profile?.families
  ) as { name: string; county: string | null } | null | undefined;
  const firstName = profile?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Good morning, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s on for the {family?.name || 'family'} today.
        </p>
      </div>

      {/* Weather summary placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Sun className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-base">Weather</CardTitle>
            <CardDescription>
              {family?.county ? `${family.county}, Ireland` : 'Ireland'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Weather integration coming soon. We&apos;ll use Open-Meteo to give
            you weather-appropriate activity suggestions.
          </p>
        </CardContent>
      </Card>

      {/* Today's activities placeholder */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-green-800">
          Today&apos;s ideas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Nature scavenger hunt',
              description:
                'Head outside and find 10 things from nature — a feather, a smooth stone, something red...',
              duration: '30 min',
              icon: TreePine,
            },
            {
              title: 'Kitchen science',
              description:
                'Make a volcano with baking soda and vinegar. Measure, predict, and observe.',
              duration: '20 min',
              icon: Cloud,
            },
            {
              title: 'Story stones',
              description:
                'Paint stones with characters and settings. Take turns building a story.',
              duration: '45 min',
              icon: Sun,
            },
          ].map((activity) => (
            <Card
              key={activity.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <activity.icon className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    {activity.duration}
                  </span>
                </div>
                <CardTitle className="text-base">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Personalised activity suggestions powered by AI are coming in Phase 2.
      </p>
    </div>
  );
}
