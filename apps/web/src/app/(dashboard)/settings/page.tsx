export const metadata = {
  title: 'Settings — The Hedge',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Settings</h1>
        <p className="text-muted-foreground">
          Manage your family profile, children, notifications, and account.
        </p>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-stone-400">
            Settings panel coming soon
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Family profile, notification preferences, and subscription management.
          </p>
        </div>
      </div>
    </div>
  );
}
