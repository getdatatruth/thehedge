'use client';

import { LogActivityModal } from '@/components/shared/log-activity-modal';
import { CheckCircle } from 'lucide-react';

interface LogActivityButtonProps {
  activityId: string;
  activityTitle: string;
}

export function LogActivityButton({
  activityId,
  activityTitle,
}: LogActivityButtonProps) {
  return (
    <div className="sticky bottom-4 flex justify-center pb-4">
      <LogActivityModal activityId={activityId} activityTitle={activityTitle}>
        <button className="btn-primary text-base px-8 py-3 shadow-xl shadow-forest/20">
          <CheckCircle className="h-5 w-5" />
          We did this!
        </button>
      </LogActivityModal>
    </div>
  );
}
