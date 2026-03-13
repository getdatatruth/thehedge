'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Users,
  Bell,
  CreditCard,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Check,
  Crown,
  ExternalLink,
  X,
  Loader2,
  Download,
  Database,
  AlertTriangle,
} from 'lucide-react';

// --- Types ---

type Tab = 'profile' | 'children' | 'notifications' | 'subscription' | 'account' | 'data';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FamilyData {
  id: string;
  name: string;
  county: string;
  familyStyle: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

interface ChildData {
  id: string;
  name: string;
  dateOfBirth: string;
  interests: string[];
  schoolStatus: string;
  senFlags: string[];
  learningStyle: string;
  curriculumStage: string;
}

interface NotificationPrefs {
  morning_idea: boolean;
  weekend_plan: boolean;
  weekly_summary: boolean;
  community: boolean;
}

interface SettingsClientProps {
  user: UserData;
  family: FamilyData;
  children: ChildData[];
  notificationPrefs: NotificationPrefs;
}

// --- Constants ---

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'children', label: 'Children', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'data', label: 'Your Data', icon: Database },
];

const FAMILY_STYLES = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'active', label: 'Active' },
  { value: 'creative', label: 'Creative' },
  { value: 'curious', label: 'Curious' },
  { value: 'bookish', label: 'Bookish' },
];

const SCHOOL_STATUSES = [
  { value: 'mainstream', label: 'Mainstream School' },
  { value: 'homeschool', label: 'Home Education' },
  { value: 'considering', label: 'Considering Home Ed' },
];

const TIER_LABELS: Record<string, string> = {
  free: 'Free Plan',
  family: 'Family Plan',
  educator: 'Educator Plan',
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  free: 'Basic access with limited AI suggestions.',
  family: 'Full access to all activities, weekly plans, and unlimited AI suggestions.',
  educator: 'Everything in Family, plus Tusla compliance tools and portfolio management.',
};

// --- Helpers ---

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// --- Sub-components ---

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-moss' : 'bg-linen'}`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-parchment shadow-sm transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function SaveFeedback({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-clay/50" />
          <span className="text-clay/50">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-moss" />
          <span className="text-moss">Saved</span>
        </>
      )}
      {status === 'error' && <span className="text-terracotta">Failed to save. Please try again.</span>}
    </span>
  );
}

// --- Child form modal ---

function ChildForm({
  child,
  onSave,
  onCancel,
}: {
  child?: ChildData;
  onSave: (data: Omit<ChildData, 'id'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(child?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(child?.dateOfBirth || '');
  const [interests, setInterests] = useState(child?.interests.join(', ') || '');
  const [schoolStatus, setSchoolStatus] = useState(child?.schoolStatus || 'mainstream');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: child?.id,
        name,
        dateOfBirth,
        interests: interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        schoolStatus,
        senFlags: child?.senFlags || [],
        learningStyle: child?.learningStyle || '',
        curriculumStage: child?.curriculumStage || '',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-elevated p-6 sm:p-8 space-y-5 border-2 border-moss/20">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-light text-ink">
          {child ? 'Edit child' : 'Add a child'}
        </h3>
        <button type="button" onClick={onCancel} className="rounded-[4px] p-1.5 hover:bg-linen transition-colors">
          <X className="h-4 w-4 text-clay/40" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-[4px] border-stone bg-parchment/30"
              placeholder="Child's name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Date of Birth</Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="rounded-[4px] border-stone bg-parchment/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Interests</Label>
            <Input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="rounded-[4px] border-stone bg-parchment/30"
              placeholder="dinosaurs, art, football"
            />
            <p className="text-[10px] text-clay/40">Separate with commas</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">School Status</Label>
            <select
              value={schoolStatus}
              onChange={(e) => setSchoolStatus(e.target.value)}
              className="w-full h-10 rounded-[4px] border border-stone bg-parchment/30 px-3 text-sm"
            >
              {SCHOOL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {child ? 'Update child' : 'Add child'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Password change form ---

function PasswordChangeForm({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update password');
      }
      setStatus('saved');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 rounded-[4px] bg-parchment/50 border border-stone">
      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">New Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[4px] border-stone bg-parchment/30"
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Confirm Password</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-[4px] border-stone bg-parchment/30"
          placeholder="Repeat your new password"
          required
          minLength={8}
        />
      </div>
      {errorMsg && <p className="text-xs text-terracotta">{errorMsg}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary flex items-center gap-2 text-sm">
          {status === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update password
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-sm">
          Cancel
        </button>
        <SaveFeedback status={status} />
      </div>
    </form>
  );
}

// --- Main component ---

export function SettingsClient({ user, family, children: initialChildren, notificationPrefs: initialNotifs }: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTabs: Tab[] = ['profile', 'children', 'notifications', 'subscription', 'account', 'data'];
  const initialTab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : 'profile';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Profile state
  const [familyName, setFamilyName] = useState(family.name);
  const [county, setCounty] = useState(family.county);
  const [userName, setUserName] = useState(user.name);
  const [familyStyle, setFamilyStyle] = useState(family.familyStyle);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Children state
  const [children, setChildren] = useState<ChildData[]>(initialChildren);
  const [editingChild, setEditingChild] = useState<ChildData | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);

  // Notifications state
  const [morningIdea, setMorningIdea] = useState(initialNotifs.morning_idea);
  const [weekendPlan, setWeekendPlan] = useState(initialNotifs.weekend_plan);
  const [weeklySummary, setWeeklySummary] = useState(initialNotifs.weekly_summary);
  const [community, setCommunity] = useState(initialNotifs.community);
  const [notifsStatus, setNotifsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Account state
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Billing state
  const [billingLoading, setBillingLoading] = useState(false);

  // GDPR state
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [gdprError, setGdprError] = useState<string | null>(null);
  const [gdprSuccess, setGdprSuccess] = useState<string | null>(null);

  // --- Handlers ---

  const handleSaveProfile = useCallback(async () => {
    setProfileStatus('saving');
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName, county, userName, familyStyle }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setProfileStatus('saved');
      setTimeout(() => setProfileStatus('idle'), 2500);
      router.refresh();
    } catch {
      setProfileStatus('error');
      setTimeout(() => setProfileStatus('idle'), 3000);
    }
  }, [familyName, county, userName, familyStyle, router]);

  const handleSaveChild = useCallback(
    async (data: Omit<ChildData, 'id'> & { id?: string }) => {
      const isEdit = !!data.id;
      const res = await fetch('/api/settings/children', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          interests: data.interests,
          schoolStatus: data.schoolStatus,
          senFlags: data.senFlags,
          learningStyle: data.learningStyle,
          curriculumStage: data.curriculumStage,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save child');
      }

      const result = await res.json();

      if (isEdit) {
        setChildren((prev) =>
          prev.map((c) =>
            c.id === data.id
              ? {
                  id: result.child.id,
                  name: result.child.name,
                  dateOfBirth: result.child.date_of_birth,
                  interests: result.child.interests || [],
                  schoolStatus: result.child.school_status || 'mainstream',
                  senFlags: result.child.sen_flags || [],
                  learningStyle: result.child.learning_style || '',
                  curriculumStage: result.child.curriculum_stage || '',
                }
              : c
          )
        );
        setEditingChild(null);
      } else {
        setChildren((prev) => [
          ...prev,
          {
            id: result.child.id,
            name: result.child.name,
            dateOfBirth: result.child.date_of_birth,
            interests: result.child.interests || [],
            schoolStatus: result.child.school_status || 'mainstream',
            senFlags: result.child.sen_flags || [],
            learningStyle: result.child.learning_style || '',
            curriculumStage: result.child.curriculum_stage || '',
          },
        ]);
        setShowAddChild(false);
      }

      router.refresh();
    },
    [router]
  );

  const handleDeleteChild = useCallback(
    async (childId: string) => {
      setDeletingChildId(childId);
      try {
        const res = await fetch(`/api/settings/children?id=${childId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete');
        setChildren((prev) => prev.filter((c) => c.id !== childId));
        router.refresh();
      } catch {
        // Could show error toast
      } finally {
        setDeletingChildId(null);
      }
    },
    [router]
  );

  const handleSaveNotifications = useCallback(async () => {
    setNotifsStatus('saving');
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          morningIdea: morningIdea,
          weekendPlan: weekendPlan,
          weeklySummary: weeklySummary,
          community: community,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setNotifsStatus('saved');
      setTimeout(() => setNotifsStatus('idle'), 2500);
    } catch {
      setNotifsStatus('error');
      setTimeout(() => setNotifsStatus('idle'), 3000);
    }
  }, [morningIdea, weekendPlan, weeklySummary, community]);

  // --- Billing handler ---

  const [billingError, setBillingError] = useState<string | null>(null);

  const handleManageBilling = useCallback(async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error?.message || json.error || 'Failed to open billing portal';
        throw new Error(msg);
      }
      const portalUrl = json.data?.url || json.url;
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Something went wrong');
      setBillingLoading(false);
    }
  }, []);

  // --- GDPR handlers ---

  const handleExportData = useCallback(async () => {
    setExportLoading(true);
    setGdprError(null);
    try {
      const res = await fetch('/api/gdpr/export');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to export data');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `the-hedge-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setGdprSuccess('Your data has been downloaded.');
      setTimeout(() => setGdprSuccess(null), 4000);
    } catch (err) {
      setGdprError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;
    setDeleteLoading(true);
    setGdprError(null);
    try {
      const res = await fetch('/api/gdpr/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: deleteConfirmText }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      // Redirect to homepage after deletion
      window.location.href = '/?deleted=true';
    } catch (err) {
      setGdprError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  }, [deleteConfirmText]);

  // --- Render ---

  return (
    <div className="space-y-10 animate-fade-up">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-3">Account</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          <em className="text-moss italic">Settings</em>
        </h1>
        <p className="text-clay mt-2 font-serif text-lg">
          Manage your family profile and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Tab sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 rounded-[4px] px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'bg-forest text-parchment shadow-sm'
                    : 'text-clay/60 hover:bg-linen hover:text-umber'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* --- Profile Tab --- */}
          {activeTab === 'profile' && (
            <div className="card-elevated p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-xl font-light text-ink">Family Profile</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Family Name</Label>
                  <Input
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="rounded-[4px] border-stone bg-parchment/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">County</Label>
                  <Input
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="rounded-[4px] border-stone bg-parchment/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Your Name</Label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="rounded-[4px] border-stone bg-parchment/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Family Style</Label>
                  <select
                    value={familyStyle}
                    onChange={(e) => setFamilyStyle(e.target.value)}
                    className="w-full h-10 rounded-[4px] border border-stone bg-parchment/30 px-3 text-sm"
                  >
                    {FAMILY_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3">
                <button onClick={handleSaveProfile} disabled={profileStatus === 'saving'} className="btn-primary flex items-center gap-2">
                  {profileStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save changes
                </button>
                <SaveFeedback status={profileStatus} />
              </div>
            </div>
          )}

          {/* --- Children Tab --- */}
          {activeTab === 'children' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-light text-ink">Children</h2>
                {!showAddChild && (
                  <button
                    onClick={() => {
                      setEditingChild(null);
                      setShowAddChild(true);
                    }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add child
                  </button>
                )}
              </div>

              {showAddChild && (
                <ChildForm
                  onSave={handleSaveChild}
                  onCancel={() => setShowAddChild(false)}
                />
              )}

              {children.length === 0 && !showAddChild && (
                <div className="card-elevated p-8 text-center">
                  <p className="text-clay/50 font-serif">No children added yet.</p>
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add your first child
                  </button>
                </div>
              )}

              {children.map((child) =>
                editingChild?.id === child.id ? (
                  <ChildForm
                    key={child.id}
                    child={child}
                    onSave={handleSaveChild}
                    onCancel={() => setEditingChild(null)}
                  />
                ) : (
                  <div key={child.id} className="card-elevated p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-sage/15">
                        <span className="text-lg font-bold font-display text-forest">
                          {child.name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-medium text-ink">{child.name}</h3>
                          {child.dateOfBirth && (
                            <span className="tag tag-sage text-[11px]">
                              Age {calculateAge(child.dateOfBirth)}
                            </span>
                          )}
                        </div>
                        {child.interests.length > 0 && (
                          <p className="text-xs text-clay/60 mt-1 font-serif">
                            Interests: {child.interests.join(', ')}
                          </p>
                        )}
                        <p className="text-xs text-clay/50">
                          {SCHOOL_STATUSES.find((s) => s.value === child.schoolStatus)?.label || child.schoolStatus}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowAddChild(false);
                            setEditingChild(child);
                          }}
                          className="rounded-[4px] p-2 hover:bg-linen transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-clay/40" />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          disabled={deletingChildId === child.id}
                          className="rounded-[4px] p-2 hover:bg-terracotta/5 transition-colors"
                        >
                          {deletingChildId === child.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-clay/40" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-clay/40 hover:text-terracotta" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* --- Notifications Tab --- */}
          {activeTab === 'notifications' && (
            <div className="card-elevated p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-xl font-light text-ink">Notification Preferences</h2>
              <div className="space-y-5">
                {[
                  {
                    label: 'Morning activity idea',
                    description: 'A curated activity idea delivered each morning',
                    checked: morningIdea,
                    onChange: setMorningIdea,
                  },
                  {
                    label: 'Weekend plan',
                    description: 'Get a weekend plan suggestion every Friday',
                    checked: weekendPlan,
                    onChange: setWeekendPlan,
                  },
                  {
                    label: 'Weekly summary',
                    description: 'Summary of your week every Sunday evening',
                    checked: weeklySummary,
                    onChange: setWeeklySummary,
                  },
                  {
                    label: 'Community updates',
                    description: 'Posts and events from your county group',
                    checked: community,
                    onChange: setCommunity,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-stone last:border-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="text-xs text-clay/50 mt-0.5 font-serif">{item.description}</p>
                    </div>
                    <Toggle checked={item.checked} onChange={item.onChange} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-3">
                <button onClick={handleSaveNotifications} disabled={notifsStatus === 'saving'} className="btn-primary flex items-center gap-2">
                  {notifsStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save preferences
                </button>
                <SaveFeedback status={notifsStatus} />
              </div>
            </div>
          )}

          {/* --- Subscription Tab --- */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="card-elevated p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-amber/10">
                    <Crown className="h-6 w-6 text-amber" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl font-light text-ink">
                        {TIER_LABELS[family.subscriptionTier] || 'Free Plan'}
                      </h2>
                      <span
                        className={`tag font-bold ${
                          family.subscriptionStatus === 'active' ? 'tag-sage' : 'tag-terracotta'
                        }`}
                      >
                        {family.subscriptionStatus === 'active'
                          ? 'Active'
                          : family.subscriptionStatus === 'trialing'
                          ? 'Trial'
                          : family.subscriptionStatus === 'canceled'
                          ? 'Cancelled'
                          : family.subscriptionStatus}
                      </span>
                    </div>
                    <p className="text-sm text-clay/60 mt-1.5 font-serif">
                      {TIER_DESCRIPTIONS[family.subscriptionTier] || TIER_DESCRIPTIONS.free}
                    </p>
                  </div>
                </div>
              </div>

              {family.subscriptionTier === 'free' && (
                <div className="card-elevated p-6 sm:p-8 border-l-4 border-l-moss/30">
                  <h3 className="font-display font-medium text-ink mb-2">Upgrade to Family Plan</h3>
                  <p className="text-sm text-clay/60 font-serif mb-4">
                    Get unlimited AI suggestions, weekly plans, and full access to all activities.
                  </p>
                  <a href="/settings/billing" className="btn-primary text-sm inline-block">
                    View plans & upgrade
                  </a>
                </div>
              )}

              {billingError && (
                <div className="card-elevated p-4 border-l-4 border-l-terracotta/30 mb-4">
                  <p className="text-sm text-terracotta">{billingError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <a href="/settings/billing" className="btn-secondary flex items-center gap-2 text-sm">
                  <CreditCard className="h-3.5 w-3.5" />
                  View billing details
                </a>
                {family.subscriptionTier !== 'free' && (
                  <button
                    onClick={handleManageBilling}
                    disabled={billingLoading}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    {billingLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    Manage billing
                  </button>
                )}
              </div>
            </div>
          )}

          {/* --- Account Tab --- */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="card-elevated p-6 sm:p-8 space-y-5">
                <h2 className="font-display text-xl font-light text-ink">Account</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-stone">
                    <div>
                      <p className="text-sm font-medium text-ink">Email</p>
                      <p className="text-xs text-clay/50 font-serif">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-3 border-b border-stone">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Password</p>
                        <p className="text-xs text-clay/50 font-serif">Change your account password</p>
                      </div>
                      {!showPasswordForm && (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="text-xs font-medium text-moss hover:text-forest transition-colors"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {showPasswordForm && (
                      <PasswordChangeForm onClose={() => setShowPasswordForm(false)} />
                    )}
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">Two-factor authentication</p>
                      <p className="text-xs text-clay/50 font-serif">Not enabled</p>
                    </div>
                    <button className="text-xs font-medium text-moss hover:text-forest transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6 sm:p-8 border-l-4 border-l-terracotta/20">
                <h3 className="font-display font-medium text-terracotta mb-2">Danger zone</h3>
                <p className="text-sm text-clay/60 mb-4 font-serif">
                  To delete your account and all data, go to the Your Data tab.
                </p>
                <button
                  onClick={() => setActiveTab('data')}
                  className="rounded-[4px] border border-terracotta/20 px-4 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/5 transition-colors"
                >
                  Go to Your Data
                </button>
              </div>
            </div>
          )}

          {/* --- Your Data (GDPR) Tab --- */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {gdprError && (
                <div className="card-elevated p-4 border-l-4 border-l-terracotta/30">
                  <p className="text-sm text-terracotta">{gdprError}</p>
                </div>
              )}
              {gdprSuccess && (
                <div className="card-elevated p-4 border-l-4 border-l-moss">
                  <p className="text-sm text-forest">{gdprSuccess}</p>
                </div>
              )}

              {/* Export Data */}
              <div className="card-elevated p-6 sm:p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sage/15">
                    <Download className="h-5 w-5 text-forest" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-light text-ink">Export your data</h2>
                    <p className="text-sm text-clay/60 mt-1.5 font-serif">
                      Download a copy of all your data, including your profile, family details,
                      children, activity logs, education plans, and portfolio entries.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  {exportLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {exportLoading ? 'Preparing download...' : 'Download my data'}
                </button>
              </div>

              {/* Data Retention Policy */}
              <div className="card-elevated p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-xl font-light text-ink">Data retention policy</h2>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Account data',
                      detail: 'Stored as long as your account is active. Deleted within 30 days of account deletion.',
                    },
                    {
                      label: 'Activity logs',
                      detail: 'Retained for the lifetime of your account. You can delete individual entries at any time.',
                    },
                    {
                      label: 'Payment data',
                      detail: 'Payment details are stored securely by Stripe. We only store your Stripe customer ID.',
                    },
                    {
                      label: 'Analytics',
                      detail: 'We collect anonymous usage analytics to improve the platform. No personal data is shared with third parties.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="py-3 border-b border-stone last:border-0">
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="text-xs text-clay/50 mt-0.5 font-serif">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Account */}
              <div className="card-elevated p-6 sm:p-8 border-l-4 border-l-terracotta/20 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-terracotta/10">
                    <AlertTriangle className="h-5 w-5 text-terracotta" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-light text-terracotta">Delete my account</h2>
                    <p className="text-sm text-clay/60 mt-1.5 font-serif">
                      This will permanently delete your account and all associated data, including
                      your family profile, children, activity logs, education plans, and portfolio entries.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-[4px] border border-terracotta/20 px-4 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/5 transition-colors"
                  >
                    I want to delete my account
                  </button>
                ) : (
                  <div className="space-y-4 p-4 rounded-[4px] bg-terracotta/5 border border-terracotta/20">
                    <p className="text-sm font-medium text-ink">
                      Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="rounded-[4px] border-terracotta/30 bg-parchment"
                      placeholder="DELETE MY ACCOUNT"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || deleteLoading}
                        className={`rounded-[4px] px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                          deleteConfirmText === 'DELETE MY ACCOUNT'
                            ? 'bg-terracotta text-parchment hover:bg-terracotta/90'
                            : 'bg-terracotta/20 text-terracotta/50 cursor-not-allowed'
                        }`}
                      >
                        {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {deleteLoading ? 'Deleting...' : 'Permanently delete my account'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
