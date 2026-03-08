'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StepPractical() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    hasOutdoorSpace,
    carActivities,
    messComfort,
    updateField,
    prevStep,
    // Full state for submission
    familyName,
    country,
    county,
    children,
    familyStyle,
    ideaTimes,
    weekendPlanning,
    holidayPlanning,
  } = useOnboardingStore();

  async function handleComplete() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to complete onboarding.');
        setLoading(false);
        return;
      }

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          country,
          county: county || null,
          family_style: familyStyle,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // Update user profile with family_id
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          family_id: family.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email!,
          role: 'owner',
          notification_prefs: {
            morning_idea: true,
            weekend_plan: weekendPlanning,
            weekly_summary: true,
            community: true,
          },
        });

      if (userError) throw userError;

      // Create children
      if (children.length > 0) {
        const childInserts = children.map((child) => ({
          family_id: family.id,
          name: child.name,
          date_of_birth: child.dateOfBirth,
          interests: child.interests,
          school_status: child.schoolStatus,
          sen_flags: child.senFlags,
          learning_style: child.learningStyle,
        }));

        const { error: childrenError } = await supabase
          .from('children')
          .insert(childInserts);

        if (childrenError) throw childrenError;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-green-800">
          Nearly there! A few practical bits.
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          So we suggest activities that actually work for you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-stone-200 p-4">
          <Checkbox
            id="outdoor"
            checked={hasOutdoorSpace}
            onCheckedChange={(checked) =>
              updateField('hasOutdoorSpace', checked === true)
            }
          />
          <Label htmlFor="outdoor">
            We have outdoor space (garden, yard, balcony)
          </Label>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-stone-200 p-4">
          <Checkbox
            id="car"
            checked={carActivities}
            onCheckedChange={(checked) =>
              updateField('carActivities', checked === true)
            }
          />
          <Label htmlFor="car">
            We spend time in the car (include car-friendly ideas)
          </Label>
        </div>

        <div className="space-y-2">
          <Label>How do you feel about mess?</Label>
          <Select
            value={messComfort}
            onValueChange={(v) =>
              updateField('messComfort', v as 'none' | 'low' | 'medium' | 'high')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keep it clean, please</SelectItem>
              <SelectItem value="low">A small bit is fine</SelectItem>
              <SelectItem value="medium">
                Sure, a bit of mess is grand
              </SelectItem>
              <SelectItem value="high">
                Go wild — the messier the better
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="bg-green-700 hover:bg-green-800"
        >
          {loading ? 'Setting up your family...' : 'Start exploring'}
        </Button>
      </div>
    </div>
  );
}
