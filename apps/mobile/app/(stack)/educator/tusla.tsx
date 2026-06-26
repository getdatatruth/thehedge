import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Info,
  Check,
  Circle,
  ChevronRight,
  CalendarClock,
  FolderOpen,
  ClipboardCheck,
} from 'lucide-react-native';
// Note: in Ireland you register WITH Tusla, VIA AEARS (the Alternative Education
// Assessment and Registration Service, a service within Tusla). There is no
// required curriculum, no minimum number of hours and no attendance requirement.
// This screen helps a family organise evidence and track their registration.
// It is not an official Tusla product and not legal advice.
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TierGate } from '@/components/shared/TierGate';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';
import { lightTheme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import {
  RegistrationStatus,
  REGISTRATION_STEPS,
  statusIndex,
  statusMeta,
  nextStatus,
  ChecklistItem,
  DEFAULT_DOCUMENT_CHECKLIST,
  DEFAULT_ASSESSMENT_CHECKLIST,
  mergeChecklist,
  serialiseChecklist,
  readiness,
  buildMilestones,
  daysAwayLabel,
} from '@/lib/aears';

// ── API ────────────────────────────────────────────────────────────────
// The web route GET/POST /api/educator/tusla returns { data } (no `success`
// envelope), so the shared api() helper does not fit. We call the root API
// directly here with the supabase access token, matching the apiRoot* pattern.

const PROD_API_ORIGIN = 'https://app.thehedge.ie';
const API_ROOT = (__DEV__
  ? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
  : PROD_API_ORIGIN) + '/api';

interface TuslaRegistration {
  id: string;
  child_id: string;
  status: RegistrationStatus;
  notification_form: Record<string, unknown>;
  documents: { key: string; done: boolean }[];
  deadlines: unknown[];
  assessment_checklist: { key: string; done: boolean }[];
  notes: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function fetchRegistrations(): Promise<TuslaRegistration[]> {
  const res = await fetch(`${API_ROOT}/educator/tusla`, {
    headers: await authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'Could not load registrations');
  return (json?.data ?? []) as TuslaRegistration[];
}

async function saveRegistration(
  body: Partial<TuslaRegistration> & { child_id: string }
): Promise<TuslaRegistration> {
  const res = await fetch(`${API_ROOT}/educator/tusla`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'Could not save');
  return json.data as TuslaRegistration;
}

// ── Registration status tracker ─────────────────────────────────────────

function StatusTracker({
  status,
  onAdvance,
  saving,
}: {
  status: RegistrationStatus;
  onAdvance: () => void;
  saving: boolean;
}) {
  const current = statusIndex(status);
  const next = nextStatus(status);
  const meta = statusMeta(status);

  return (
    <Card variant="elevated" padding="lg">
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Where you are</Text>
        <Badge variant={status === 'approved' ? 'moss' : 'accent'} size="sm">
          {meta.label}
        </Badge>
      </View>

      <View style={styles.stepper}>
        {REGISTRATION_STEPS.map((step, i) => {
          const reached = i <= current;
          return (
            <View key={step.status} style={styles.stepItem}>
              <View style={styles.stepLine}>
                <View
                  style={[
                    styles.stepDot,
                    reached && styles.stepDotActive,
                  ]}
                >
                  {reached ? (
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  ) : null}
                </View>
                {i < REGISTRATION_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      i < current && styles.stepConnectorActive,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  reached && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.stepBlurb}>{meta.blurb}</Text>

      {next && (
        <TouchableOpacity
          style={styles.advanceBtn}
          onPress={onAdvance}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.advanceBtnText}>
                {next === 'in_progress'
                  ? 'Begin getting ready'
                  : next === 'submitted'
                  ? 'Mark application as sent'
                  : 'Mark as on the register'}
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      )}
    </Card>
  );
}

// ── Checklist ───────────────────────────────────────────────────────────

function ChecklistCard({
  title,
  framing,
  icon,
  items,
  onToggle,
}: {
  title: string;
  framing: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  onToggle: (key: string) => void;
}) {
  const r = readiness(items);

  return (
    <Card variant="elevated" padding="lg">
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleWithIcon}>
          <View style={styles.titleIconWrap}>{icon}</View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.readinessCount}>
          {r.done}/{r.total}
        </Text>
      </View>

      <Text style={styles.framing}>{framing}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(r.fraction * 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.readinessPhrase}>{r.phrase}</Text>

      <View style={styles.checklist}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.checkItem}
            onPress={() => onToggle(item.key)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkBox, item.done && styles.checkBoxActive]}
            >
              {item.done ? (
                <Check size={13} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Circle size={4} color={`${lightTheme.textSecondary}60`} />
              )}
            </View>
            <View style={styles.checkContent}>
              <Text
                style={[
                  styles.checkLabel,
                  item.done && styles.checkLabelDone,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.checkHint}>{item.hint}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

// ── Deadlines ───────────────────────────────────────────────────────────

function DeadlinesCard({ status }: { status: RegistrationStatus }) {
  const milestones = useMemo(() => buildMilestones(status), [status]);

  return (
    <Card variant="elevated" padding="lg">
      <View style={styles.cardTitleWithIcon}>
        <View style={styles.titleIconWrap}>
          <CalendarClock size={15} color={lightTheme.primary} />
        </View>
        <Text style={styles.cardTitle}>On the horizon</Text>
      </View>

      <Text style={styles.framing}>
        A gentle rhythm to keep in mind. These are a guide, not fixed legal
        dates. There is no single deadline to register.
      </Text>

      <View style={styles.timeline}>
        {milestones.map((m) => (
          <View key={m.key} style={styles.milestone}>
            <View style={styles.milestoneDate}>
              <Text style={styles.milestoneDays}>
                {daysAwayLabel(m.daysAway)}
              </Text>
              <Text style={styles.milestoneDateText}>
                {m.date.toLocaleDateString('en-IE', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
            <View style={styles.milestoneBody}>
              <Text style={styles.milestoneTitle}>{m.title}</Text>
              <Text style={styles.milestoneDetail}>{m.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

// ── Per-child section ───────────────────────────────────────────────────

function ChildTusla({
  childId,
  childName,
  registration,
  onSave,
}: {
  childId: string;
  childName: string;
  registration?: TuslaRegistration;
  onSave: (
    body: Partial<TuslaRegistration> & { child_id: string }
  ) => Promise<void>;
}) {
  const status: RegistrationStatus = registration?.status ?? 'not_started';

  const documents = useMemo(
    () =>
      mergeChecklist(DEFAULT_DOCUMENT_CHECKLIST, registration?.documents),
    [registration?.documents]
  );
  const assessment = useMemo(
    () =>
      mergeChecklist(
        DEFAULT_ASSESSMENT_CHECKLIST,
        registration?.assessment_checklist
      ),
    [registration?.assessment_checklist]
  );

  const [savingStatus, setSavingStatus] = useState(false);

  const advance = useCallback(async () => {
    const next = nextStatus(status);
    if (!next) return;
    setSavingStatus(true);
    try {
      await onSave({ child_id: childId, status: next });
    } finally {
      setSavingStatus(false);
    }
  }, [status, childId, onSave]);

  const toggleDocument = useCallback(
    (key: string) => {
      const updated = documents.map((d) =>
        d.key === key ? { ...d, done: !d.done } : d
      );
      onSave({ child_id: childId, documents: serialiseChecklist(updated) });
    },
    [documents, childId, onSave]
  );

  const toggleAssessment = useCallback(
    (key: string) => {
      const updated = assessment.map((a) =>
        a.key === key ? { ...a, done: !a.done } : a
      );
      onSave({
        child_id: childId,
        assessment_checklist: serialiseChecklist(updated),
      });
    },
    [assessment, childId, onSave]
  );

  return (
    <View style={styles.childSection}>
      <Text style={styles.childName}>{childName}</Text>

      <StatusTracker
        status={status}
        onAdvance={advance}
        saving={savingStatus}
      />

      <DeadlinesCard status={status} />

      <ChecklistCard
        title="Evidence to gather"
        framing="A handful of things that, together, paint a picture of your child’s learning. Tick them off as you go."
        icon={<FolderOpen size={15} color={lightTheme.primary} />}
        items={documents}
        onToggle={toggleDocument}
      />

      <ChecklistCard
        title="What an assessor tends to look at"
        framing="Assessment has two stages: a preliminary questionnaire and a meeting with you, then, if needed, a comprehensive home visit by an assessor (an authorised person appointed by Tusla). They look at whether a certain minimum education is being provided. There is no required curriculum, no minimum number of hours and no attendance requirement."
        icon={<ClipboardCheck size={15} color={lightTheme.primary} />}
        items={assessment}
        onToggle={toggleAssessment}
      />
    </View>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────

export default function TuslaScreen() {
  const router = useRouter();
  const children = useAuthStore((s) => s.children);

  const [registrations, setRegistrations] = useState<TuslaRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchRegistrations();
      setRegistrations(data);
    } catch {
      // Stay calm on failure: keep whatever we have, show empty otherwise.
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Optimistic save: update local state immediately, persist, then reconcile.
  const handleSave = useCallback(
    async (body: Partial<TuslaRegistration> & { child_id: string }) => {
      setRegistrations((prev) => {
        const existing = prev.find((r) => r.child_id === body.child_id);
        if (existing) {
          return prev.map((r) =>
            r.child_id === body.child_id ? { ...r, ...body } : r
          );
        }
        return [
          ...prev,
          {
            id: `temp-${body.child_id}`,
            status: 'not_started',
            notification_form: {},
            documents: [],
            deadlines: [],
            assessment_checklist: [],
            notes: null,
            ...body,
          } as TuslaRegistration,
        ];
      });

      try {
        const saved = await saveRegistration(body);
        setRegistrations((prev) =>
          prev.map((r) => (r.child_id === saved.child_id ? saved : r))
        );
      } catch {
        // Reload to discard the optimistic change if the save did not land.
        load();
      }
    },
    [load]
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tusla and AEARS</Text>
      </View>

      <TierGate requiredTier="educator" featureName="Educator Dashboard">
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={lightTheme.primary}
            />
          }
        >
          <Text style={styles.intro}>
            A calm place to keep your home-education registration in order, and
            to gather the kind of evidence an AEARS assessment looks at. Take it
            a step at a time.
          </Text>

          {children.map((child) => (
            <ChildTusla
              key={child.id}
              childId={child.id}
              childName={child.name}
              registration={registrations.find(
                (r) => r.child_id === child.id
              )}
              onSave={handleSave}
            />
          ))}

          {children.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No children added yet</Text>
              <Text style={styles.emptyBody}>
                Add a child to your family to start keeping their
                home-education record together.
              </Text>
            </View>
          )}

          {/* Honest disclaimer */}
          <Card variant="elevated" padding="lg">
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Info size={18} color={lightTheme.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>A few honest words</Text>
                <Text style={styles.infoBody}>
                  This is not an official Tusla product and not legal advice. It
                  simply helps you organise the evidence an assessment tends to
                  look at, and keep gentle track of your registration.
                  {'\n\n'}
                  Under Article 42 of the Constitution and Section 14 of the
                  Education (Welfare) Act 2000, parents educating outside a
                  recognised school apply to Tusla, via AEARS, to be entered on
                  the Section 14 Register. You apply using Tusla’s official
                  application form (currently the R1) with a certified copy of
                  your child’s birth certificate or passport. The assessment
                  looks at whether a certain minimum education suited to your
                  child’s age, ability and aptitude is being provided. You do not
                  have to follow the national curriculum, and there is no minimum
                  number of hours or attendance requirement. Registration is
                  subject to periodic review. For anything official, use Tusla’s
                  forms and check directly with Tusla.
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </TierGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '300', color: lightTheme.text },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  intro: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    lineHeight: 21,
  },

  // Child section
  childSection: {
    gap: spacing.md,
  },
  childName: {
    fontSize: 18,
    fontWeight: '500',
    color: lightTheme.text,
    marginBottom: spacing.xs,
  },

  // Card shared
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: `${lightTheme.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: lightTheme.text,
  },
  framing: {
    fontSize: 13,
    color: lightTheme.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stepLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: lightTheme.background,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: lightTheme.accent,
    borderColor: lightTheme.accent,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: lightTheme.border,
  },
  stepConnectorActive: {
    backgroundColor: lightTheme.accent,
  },
  stepLabel: {
    fontSize: 10,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  stepLabelActive: {
    color: lightTheme.text,
    fontWeight: '500',
  },
  stepBlurb: {
    fontSize: 13,
    color: lightTheme.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: lightTheme.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  advanceBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Checklist
  readinessCount: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.accent,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: `${lightTheme.primary}10`,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: lightTheme.accent,
  },
  readinessPhrase: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    marginBottom: spacing.md,
  },
  checklist: {
    gap: spacing.xs,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: lightTheme.background,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkBoxActive: {
    backgroundColor: lightTheme.accent,
    borderColor: lightTheme.accent,
  },
  checkContent: {
    flex: 1,
    gap: 2,
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: lightTheme.text,
  },
  checkLabelDone: {
    color: lightTheme.textSecondary,
  },
  checkHint: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    lineHeight: 17,
  },

  // Timeline
  timeline: {
    gap: spacing.lg,
  },
  milestone: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  milestoneDate: {
    width: 72,
  },
  milestoneDays: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.text,
  },
  milestoneDateText: {
    fontSize: 11,
    color: lightTheme.textSecondary,
    marginTop: 1,
  },
  milestoneBody: {
    flex: 1,
    gap: 2,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: lightTheme.text,
  },
  milestoneDetail: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    lineHeight: 17,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: lightTheme.text,
  },
  emptyBody: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  // Info
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${lightTheme.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTheme.text,
  },
  infoBody: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
});
