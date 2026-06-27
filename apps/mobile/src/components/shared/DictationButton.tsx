import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// A real, in-app dictation control. Tap to speak, tap to stop. The transcript is
// appended to whatever is already in the field, so you can type and talk. Falls
// back gracefully if permission is refused or speech is unavailable.
export function DictationButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const baseRef = useRef('');
  const pulse = useRef(new Animated.Value(0)).current;

  useSpeechRecognitionEvent('result', (e) => {
    const transcript = e.results?.[0]?.transcript ?? '';
    if (!transcript) return;
    const base = baseRef.current;
    const sep = base && !base.endsWith(' ') ? ' ' : '';
    onChange((base + sep + transcript).replace(/\s+/g, ' ').trimStart());
  });
  useSpeechRecognitionEvent('end', () => stopUi());
  useSpeechRecognitionEvent('error', (e) => {
    stopUi();
    if (e?.error && e.error !== 'aborted' && e.error !== 'no-speech') {
      Alert.alert('Could not hear that', 'Have another go, or just type it in.');
    }
  });

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }
  function stopUi() {
    setListening(false);
    pulse.stopAnimation();
    pulse.setValue(0);
  }

  async function toggle() {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Microphone needed',
          'Allow the microphone and speech recognition in Settings to speak instead of typing.',
        );
        return;
      }
      baseRef.current = value || '';
      setListening(true);
      startPulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      ExpoSpeechRecognitionModule.start({
        lang: 'en-IE',
        interimResults: true,
        continuous: false,
        addsPunctuation: true,
      });
    } catch {
      stopUi();
      Alert.alert('Dictation unavailable', 'You can type it in instead, no bother.');
    }
  }

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={toggle} style={styles.row}>
      <View style={styles.micWrap}>
        {listening && (
          <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        )}
        <View style={[styles.mic, listening && styles.micOn]}>
          {listening ? <Square size={15} color="#FFFFFF" fill="#FFFFFF" /> : <Mic size={17} color={lightTheme.accent} />}
        </View>
      </View>
      <Text style={[styles.label, listening && styles.labelOn]}>
        {listening ? 'Listening, tap to stop' : 'Prefer to talk? Tap and just say it'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  micWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: lightTheme.accent },
  mic: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  micOn: { backgroundColor: lightTheme.accent },
  label: { ...typography.bodySmall, color: lightTheme.textSecondary, flex: 1 },
  labelOn: { color: lightTheme.accent, fontWeight: '600' },
});
