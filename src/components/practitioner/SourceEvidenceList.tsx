"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, FileText, Info } from "lucide-react";
import { chatCopy } from "@/lib/intake/copy";
import { sourceDisplayLabel } from "@/lib/intake/evidence";
import { AnswerGrounding, SourceCitation } from "@/lib/intake/schemas";

interface SourceEvidenceListProps {
  grounding: AnswerGrounding;
  answerMessageId: string;
  selectedSourceId?: string | null;
  onSelectSource?: (sourceId: string, answerMessageId: string) => void;
  onOpenEvidence?: (answerMessageId: string) => void;
}

export default function SourceEvidenceList({
  grounding,
  answerMessageId,
  selectedSourceId,
  onSelectSource,
  onOpenEvidence,
}: SourceEvidenceListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSources = grounding.sources.length > 0;
  const visibleSources = grounding.sources.slice(0, 3);

  function selectSource(source: SourceCitation) {
    onSelectSource?.(source.id, answerMessageId);
    onOpenEvidence?.(answerMessageId);
  }

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="border-t border-zinc-100 pt-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {chatCopy.sourceListLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">{grounding.summary}</p>
        </div>
        {hasSources && (
          <div className="flex flex-wrap gap-2">
            {onOpenEvidence && (
              <button
                type="button"
                onClick={() => onOpenEvidence(answerMessageId)}
                className="inline-flex items-center gap-1.5 self-start rounded-md bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-100"
              >
                Quellen prüfen
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex items-center gap-1.5 self-start rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200"
              aria-expanded={isOpen}
            >
              Details
              <ChevronDown
                className={["size-3.5 transition", isOpen ? "rotate-180" : ""].join(" ")}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>

      {!hasSources && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500">
          <Info className="size-3.5 shrink-0" aria-hidden="true" />
          {chatCopy.noSourcesYet}
        </p>
      )}

      {hasSources && (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleSources.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => selectSource(source)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-left text-xs font-semibold transition",
                source.id === selectedSourceId
                  ? "bg-teal-100 text-teal-950"
                  : "bg-zinc-50 text-zinc-700 hover:bg-teal-50 hover:text-teal-950",
              ].join(" ")}
            >
              <FileText className="size-3.5 text-teal-700" aria-hidden="true" />
              {sourceDisplayLabel(source)}
            </button>
          ))}
        </div>
      )}

      {hasSources && isOpen && (
        <div className="mt-3 space-y-2">
          {grounding.sources.map((source, index) => (
            <article key={source.id} className="rounded-md bg-zinc-50/80 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    [{index + 1}] {sourceDisplayLabel(source)}
                  </p>
                  {source.documentType && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                      {source.documentType}
                    </p>
                  )}
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Dokument öffnen
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              {source.excerpt && (
                <blockquote className="mt-3 border-l-2 border-teal-600 pl-3 text-sm leading-6 text-zinc-700">
                  {source.excerpt}
                </blockquote>
              )}
            </article>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
