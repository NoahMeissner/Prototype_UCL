"use client";

import { useState } from "react";
import {
  getActiveSteps,
  getOptionsForStep,
  getStep3Options,
  getStepData,
} from "@/lib/graph";
import { StepId, WizardState } from "@/lib/types";
import StepCard from "./StepCard";
import ChatView from "./ChatView";
import descriptions from "@/lib/descriptions.json";
import notes from "@/lib/notes.json";

const INITIAL_STATE: WizardState = {
  currentStep: 1,
  selections: {},
  freitextValues: {},
};

export default function HygieneWizard() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [inChat, setInChat] = useState(false);

  const activeSteps = getActiveSteps(state.selections);
  const currentIndex = activeSteps.indexOf(state.currentStep);
  const totalSteps = activeSteps.length;
  const isLastStep = currentIndex === totalSteps - 1;

  const step2 = state.selections[2] ?? [];
  const currentOptions = getOptionsForStep(state.currentStep, step2);
  const currentSelections = state.selections[state.currentStep] ?? [];

  const canProceed = (() => {
    if (currentSelections.length === 0) return false;
    for (const opt of currentOptions) {
      if (opt.hasFreitext && currentSelections.includes(opt.key)) {
        const val = state.freitextValues[`${state.currentStep}-${opt.key}`] ?? "";
        if (!val.trim()) return false;
      }
    }
    return true;
  })();

  const currentNote = inChat
    ? notes.steps.chat
    : notes.steps[String(state.currentStep) as keyof typeof notes.steps];

  function handleToggle(key: string) {
    setState((prev) => {
      const current = prev.selections[prev.currentStep] ?? [];
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];

      let newFreitextValues = { ...prev.freitextValues };
      if (!next.includes(key) && key === "freitext") {
        delete newFreitextValues[`${prev.currentStep}-${key}`];
      }

      let newSelections = { ...prev.selections, [prev.currentStep]: next };
      if (prev.currentStep === 1 || prev.currentStep === 2) {
        delete newSelections[3];
        const newFT: Record<string, string> = {};
        for (const [k, v] of Object.entries(newFreitextValues)) {
          if (!k.startsWith("3-")) newFT[k] = v;
        }
        newFreitextValues = newFT;
      }

      return { ...prev, selections: newSelections, freitextValues: newFreitextValues };
    });
  }

  function handleFreitext(key: string, value: string) {
    setState((prev) => ({
      ...prev,
      freitextValues: {
        ...prev.freitextValues,
        [`${prev.currentStep}-${key}`]: value,
      },
    }));
  }

  function handleNext() {
    if (!canProceed) return;
    if (isLastStep) {
      setInChat(true);
      return;
    }
    setDirection("forward");
    const nextStep = activeSteps[currentIndex + 1];
    setState((prev) => ({ ...prev, currentStep: nextStep }));
  }

  function handleBack() {
    if (currentIndex === 0) return;
    setDirection("back");
    const prevStep = activeSteps[currentIndex - 1];
    setState((prev) => ({ ...prev, currentStep: prevStep }));
  }

  function handleReset() {
    setState(INITIAL_STATE);
    setInChat(false);
    setDirection("forward");
  }

  const stepData = inChat ? null : getStepData(state.currentStep);
  const stepOptions = inChat
    ? []
    : state.currentStep === 3
    ? getStep3Options(step2)
    : stepData!.options;
  const displayStepNum = currentIndex + 1;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Main content */}
      {inChat ? (
        <ChatView state={state} onReset={handleReset} />
      ) : (
        <div className="flex flex-1 items-center justify-center overflow-y-auto py-12 px-4">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Hygiene Assistant
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {activeSteps.map((stepId, i) => (
                  <div
                    key={stepId}
                    className={[
                      "h-1 rounded-full transition-all duration-300",
                      i === currentIndex
                        ? "w-6 bg-zinc-900"
                        : i < currentIndex
                        ? "w-3 bg-zinc-400"
                        : "w-3 bg-zinc-200",
                    ].join(" ")}
                  />
                ))}
                <span className="ml-2 text-xs text-zinc-400">
                  {displayStepNum} / {totalSteps}
                </span>
              </div>
            </div>

            {/* Step card */}
            <div
              key={state.currentStep}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 mb-6"
              style={{
                animation: `${direction === "forward" ? "slideInForward" : "slideInBack"} 200ms ease-out`,
              }}
            >
              <StepCard
                question={stepData!.question}
                hint={stepData!.hint}
                description={descriptions.steps[String(state.currentStep) as keyof typeof descriptions.steps]}
                options={stepOptions}
                stepId={state.currentStep}
                selectedKeys={currentSelections}
                freitextValues={state.freitextValues}
                onToggle={handleToggle}
                onFreitext={handleFreitext}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-0 cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-zinc-900 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLastStep ? "Continue" : "Next"}
              </button>
            </div>

            {/* Multi-select hint */}
            <p className="text-center text-xs text-zinc-300 mt-4">
              Multiple selection possible
            </p>
          </div>
        </div>
      )}

      {/* Design note */}
      {currentNote && (
        <div className="shrink-0 border-t-2 border-red-200 bg-red-50 px-6 py-4">
          <p className="text-xs text-red-500 max-w-xl mx-auto leading-relaxed">
            <span className="font-semibold">Design note: </span>
            {currentNote}
          </p>
        </div>
      )}
    </div>
  );
}
