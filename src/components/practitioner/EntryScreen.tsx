"use client";

import { ArrowRight, ClipboardList, MessageSquareText } from "lucide-react";
import { entryChoices, questions } from "@/lib/intake/copy";

interface EntryScreenProps {
  onSelectMdro: () => void;
  onSelectGeneral: () => void;
}

export default function EntryScreen({ onSelectMdro, onSelectGeneral }: EntryScreenProps) {
  return (
    <section className="surface-enter overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-l-4 border-teal-700 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {questions.entry.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{questions.entry.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{questions.entry.hint}</p>
      </div>

      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSelectMdro}
          className="choice-motion group flex min-h-44 flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 text-left transition duration-150 hover:border-teal-700 hover:bg-teal-50/60"
        >
          <span>
            <span className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
              <ClipboardList className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-4 block text-base font-semibold text-zinc-950">{entryChoices.mdro.title}</span>
            <span className="mt-2 block text-sm leading-6 text-zinc-600">{entryChoices.mdro.description}</span>
          </span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
            Strukturierte Erfassung starten
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          onClick={onSelectGeneral}
          className="choice-motion group flex min-h-44 flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 text-left transition duration-150 hover:border-teal-700 hover:bg-teal-50/60"
        >
          <span>
            <span className="flex size-10 items-center justify-center rounded-md bg-zinc-950 text-white">
              <MessageSquareText className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-4 block text-base font-semibold text-zinc-950">{entryChoices.general.title}</span>
            <span className="mt-2 block text-sm leading-6 text-zinc-600">{entryChoices.general.description}</span>
          </span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
            Frage stellen
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
}
