import { TreePine } from 'lucide-react';

// A calm, full-screen shell for the first moment with The Hedge - no dashboard
// chrome, nothing to navigate, just the conversation.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-parchment">
      <header className="flex items-center justify-center gap-2.5 pt-8 pb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/15">
          <TreePine className="h-5 w-5 text-moss" />
        </div>
        <span className="font-display text-xl font-semibold text-forest">The Hedge</span>
      </header>
      <main className="px-5">{children}</main>
    </div>
  );
}
