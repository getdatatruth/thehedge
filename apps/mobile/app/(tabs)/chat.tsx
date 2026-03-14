import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, Clock, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { apiPost } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
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
                <Sparkles size={32} color={colors.parchment} />
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
                  <Sparkles size={14} color={colors.parchment} />
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
                      <Card key={j} variant="interactive" padding="lg">
                        <View style={styles.suggestionHeader}>
                          <Text style={styles.suggestionTitle}>
                            {s.title}
                          </Text>
                          <View style={styles.durationPill}>
                            <Clock size={10} color={colors.clay} />
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
                      </Card>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.assistantText}>{msg.content}</Text>
                )}
              </View>
              {msg.role === 'user' && (
                <View style={styles.userAvatar}>
                  <User size={14} color={`${colors.clay}80`} />
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.loadingRow}>
              <View style={styles.aiAvatar}>
                <Sparkles size={14} color={colors.parchment} />
              </View>
              <View style={styles.loadingDots}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
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
                placeholderTextColor={`${colors.clay}60`}
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
                <Send size={18} color={colors.parchment} />
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
  safe: { flex: 1, backgroundColor: colors.parchment },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: `${colors.clay}80`,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.ink,
  },
  context: {
    fontSize: 13,
    color: colors.moss,
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
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.clay,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
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
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  promptText: {
    fontSize: 13,
    color: colors.clay,
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
    borderRadius: radius.lg,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    flex: 1,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: colors.forest,
    borderRadius: radius.lg,
    borderTopRightRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  assistantBubble: {},
  userText: {
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 20,
  },
  assistantText: {
    fontSize: 14,
    color: colors.umber,
    lineHeight: 20,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  suggestions: {
    gap: spacing.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
    flex: 1,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.clay,
  },
  suggestionDesc: {
    fontSize: 13,
    color: `${colors.clay}B0`,
    lineHeight: 18,
  },
  whyToday: {
    marginTop: spacing.sm,
    backgroundColor: `${colors.forest}08`,
    borderWidth: 1,
    borderColor: `${colors.forest}12`,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  whyTodayText: {
    fontSize: 12,
    color: colors.forest,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.moss}60`,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.stone,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: colors.ink,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  limitBanner: {
    backgroundColor: `${colors.amber}08`,
    borderWidth: 1,
    borderColor: `${colors.amber}20`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  limitBody: {
    fontSize: 12,
    color: colors.clay,
  },
  usageText: {
    fontSize: 11,
    color: `${colors.clay}60`,
    textAlign: 'center',
  },
});
