'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Shield,
  Calendar,
  Clock,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  XCircle,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  BookOpen,
  Users,
  MapPin,
  Info,
  CircleDot,
  Circle,
  CheckCircle2,
  Save,
  Loader2,
  Plus,
  Trash2,
  CalendarDays,
  Bell,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface EducationPlan {
  id: string;
  child_id: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
  curriculum_areas: Record<string, { priority: string; notes?: string }> | null;
  tusla_status: string;
}

interface DailyPlanSummary {
  id: string;
  child_id: string;
  date: string;
  attendance_logged: boolean;
  status: string;
}

interface ActivityLog {
  id: string;
  date: string;
  duration_minutes: number | null;
  curriculum_areas_covered: string[] | null;
  child_ids: string[];
}

interface TuslaDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedDate?: string;
  category: 'registration' | 'assessment' | 'ongoing';
}

interface TuslaDeadline {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
  type: 'registration' | 'assessment' | 'review';
}

interface NotificationForm {
  parentName: string;
  parentAddress: string;
  parentPhone: string;
  parentEmail: string;
  childName: string;
  childDob: string;
  childPps: string;
  educationStartDate: string;
  previousSchool: string;
  educationApproach: string;
  hoursPerDay: string;
  daysPerWeek: string;
  curriculumDescription: string;
  specialNeeds: string;
  assessmentMethod: string;
  additionalInfo: string;
}

interface TuslaRegistration {
  id: string;
  family_id: string;
  child_id: string;
  status: RegistrationStatus;
  notification_form: NotificationForm;
  documents: TuslaDocument[];
  deadlines: TuslaDeadline[];
  assessment_checklist: AssessmentItem[];
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
}

interface AssessmentItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'preparation' | 'documentation' | 'portfolio' | 'review';
}

type RegistrationStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved';

interface Props {
  children: Child[];
  plans: EducationPlan[];
  dailyPlans: DailyPlanSummary[];
  activityLogs: ActivityLog[];
  registrations: TuslaRegistration[];
}

// ─── Constants ───────────────────────────────────────────

const STATUS_CONFIG: Record<RegistrationStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  not_started: { label: 'Not Started', color: 'text-clay', bgColor: 'bg-stone/20', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber', bgColor: 'bg-amber/10', icon: CircleDot },
  submitted: { label: 'Submitted', color: 'text-moss', bgColor: 'bg-moss/10', icon: Clock },
  approved: { label: 'Approved', color: 'text-forest', bgColor: 'bg-sage/20', icon: CheckCircle2 },
};

const STATUS_STEPS: { key: RegistrationStatus; label: string }[] = [
  { key: 'not_started', label: 'Not Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
];

const DEFAULT_DOCUMENTS: TuslaDocument[] = [
  {
    id: 'notification-of-intent',
    name: 'Notification of Intent to Educate at Home',
    description: 'Section 14 notification form sent to Tusla Education and Welfare Service informing them of your decision to home educate.',
    required: true,
    completed: false,
    category: 'registration',
  },
  {
    id: 'preliminary-assessment-form',
    name: 'Preliminary Assessment Statement',
    description: 'Initial outline of your educational provision including approach, curriculum areas, and daily schedule.',
    required: true,
    completed: false,
    category: 'registration',
  },
  {
    id: 'education-plan',
    name: 'Education Plan / Philosophy Statement',
    description: 'Detailed description of your educational philosophy, methodology, and how you plan to cover all curriculum areas.',
    required: true,
    completed: false,
    category: 'registration',
  },
  {
    id: 'sample-timetable',
    name: 'Sample Weekly Timetable',
    description: 'A typical week showing how education time is structured across subjects and activities.',
    required: true,
    completed: false,
    category: 'registration',
  },
  {
    id: 'child-birth-cert',
    name: 'Child\'s Birth Certificate (copy)',
    description: 'Copy of the child\'s birth certificate for identification purposes.',
    required: true,
    completed: false,
    category: 'registration',
  },
  {
    id: 'annual-assessment-report',
    name: 'Annual Assessment Report',
    description: 'Yearly report documenting educational progress, portfolio evidence, and curriculum coverage for Tusla review.',
    required: true,
    completed: false,
    category: 'assessment',
  },
  {
    id: 'portfolio-evidence',
    name: 'Portfolio of Child\'s Work',
    description: 'Collection of work samples, projects, photographs, and evidence of learning across all curriculum areas.',
    required: true,
    completed: false,
    category: 'assessment',
  },
  {
    id: 'attendance-record',
    name: 'Attendance Records',
    description: 'Daily attendance log showing education days, including any absences and reasons.',
    required: true,
    completed: false,
    category: 'ongoing',
  },
  {
    id: 'curriculum-records',
    name: 'Curriculum Coverage Records',
    description: 'Ongoing records showing coverage across all required curriculum areas: Language, Maths, SESE, SPHE, Arts, PE.',
    required: true,
    completed: false,
    category: 'ongoing',
  },
  {
    id: 'socialisation-records',
    name: 'Socialisation Records',
    description: 'Evidence of social activities, group interactions, extracurricular activities, and community involvement.',
    required: false,
    completed: false,
    category: 'ongoing',
  },
];

const DEFAULT_ASSESSMENT_CHECKLIST: AssessmentItem[] = [
  { id: 'ac-1', text: 'Review and update education plan for current year', completed: false, category: 'preparation' },
  { id: 'ac-2', text: 'Ensure attendance records are complete and up to date', completed: false, category: 'preparation' },
  { id: 'ac-3', text: 'Review curriculum coverage across all areas', completed: false, category: 'preparation' },
  { id: 'ac-4', text: 'Identify any curriculum gaps and plan to address them', completed: false, category: 'preparation' },
  { id: 'ac-5', text: 'Compile portfolio samples for each curriculum area', completed: false, category: 'portfolio' },
  { id: 'ac-6', text: 'Include dated work samples showing progression', completed: false, category: 'portfolio' },
  { id: 'ac-7', text: 'Add photographs of projects, field trips, and practical work', completed: false, category: 'portfolio' },
  { id: 'ac-8', text: 'Include any certificates, awards, or external assessments', completed: false, category: 'portfolio' },
  { id: 'ac-9', text: 'Write narrative summary of child\'s progress', completed: false, category: 'documentation' },
  { id: 'ac-10', text: 'Document any standardised test results (if applicable)', completed: false, category: 'documentation' },
  { id: 'ac-11', text: 'Prepare list of resources and materials used', completed: false, category: 'documentation' },
  { id: 'ac-12', text: 'Document socialisation activities and group involvement', completed: false, category: 'documentation' },
  { id: 'ac-13', text: 'Prepare child for potential interview/conversation with assessor', completed: false, category: 'review' },
  { id: 'ac-14', text: 'Prepare the home education space for visit (if applicable)', completed: false, category: 'review' },
  { id: 'ac-15', text: 'Review previous assessment feedback and address any concerns', completed: false, category: 'review' },
  { id: 'ac-16', text: 'Have education plan and goals ready for discussion', completed: false, category: 'review' },
];

const DEFAULT_DEADLINES: TuslaDeadline[] = [
  {
    id: 'dl-1',
    title: 'Submit Notification of Intent',
    date: '',
    description: 'Notify Tusla of your intention to home educate under Section 14 of the Education (Welfare) Act 2000.',
    completed: false,
    type: 'registration',
  },
  {
    id: 'dl-2',
    title: 'Preliminary Assessment Visit',
    date: '',
    description: 'First assessment visit from Tusla Education Welfare Officer to review your educational provision.',
    completed: false,
    type: 'assessment',
  },
  {
    id: 'dl-3',
    title: 'Annual Assessment Due',
    date: '',
    description: 'Annual review of home education provision. Prepare portfolio, attendance records, and progress report.',
    completed: false,
    type: 'review',
  },
];

const TUSLA_RESOURCES = [
  {
    title: 'Tusla Education Support Service (TESS)',
    url: 'https://www.tusla.ie/tess/',
    description: 'Official Tusla education support and welfare service for home-educating families.',
  },
  {
    title: 'Guidelines on Assessment of Education in Places Other Than Recognised Schools',
    url: 'https://www.tusla.ie/tess/information-for-parents-on-home-education/',
    description: 'Tusla guidelines explaining the assessment process and what is expected.',
  },
  {
    title: 'Education (Welfare) Act 2000',
    url: 'https://www.irishstatutebook.ie/eli/2000/act/22/enacted/en/html',
    description: 'The legislation governing home education in Ireland, including Section 14 registration requirements.',
  },
  {
    title: 'NCCA Primary Curriculum',
    url: 'https://www.curriculumonline.ie/',
    description: 'National Council for Curriculum and Assessment - primary curriculum framework and subject guidelines.',
  },
  {
    title: 'Home Education Network (HEN)',
    url: 'https://www.henireland.org/',
    description: 'Support network for home-educating families in Ireland with resources and community.',
  },
  {
    title: 'HSLDA Ireland Guide',
    url: 'https://hslda.org/post/ireland',
    description: 'Home School Legal Defense Association overview of Irish home education law.',
  },
];

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const EMPTY_FORM: NotificationForm = {
  parentName: '',
  parentAddress: '',
  parentPhone: '',
  parentEmail: '',
  childName: '',
  childDob: '',
  childPps: '',
  educationStartDate: '',
  previousSchool: '',
  educationApproach: '',
  hoursPerDay: '4',
  daysPerWeek: '5',
  curriculumDescription: '',
  specialNeeds: '',
  assessmentMethod: '',
  additionalInfo: '',
};

// ─── Component ───────────────────────────────────────────

export function TuslaClient({ children: childrenProp, plans, dailyPlans, activityLogs, registrations: initialRegistrations }: Props) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenProp[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'registration' | 'documents' | 'notification' | 'assessment' | 'deadlines' | 'resources'>('overview');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Local state for registration data
  const existingReg = initialRegistrations.find((r) => r.child_id === selectedChildId);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    (existingReg?.status as RegistrationStatus) || 'not_started'
  );
  const [documents, setDocuments] = useState<TuslaDocument[]>(
    existingReg?.documents?.length ? existingReg.documents : DEFAULT_DOCUMENTS
  );
  const [notificationForm, setNotificationForm] = useState<NotificationForm>(
    existingReg?.notification_form && Object.keys(existingReg.notification_form).length > 0
      ? existingReg.notification_form
      : EMPTY_FORM
  );
  const [assessmentChecklist, setAssessmentChecklist] = useState<AssessmentItem[]>(
    existingReg?.assessment_checklist?.length ? existingReg.assessment_checklist : DEFAULT_ASSESSMENT_CHECKLIST
  );
  const [deadlines, setDeadlines] = useState<TuslaDeadline[]>(
    existingReg?.deadlines?.length ? existingReg.deadlines : DEFAULT_DEADLINES
  );
  const [notes, setNotes] = useState(existingReg?.notes || '');

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    registration: true,
    assessment: true,
    ongoing: true,
    preparation: true,
    documentation: true,
    portfolio: true,
    review: true,
  });

  const selectedChild = childrenProp.find((c) => c.id === selectedChildId);
  const selectedPlan = plans.find((p) => p.child_id === selectedChildId) || plans[0];

  // ─── Calculations (same as before) ────────────────────

  const childDailyPlans = dailyPlans.filter((dp) => dp.child_id === selectedChildId);
  const totalPlannedDays = childDailyPlans.length;
  const daysAttended = childDailyPlans.filter((dp) => dp.attendance_logged).length;
  const attendancePercentage = totalPlannedDays > 0
    ? Math.round((daysAttended / totalPlannedDays) * 100)
    : 0;

  const childActivityLogs = activityLogs.filter(
    (log) => log.child_ids?.includes(selectedChildId)
  );
  const totalMinutesLogged = (childActivityLogs.length > 0 ? childActivityLogs : activityLogs).reduce(
    (sum, log) => sum + (log.duration_minutes || 0),
    0
  );
  const hoursLogged = Math.round(totalMinutesLogged / 60 * 10) / 10;
  const requiredHours = selectedPlan
    ? Math.round(selectedPlan.hours_per_day * selectedPlan.days_per_week * 36)
    : 900;
  const hoursPercentage = requiredHours > 0 ? Math.round((hoursLogged / requiredHours) * 100) : 0;

  const allAreasCovered = new Set<string>();
  (childActivityLogs.length > 0 ? childActivityLogs : activityLogs).forEach((log) => {
    (log.curriculum_areas_covered || []).forEach((area) => allAreasCovered.add(area));
  });
  const planAreas = selectedPlan?.curriculum_areas || {};
  const totalAreas = Object.keys(planAreas).length || 7;
  const activeAreas = Object.keys(planAreas).filter((a) => allAreasCovered.has(a)).length;

  // Monthly attendance
  const monthlyAttendance = MONTHS.map((monthName, idx) => {
    const monthIdx = idx < 4 ? idx + 8 : idx - 4;
    const monthPlans = childDailyPlans.filter((dp) => {
      const d = new Date(dp.date + 'T12:00:00');
      return d.getMonth() === monthIdx;
    });
    const attended = monthPlans.filter((dp) => dp.attendance_logged).length;
    const total = monthPlans.length;
    return { month: monthName, days: attended, required: total };
  }).filter((m) => m.required > 0);

  // Compliance alerts
  const alerts: { type: 'warning' | 'danger'; message: string }[] = [];
  if (attendancePercentage > 0 && attendancePercentage < 80) {
    alerts.push({ type: 'danger', message: `Attendance is at ${attendancePercentage}% -- below the recommended 80% threshold.` });
  } else if (attendancePercentage > 0 && attendancePercentage < 90) {
    alerts.push({ type: 'warning', message: `Attendance is at ${attendancePercentage}% -- aim for 90%+ for compliance.` });
  }
  if (registrationStatus === 'not_started') {
    alerts.push({ type: 'warning', message: 'Tusla registration has not been started yet.' });
  }

  // Document completion stats
  const completedDocs = documents.filter((d) => d.completed).length;
  const requiredDocs = documents.filter((d) => d.required).length;
  const completedRequiredDocs = documents.filter((d) => d.required && d.completed).length;

  // Assessment completion stats
  const completedAssessmentItems = assessmentChecklist.filter((a) => a.completed).length;
  const totalAssessmentItems = assessmentChecklist.length;

  // Upcoming deadlines
  const now = new Date();
  const upcomingDeadlines = deadlines
    .filter((d) => d.date && !d.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ─── Save handler ─────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!selectedChildId) return;
    setSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/educator/tusla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChildId,
          status: registrationStatus,
          notification_form: notificationForm,
          documents,
          deadlines,
          assessment_checklist: assessmentChecklist,
          notes,
        }),
      });

      if (res.ok) {
        setSaveMessage('Saved successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const data = await res.json();
        setSaveMessage(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch {
      setSaveMessage('Error: Network error');
    } finally {
      setSaving(false);
    }
  }, [selectedChildId, registrationStatus, notificationForm, documents, deadlines, assessmentChecklist, notes]);

  // ─── Toggle helpers ────────────────────────────────────

  const toggleDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, completed: !d.completed, completedDate: !d.completed ? new Date().toISOString().split('T')[0] : undefined }
          : d
      )
    );
  };

  const toggleAssessmentItem = (itemId: string) => {
    setAssessmentChecklist((prev) =>
      prev.map((a) => (a.id === itemId ? { ...a, completed: !a.completed } : a))
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateDeadline = (deadlineId: string, field: keyof TuslaDeadline, value: string | boolean) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadlineId ? { ...d, [field]: value } : d))
    );
  };

  const addDeadline = () => {
    const newDeadline: TuslaDeadline = {
      id: `dl-custom-${Date.now()}`,
      title: '',
      date: '',
      description: '',
      completed: false,
      type: 'review',
    };
    setDeadlines((prev) => [...prev, newDeadline]);
  };

  const removeDeadline = (deadlineId: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));
  };

  const updateNotificationField = (field: keyof NotificationForm, value: string) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Tab navigation items ─────────────────────────────

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'registration', label: 'Registration', icon: ClipboardCheck },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'notification', label: 'Notification Form', icon: BookOpen },
    { key: 'assessment', label: 'Assessment Prep', icon: CheckCircle },
    { key: 'deadlines', label: 'Deadlines', icon: CalendarDays },
    { key: 'resources', label: 'Resources', icon: ExternalLink },
  ] as const;

  // ─── Days until next deadline ─────────────────────────

  const nextDeadline = upcomingDeadlines[0];
  const daysUntilDeadline = nextDeadline
    ? Math.ceil((new Date(nextDeadline.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <Link href="/educator" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to educator
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-2">Tusla Compliance</p>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
              Registration {'&'} <em className="text-moss italic">Compliance</em>
            </h1>
            <p className="text-clay mt-2 text-lg">
              {selectedChild
                ? `Managing Tusla registration and compliance for ${selectedChild.name}.`
                : 'Add children and create an education plan to begin.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className={`text-xs font-medium ${saveMessage.startsWith('Error') ? 'text-terracotta' : 'text-moss'}`}>
                {saveMessage}
              </span>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Progress
            </button>
          </div>
        </div>
      </div>

      {/* Child selector (if multiple children) */}
      {childrenProp.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {childrenProp.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                setSelectedChildId(child.id);
                const reg = initialRegistrations.find((r) => r.child_id === child.id);
                setRegistrationStatus((reg?.status as RegistrationStatus) || 'not_started');
                setDocuments(reg?.documents?.length ? reg.documents : DEFAULT_DOCUMENTS);
                setNotificationForm(
                  reg?.notification_form && Object.keys(reg.notification_form).length > 0
                    ? reg.notification_form
                    : EMPTY_FORM
                );
                setAssessmentChecklist(reg?.assessment_checklist?.length ? reg.assessment_checklist : DEFAULT_ASSESSMENT_CHECKLIST);
                setDeadlines(reg?.deadlines?.length ? reg.deadlines : DEFAULT_DEADLINES);
                setNotes(reg?.notes || '');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
                selectedChildId === child.id
                  ? 'bg-forest text-parchment'
                  : 'bg-linen border border-stone text-umber hover:border-moss/30'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Compliance alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 ${
                alert.type === 'danger'
                  ? 'bg-terracotta/8 border border-terracotta/15'
                  : 'bg-amber/8 border border-amber/15'
              }`}
            >
              <AlertTriangle className={`h-5 w-5 shrink-0 ${
                alert.type === 'danger' ? 'text-terracotta' : 'text-amber'
              }`} />
              <p className={`text-sm ${
                alert.type === 'danger' ? 'text-terracotta' : 'text-amber'
              }`}>
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-forest text-parchment'
                  : 'text-clay hover:bg-linen hover:text-umber'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════
         OVERVIEW TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status tracker */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-5">
              Registration <em className="text-moss italic">Status</em>
            </h2>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, idx) => {
                const stepIdx = STATUS_STEPS.findIndex((s) => s.key === registrationStatus);
                const isComplete = idx <= stepIdx;
                const isCurrent = idx === stepIdx;
                const StepIcon = isComplete ? CheckCircle2 : Circle;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                          isCurrent
                            ? 'bg-forest text-parchment ring-4 ring-sage/20'
                            : isComplete
                            ? 'bg-moss text-parchment'
                            : 'bg-stone/30 text-clay/40'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                        isCurrent ? 'text-forest' : isComplete ? 'text-moss' : 'text-clay/40'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded-full ${
                        idx < stepIdx ? 'bg-moss' : 'bg-stone/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-moss" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Documents</p>
              </div>
              <p className="text-2xl font-light text-ink">
                {completedRequiredDocs}<span className="text-sm font-normal text-clay/40"> / {requiredDocs}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-stone/20">
                <div
                  className="h-full rounded-full bg-moss transition-all"
                  style={{ width: `${requiredDocs > 0 ? (completedRequiredDocs / requiredDocs) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-sky" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Attendance</p>
              </div>
              <p className="text-2xl font-light text-ink">
                {attendancePercentage}%
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-stone/20">
                <div
                  className={`h-full rounded-full transition-all ${
                    attendancePercentage >= 90 ? 'bg-moss' : attendancePercentage >= 80 ? 'bg-amber' : 'bg-terracotta'
                  }`}
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-amber" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Hours Logged</p>
              </div>
              <p className="text-2xl font-light text-ink">
                {hoursLogged}<span className="text-sm font-normal text-clay/40"> / {requiredHours}h</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-stone/20">
                <div
                  className="h-full rounded-full bg-amber transition-all"
                  style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-sage" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Assessment Prep</p>
              </div>
              <p className="text-2xl font-light text-ink">
                {completedAssessmentItems}<span className="text-sm font-normal text-clay/40"> / {totalAssessmentItems}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-stone/20">
                <div
                  className="h-full rounded-full bg-sage transition-all"
                  style={{ width: `${totalAssessmentItems > 0 ? (completedAssessmentItems / totalAssessmentItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upcoming deadlines + Curriculum coverage row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Next deadline card */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-terracotta" />
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Next Deadline</h3>
              </div>
              {nextDeadline ? (
                <div>
                  <p className="text-sm font-medium text-ink">{nextDeadline.title}</p>
                  <p className="text-xs text-clay/60 mt-1">{nextDeadline.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <CalendarDays className="h-3.5 w-3.5 text-clay/40" />
                    <span className="text-xs font-medium text-umber">
                      {new Date(nextDeadline.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {daysUntilDeadline !== null && (
                      <span className={`tag ${
                        daysUntilDeadline <= 7 ? 'tag-terra' : daysUntilDeadline <= 30 ? 'tag-amber' : 'tag-sage'
                      }`}>
                        {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : daysUntilDeadline === 0 ? 'Today' : 'Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-clay/40">No upcoming deadlines. Add dates in the Deadlines tab.</p>
              )}
            </div>

            {/* Curriculum coverage */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-amber" />
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60">Curriculum Coverage</h3>
              </div>
              <p className="text-2xl font-light text-ink mb-2">
                {activeAreas} <span className="text-sm font-normal text-clay/40">/ {totalAreas} areas active</span>
              </p>
              {allAreasCovered.size > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Array.from(allAreasCovered).map((area) => (
                    <span key={area} className="tag tag-sage">{area}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-clay/40">No curriculum areas logged yet.</p>
              )}
            </div>
          </div>

          {/* Monthly attendance chart */}
          {monthlyAttendance.length > 0 && (
            <div className="card-elevated p-6">
              <h2 className="font-display text-lg font-light text-ink mb-6">
                Monthly <em className="text-moss italic">Attendance</em>
              </h2>
              <div className="flex items-end gap-3 h-40">
                {monthlyAttendance.map((month) => {
                  const percent = month.required > 0 ? (month.days / month.required) * 100 : 0;
                  const isLow = percent < 80;
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center" style={{ height: '120px' }}>
                        <div className="flex-1" />
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isLow ? 'bg-amber/60' : 'bg-moss/60'
                          }`}
                          style={{ height: `${percent}%`, maxWidth: '40px', margin: '0 auto' }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-clay/50">{month.month}</p>
                        <p className="text-[10px] text-clay/30">{month.days}/{month.required}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reports */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-5">
              Available <em className="text-moss italic">Reports</em>
            </h2>
            <div className="space-y-2">
              {([
                { title: 'Annual Assessment Report', description: 'Full compliance report for Tusla assessment', type: 'PDF' as const, reportType: 'annual' },
                { title: 'Term Summary', description: 'Attendance, curriculum coverage, and portfolio summary', type: 'PDF' as const, reportType: 'assessment' },
                { title: 'Attendance Record', description: 'Day-by-day attendance log', type: 'CSV' as const, reportType: 'attendance' },
                { title: 'Curriculum Coverage', description: 'Detailed breakdown by subject area and strand', type: 'PDF' as const, reportType: 'portfolio' },
              ] as const).map((report) => {
                const reportUrl = `/api/educator/reports?type=${report.reportType}&childId=${selectedChildId}`;
                return (
                  <div key={report.title} className="flex items-center gap-3 rounded-2xl p-3.5 hover:bg-parchment/50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss/8">
                      <FileText className="h-5 w-5 text-moss" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-umber">{report.title}</p>
                      <p className="text-xs text-clay/50">{report.description}</p>
                    </div>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                        !selectedChildId ? 'pointer-events-none opacity-40' : ''
                      }`}
                      aria-disabled={!selectedChildId}
                    >
                      <Download className="h-3 w-3" />
                      {report.type}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         REGISTRATION TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'registration' && (
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="font-display text-xl font-light text-ink mb-2">
              Registration <em className="text-moss italic">Status</em>
            </h2>
            <p className="text-sm text-clay mb-6">
              Track your Tusla registration progress. Update your status as you move through the process.
            </p>

            {/* Status stepper */}
            <div className="flex items-center gap-0 mb-8">
              {STATUS_STEPS.map((step, idx) => {
                const stepIdx = STATUS_STEPS.findIndex((s) => s.key === registrationStatus);
                const isComplete = idx <= stepIdx;
                const isCurrent = idx === stepIdx;
                const StepIcon = isComplete ? CheckCircle2 : Circle;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => setRegistrationStatus(step.key)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all group-hover:scale-105 ${
                          isCurrent
                            ? 'bg-forest text-parchment ring-4 ring-sage/20'
                            : isComplete
                            ? 'bg-moss text-parchment'
                            : 'bg-stone/30 text-clay/40 hover:bg-stone/50'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                        isCurrent ? 'text-forest' : isComplete ? 'text-moss' : 'text-clay/40'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all ${
                        idx < stepIdx ? 'bg-moss' : 'bg-stone/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status-specific guidance */}
            <div className="rounded-2xl bg-parchment p-5 border border-stone/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-moss shrink-0 mt-0.5" />
                <div>
                  {registrationStatus === 'not_started' && (
                    <>
                      <h3 className="text-sm font-bold text-ink mb-1">Getting Started</h3>
                      <p className="text-sm text-clay">
                        Under Section 14 of the Education (Welfare) Act 2000, parents who wish to educate their children at home
                        must notify Tusla. Begin by completing the Notification of Intent form and gathering the required documents.
                        Tusla will then arrange a preliminary assessment of your educational provision.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setActiveTab('notification')} className="btn-primary text-xs py-2 px-3">
                          Fill Notification Form
                        </button>
                        <button onClick={() => setActiveTab('documents')} className="btn-secondary text-xs py-2 px-3">
                          View Document Checklist
                        </button>
                      </div>
                    </>
                  )}
                  {registrationStatus === 'in_progress' && (
                    <>
                      <h3 className="text-sm font-bold text-ink mb-1">Application In Progress</h3>
                      <p className="text-sm text-clay">
                        You have begun the registration process. Ensure all required documents are prepared and your notification
                        form is complete. When ready, submit your notification to Tusla Education and Welfare Service (TESS)
                        at your regional office.
                      </p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button onClick={() => setActiveTab('documents')} className="btn-secondary text-xs py-2 px-3">
                          Check Documents ({completedRequiredDocs}/{requiredDocs})
                        </button>
                        <button onClick={() => setActiveTab('notification')} className="btn-secondary text-xs py-2 px-3">
                          Review Form
                        </button>
                      </div>
                    </>
                  )}
                  {registrationStatus === 'submitted' && (
                    <>
                      <h3 className="text-sm font-bold text-ink mb-1">Application Submitted</h3>
                      <p className="text-sm text-clay">
                        Your notification has been submitted to Tusla. They will review your application and arrange a preliminary
                        assessment visit. This typically takes 4-8 weeks. In the meantime, continue documenting your educational
                        provision and keep attendance records.
                      </p>
                      <div className="mt-3">
                        <button onClick={() => setActiveTab('assessment')} className="btn-secondary text-xs py-2 px-3">
                          Prepare for Assessment
                        </button>
                      </div>
                    </>
                  )}
                  {registrationStatus === 'approved' && (
                    <>
                      <h3 className="text-sm font-bold text-ink mb-1">Registration Approved</h3>
                      <p className="text-sm text-clay">
                        Congratulations! Your home education provision has been approved by Tusla. You are now on the register
                        maintained under Section 14. Annual assessments will be conducted to review your educational provision.
                        Keep documenting learning, maintaining attendance records, and building portfolios.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setActiveTab('assessment')} className="btn-secondary text-xs py-2 px-3">
                          Annual Assessment Prep
                        </button>
                        <button onClick={() => setActiveTab('deadlines')} className="btn-secondary text-xs py-2 px-3">
                          View Deadlines
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-3">
              Registration <em className="text-moss italic">Notes</em>
            </h2>
            <p className="text-xs text-clay/60 mb-4">
              Keep track of any correspondence, assessor names, reference numbers, or other important notes.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded-[10px] border border-stone bg-parchment px-4 py-3 text-sm text-umber placeholder:text-clay/30 focus:outline-none focus:ring-2 focus:ring-moss/20 resize-y"
              placeholder="e.g., TESS reference number, assessor contact details, dates of correspondence..."
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         DOCUMENTS TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="card-elevated p-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-light text-ink">
                Document <em className="text-moss italic">Checklist</em>
              </h2>
              <p className="text-sm text-clay mt-1">
                Track all required and recommended documents for your Tusla registration.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light text-ink">{completedDocs}/{documents.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Complete</p>
            </div>
          </div>

          {/* Registration documents */}
          {(['registration', 'assessment', 'ongoing'] as const).map((category) => {
            const categoryDocs = documents.filter((d) => d.category === category);
            const categoryLabels = {
              registration: 'Registration Documents',
              assessment: 'Assessment Documents',
              ongoing: 'Ongoing Records',
            };
            const completedInCategory = categoryDocs.filter((d) => d.completed).length;

            return (
              <div key={category} className="card-elevated overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-5 hover:bg-parchment/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedSections[category] ? (
                      <ChevronDown className="h-4 w-4 text-clay/40" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-clay/40" />
                    )}
                    <h3 className="text-sm font-bold text-ink">{categoryLabels[category]}</h3>
                    <span className="tag tag-sage">{completedInCategory}/{categoryDocs.length}</span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-stone/20">
                    <div
                      className="h-full rounded-full bg-moss transition-all"
                      style={{ width: `${categoryDocs.length > 0 ? (completedInCategory / categoryDocs.length) * 100 : 0}%` }}
                    />
                  </div>
                </button>

                {expandedSections[category] && (
                  <div className="border-t border-stone/50 divide-y divide-stone/30">
                    {categoryDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-start gap-4 p-5 transition-colors ${
                          doc.completed ? 'bg-sage/5' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleDocument(doc.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            doc.completed
                              ? 'bg-moss border-moss text-parchment'
                              : 'border-stone hover:border-moss/50'
                          }`}
                        >
                          {doc.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${doc.completed ? 'text-moss line-through' : 'text-ink'}`}>
                              {doc.name}
                            </p>
                            {doc.required && (
                              <span className="tag tag-terra text-[8px]">Required</span>
                            )}
                          </div>
                          <p className="text-xs text-clay/60 mt-1">{doc.description}</p>
                          {doc.completed && doc.completedDate && (
                            <p className="text-[10px] text-moss/60 mt-1">
                              Completed on {new Date(doc.completedDate).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         NOTIFICATION FORM TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'notification' && (
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="font-display text-xl font-light text-ink mb-2">
              Notification of Intent to <em className="text-moss italic">Educate at Home</em>
            </h2>
            <p className="text-sm text-clay mb-2">
              Complete this form to prepare your Section 14 notification to Tusla. You can save your progress
              and return later. When complete, print or download to submit to your regional Tusla office.
            </p>
            <div className="flex items-center gap-2 mb-6">
              <Info className="h-3.5 w-3.5 text-clay/40" />
              <p className="text-[10px] text-clay/40 uppercase tracking-wider font-bold">
                This data is stored securely and only visible to you
              </p>
            </div>

            <div className="space-y-8">
              {/* Parent/Guardian details */}
              <div>
                <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-moss" />
                  Parent / Guardian Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full Name"
                    value={notificationForm.parentName}
                    onChange={(v) => updateNotificationField('parentName', v)}
                    placeholder="e.g., Sarah O'Brien"
                  />
                  <FormField
                    label="Email Address"
                    value={notificationForm.parentEmail}
                    onChange={(v) => updateNotificationField('parentEmail', v)}
                    placeholder="e.g., sarah@example.com"
                    type="email"
                  />
                  <FormField
                    label="Phone Number"
                    value={notificationForm.parentPhone}
                    onChange={(v) => updateNotificationField('parentPhone', v)}
                    placeholder="e.g., 087 123 4567"
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Address"
                      value={notificationForm.parentAddress}
                      onChange={(v) => updateNotificationField('parentAddress', v)}
                      placeholder="Full postal address"
                      multiline
                    />
                  </div>
                </div>
              </div>

              {/* Child details */}
              <div>
                <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-moss" />
                  Child Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Child's Full Name"
                    value={notificationForm.childName || selectedChild?.name || ''}
                    onChange={(v) => updateNotificationField('childName', v)}
                    placeholder="Full legal name"
                  />
                  <FormField
                    label="Date of Birth"
                    value={notificationForm.childDob || selectedChild?.date_of_birth || ''}
                    onChange={(v) => updateNotificationField('childDob', v)}
                    type="date"
                  />
                  <FormField
                    label="PPS Number"
                    value={notificationForm.childPps}
                    onChange={(v) => updateNotificationField('childPps', v)}
                    placeholder="e.g., 1234567AB"
                  />
                  <FormField
                    label="Previous School (if any)"
                    value={notificationForm.previousSchool}
                    onChange={(v) => updateNotificationField('previousSchool', v)}
                    placeholder="School name and roll number"
                  />
                </div>
              </div>

              {/* Education details */}
              <div>
                <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-moss" />
                  Education Provision
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Education Start Date"
                    value={notificationForm.educationStartDate}
                    onChange={(v) => updateNotificationField('educationStartDate', v)}
                    type="date"
                  />
                  <FormField
                    label="Educational Approach"
                    value={notificationForm.educationApproach || selectedPlan?.approach || ''}
                    onChange={(v) => updateNotificationField('educationApproach', v)}
                    placeholder="e.g., Structured, Child-led, Eclectic, Montessori"
                  />
                  <FormField
                    label="Hours Per Day"
                    value={notificationForm.hoursPerDay || String(selectedPlan?.hours_per_day || '4')}
                    onChange={(v) => updateNotificationField('hoursPerDay', v)}
                    type="number"
                  />
                  <FormField
                    label="Days Per Week"
                    value={notificationForm.daysPerWeek || String(selectedPlan?.days_per_week || '5')}
                    onChange={(v) => updateNotificationField('daysPerWeek', v)}
                    type="number"
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Curriculum Description"
                      value={notificationForm.curriculumDescription}
                      onChange={(v) => updateNotificationField('curriculumDescription', v)}
                      placeholder="Describe how you will cover the main curriculum areas: Language (English/Irish), Mathematics, SESE (Science, History, Geography), Arts (Visual Arts, Music, Drama), PE, and SPHE."
                      multiline
                      rows={4}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormField
                      label="Special Educational Needs (if applicable)"
                      value={notificationForm.specialNeeds}
                      onChange={(v) => updateNotificationField('specialNeeds', v)}
                      placeholder="Detail any special educational needs and how they are being accommodated."
                      multiline
                      rows={3}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormField
                      label="Assessment Methods"
                      value={notificationForm.assessmentMethod}
                      onChange={(v) => updateNotificationField('assessmentMethod', v)}
                      placeholder="How do you assess your child's progress? e.g., Portfolio-based assessment, standardised tests, ongoing observation, project-based evaluation."
                      multiline
                      rows={3}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormField
                      label="Additional Information"
                      value={notificationForm.additionalInfo}
                      onChange={(v) => updateNotificationField('additionalInfo', v)}
                      placeholder="Any additional information you wish to provide to the Education Welfare Officer."
                      multiline
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone/30 flex items-center justify-between">
              <p className="text-xs text-clay/40">
                Save your progress and return anytime. When ready, print this form for submission.
              </p>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         ASSESSMENT PREP TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-light text-ink mb-2">
                  Annual Assessment <em className="text-moss italic">Preparation</em>
                </h2>
                <p className="text-sm text-clay">
                  Use this checklist to prepare for your annual Tusla assessment. The assessor will review your
                  educational provision, meet your child, and examine portfolio evidence.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-ink">
                  {completedAssessmentItems}/{totalAssessmentItems}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-stone/20 mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moss to-sage transition-all"
                style={{ width: `${totalAssessmentItems > 0 ? (completedAssessmentItems / totalAssessmentItems) * 100 : 0}%` }}
              />
            </div>

            {/* Grouped checklists */}
            {(['preparation', 'portfolio', 'documentation', 'review'] as const).map((category) => {
              const categoryItems = assessmentChecklist.filter((a) => a.category === category);
              const completedInCat = categoryItems.filter((a) => a.completed).length;
              const categoryLabels = {
                preparation: 'Preparation',
                portfolio: 'Portfolio',
                documentation: 'Documentation',
                review: 'Assessment Day',
              };
              const categoryDescriptions = {
                preparation: 'Foundational tasks to get ready for your assessment.',
                portfolio: 'Evidence of learning across all curriculum areas.',
                documentation: 'Written records and reports to present.',
                review: 'Preparation for the assessment visit itself.',
              };

              return (
                <div key={category} className="mb-6 last:mb-0">
                  <button
                    onClick={() => toggleSection(category)}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections[category] ? (
                        <ChevronDown className="h-4 w-4 text-clay/40" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-clay/40" />
                      )}
                      <h3 className="text-sm font-bold text-ink">{categoryLabels[category]}</h3>
                      <span className="tag tag-sage text-[8px]">{completedInCat}/{categoryItems.length}</span>
                    </div>
                  </button>

                  {expandedSections[category] && (
                    <>
                      <p className="text-xs text-clay/50 mb-3 ml-6">{categoryDescriptions[category]}</p>
                      <div className="space-y-1 ml-6">
                        {categoryItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleAssessmentItem(item.id)}
                            className={`w-full flex items-center gap-3 rounded-[10px] p-3 text-left transition-colors ${
                              item.completed ? 'bg-sage/5' : 'hover:bg-parchment/50'
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                                item.completed
                                  ? 'bg-moss border-moss text-parchment'
                                  : 'border-stone hover:border-moss/50'
                              }`}
                            >
                              {item.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-moss line-through' : 'text-umber'}`}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         DEADLINES TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'deadlines' && (
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-light text-ink mb-2">
                  Important <em className="text-moss italic">Dates {'&'} Deadlines</em>
                </h2>
                <p className="text-sm text-clay">
                  Track registration deadlines, assessment dates, and review periods.
                </p>
              </div>
              <button onClick={addDeadline} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                <Plus className="h-3 w-3" />
                Add Deadline
              </button>
            </div>

            <div className="space-y-3">
              {deadlines.map((deadline) => {
                const isPast = deadline.date && new Date(deadline.date) < now;
                const isUpcoming = deadline.date && !isPast;
                const daysLeft = deadline.date
                  ? Math.ceil((new Date(deadline.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                const typeColors = {
                  registration: 'bg-moss/8 text-moss border-moss/20',
                  assessment: 'bg-amber/8 text-amber border-amber/20',
                  review: 'bg-terracotta/8 text-terracotta border-terracotta/20',
                };

                return (
                  <div
                    key={deadline.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      deadline.completed
                        ? 'bg-sage/5 border-sage/20'
                        : isPast && !deadline.completed
                        ? 'bg-terracotta/5 border-terracotta/20'
                        : 'bg-linen border-stone'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => updateDeadline(deadline.id, 'completed', !deadline.completed)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                          deadline.completed
                            ? 'bg-moss border-moss text-parchment'
                            : 'border-stone hover:border-moss/50'
                        }`}
                      >
                        {deadline.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={deadline.title}
                            onChange={(e) => updateDeadline(deadline.id, 'title', e.target.value)}
                            className={`text-sm font-medium bg-transparent border-none p-0 focus:outline-none focus:ring-0 flex-1 min-w-[200px] ${
                              deadline.completed ? 'text-moss line-through' : 'text-ink'
                            }`}
                            placeholder="Deadline title"
                          />
                          <span className={`tag text-[8px] border ${typeColors[deadline.type]}`}>
                            {deadline.type}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={deadline.description}
                          onChange={(e) => updateDeadline(deadline.id, 'description', e.target.value)}
                          className="text-xs text-clay/60 bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0"
                          placeholder="Description"
                        />

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-clay/40" />
                            <input
                              type="date"
                              value={deadline.date}
                              onChange={(e) => updateDeadline(deadline.id, 'date', e.target.value)}
                              className="text-xs font-medium text-umber bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                            />
                          </div>
                          {deadline.date && daysLeft !== null && !deadline.completed && (
                            <span className={`tag ${
                              daysLeft < 0 ? 'tag-terra' : daysLeft <= 14 ? 'tag-amber' : 'tag-sage'
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeDeadline(deadline.id)}
                        className="text-clay/30 hover:text-terracotta transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {deadlines.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="h-10 w-10 text-clay/20 mx-auto mb-3" />
                  <p className="text-sm text-clay/40">No deadlines set yet.</p>
                  <button onClick={addDeadline} className="btn-secondary text-xs py-2 px-3 mt-3">
                    Add Your First Deadline
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Academic year key dates */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-4">
              Typical <em className="text-moss italic">Academic Year</em> Key Dates
            </h2>
            <p className="text-xs text-clay/50 mb-4">
              These are general guideline dates. Your actual Tusla assessment schedule may vary.
            </p>
            <div className="space-y-3">
              {[
                { month: 'September', event: 'Academic year begins. Update education plan for the new year.', icon: BookOpen },
                { month: 'October', event: 'Submit updated education plan to Tusla if requested. Begin attendance logging.', icon: FileText },
                { month: 'December', event: 'End of Term 1. Review curriculum coverage and portfolio progress.', icon: TrendingUp },
                { month: 'January-March', event: 'Typical window for annual Tusla assessment visits.', icon: Shield },
                { month: 'March', event: 'Mid-year review. Ensure all curriculum areas are being covered.', icon: ClipboardCheck },
                { month: 'June', event: 'End of academic year. Compile annual portfolio and assessment report.', icon: CheckCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.month} className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-parchment/50 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss/8">
                      <Icon className="h-4 w-4 text-moss" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{item.month}</p>
                      <p className="text-xs text-clay/60 mt-0.5">{item.event}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         RESOURCES TAB
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="font-display text-xl font-light text-ink mb-2">
              Tusla <em className="text-moss italic">Resources</em>
            </h2>
            <p className="text-sm text-clay mb-6">
              Essential links, guides, and resources for home-educating families in Ireland.
            </p>

            <div className="space-y-3">
              {TUSLA_RESOURCES.map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-2xl p-4 hover:bg-parchment/50 transition-colors group border border-transparent hover:border-stone/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss/8 group-hover:bg-moss/12 transition-colors">
                    <ExternalLink className="h-5 w-5 text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-xs text-clay/60 mt-1">{resource.description}</p>
                    <p className="text-[10px] text-clay/30 mt-1 truncate">{resource.url}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-clay/30 group-hover:text-moss transition-colors shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </div>

          {/* Irish Curriculum Areas */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-4">
              Irish Primary <em className="text-moss italic">Curriculum Areas</em>
            </h2>
            <p className="text-xs text-clay/50 mb-4">
              Tusla assessors will look for evidence of education across these curriculum areas as defined by the NCCA.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  area: 'Language',
                  subjects: 'English, Gaeilge',
                  description: 'Reading, writing, oral language, and communication skills in both English and Irish.',
                },
                {
                  area: 'Mathematics',
                  subjects: 'Number, Algebra, Shape & Space, Measures, Data',
                  description: 'Mathematical concepts, problem-solving, and practical application of numeracy.',
                },
                {
                  area: 'SESE',
                  subjects: 'Science, History, Geography',
                  description: 'Social, Environmental, and Scientific Education including investigation and exploration.',
                },
                {
                  area: 'Arts Education',
                  subjects: 'Visual Arts, Music, Drama',
                  description: 'Creative expression, appreciation, and performance across visual and performing arts.',
                },
                {
                  area: 'Physical Education',
                  subjects: 'Games, Athletics, Gymnastics, Dance, Outdoor Activities, Aquatics',
                  description: 'Physical development, fitness, motor skills, and healthy active living.',
                },
                {
                  area: 'SPHE',
                  subjects: 'Social, Personal & Health Education',
                  description: 'Wellbeing, relationships, safety, citizenship, and personal development.',
                },
              ].map((item) => (
                <div key={item.area} className="rounded-2xl bg-parchment p-4 border border-stone/30">
                  <h4 className="text-sm font-bold text-ink">{item.area}</h4>
                  <p className="text-[10px] font-bold text-moss/70 uppercase tracking-wider mt-0.5">{item.subjects}</p>
                  <p className="text-xs text-clay/60 mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-light text-ink mb-4">
              Frequently Asked <em className="text-moss italic">Questions</em>
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Do I legally have to register with Tusla?',
                  a: 'Yes. Under the Education (Welfare) Act 2000, Section 14, parents who educate their children in a place other than a recognised school must apply to have the child registered with Tusla.',
                },
                {
                  q: 'What happens during a Tusla assessment?',
                  a: 'An Education Welfare Officer will visit your home (or arrange a meeting), review your education provision, examine portfolio evidence, and may speak with your child. They assess whether a minimum education is being provided.',
                },
                {
                  q: 'What is considered a "minimum education"?',
                  a: 'There is no strict definition, but Tusla looks for evidence that the child is receiving education in the core curriculum areas appropriate to their age and ability. The education should support the child\'s intellectual, social, and personal development.',
                },
                {
                  q: 'How often are assessments carried out?',
                  a: 'Typically annually, though newly registered families may have an initial preliminary assessment followed by a comprehensive assessment within the first year.',
                },
                {
                  q: 'Can my application be refused?',
                  a: 'If Tusla determines that a minimum education is not being provided, they can refuse registration. You would then be required to send your child to a recognised school or address the concerns raised.',
                },
                {
                  q: 'Do I need to follow the national curriculum exactly?',
                  a: 'No. You are not required to follow the NCCA curriculum exactly, but Tusla will look for evidence that you are covering equivalent curriculum areas at an appropriate level for your child.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="rounded-[10px] p-4 bg-parchment/50 border border-stone/20">
                  <p className="text-sm font-bold text-ink">{faq.q}</p>
                  <p className="text-sm text-clay mt-2">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form Field Component ────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const inputClasses =
    'w-full rounded-[8px] border border-stone bg-parchment px-3 py-2.5 text-sm text-umber placeholder:text-clay/30 focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss/30';

  return (
    <div>
      <label className="block text-xs font-bold text-ink mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${inputClasses} resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
