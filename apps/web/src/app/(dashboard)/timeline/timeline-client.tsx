'use client';

import { LogActivityModal } from '@/components/shared/log-activity-modal';
import { Plus } from 'lucide-react';

export function TimelineClient() {
  return (
    <LogActivityModal activityTitle="an activity">
      <button className="btn-secondary flex items-center gap-2 text-sm mt-2">
        <Plus className="h-4 w-4" />
        Log activity
      </button>
    </LogActivityModal>
  );
}
