export const metadata = {
  title: 'Timeline — The Hedge',
};

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Family timeline</h1>
        <p className="text-muted-foreground">
          Your family&apos;s activity history and memories will appear here once
          you start logging activities.
        </p>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-stone-400">
            No activities logged yet
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Complete an activity from Today to see it here.
          </p>
        </div>
      </div>
    </div>
  );
}
