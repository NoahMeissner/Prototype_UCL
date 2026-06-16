"use client";

import { useState } from "react";
import { useMachine } from "@xstate/react";
import { RotateCcw } from "lucide-react";
import { createGeneralIntakeContext } from "@/lib/intake/context";
import { intakeMachine } from "@/lib/intake/machine";
import {
  bodyLocationLabels,
  carriageLabels,
  contextLabels,
  organismLabels,
  patientStatusLabels,
  questions,
} from "@/lib/intake/copy";
import ChatPanel from "./ChatPanel";
import EntryScreen from "./EntryScreen";
import ExitScreen from "./ExitScreen";
import OtherContextStep from "./OtherContextStep";
import QuestionStep, { NonEmptyChoices } from "./QuestionStep";

function createChoices<TValue extends string>(
  values: readonly [TValue, ...TValue[]],
  labelFor: Record<TValue, string>
): NonEmptyChoices<TValue> {
  const toChoice = (value: TValue) => ({
    id: value,
    value,
    label: labelFor[value],
    tone: value === "unknown" ? ("caution" as const) : ("default" as const),
  });
  const [first, ...rest] = values;
  return [toChoice(first), ...rest.map(toChoice)];
}

const organismChoices = createChoices(["mrsa", "vre", "3mrgn", "4mrgn", "unknown"], organismLabels);

const carriageChoices = createChoices(["colonization", "infection", "unknown"], carriageLabels);

const patientStatusChoices = createChoices(["confirmed", "suspected", "contact", "unknown"], patientStatusLabels);

const bodyLocationChoices = createChoices(["airway", "wound", "urinary", "stool", "skin", "unknown"], bodyLocationLabels);

const careContextChoices = createChoices(
  ["screening", "wound_care", "transport", "room_isolation", "ppe", "ward_routine", "other"],
  contextLabels
);

type RedFlagRisk = "yes" | "no" | "unknown";

const redFlagChoices: NonEmptyChoices<RedFlagRisk> = [
  { id: "red-flag-no", value: "no", label: "Nein" },
  { id: "red-flag-yes", value: "yes", label: "Ja" },
  { id: "red-flag-unknown", value: "unknown", label: "Nicht sicher", tone: "caution" },
];

const stepLabels: Record<string, string> = {
  organism: "Erregergruppe",
  redFlag: "4MRGN-Risiko",
  patientStatus: "Infektionsstatus",
  carriage: "Befundstatus",
  bodyLocation: "Lokalisation",
  careContext: "Versorgungskontext",
  otherContext: "Freitext",
};

function Progress({ value, includesRedFlag }: { value: unknown; includesRedFlag: boolean }) {
  const state = String(value);
  const order = includesRedFlag
    ? ["organism", "redFlag", "patientStatus", "carriage", "bodyLocation", "careContext", "otherContext"]
    : ["organism", "patientStatus", "carriage", "bodyLocation", "careContext", "otherContext"];
  const activeIndex = Math.max(0, order.includes(state) ? order.indexOf(state) : order.length - 1);
  const total = order.length - (state === "otherContext" ? 0 : 1);
  const displayedTotal = state === "otherContext" ? order.length : total;
  const label = stepLabels[state] ?? "Erfassung";
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-zinc-600">
        Schritt {activeIndex + 1} von {displayedTotal} · {label}
      </p>
      <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
        {order.slice(0, displayedTotal).map((step, stepIndex) => (
          <span
            key={step}
            className={[
              "h-1 rounded-full transition-all duration-200",
              stepIndex <= activeIndex ? "w-8 bg-teal-700" : "w-4 bg-zinc-300",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

type PractitionerMode = "entry" | "mdro" | "general";

export default function HygieneAssistant() {
  const [snapshot, send] = useMachine(intakeMachine);
  const [mode, setMode] = useState<PractitionerMode>("entry");
  const stateValue = String(snapshot.value);
  const context = snapshot.context;
  const includesRedFlag = context.mdro.organism === "4mrgn" || stateValue === "redFlag";
  const isChatSurface = mode === "general" || (mode === "mdro" && stateValue === "chatReady");

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
            <div className="flex items-center gap-3">
              {mode === "mdro" && stateValue !== "chatReady" && (
                <Progress value={snapshot.value} includesRedFlag={includesRedFlag} />
              )}
              {mode !== "entry" && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-500"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Auswahl ändern
                </button>
              )}
            </div>
          </div>
        </header>

        <div className={isChatSurface ? "min-h-0 flex-1" : "mx-auto w-full max-w-3xl"}>
          {mode === "entry" && <EntryScreen onSelectMdro={startMdro} onSelectGeneral={startGeneral} />}

          {mode === "general" && <ChatPanel intakeContext={createGeneralIntakeContext()} onReset={reset} />}

          {mode === "mdro" && stateValue === "organism" && (
            <QuestionStep
              eyebrow={questions.organism.eyebrow}
              title={questions.organism.title}
              hint={questions.organism.hint}
              choices={organismChoices}
              onSubmit={(value) => send({ type: "SELECT_ORGANISM", organism: value })}
            />
          )}

          {mode === "mdro" && stateValue === "redFlag" && (
            <QuestionStep
              eyebrow={questions.redFlag.eyebrow}
              title={questions.redFlag.title}
              hint={questions.redFlag.hint}
              choices={redFlagChoices}
              onSubmit={(value) => send({ type: "SELECT_RED_FLAG_RISK", risk: value })}
            />
          )}

          {mode === "mdro" && stateValue === "patientStatus" && (
            <QuestionStep
              eyebrow={questions.patientStatus.eyebrow}
              title={questions.patientStatus.title}
              hint={questions.patientStatus.hint}
              choices={patientStatusChoices}
              onSubmit={(value) => send({ type: "SELECT_PATIENT_STATUS", status: value })}
            />
          )}

          {mode === "mdro" && stateValue === "carriage" && (
            <QuestionStep
              eyebrow={questions.carriage.eyebrow}
              title={questions.carriage.title}
              hint={questions.carriage.hint}
              choices={carriageChoices}
              onSubmit={(value) => send({ type: "SELECT_CARRIAGE_STATUS", status: value })}
            />
          )}

          {mode === "mdro" && stateValue === "bodyLocation" && (
            <QuestionStep
              eyebrow={questions.bodyLocation.eyebrow}
              title={questions.bodyLocation.title}
              hint={questions.bodyLocation.hint}
              choices={bodyLocationChoices}
              onSubmit={(value) => send({ type: "SELECT_BODY_LOCATION", location: value })}
            />
          )}

          {mode === "mdro" && stateValue === "careContext" && (
            <QuestionStep
              eyebrow={questions.careContext.eyebrow}
              title={questions.careContext.title}
              hint={questions.careContext.hint}
              choices={careContextChoices}
              onSubmit={(value) => send({ type: "SELECT_CARE_CONTEXT", context: value })}
            />
          )}

          {mode === "mdro" && stateValue === "otherContext" && (
            <OtherContextStep onSubmit={(text) => send({ type: "ENTER_OTHER_CONTEXT", text })} />
          )}

          {mode === "mdro" && stateValue === "chatReady" && <ChatPanel intakeContext={context} onReset={reset} />}

          {mode === "mdro" && context.common.terminalTarget && stateValue !== "chatReady" && (
            <ExitScreen target={context.common.terminalTarget} onReset={reset} />
          )}
        </div>
      </div>
    </main>
  );
}
