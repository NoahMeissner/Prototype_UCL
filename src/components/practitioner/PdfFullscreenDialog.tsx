"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, X } from "lucide-react";
import { sourceDisplayLabel, sourceDocumentTypeLabel } from "@/lib/intake/evidence";
import { SourceCitation } from "@/lib/intake/schemas";
import PdfPagePreview from "./PdfPagePreview";

interface PdfFullscreenDialogProps {
  source: SourceCitation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PdfFullscreenDialog({
  source,
  open,
  onOpenChange,
}: PdfFullscreenDialogProps) {
  const [maxWidth, setMaxWidth] = useState(820);

  if (!source) return null;

  const page = source.page ?? source.bbox?.page ?? source.bboxes?.[0]?.page;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white sm:inset-6 sm:rounded-lg sm:border sm:border-white/15 sm:bg-zinc-950/95">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
                {sourceDocumentTypeLabel(source)}
                {page ? ` · Seite ${page}` : ""}
              </p>
              <Dialog.Title className="mt-1 truncate text-base font-semibold text-white">
                {sourceDisplayLabel(source)}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Vergrößerte PDF-Ansicht der ausgewählten Dokumentstelle.
              </Dialog.Description>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMaxWidth((current) => Math.max(520, current - 120))}
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10"
                aria-label="PDF verkleinern"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMaxWidth((current) => Math.min(1180, current + 120))}
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10"
                aria-label="PDF vergrößern"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
              <Dialog.Close className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10">
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">PDF schließen</span>
              </Dialog.Close>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-8">
            <div className="mx-auto w-full max-w-[1180px]">
              <PdfPagePreview source={source} maxWidth={maxWidth} className="mx-auto shadow-2xl shadow-black/40" />
              {source.excerpt && (
                <blockquote className="mx-auto mt-4 max-w-3xl border-l-2 border-teal-300 pl-4 text-sm leading-6 text-zinc-100">
                  {source.excerpt}
                </blockquote>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
