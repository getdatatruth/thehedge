import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyStyle, SchoolStatus, LearningStyle } from '@/types/database';

export interface ChildData {
  name: string;
  dateOfBirth: string;
  interests: string[];
  schoolStatus: SchoolStatus;
  senFlags: string[];
  learningStyle: LearningStyle | null;
}

export interface OnboardingState {
  step: number;
  // Step 1: Family basics
  familyName: string;
  country: string;
  county: string;
  // Step 2: Children
  children: ChildData[];
  // Step 3: Learning path
  learningPath: string;
  // Step 4: Interests (applied to all children)
  familyInterests: string[];
  // Step 5: Family style
  familyStyle: FamilyStyle;
  // Step 4: Availability
  ideaTimes: string[];
  weekendPlanning: boolean;
  holidayPlanning: boolean;
  // Step 5: Practical details
  hasOutdoorSpace: boolean;
  carActivities: boolean;
  messComfort: 'none' | 'low' | 'medium' | 'high';
}

interface OnboardingActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => void;
  addChild: () => void;
  removeChild: (index: number) => void;
  updateChild: (index: number, data: Partial<ChildData>) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  step: 1,
  familyName: '',
  country: 'IE',
  county: '',
  children: [
    {
      name: '',
      dateOfBirth: '',
      interests: [],
      schoolStatus: 'mainstream',
      senFlags: [],
      learningStyle: null,
    },
  ],
  learningPath: '',
  familyInterests: [],
  familyStyle: 'balanced',
  ideaTimes: [],
  weekendPlanning: true,
  holidayPlanning: true,
  hasOutdoorSpace: false,
  carActivities: false,
  messComfort: 'medium',
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 8) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      updateField: (key, value) => set({ [key]: value }),

      addChild: () =>
        set((state) => ({
          children: [
            ...state.children,
            {
              name: '',
              dateOfBirth: '',
              interests: [],
              schoolStatus: 'mainstream' as SchoolStatus,
              senFlags: [],
              learningStyle: null,
            },
          ],
        })),

      removeChild: (index) =>
        set((state) => ({
          children: state.children.filter((_, i) => i !== index),
        })),

      updateChild: (index, data) =>
        set((state) => ({
          children: state.children.map((child, i) =>
            i === index ? { ...child, ...data } : child
          ),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'hedge-onboarding',
      partialize: (state) => ({
        step: state.step,
        familyName: state.familyName,
        country: state.country,
        county: state.county,
        children: state.children,
        learningPath: state.learningPath,
        familyInterests: state.familyInterests,
        familyStyle: state.familyStyle,
        ideaTimes: state.ideaTimes,
        weekendPlanning: state.weekendPlanning,
        holidayPlanning: state.holidayPlanning,
        hasOutdoorSpace: state.hasOutdoorSpace,
        carActivities: state.carActivities,
        messComfort: state.messComfort,
      }),
    }
  )
);
