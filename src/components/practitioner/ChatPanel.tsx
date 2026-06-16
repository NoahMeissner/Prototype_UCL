"use client";

import { FormEvent, UIEvent, useEffect, useMemo, useRef, useState } from "react";
import { Info, Send } from "lucide-react";
import { buildChatContext } from "@/lib/intake/context";
import { chatCopy } from "@/lib/intake/copy";
import { buildEvidenceGroups, findEvidenceSource } from "@/lib/intake/evidence";
import { ChatMessage, IntakeContext } from "@/lib/intake/schemas";
import { ChatProvider, createChatMessageId, stubChatProvider } from "@/lib/intake/chat";
import ChatEmptyState from "./ChatEmptyState";
import ClinicalAnswerCard from "./ClinicalAnswerCard";
import EvidenceLibrary from "./EvidenceLibrary";
import MobileEvidenceDialog from "./MobileEvidenceDialog";
import PdfFullscreenDialog from "./PdfFullscreenDialog";

interface ChatPanelProps {
  intakeContext: IntakeContext;
  onReset: () => void;
  provider?: ChatProvider;
}

export default function ChatPanel({
  intakeContext,
  onReset,
  provider = stubChatProvider,
}: ChatPanelProps) {
  const chatContext = buildChatContext(intakeContext);
  const isGeneral = chatContext.common.topicClass === "general";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(true);
  const [isMobileEvidenceOpen, setIsMobileEvidenceOpen] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [fullscreenSourceId, setFullscreenSourceId] = useState<string | null>(null);
  const [autoScrollEvidenceGroup, setAutoScrollEvidenceGroup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const evidenceScrollRef = useRef<HTMLDivElement | null>(null);
  const previousEvidenceCountRef = useRef(0);
  const scrollOriginRef = useRef<"chat" | "evidence" | "programmatic" | null>(null);
  const scrollOriginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConversation = messages.length > 0;
  const evidenceGroups = useMemo(() => buildEvidenceGroups(messages), [messages]);
  const selectedEvidence = findEvidenceSource(evidenceGroups, selectedSourceId);
  const fullscreenEvidence = findEvidenceSource(evidenceGroups, fullscreenSourceId);
  const selectedGroup =
    evidenceGroups.find((group) => group.answerMessageId === selectedAnswerId) ??
    selectedEvidence?.group ??
    evidenceGroups.at(-1) ??
    null;
  const hasEvidence = evidenceGroups.length > 0;

  useEffect(() => {
    const latestGroup = evidenceGroups.at(-1);
    if (!latestGroup) return;
    if (evidenceGroups.length > previousEvidenceCountRef.current) {
      setSelectedAnswerId(latestGroup.answerMessageId);
      setSelectedSourceId(latestGroup.sources[0]?.id ?? null);
      setIsEvidenceOpen(true);
    }
    previousEvidenceCountRef.current = evidenceGroups.length;
  }, [evidenceGroups]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (scrollOriginTimeoutRef.current) clearTimeout(scrollOriginTimeoutRef.current);
    };
  }, []);

  function setScrollOrigin(origin: "chat" | "evidence" | "programmatic") {
    scrollOriginRef.current = origin;
    if (scrollOriginTimeoutRef.current) clearTimeout(scrollOriginTimeoutRef.current);
    scrollOriginTimeoutRef.current = setTimeout(() => {
      if (scrollOriginRef.current === origin) scrollOriginRef.current = null;
    }, origin === "programmatic" ? 350 : 180);
  }

  function visibleAnswerIdFromScroll(root: HTMLDivElement) {
    const rootRect = root.getBoundingClientRect();
    const centerY = rootRect.top + rootRect.height / 2;
    const answers = [...root.querySelectorAll<HTMLElement>("[data-answer-id]")];
    const containing = answers.find((answer) => {
      const rect = answer.getBoundingClientRect();
      return rect.top <= centerY && rect.bottom >= centerY;
    });
    if (containing) return containing.getAttribute("data-answer-id");

    const closest = answers
      .map((answer) => {
        const rect = answer.getBoundingClientRect();
        return {
          id: answer.getAttribute("data-answer-id"),
          distance: Math.abs(rect.top + rect.height / 2 - centerY),
        };
      })
      .sort((first, second) => first.distance - second.distance)[0];

    return closest?.id ?? null;
  }

  function handleChatScroll(event: UIEvent<HTMLDivElement>) {
    if (scrollOriginRef.current === "programmatic") return;
    setScrollOrigin("chat");
    const answerMessageId = visibleAnswerIdFromScroll(event.currentTarget);
    if (!answerMessageId) return;
    setSelectedAnswerId(answerMessageId);
    setSelectedSourceId(null);
    setAutoScrollEvidenceGroup(true);
    setScrollOrigin("programmatic");
  }

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

  function openEvidence(answerMessageId: string) {
    setSelectedAnswerId(answerMessageId);
    setIsEvidenceOpen(true);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      setIsMobileEvidenceOpen(true);
    }
  }

  function selectSource(sourceId: string, answerMessageId: string) {
    setScrollOrigin("programmatic");
    setAutoScrollEvidenceGroup(false);
    setSelectedSourceId(sourceId);
    openEvidence(answerMessageId);
  }

  function jumpToAnswer(answerMessageId: string) {
    setScrollOrigin("programmatic");
    setAutoScrollEvidenceGroup(false);
    document.getElementById(`answer-${answerMessageId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
    setSelectedAnswerId(answerMessageId);
  }

  function visibleEvidenceGroupChanged(answerMessageId: string) {
    if (scrollOriginRef.current !== "evidence") return;
    setAutoScrollEvidenceGroup(false);
    setSelectedAnswerId(answerMessageId);
    setSelectedSourceId(null);
    setScrollOrigin("programmatic");
    document.getElementById(`answer-${answerMessageId}`)?.scrollIntoView({
      block: "center",
      behavior: "auto",
    });
  }

  return (
    <section
      className={[
        "surface-enter flex h-full min-h-[680px] flex-col overflow-hidden bg-white xl:min-h-0",
      ].join(" ")}
    >
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className={["bg-white p-4 transition-all sm:p-5", hasConversation ? "sm:p-4" : ""].join(" ")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              <button
                type="button"
                onClick={onReset}
                className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 active:translate-y-px"
              >
                {chatCopy.editContext}
              </button>
            </div>
            <div
              className={[
                "transition-all",
                hasConversation ? "mt-3" : "mt-4",
              ].join(" ")}
            >
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
            {!hasConversation && (
              <div className="mt-3 flex max-w-3xl gap-2 rounded-md bg-teal-50/60 px-3 py-2 text-xs font-medium leading-5 text-teal-950">
                <Info className="mt-0.5 size-3.5 shrink-0 text-teal-700" aria-hidden="true" />
                <p>{chatCopy.prototypeNotice}</p>
              </div>
            )}
          </header>
          <div
            ref={chatScrollRef}
            data-chat-scroll
            onScroll={handleChatScroll}
            className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/25 p-4 sm:p-5"
          >
            {messages.length === 0 && (
              <ChatEmptyState isGeneral={isGeneral} onSelectPrompt={selectPrompt} />
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                data-answer-id={message.role === "assistant" ? message.id : undefined}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "user" ? (
                  <div className="max-w-[86%] rounded-lg bg-zinc-950 px-4 py-2.5 text-sm leading-6 text-white">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <ClinicalAnswerCard
                    message={message}
                    isEvidenceActive={message.id === selectedAnswerId}
                    selectedSourceId={selectedSourceId}
                    onSelectSource={selectSource}
                    onOpenEvidence={openEvidence}
                  />
                )}
              </div>
            ))}
            {isLoading && <p className="text-sm text-zinc-500">{chatCopy.loading}</p>}
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="border-t border-zinc-200 bg-white p-4 sm:p-5">
            <div className="flex items-stretch gap-3">
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
        </div>

        {hasEvidence && isEvidenceOpen && (
          <EvidenceLibrary
            groups={evidenceGroups}
            selectedAnswerId={selectedAnswerId}
            selectedSourceId={selectedSourceId}
            onSelectSource={selectSource}
            onOpenFullscreen={(source) => setFullscreenSourceId(source.id)}
            onJumpToAnswer={jumpToAnswer}
            onVisibleGroupChange={visibleEvidenceGroupChanged}
            onScrollArea={() => {
              if (scrollOriginRef.current !== "programmatic") setScrollOrigin("evidence");
            }}
            autoScrollActiveGroup={autoScrollEvidenceGroup}
            scrollContainerRef={evidenceScrollRef}
            onClose={() => setIsEvidenceOpen(false)}
            className="hidden xl:flex"
          />
        )}
      </div>

      <MobileEvidenceDialog
        open={isMobileEvidenceOpen}
        onOpenChange={setIsMobileEvidenceOpen}
        group={selectedGroup}
        selectedSourceId={selectedSourceId}
        onSelectSource={selectSource}
        onOpenFullscreen={(source) => setFullscreenSourceId(source.id)}
        onJumpToAnswer={jumpToAnswer}
      />
      <PdfFullscreenDialog
        source={fullscreenEvidence?.source ?? null}
        open={Boolean(fullscreenSourceId)}
        onOpenChange={(open) => {
          if (!open) setFullscreenSourceId(null);
        }}
      />
    </section>
  );
}
