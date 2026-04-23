import { create } from 'zustand';

export interface OnboardingChild {
  name: string;
  dateOfBirth: string;
  interests: string[];
  schoolStatus: string;
}

interface OnboardingState {
  // Step data
  familyName: string;
  county: string;
  children: OnboardingChild[];
  learningPath: string; // 'mainstream' | 'homeschool' | 'considering'
  educationApproach: string; // 'structured' | 'blended' | 'child_led' | 'waldorf' | 'unschool'
  familyStyle: string;
  outdoorSpace: string;
  learningGoals: string[];
  activitiesPerWeek: string;

  // Actions
  setFamilyName: (name: string) => void;
  setCounty: (county: string) => void;
  setChildren: (children: OnboardingChild[]) => void;
  addChild: () => void;
  updateChild: (index: number, field: keyof OnboardingChild, value: string | string[]) => void;
  removeChild: (index: number) => void;
  setLearningPath: (path: string) => void;
  setEducationApproach: (approach: string) => void;
  setFamilyStyle: (style: string) => void;
  setOutdoorSpace: (space: string) => void;
  setLearningGoals: (goals: string[]) => void;
  toggleLearningGoal: (goal: string) => void;
  setActivitiesPerWeek: (count: string) => void;
  reset: () => void;

  // Computed
  getApiPayload: () => {
    familyName: string;
    county: string;
    children: { name: string; dateOfBirth: string; interests: string[]; schoolStatus: string }[];
    learningPath: string;
    educationApproach: string;
    familyStyle: string;
    outdoorSpace: string;
    learningGoals: string[];
    activitiesPerWeek: string;
  };
}

const initialChild: OnboardingChild = {
  name: '',
  dateOfBirth: '',
  interests: [],
  schoolStatus: 'primary',
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  familyName: '',
  county: '',
  children: [{ ...initialChild }],
  learningPath: '',
  educationApproach: '',
  familyStyle: '',
  outdoorSpace: '',
  learningGoals: [],
  activitiesPerWeek: '',

  setFamilyName: (name) => set({ familyName: name }),
  setCounty: (county) => set({ county }),

  setChildren: (children) => set({ children }),
  addChild: () => set((s) => ({ children: [...s.children, { ...initialChild }] })),
  updateChild: (index, field, value) =>
    set((s) => {
      const updated = [...s.children];
      (updated[index] as any)[field] = value;
      return { children: updated };
    }),
  removeChild: (index) =>
    set((s) => ({
      children: s.children.filter((_, i) => i !== index),
    })),

  setLearningPath: (path) => set({ learningPath: path }),
  setEducationApproach: (approach) => set({ educationApproach: approach }),
  setFamilyStyle: (style) => set({ familyStyle: style }),
  setOutdoorSpace: (space) => set({ outdoorSpace: space }),

  setLearningGoals: (goals) => set({ learningGoals: goals }),
  toggleLearningGoal: (goal) =>
    set((s) => ({
      learningGoals: s.learningGoals.includes(goal)
        ? s.learningGoals.filter((g) => g !== goal)
        : [...s.learningGoals, goal],
    })),

  setActivitiesPerWeek: (count) => set({ activitiesPerWeek: count }),

  reset: () =>
    set({
      familyName: '',
      county: '',
      children: [{ ...initialChild }],
      learningPath: '',
      educationApproach: '',
      familyStyle: '',
      outdoorSpace: '',
      learningGoals: [],
      activitiesPerWeek: '',
    }),

  getApiPayload: () => {
    const s = get();
    return {
      familyName: s.familyName,
      county: s.county,
      children: s.children.map((c) => ({
        name: c.name,
        dateOfBirth: c.dateOfBirth || '2020-01-01',
        interests: c.interests,
        schoolStatus: c.schoolStatus,
      })),
      learningPath: s.learningPath,
      educationApproach: s.educationApproach,
      familyStyle: s.familyStyle,
      outdoorSpace: s.outdoorSpace,
      learningGoals: s.learningGoals,
      activitiesPerWeek: s.activitiesPerWeek,
    };
  },
}));
