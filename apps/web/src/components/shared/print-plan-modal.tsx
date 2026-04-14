'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Printer, FileText, LayoutList, Check } from 'lucide-react';
import { generateWeeklyPlanHtml, type PrintOptions } from '@/lib/weekly-plan-print';

interface PlanBlock {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  notes?: string;
  completed: boolean;
  category?: string;
}

interface DailyPlan {
  id: string;
  child_id: string;
  date: string;
  blocks: PlanBlock[];
  status: string;
}

interface ChildInfo {
  id: string;
  name: string;
  date_of_birth: string;
}

interface PrintPlanModalProps {
  familyName: string;
  weekStart: string;
  weekEnd: string;
  children: ChildInfo[];
  dailyPlans: DailyPlan[];
  activityCategories: Record<string, string>;
  trigger: React.ReactNode;
}

export function PrintPlanModal({
  familyName,
  weekStart,
  weekEnd,
  children,
  dailyPlans,
  activityCategories,
  trigger,
}: PrintPlanModalProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'full' | 'summary'>('full');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeCategoryColours, setIncludeCategoryColours] = useState(true);
  const [includeCheckboxes, setIncludeCheckboxes] = useState(true);
  const [includeCurriculum, setIncludeCurriculum] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeWeeklySummary, setIncludeWeeklySummary] = useState(true);

  function handleGenerate() {
    const options: PrintOptions = {
      format,
      includeHeader,
      includeCategoryColours,
      includeCheckboxes,
      includeCurriculum,
      includeNotes,
      includeWeeklySummary,
      childId: selectedChild,
    };

    const html = generateWeeklyPlanHtml(
      { familyName, weekStart, weekEnd, children, dailyPlans, activityCategories },
      options
    );

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setOpen(false);
  }

  const toggleOptions = [
    { label: 'Family header & branding', value: includeHeader, setter: setIncludeHeader },
    { label: 'Category colour coding', value: includeCategoryColours, setter: setIncludeCategoryColours },
    { label: 'Completion checkboxes', value: includeCheckboxes, setter: setIncludeCheckboxes },
    { label: 'Curriculum info (subjects)', value: includeCurriculum, setter: setIncludeCurriculum },
    { label: 'Weekly summary & stats', value: includeWeeklySummary, setter: setIncludeWeeklySummary },
    { label: 'Notes & reflections space', value: includeNotes, setter: setIncludeNotes },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-linen border-stone">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-ink flex items-center gap-2">
            <Printer className="h-5 w-5 text-cat-nature" />
            Print Weekly Plan
          </DialogTitle>
          <DialogDescription className="text-clay">
            Customise your printable plan, then print or save as PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Format toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-clay mb-2">Format</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('full')}
                className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-all ${
                  format === 'full'
                    ? 'border-cat-nature bg-cat-nature/8 text-forest'
                    : 'border-stone bg-parchment text-clay hover:border-cat-nature/30'
                }`}
              >
                <FileText className="h-4 w-4" />
                Full Plan
              </button>
              <button
                onClick={() => setFormat('summary')}
                className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-all ${
                  format === 'summary'
                    ? 'border-cat-nature bg-cat-nature/8 text-forest'
                    : 'border-stone bg-parchment text-clay hover:border-cat-nature/30'
                }`}
              >
                <LayoutList className="h-4 w-4" />
                1-Page Summary
              </button>
            </div>
          </div>

          {/* Child selector */}
          {children.length > 1 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-clay mb-2">Child</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedChild(null)}
                  className={`rounded-2xl px-3 py-1.5 text-sm font-medium transition-all ${
                    !selectedChild
                      ? 'bg-forest text-parchment'
                      : 'bg-parchment text-clay border border-stone hover:border-cat-nature/30'
                  }`}
                >
                  All children
                </button>
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className={`rounded-2xl px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedChild === child.id
                        ? 'bg-forest text-parchment'
                        : 'bg-parchment text-clay border border-stone hover:border-cat-nature/30'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Include options */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-clay mb-2">Include</p>
            <div className="space-y-2">
              {toggleOptions.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => opt.setter(!opt.value)}
                  className="flex items-center gap-3 w-full text-left py-1.5"
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    opt.value
                      ? 'bg-cat-nature border-cat-nature text-white'
                      : 'border-stone bg-parchment'
                  }`}>
                    {opt.value && <Check className="h-3 w-3" />}
                  </div>
                  <span className={`text-sm ${opt.value ? 'text-umber' : 'text-clay'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="btn-primary w-full justify-center h-11"
          >
            <Printer className="h-4 w-4" />
            Generate Printable Plan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
