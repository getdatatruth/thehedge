'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Send, Sparkles, User, Crown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  isFreeUser?: boolean;
}

const EXAMPLE_PROMPTS = [
  'What could we do this afternoon?',
  "We're stuck indoors on a rainy day",
  'Something calm before bedtime',
  'How does Tusla home-ed registration work?',
  'A science idea with kitchen supplies',
];

export function ChatInterface({ context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [limitReached, setLimitReached] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, streaming]);

  async function handleSubmit(prompt?: string) {
    const text = (prompt || input).trim();
    if (!text || streaming || limitReached) return;

    setInput('');
    setLimitReached(null);

    // Build the full history (including this new turn) to send to the model.
    const history: Message[] = [...messages, { role: 'user', content: text }];
    // Add the user turn plus an empty assistant turn we'll stream tokens into.
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
      });

      if (!res.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const data = await res.json();
          message = data?.error?.message || message;
        } catch {
          // non-JSON error body, keep the default
        }

        if (res.status === 402) {
          setLimitReached(message);
          // Drop the empty assistant placeholder, keep the user's message.
          setMessages(history);
        } else {
          setMessages([...history, { role: 'assistant', content: message }]);
        }
        return;
      }

      if (!res.body) {
        setMessages([
          ...history,
          { role: 'assistant', content: 'Sorry, I lost my train of thought. Please try again.' },
        ]);
        return;
      }

      // Stream tokens into the last (assistant) message as they arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const current = acc;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: current };
          return next;
        });
      }

      if (!acc.trim()) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: "Sorry, I didn't quite catch that. Could you ask again?",
          };
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: "Sorry, I couldn't connect. Please try again.",
        };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  // The last message is "pending" if it's an empty assistant bubble mid-stream.
  const lastMsg = messages[messages.length - 1];
  const awaitingFirstToken =
    streaming && lastMsg?.role === 'assistant' && lastMsg.content === '';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">HedgeAI</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          Ask <em className="text-moss italic">The Hedge</em>
        </h1>
        <p className="text-clay mt-2 text-lg leading-relaxed">
          A calm companion for family learning and home education.
          {context.children.length > 0 && (
            <span className="text-moss">
              {' '}I know about{' '}
              {context.children.map((c) => `${c.name} (${c.age})`).join(', ')}.
            </span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-10 animate-fade-up">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss shadow-lg shadow-forest/20">
                <Sparkles className="h-8 w-8 text-parchment" />
              </div>
              <h2 className="text-2xl font-bold text-ink">
                What&apos;s on your <em className="text-moss italic">mind</em>?
              </h2>
              <p className="text-sm text-clay/60 mt-3 max-w-sm mx-auto leading-relaxed">
                Ask me anything about activities, your day, or home education. I&apos;ll
                remember our conversation as we go.
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

        {messages.map((msg, i) => {
          // Skip rendering the empty assistant placeholder; show dots instead.
          if (msg.role === 'assistant' && msg.content === '' && i === messages.length - 1) {
            return null;
          }
          return (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss shadow-sm">
                  <Sparkles className="h-4 w-4 text-parchment" />
                </div>
              )}
              <div
                className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-tr-sm bg-gradient-to-br from-forest to-moss text-parchment px-5 py-3 shadow-sm'
                    : ''
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="card-elevated px-5 py-3">
                    <p className="text-sm text-umber whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                      {streaming && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-moss/50 animate-pulse" />
                      )}
                    </p>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-linen border border-stone">
                  <User className="h-4 w-4 text-clay/50" />
                </div>
              )}
            </div>
          );
        })}

        {awaitingFirstToken && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss shadow-sm">
              <Sparkles className="h-4 w-4 text-parchment animate-pulse" />
            </div>
            <div className="card-elevated px-5 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-moss/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-stone pt-4">
        {limitReached ? (
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber/5 via-amber/8 to-amber/5 border border-amber/15 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/10">
              <Crown className="h-5 w-5 text-amber" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{limitReached}</p>
              <p className="text-[12px] text-clay/60 mt-0.5">
                Upgrade to keep chatting with The Hedge.
              </p>
            </div>
            <Link href="/settings/billing?upgrade=family" className="btn-primary text-sm shrink-0">
              Upgrade
            </Link>
          </div>
        ) : (
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
                placeholder="Ask The Hedge anything..."
                disabled={streaming}
                className="h-12 rounded-[4px] border-stone bg-linen pr-4 pl-4 text-sm shadow-sm focus:border-moss focus:shadow-md transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="btn-primary h-12 w-12 !p-0 justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
