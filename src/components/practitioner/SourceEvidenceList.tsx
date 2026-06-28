"use client";

import { ExternalLink, Info, Maximize2 } from "lucide-react";
import { chatCopy } from "@/lib/intake/copy";
import { sourceDisplayLabel, sourceDocumentTypeLabel } from "@/lib/intake/evidence";
import { AnswerGrounding, SourceCitation } from "@/lib/intake/schemas";
import PdfPagePreview from "./PdfPagePreview";

interface SourceEvidenceListProps {
  grounding: AnswerGrounding;
  answerMessageId: string;
  onOpenFullscreen?: (source: SourceCitation) => void;
}

export default function SourceEvidenceList({
  grounding,
  answerMessageId,
  onOpenFullscreen,
}: SourceEvidenceListProps) {
  const hasSources = grounding.sources.length > 0;

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="border-t border-zinc-100 pt-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {chatCopy.sourceListLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">{grounding.summary}</p>
        </div>

        {!hasSources && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500">
            <Info className="size-3.5 shrink-0" aria-hidden="true" />
            {chatCopy.noSourcesYet}
          </p>
        )}

        {hasSources && (
          <div className="mt-3 space-y-3">
            {grounding.sources.map((source, index) => (
              <article key={source.id} className="rounded-md border border-zinc-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                    [{index + 1}] {sourceDocumentTypeLabel(source)}
                    {source.page ? ` · S. ${source.page}` : ""}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-5 text-zinc-950">
                    {sourceDisplayLabel(source)}
                  </h3>
                </div>

                {(source.pdfUrl || source.bbox || source.bboxes) && (
                  <button
                    type="button"
                    onClick={() => onOpenFullscreen?.(source)}
                    className="mt-3 block w-full text-left"
                    aria-label={`${sourceDisplayLabel(source)} im Vollbild öffnen`}
                  >
                    <PdfPagePreview source={source} cropToBbox />
                  </button>
                )}

                {source.excerpt && (
                  <blockquote className="mt-3 border-l-2 border-teal-600 pl-3 text-sm leading-6 text-zinc-700">
                    {source.excerpt}
                  </blockquote>
                )}

                {source.selectionReason && (
                  <div className="mt-3 px-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      Warum ausgewählt
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">{source.selectionReason}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {onOpenFullscreen && (
                    <button
                      type="button"
                      onClick={() => onOpenFullscreen(source)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-teal-50 hover:text-teal-900"
                    >
                      <Maximize2 className="size-3.5" aria-hidden="true" />
                      Vollbild öffnen
                    </button>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-teal-50 hover:text-teal-900"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      Dokument öffnen
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
