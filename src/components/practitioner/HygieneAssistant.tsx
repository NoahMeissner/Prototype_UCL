"use client";

import { useState } from "react";
import { useMachine } from "@xstate/react";
import { createGeneralIntakeContext } from "@/lib/intake/context";
import { intakeMachine } from "@/lib/intake/machine";
import ChatPanel from "./ChatPanel";
import EntryScreen from "./EntryScreen";
import ExitScreen from "./ExitScreen";
import InlineChatQuestionnaire from "./InlineChatQuestionnaire";

type PractitionerMode = "entry" | "mdro" | "general";

export default function HygieneAssistant() {
  const [snapshot, send] = useMachine(intakeMachine);
  const [mode, setMode] = useState<PractitionerMode>("mdro");
  const stateValue = String(snapshot.value);
  const context = snapshot.context;
  const includesRedFlag = context.mdro.organism === "4mrgn" || stateValue === "redFlag";
  const isMdroChat = mode === "mdro" && !context.common.terminalTarget;
  const isChatSurface = mode === "general" || isMdroChat;

  function reset() {
    send({ type: "RESET" });
    setMode("entry");
  }

  function startMdro() {
    send({ type: "RESET" });
    setMode("mdro");
  }

  function startGeneral() {
    setMode("general");
  }

  return (
    <main className={isChatSurface ? "h-screen overflow-hidden bg-[#f4f6f5] text-zinc-950" : "min-h-screen bg-[#f4f6f5] text-zinc-950"}>
      <div
        className={
          isChatSurface
            ? "flex h-screen w-full flex-col"
            : "mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8"
        }
      >
        <header
          className={
            isChatSurface
              ? "shrink-0 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6"
              : "mb-6 border-b border-zinc-200 pb-5"
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">ASEPSIS</p>
              <h1
                className={[
                  "mt-2 font-semibold tracking-tight",
                  isChatSurface ? "text-xl" : "text-3xl",
                ].join(" ")}
              >
                Hygiene-Assistent
              </h1>
              {!isChatSurface && (
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                  Strukturierter MDRO/MRE-Einstieg oder direkte Hygienefrage.
                </p>
              )}
            </div>
          </div>
        </header>

        <div className={isChatSurface ? "min-h-0 flex-1" : "mx-auto w-full max-w-3xl"}>
          {mode === "entry" && <EntryScreen onSelectMdro={startMdro} onSelectGeneral={startGeneral} />}

          {mode === "general" && <ChatPanel intakeContext={createGeneralIntakeContext()} />}

          {isMdroChat && (
            <ChatPanel
              intakeContext={context}
              isQuestionnaireComplete={stateValue === "chatReady"}
              questionnaireSlot={
                <InlineChatQuestionnaire
                  stateValue={stateValue}
                  context={context}
                  send={send}
                  includesRedFlag={includesRedFlag}
                  onDismiss={startGeneral}
                />
              }
            />
          )}

          {mode === "mdro" && context.common.terminalTarget && (
            <ExitScreen target={context.common.terminalTarget} onReset={reset} />
          )}
        </div>
      </div>
    </main>
  );
}
