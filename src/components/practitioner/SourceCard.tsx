"use client";

import { ExternalLink, Maximize2 } from "lucide-react";
import { sourceDisplayLabel, sourceDocumentTypeLabel } from "@/lib/intake/evidence";
import { SourceCitation } from "@/lib/intake/schemas";
import PdfPagePreview from "./PdfPagePreview";

interface SourceCardProps {
  source: SourceCitation;
  index: number;
  isSelected: boolean;
  onSelect: (sourceId: string) => void;
  onOpenFullscreen: (source: SourceCitation) => void;
}

export default function SourceCard({
  source,
  index,
  isSelected,
  onSelect,
  onOpenFullscreen,
}: SourceCardProps) {
  return (
    <article
      id={`source-${source.id}`}
      className={[
        "rounded-md border-l-2 p-3 transition",
        isSelected ? "border-l-teal-500 bg-teal-50/40" : "border-l-transparent bg-white/70 hover:bg-white",
      ].join(" ")}
    >
      <button type="button" onClick={() => onSelect(source.id)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              [{index + 1}] {sourceDocumentTypeLabel(source)}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-5 text-zinc-950">
              {sourceDisplayLabel(source)}
            </h3>
          </div>
          {source.page && (
            <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
              S. {source.page}
            </span>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onOpenFullscreen(source)}
        className="mt-3 block w-full text-left"
        aria-label={`${sourceDisplayLabel(source)} im Vollbild öffnen`}
      >
        <PdfPagePreview source={source} />
      </button>

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
        <button
          type="button"
          onClick={() => onOpenFullscreen(source)}
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-teal-50 hover:text-teal-900"
        >
          <Maximize2 className="size-3.5" aria-hidden="true" />
          Vollbild öffnen
        </button>
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
  );
}
