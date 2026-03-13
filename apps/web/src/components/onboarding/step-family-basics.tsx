'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford',
  'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon',
  'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath',
  'Wexford', 'Wicklow',
];

export function StepFamilyBasics() {
  const { familyName, country, county, updateField, nextStep } =
    useOnboardingStore();

  const canProceed = familyName.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          Tell us about your family
        </h2>
        <p className="text-sm text-clay mt-1 font-serif">
          Just the basics to get you started.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="familyName" className="text-umber">Family name</Label>
          <Input
            id="familyName"
            placeholder="e.g. The O'Briens"
            value={familyName}
            onChange={(e) => updateField('familyName', e.target.value)}
            className="border-stone focus:border-moss"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-umber">Country</Label>
          <Select
            value={country}
            onValueChange={(v) => { if (v) updateField('country', v); }}
          >
            <SelectTrigger className="border-stone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IE">Ireland</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="US">United States</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {country === 'IE' && (
          <div className="space-y-2">
            <Label className="text-umber">County</Label>
            <Select
              value={county}
              onValueChange={(v) => { if (v) updateField('county', v); }}
            >
              <SelectTrigger className="border-stone">
                <SelectValue placeholder="Select your county" />
              </SelectTrigger>
              <SelectContent>
                {IRISH_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={nextStep}
          disabled={!canProceed}
          className="btn-primary"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
