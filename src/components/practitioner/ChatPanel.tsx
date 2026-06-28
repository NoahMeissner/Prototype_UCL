"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Info, Send } from "lucide-react";
import { buildChatContext } from "@/lib/intake/context";
import { chatCopy } from "@/lib/intake/copy";
import { ChatMessage, IntakeContext, SourceCitation } from "@/lib/intake/schemas";
import { ChatProvider, createChatMessageId, stubChatProvider } from "@/lib/intake/chat";
import ChatEmptyState from "./ChatEmptyState";
import ClinicalAnswerCard from "./ClinicalAnswerCard";
import PdfFullscreenDialog from "./PdfFullscreenDialog";

interface ChatPanelProps {
  intakeContext: IntakeContext;
  provider?: ChatProvider;
  questionnaireSlot?: ReactNode;
  isQuestionnaireComplete?: boolean;
}

export default function ChatPanel({
  intakeContext,
  provider = stubChatProvider,
  questionnaireSlot,
  isQuestionnaireComplete = false,
}: ChatPanelProps) {
  const chatContext = buildChatContext(intakeContext);
  const isGeneral = chatContext.common.topicClass === "general";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [fullscreenSource, setFullscreenSource] = useState<SourceCitation | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasConversation = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isQuestionnaireComplete) setIsQuestionnaireOpen(false);
  }, [isQuestionnaireComplete]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { id: createChatMessageId("user"), role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const assistantMessage = await provider({ context: chatContext, messages: nextMessages });
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("Die Nachricht konnte nicht verarbeitet werden.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectPrompt(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  return (
    <section className="surface-enter flex h-full min-h-[680px] flex-col overflow-hidden bg-white xl:min-h-0">
      <header className={["bg-white p-4 transition-all sm:p-5", hasConversation ? "sm:p-4" : ""].join(" ")}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            {isGeneral ? chatCopy.generalEyebrow : chatCopy.mdroEyebrow}
          </p>
          <h1
            className={[
              "mt-2 font-semibold tracking-tight text-zinc-950 transition-all",
              hasConversation ? "text-xl" : "text-2xl",
            ].join(" ")}
          >
            {chatCopy.title}
          </h1>
          {!hasConversation && (
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {isGeneral ? chatCopy.generalIntro : chatCopy.mdroIntro}
            </p>
          )}
        </div>
        {!questionnaireSlot && (
          <div className={["transition-all", hasConversation ? "mt-3" : "mt-4"].join(" ")}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {isGeneral ? "Anfrage" : "Übernommener Fallkontext"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {chatContext.summary.map((chip) => (
                <span
                  key={chip}
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    isGeneral ? "bg-zinc-100 text-zinc-700" : "bg-teal-50 text-teal-950",
                  ].join(" ")}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}
        {!hasConversation && (
          <div className="mt-3 flex max-w-3xl gap-2 rounded-md bg-teal-50/60 px-3 py-2 text-xs font-medium leading-5 text-teal-950">
            <Info className="mt-0.5 size-3.5 shrink-0 text-teal-700" aria-hidden="true" />
            <p>{chatCopy.prototypeNotice}</p>
          </div>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/25 p-4 sm:p-5">
        {messages.length === 0 && (
          <ChatEmptyState isGeneral={isGeneral} onSelectPrompt={selectPrompt} />
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "user" ? (
              <div className="max-w-[86%] rounded-lg bg-zinc-950 px-4 py-2.5 text-sm leading-6 text-white">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ) : (
              <ClinicalAnswerCard
                message={message}
                onOpenFullscreen={setFullscreenSource}
              />
            )}
          </div>
        ))}
        {isLoading && <p className="text-sm text-zinc-500">{chatCopy.loading}</p>}
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-200 bg-white">
        {questionnaireSlot && !isQuestionnaireOpen && (
          <>
            <div className="flex items-center px-4 py-2.5 sm:px-5">
              {isQuestionnaireComplete ? (
                questionnaireSlot
              ) : (
                <button
                  type="button"
                  onClick={() => setIsQuestionnaireOpen(true)}
                  className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                >
                  MDRO/MRE-Fall erfassen
                </button>
              )}
            </div>
            <div className="border-t border-zinc-100" />
          </>
        )}
        {questionnaireSlot && isQuestionnaireOpen && !isQuestionnaireComplete ? (
          <div className="p-4 sm:p-5">
            {questionnaireSlot}
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-stretch gap-3 p-4 sm:p-5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                className="h-16 flex-1 resize-none rounded-md border border-zinc-300 bg-white px-3 py-4 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder={chatCopy.inputPlaceholder}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-16 shrink-0 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 text-sm font-semibold leading-none text-white transition hover:border-teal-800 hover:bg-teal-800 active:translate-y-px disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 sm:min-w-32"
                aria-label={chatCopy.send}
              >
                <span className="hidden sm:inline">{isLoading ? chatCopy.sending : chatCopy.send}</span>
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </div>

      <PdfFullscreenDialog
        source={fullscreenSource}
        open={Boolean(fullscreenSource)}
        onOpenChange={(open) => {
          if (!open) setFullscreenSource(null);
        }}
      />
    </section>
  );
}
