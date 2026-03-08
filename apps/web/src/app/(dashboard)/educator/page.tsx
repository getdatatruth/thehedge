export const metadata = {
  title: 'Educator — The Hedge',
};

export default function EducatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Educator Suite</h1>
        <p className="text-muted-foreground">
          Curriculum planning, daily plans, and Tusla compliance — the complete
          homeschool operating system.
        </p>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-stone-400">
            Educator features require the Educator plan
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Curriculum engine, daily planning, and Tusla AEARS compliance tools.
          </p>
        </div>
      </div>
    </div>
  );
}
