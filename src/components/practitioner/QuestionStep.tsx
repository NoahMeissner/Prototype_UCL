"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export type Choice<TValue extends string = string> = {
  id: string;
  label: string;
  description?: string;
  tone?: "default" | "caution";
  value: TValue;
};

export type NonEmptyChoices<TValue extends string> = [Choice<TValue>, ...Choice<TValue>[]];

interface QuestionStepProps<TValue extends string> {
  eyebrow: string;
  title: string;
  hint?: string;
  choices: NonEmptyChoices<TValue>;
  submitLabel?: string;
  onSubmit: (value: TValue) => void;
}

export default function QuestionStep<TValue extends string>({
  eyebrow,
  title,
  hint,
  choices,
  submitLabel = "Weiter",
  onSubmit,
}: QuestionStepProps<TValue>) {
  const [selected, setSelected] = useState<TValue | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    onSubmit(selected);
  }

  return (
    <form
      onSubmit={submit}
      className="surface-enter overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-l-4 border-teal-700 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        {hint && <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{hint}</p>}
      </div>

      <div className="grid gap-2 px-5 pb-5">
        {choices.map((choice) => {
          const active = selected === choice.value;
          const isCaution = choice.tone === "caution";
          return (
            <label
              key={choice.id}
              className={[
                "choice-motion block cursor-pointer rounded-md border p-3 transition duration-150",
                active
                  ? isCaution
                    ? "border-amber-500 bg-amber-50 text-zinc-950 shadow-sm ring-1 ring-amber-500/30"
                    : "border-teal-700 bg-teal-50 text-zinc-950 shadow-sm ring-1 ring-teal-700/20"
                  : isCaution
                    ? "border-amber-200 bg-white text-zinc-800 hover:border-amber-400 hover:bg-amber-50/50"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50",
              ].join(" ")}
            >
              <input
                type="radio"
                name={eyebrow}
                value={choice.value}
                checked={active}
                onChange={() => setSelected(choice.value)}
                className="sr-only"
              />
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{choice.label}</span>
                  {choice.description && (
                    <span
                      className={[
                        "mt-1 block text-xs leading-5",
                        active ? (isCaution ? "text-amber-900/80" : "text-teal-900/70") : "text-zinc-500",
                      ].join(" ")}
                    >
                      {choice.description}
                    </span>
                  )}
                </span>
                <span
                  className={[
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? isCaution
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-teal-700 bg-teal-700 text-white"
                      : "border-zinc-300 text-transparent",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Check className="size-3.5" />
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className="mx-5 mb-5 inline-flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
