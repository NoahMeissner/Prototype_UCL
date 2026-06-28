"use client";

import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { useState } from "react";
import { buildChatContext } from "@/lib/intake/context";
import {
  bodyLocationLabels,
  carriageLabels,
  contextLabels,
  organismLabels,
  patientStatusLabels,
  questions,
} from "@/lib/intake/copy";
import {
  BodyLocation,
  CareContext,
  CarriageStatus,
  IntakeContext,
  IntakeEvent,
  OrganismGroup,
  PatientStatus,
} from "@/lib/intake/schemas";

interface InlineChatQuestionnaireProps {
  stateValue: string;
  context: IntakeContext;
  send: (event: IntakeEvent) => void;
  includesRedFlag: boolean;
  onDismiss: () => void;
}

type StepChoice = { value: string; label: string; tone?: "caution" };

const CHOICES: Record<string, StepChoice[]> = {
  organism: [
    { value: "mrsa", label: "MRSA" },
    { value: "vre", label: "VRE" },
    { value: "3mrgn", label: "3MRGN" },
    { value: "4mrgn", label: "4MRGN" },
    { value: "unknown", label: organismLabels.unknown, tone: "caution" },
  ],
  redFlag: [
    { value: "no", label: "Nein" },
    { value: "yes", label: "Ja" },
    { value: "unknown", label: "Nicht sicher", tone: "caution" },
  ],
  patientStatus: [
    { value: "confirmed", label: patientStatusLabels.confirmed },
    { value: "suspected", label: patientStatusLabels.suspected },
    { value: "contact", label: patientStatusLabels.contact },
    { value: "unknown", label: patientStatusLabels.unknown, tone: "caution" },
  ],
  carriage: [
    { value: "colonization", label: carriageLabels.colonization },
    { value: "infection", label: carriageLabels.infection },
    { value: "unknown", label: carriageLabels.unknown, tone: "caution" },
  ],
  bodyLocation: [
    { value: "airway", label: bodyLocationLabels.airway },
    { value: "wound", label: bodyLocationLabels.wound },
    { value: "urinary", label: bodyLocationLabels.urinary },
    { value: "stool", label: bodyLocationLabels.stool },
    { value: "skin", label: bodyLocationLabels.skin },
    { value: "unknown", label: bodyLocationLabels.unknown, tone: "caution" },
  ],
  careContext: [
    { value: "screening", label: contextLabels.screening },
    { value: "wound_care", label: contextLabels.wound_care },
    { value: "transport", label: contextLabels.transport },
    { value: "room_isolation", label: contextLabels.room_isolation },
    { value: "ppe", label: contextLabels.ppe },
    { value: "ward_routine", label: contextLabels.ward_routine },
    { value: "other", label: contextLabels.other },
  ],
};

const QUESTION_TITLES: Record<string, string> = {
  organism: questions.organism.title,
  redFlag: questions.redFlag.title,
  patientStatus: questions.patientStatus.title,
  carriage: questions.carriage.title,
  bodyLocation: questions.bodyLocation.title,
  careContext: questions.careContext.title,
  otherContext: questions.otherContext.title,
};

function dispatchChoice(send: (e: IntakeEvent) => void, stateValue: string, value: string) {
  if (stateValue === "organism") send({ type: "SELECT_ORGANISM", organism: value as OrganismGroup });
  else if (stateValue === "redFlag") send({ type: "SELECT_RED_FLAG_RISK", risk: value as "yes" | "no" | "unknown" });
  else if (stateValue === "patientStatus") send({ type: "SELECT_PATIENT_STATUS", status: value as PatientStatus });
  else if (stateValue === "carriage") send({ type: "SELECT_CARRIAGE_STATUS", status: value as CarriageStatus });
  else if (stateValue === "bodyLocation") send({ type: "SELECT_BODY_LOCATION", location: value as BodyLocation });
  else if (stateValue === "careContext") send({ type: "SELECT_CARE_CONTEXT", context: value as CareContext });
}

export default function InlineChatQuestionnaire({
  stateValue,
  context,
  send,
  includesRedFlag,
  onDismiss,
}: InlineChatQuestionnaireProps) {
  const [otherText, setOtherText] = useState("");

  const order = includesRedFlag
    ? ["organism", "redFlag", "patientStatus", "carriage", "bodyLocation", "careContext", "otherContext"]
    : ["organism", "patientStatus", "carriage", "bodyLocation", "careContext", "otherContext"];
  const activeIndex = Math.max(0, order.includes(stateValue) ? order.indexOf(stateValue) : order.length - 1);
  const total = order.length - (stateValue === "otherContext" ? 0 : 1);
  const isFirstStep = stateValue === "organism";

  if (stateValue === "chatReady") {
    const chips = buildChatContext(context).summary;
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 shrink-0">
          Fallkontext
        </span>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-950"
            >
              {chip}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => send({ type: "RESET" })}
          className="ml-auto rounded p-1 text-zinc-400 transition hover:text-zinc-700"
          aria-label="Kontext zurücksetzen"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  const title = QUESTION_TITLES[stateValue] ?? "";

  const Header = (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-semibold leading-snug text-zinc-900">{title}</p>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-xs text-zinc-500 tabular-nums">
          {activeIndex + 1} von {total}
        </span>
        <button
          type="button"
          disabled={isFirstStep}
          onClick={() => send({ type: "BACK" })}
          className="rounded p-1 text-zinc-400 transition hover:text-zinc-700 disabled:opacity-25"
          aria-label="Zurück"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-zinc-400 transition hover:text-zinc-700"
          aria-label="Fragebogen schließen"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );

  if (stateValue === "otherContext") {
    const canSubmit = otherText.trim().length >= 3;
    return (
      <div className="space-y-2.5">
        {Header}
        <textarea
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          placeholder="Kurz beschreiben..."
        />
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => send({ type: "ENTER_OTHER_CONTEXT", text: otherText.trim() })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        >
          Weiter
          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  const choices = CHOICES[stateValue] ?? [];

  return (
    <div className="space-y-2">
      {Header}
      <div className="grid gap-1.5">
        {choices.map((choice, index) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => dispatchChoice(send, stateValue, choice.value)}
            className={[
              "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition active:scale-[0.99]",
              choice.tone === "caution"
                ? "border-amber-200 bg-white text-zinc-800 hover:border-amber-400 hover:bg-amber-50/60"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50",
            ].join(" ")}
          >
            <span
              className={[
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                choice.tone === "caution"
                  ? "border-amber-300 text-amber-600"
                  : "border-zinc-300 text-zinc-500",
              ].join(" ")}
            >
              {index + 1}
            </span>
            <span className="flex-1 font-medium">{choice.label}</span>
            <ArrowRight className="size-3.5 shrink-0 text-zinc-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
