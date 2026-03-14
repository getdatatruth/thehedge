import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Leaf,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

const STEPS = ['Family Basics', 'Children', 'Family Style', 'Preferences', 'Complete'];

const COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford',
  'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon',
  'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
];

const FAMILY_STYLES = [
  { id: 'outdoor', label: 'Outdoor & Active', icon: Leaf },
  { id: 'creative', label: 'Creative & Artistic', icon: Sparkles },
  { id: 'structured', label: 'Structured & Routine', icon: Calendar },
  { id: 'flexible', label: 'Go with the Flow', icon: Users },
];

interface ChildData {
  name: string;
  dateOfBirth: string;
  interests: string[];
  schoolStatus: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { setProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [familyName, setFamilyName] = useState('');
  const [county, setCounty] = useState('');
  const [children, setChildren] = useState<ChildData[]>([
    { name: '', dateOfBirth: '', interests: [], schoolStatus: 'primary' },
  ]);
  const [familyStyle, setFamilyStyle] = useState('');
  const [outdoorSpace, setOutdoorSpace] = useState('garden');

  const canProgress = () => {
    switch (step) {
      case 0:
        return familyName.trim().length > 0 && county.length > 0;
      case 1:
        return children.every((c) => c.name.trim().length > 0);
      case 2:
        return familyStyle.length > 0;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await apiPost('/../../onboarding', {
        familyName,
        county,
        children: children.map((c) => ({
          name: c.name,
          dateOfBirth: c.dateOfBirth || '2020-01-01',
          interests: c.interests,
          schoolStatus: c.schoolStatus,
        })),
        familyStyle,
        outdoorSpace,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const addChild = () => {
    setChildren([
      ...children,
      { name: '', dateOfBirth: '', interests: [], schoolStatus: 'primary' },
    ]);
  };

  const updateChild = (index: number, field: keyof ChildData, value: string | string[]) => {
    const updated = [...children];
    (updated[index] as any)[field] = value;
    setChildren(updated);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((step + 1) / STEPS.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.stepLabel}>
            {step + 1} of {STEPS.length} - {STEPS[step]}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 0: Family Basics */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tell us about your family</Text>
              <Text style={styles.stepBody}>
                We'll personalise everything based on who you are and where you
                live.
              </Text>
              <Input
                label="Family name"
                placeholder="e.g. The Murphy Family"
                value={familyName}
                onChangeText={setFamilyName}
              />
              <Text style={styles.fieldLabel}>County</Text>
              <View style={styles.countyGrid}>
                {COUNTIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.countyChip,
                      county === c && styles.countyChipActive,
                    ]}
                    onPress={() => setCounty(c)}
                  >
                    <Text
                      style={[
                        styles.countyChipText,
                        county === c && styles.countyChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1: Children */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Your children</Text>
              <Text style={styles.stepBody}>
                We'll tailor activities to each child's age and interests.
              </Text>
              {children.map((child, i) => (
                <Card key={i} variant="elevated" padding="lg">
                  <Text style={styles.childHeader}>Child {i + 1}</Text>
                  <Input
                    label="Name"
                    placeholder="First name"
                    value={child.name}
                    onChangeText={(v) => updateChild(i, 'name', v)}
                  />
                  <Input
                    label="Date of birth"
                    placeholder="YYYY-MM-DD"
                    value={child.dateOfBirth}
                    onChangeText={(v) => updateChild(i, 'dateOfBirth', v)}
                    containerStyle={{ marginTop: spacing.md }}
                  />
                </Card>
              ))}
              <TouchableOpacity onPress={addChild} style={styles.addChildBtn}>
                <Text style={styles.addChildText}>+ Add another child</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Family Style */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Your family style</Text>
              <Text style={styles.stepBody}>
                This helps us suggest the right mix of activities.
              </Text>
              {FAMILY_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => setFamilyStyle(style.id)}
                  style={[
                    styles.styleCard,
                    familyStyle === style.id && styles.styleCardActive,
                  ]}
                >
                  <style.icon
                    size={24}
                    color={
                      familyStyle === style.id ? colors.forest : colors.clay
                    }
                  />
                  <Text
                    style={[
                      styles.styleLabel,
                      familyStyle === style.id && styles.styleLabelActive,
                    ]}
                  >
                    {style.label}
                  </Text>
                  {familyStyle === style.id && (
                    <Check size={18} color={colors.forest} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Almost there</Text>
              <Text style={styles.stepBody}>
                A couple more details to make your experience perfect.
              </Text>
              <Text style={styles.fieldLabel}>Outdoor space</Text>
              {['garden', 'balcony', 'park_nearby', 'none'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setOutdoorSpace(opt)}
                  style={[
                    styles.optionRow,
                    outdoorSpace === opt && styles.optionRowActive,
                  ]}
                >
                  <Text style={styles.optionText}>
                    {opt === 'garden'
                      ? 'Garden'
                      : opt === 'balcony'
                      ? 'Balcony'
                      : opt === 'park_nearby'
                      ? 'Park nearby'
                      : 'No outdoor space'}
                  </Text>
                  {outdoorSpace === opt && (
                    <Check size={18} color={colors.forest} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <View style={[styles.stepContent, styles.completeStep]}>
              <View style={styles.completeIcon}>
                <Sparkles size={40} color={colors.parchment} />
              </View>
              <Text style={styles.completeTitle}>You're all set!</Text>
              <Text style={styles.completeBody}>
                We've got everything we need. Your personalised activity ideas
                are ready.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.nav}>
          {step > 0 && (
            <Button variant="ghost" onPress={back} icon={<ChevronLeft size={18} color={colors.clay} />}>
              Back
            </Button>
          )}
          <View style={styles.navSpacer} />
          <Button
            variant="primary"
            onPress={next}
            disabled={!canProgress()}
            loading={loading}
            size="lg"
          >
            {step === STEPS.length - 1 ? "Let's go!" : 'Continue'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  flex: { flex: 1 },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: `${colors.stone}40`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.forest,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 11,
    color: `${colors.clay}80`,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  stepContent: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.ink,
  },
  stepBody: {
    fontSize: 15,
    color: colors.clay,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  countyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  countyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  countyChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  countyChipText: { fontSize: 12, color: colors.clay },
  countyChipTextActive: { color: colors.parchment },
  childHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  addChildBtn: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.stone,
    borderRadius: radius.lg,
  },
  addChildText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.moss,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
  },
  styleCardActive: {
    borderColor: colors.forest,
    backgroundColor: `${colors.forest}08`,
  },
  styleLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.clay,
  },
  styleLabelActive: {
    color: colors.forest,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
  },
  optionRowActive: {
    borderColor: colors.forest,
    backgroundColor: `${colors.forest}08`,
  },
  optionText: { fontSize: 15, color: colors.ink },
  completeStep: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
  },
  completeBody: {
    fontSize: 16,
    color: colors.clay,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.stone,
  },
  navSpacer: { flex: 1 },
});
