"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { questions } from "@/lib/intake/copy";

interface OtherContextStepProps {
  onSubmit: (text: string) => void;
}

export default function OtherContextStep({ onSubmit }: OtherContextStepProps) {
  const [text, setText] = useState("");
  const canSubmit = text.trim().length >= 3;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(text.trim());
  }

  return (
    <form
      onSubmit={submit}
      className="surface-enter overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-l-4 border-teal-700 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {questions.otherContext.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          {questions.otherContext.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{questions.otherContext.hint}</p>
      </div>
      <div className="px-5 pb-5">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-700"
          placeholder="Kurz beschreiben..."
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="mx-5 mb-5 inline-flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      >
        Weiter
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
