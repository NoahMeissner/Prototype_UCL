"use client";

import { useEffect, useRef, useState } from "react";
import { OPTION_LABELS, getActiveSteps } from "@/lib/graph";
import { Message, StepId, WizardState } from "@/lib/types";
import descriptions from "@/lib/descriptions.json";

interface ChatViewProps {
  state: WizardState;
  onReset: () => void;
}

export default function ChatView({ state, onReset }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const activeSteps = getActiveSteps(state.selections) as StepId[];
  const contextChips = activeSteps.flatMap((stepId) =>
    (state.selections[stepId] ?? []).map((key) => {
      const base = OPTION_LABELS[key] ?? key;
      const ft = state.freitextValues[`${stepId}-${key}`];
      return ft ? `${base}: ${ft}` : base;
    })
  );

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hygiene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: state.selections,
          freitextValues: state.freitextValues,
          messages: next,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setError("The message could not be sent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden w-full max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Hygiene Assistant
          </span>
          <button
            onClick={onReset}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            ← Edit context
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {contextChips.map((chip, i) => (
            <span
              key={i}
              className="text-xs bg-zinc-100 rounded-full px-2.5 py-0.5 text-zinc-600"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100 mb-4 shrink-0" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="pt-6 space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              {descriptions.chat}
            </p>
            <p className="text-sm text-zinc-300 text-center pt-2">
              Ask your first question below.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-100 shadow-sm text-zinc-700",
              ].join(" ")}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center h-3.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 pt-4 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-zinc-900 text-white rounded-xl px-4 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-end py-2.5 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
