'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Clock, User, ArrowUpRight } from 'lucide-react';

interface Suggestion {
  title: string;
  description: string;
  duration: string;
  materials: string[];
  steps: string[];
  learning_outcomes: string[];
  age_suitability: string;
  why_today: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
}

interface ChatInterfaceProps {
  context: {
    children: { name: string; age: number; interests: string[] }[];
    weather: {
      temperature: number;
      condition: string;
      isRaining: boolean;
    } | null;
    season: string;
    county: string | null;
    familyStyle: string | null;
  };
}

const EXAMPLE_PROMPTS = [
  "What should we do this afternoon?",
  "We're stuck indoors on a rainy day",
  "Something calm before bedtime",
  "A science experiment with kitchen supplies",
  "We're at the beach with the kids",
];

export function ChatInterface({ context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  async function handleSubmit(prompt?: string) {
    const text = prompt || input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Something went wrong. Try again.',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.text,
          suggestions: data.suggestions,
        },
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
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">HedgeAI</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          Ask <em className="text-moss italic">The Hedge</em>
        </h1>
        <p className="text-clay mt-2 font-serif text-lg leading-relaxed">
          Your family activity companion, powered by HedgeAI.
          {context.children.length > 0 && (
            <span className="text-moss">
              {' '}I know about{' '}
              {context.children.map((c) => `${c.name} (${c.age})`).join(', ')}.
            </span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-5 pb-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-10 animate-fade-up">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[14px] bg-gradient-to-br from-forest to-moss shadow-lg shadow-forest/20">
                <Sparkles className="h-8 w-8 text-parchment" />
              </div>
              <h2 className="font-display text-2xl font-light text-ink">
                What would you like to do <em className="text-moss italic">today</em>?
              </h2>
              <p className="text-sm text-clay/60 mt-3 font-serif max-w-sm mx-auto leading-relaxed">
                Ask me anything about activities for your family. I&apos;ll personalise ideas based on your children, the weather, and your family style.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="rounded-[4px] bg-linen border border-stone px-4 py-2.5 text-sm text-clay hover:text-forest hover:border-moss/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-forest to-moss shadow-sm">
                <Sparkles className="h-4 w-4 text-parchment" />
              </div>
            )}
            <div
              className={`max-w-[85%] space-y-3 ${
                msg.role === 'user'
                  ? 'rounded-[14px] rounded-tr-sm bg-gradient-to-br from-forest to-moss text-parchment px-5 py-3 shadow-sm'
                  : ''
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : msg.suggestions ? (
                <div className="space-y-3 stagger-children">
                  {msg.suggestions.map((suggestion, j) => (
                    <div key={j} className="card-interactive p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display font-light text-ink text-[15px]">
                          {suggestion.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 shrink-0 ml-3 rounded-[3px] bg-linen border border-stone px-2.5 py-1 text-[11px] font-medium text-clay">
                          <Clock className="h-3 w-3" />
                          {suggestion.duration}
                        </span>
                      </div>
                      <p className="text-[13px] text-clay/70 font-serif leading-relaxed">
                        {suggestion.description}
                      </p>
                      {suggestion.why_today && (
                        <p className="text-[12px] text-forest bg-forest/5 rounded-[4px] px-3 py-2 border border-forest/8">
                          {suggestion.why_today}
                        </p>
                      )}
                      {suggestion.materials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {suggestion.materials.map((m, k) => (
                            <span
                              key={k}
                              className="tag"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-elevated px-5 py-3">
                  <p className="text-sm text-umber whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-linen border border-stone">
                <User className="h-4 w-4 text-clay/50" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-forest to-moss shadow-sm">
              <Sparkles className="h-4 w-4 text-parchment animate-pulse" />
            </div>
            <div className="card-elevated px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-clay/40">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-stone pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about activities for your family..."
              disabled={loading}
              className="h-12 rounded-[4px] border-stone bg-linen pr-4 pl-4 text-sm shadow-sm focus:border-moss focus:shadow-md transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary h-12 w-12 !p-0 justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
