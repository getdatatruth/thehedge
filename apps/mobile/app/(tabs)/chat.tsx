import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, Clock, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { apiPost } from '@/lib/api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface Suggestion {
  title: string;
  description: string;
  duration: string;
  materials: string[];
  why_today: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
}

const EXAMPLE_PROMPTS = [
  "What should we do this afternoon?",
  "We're stuck indoors on a rainy day",
  "Something calm before bedtime",
  "A science experiment with kitchen supplies",
];

export default function ChatScreen() {
  const { children, family } = useAuthStore();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!loading) return;
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [loading]);

  const suggestionsUsed = messages.filter(
    (m) => m.role === 'assistant' && m.suggestions
  ).length;
  const isFreeUser = effectiveTier === 'free';
  const isAtLimit = isFreeUser && suggestionsUsed >= 5;

  const handleSubmit = async (prompt?: string) => {
    const text = prompt || input.trim();
    if (!text || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const context = {
        children: children.map((c) => ({
          name: c.name,
          age: c.age,
          interests: c.interests,
        })),
        weather: null,
        season: getSeason(),
        county: family?.county ?? null,
        familyStyle: family?.family_style ?? null,
      };

      const { data } = await apiPost<{
        text: string;
        suggestions: Suggestion[];
      }>('/ai/suggest', { prompt: text, context });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.text, suggestions: data.suggestions },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't connect. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => scrollRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HedgeAI</Text>
          <Text style={styles.title}>Ask The Hedge</Text>
          {children.length > 0 && (
            <Text style={styles.context}>
              I know about{' '}
              {children.map((c) => `${c.name} (${c.age})`).join(', ')}
            </Text>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Sparkles size={32} color={lightTheme.surface} />
              </View>
              <Text style={styles.emptyTitle}>
                What would you like to do today?
              </Text>
              <Text style={styles.emptyBody}>
                Ask me anything about activities for your family.
              </Text>
              <View style={styles.prompts}>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    onPress={() => handleSubmit(prompt)}
                    style={styles.promptChip}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.messageRow,
                msg.role === 'user'
                  ? styles.messageRowUser
                  : styles.messageRowAssistant,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Sparkles size={14} color={lightTheme.surface} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user'
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                {msg.role === 'user' ? (
                  <Text style={styles.userText}>{msg.content}</Text>
                ) : msg.suggestions ? (
                  <View style={styles.suggestions}>
                    {msg.suggestions.map((s, j) => (
                      <View key={j} style={styles.suggestionCard}>
                        <View style={styles.suggestionHeader}>
                          <Text style={styles.suggestionTitle}>
                            {s.title}
                          </Text>
                          <View style={styles.durationPill}>
                            <Clock size={10} color={lightTheme.textSecondary} />
                            <Text style={styles.durationText}>
                              {s.duration}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.suggestionDesc}>
                          {s.description}
                        </Text>
                        {s.why_today && (
                          <View style={styles.whyToday}>
                            <Text style={styles.whyTodayText}>
                              {s.why_today}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.assistantText}>{msg.content}</Text>
                )}
              </View>
              {msg.role === 'user' && (
                <View style={styles.userAvatar}>
                  <User size={14} color={lightTheme.textMuted} />
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.loadingRow}>
              <View style={styles.aiAvatar}>
                <Sparkles size={14} color={lightTheme.surface} />
              </View>
              <View style={styles.loadingDots}>
                <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                <Animated.View style={[styles.dot, { opacity: dot3 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          {isAtLimit ? (
            <View style={styles.limitBanner}>
              <Text style={styles.limitTitle}>
                You've used all 5 free suggestions
              </Text>
              <Text style={styles.limitBody}>
                Upgrade for unlimited AI ideas.
              </Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about activities..."
                placeholderTextColor={lightTheme.textMuted}
                value={input}
                onChangeText={setInput}
                editable={!loading}
                onSubmitEditing={() => handleSubmit()}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={() => handleSubmit()}
                disabled={!input.trim() || loading}
                style={[
                  styles.sendButton,
                  (!input.trim() || loading) && styles.sendButtonDisabled,
                ]}
              >
                <Send size={18} color={lightTheme.surface} />
              </TouchableOpacity>
            </View>
          )}
          {isFreeUser && !isAtLimit && (
            <Text style={styles.usageText}>
              {suggestionsUsed}/5 suggestions used
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: lightTheme.textMuted,
    marginBottom: 4,
  },
  title: {
    ...typography.h2,
    color: lightTheme.text,
  },
  context: {
    ...typography.bodySmall,
    color: lightTheme.accent,
    marginTop: 4,
  },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    gap: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  emptyBody: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  prompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  promptChip: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  promptText: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
  },
  messageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    maxWidth: '90%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: lightTheme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    flex: 1,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: lightTheme.primary,
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  assistantBubble: {},
  userText: {
    ...typography.body,
    color: lightTheme.surface,
  },
  assistantText: {
    ...typography.body,
    color: lightTheme.text,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  suggestions: {
    gap: spacing.md,
  },
  suggestionCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  suggestionTitle: {
    ...typography.uiBold,
    color: lightTheme.text,
    flex: 1,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: lightTheme.background,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: lightTheme.textSecondary,
  },
  suggestionDesc: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
  },
  whyToday: {
    marginTop: spacing.sm,
    backgroundColor: lightTheme.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  whyTodayText: {
    ...typography.uiSmall,
    color: lightTheme.accent,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightTheme.accent,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: lightTheme.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  limitBanner: {
    backgroundColor: `${lightTheme.warning}10`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  limitTitle: {
    ...typography.uiBold,
    color: lightTheme.text,
  },
  limitBody: {
    ...typography.uiSmall,
    color: lightTheme.textSecondary,
  },
  usageText: {
    fontSize: 11,
    color: lightTheme.textMuted,
    textAlign: 'center',
  },
});
