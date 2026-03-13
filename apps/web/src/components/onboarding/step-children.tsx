'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { SchoolStatus } from '@/types/database';

const INTEREST_OPTIONS = [
  'Animals', 'Art', 'Building', 'Cooking', 'Dancing', 'Dinosaurs',
  'Gardening', 'Lego', 'Music', 'Nature', 'Reading', 'Science',
  'Space', 'Sports', 'Stories', 'Swimming', 'Trains', 'Writing',
];

export function StepChildren() {
  const { children, addChild, removeChild, updateChild, nextStep, prevStep } =
    useOnboardingStore();

  const canProceed = children.every(
    (c) => c.name.trim().length > 0 && c.dateOfBirth.length > 0
  );

  function toggleInterest(childIndex: number, interest: string) {
    const child = children[childIndex];
    const interests = child.interests.includes(interest)
      ? child.interests.filter((i) => i !== interest)
      : [...child.interests, interest];
    updateChild(childIndex, { interests });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          Your children
        </h2>
        <p className="text-sm text-clay mt-1 font-serif">
          So we can personalise ideas to their ages and interests.
        </p>
      </div>

      {children.map((child, index) => (
        <div
          key={index}
          className="space-y-4 rounded-[14px] border border-stone bg-linen p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-forest">
              Child {index + 1}
            </h3>
            {children.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeChild(index)}
                className="text-clay hover:text-rust"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-umber">Name</Label>
              <Input
                placeholder="Child's name"
                value={child.name}
                onChange={(e) =>
                  updateChild(index, { name: e.target.value })
                }
                className="border-stone focus:border-moss"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-umber">Date of birth</Label>
              <Input
                type="date"
                value={child.dateOfBirth}
                onChange={(e) =>
                  updateChild(index, { dateOfBirth: e.target.value })
                }
                className="border-stone focus:border-moss"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-umber">School status</Label>
            <Select
              value={child.schoolStatus}
              onValueChange={(v) =>
                updateChild(index, { schoolStatus: v as SchoolStatus })
              }
            >
              <SelectTrigger className="border-stone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainstream">In school (mainstream)</SelectItem>
                <SelectItem value="homeschool">Home educated</SelectItem>
                <SelectItem value="considering">Considering homeschool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-umber">What do they love?</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={
                    child.interests.includes(interest) ? 'default' : 'outline'
                  }
                  className={`cursor-pointer rounded px-3 py-1 transition-all ${
                    child.interests.includes(interest)
                      ? 'bg-forest text-parchment hover:bg-moss border-0'
                      : 'border-stone text-clay hover:bg-forest/5'
                  }`}
                  onClick={() => toggleInterest(index, interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addChild}
        className="w-full border-dashed border-stone text-clay hover:bg-forest/5 hover:border-moss"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add another child
      </Button>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep} className="text-clay">
          Back
        </Button>
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
