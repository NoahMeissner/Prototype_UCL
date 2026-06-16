"use client";

import { RefObject, useEffect, useMemo, useState } from "react";
import { ArrowLeftFromLine, MessageSquareText } from "lucide-react";
import { EvidenceGroup } from "@/lib/intake/evidence";
import { SourceCitation } from "@/lib/intake/schemas";
import GroundingBadge from "./GroundingBadge";
import SourceCard from "./SourceCard";

type EvidenceMode = "current" | "all";

function sourceCountLabel(count: number) {
  return count === 1 ? "1 Quelle" : `${count} Quellen`;
}

interface EvidenceLibraryProps {
  groups: EvidenceGroup[];
  selectedAnswerId: string | null;
  selectedSourceId: string | null;
  onSelectSource: (sourceId: string, answerMessageId: string) => void;
  onOpenFullscreen: (source: SourceCitation) => void;
  onJumpToAnswer: (answerMessageId: string) => void;
  onVisibleGroupChange?: (answerMessageId: string) => void;
  onScrollArea?: () => void;
  autoScrollActiveGroup?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  onClose?: () => void;
  className?: string;
}

export default function EvidenceLibrary({
  groups,
  selectedAnswerId,
  selectedSourceId,
  onSelectSource,
  onOpenFullscreen,
  onJumpToAnswer,
  onVisibleGroupChange,
  onScrollArea,
  autoScrollActiveGroup = false,
  scrollContainerRef,
  onClose,
  className = "",
}: EvidenceLibraryProps) {
  const [mode, setMode] = useState<EvidenceMode>("all");
  const fallbackAnswerId = groups.at(-1)?.answerMessageId ?? null;
  const effectiveAnswerId = selectedAnswerId ?? fallbackAnswerId;
  const displayedGroups = useMemo(() => {
    if (mode === "all") return groups;
    return groups.filter((group) => group.answerMessageId === effectiveAnswerId);
  }, [effectiveAnswerId, groups, mode]);

  function visibleGroupIdFromScroll(root: HTMLDivElement) {
    const rootRect = root.getBoundingClientRect();
    const centerY = rootRect.top + rootRect.height / 2;
    const groups = [...root.querySelectorAll<HTMLElement>("[data-evidence-group-id]")];
    const containing = groups.find((group) => {
      const rect = group.getBoundingClientRect();
      return rect.top <= centerY && rect.bottom >= centerY;
    });
    if (containing) return containing.getAttribute("data-evidence-group-id");

    const closest = groups
      .map((group) => {
        const rect = group.getBoundingClientRect();
        return {
          id: group.getAttribute("data-evidence-group-id"),
          distance: Math.abs(rect.top + rect.height / 2 - centerY),
        };
      })
      .sort((first, second) => first.distance - second.distance)[0];

    return closest?.id ?? null;
  }

  useEffect(() => {
    if (!selectedSourceId) return;
    document.getElementById(`source-${selectedSourceId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [selectedSourceId, mode]);

  useEffect(() => {
    if (!autoScrollActiveGroup || !selectedAnswerId || selectedSourceId) return;
    document.getElementById(`evidence-group-${selectedAnswerId}`)?.scrollIntoView({
      block: "center",
      behavior: "auto",
    });
  }, [autoScrollActiveGroup, selectedAnswerId, selectedSourceId, mode]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <aside
      className={[
        "flex min-h-0 flex-col border-zinc-200 bg-white",
        "xl:w-[460px] xl:shrink-0 xl:border-l",
        className,
      ].join(" ")}
      aria-label="Quellen"
    >
      <header className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              Quellen
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
              Dokumentstellen
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Nach Antwort gruppiert.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-950"
              aria-label="Quellen schließen"
            >
              <ArrowLeftFromLine className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 rounded-md bg-zinc-100 p-1">
          {(["current", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={[
                "rounded px-2 py-1.5 text-xs font-semibold transition",
                mode === value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950",
              ].join(" ")}
            >
              {value === "current" ? "Aktuelle Antwort" : "Alle Quellen"}
            </button>
          ))}
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        data-evidence-scroll
        onScroll={(event) => {
          onScrollArea?.();
          const answerMessageId = visibleGroupIdFromScroll(event.currentTarget);
          if (answerMessageId) onVisibleGroupChange?.(answerMessageId);
        }}
        className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/45 px-4 pb-5"
      >
        {displayedGroups.length === 0 && (
          <div className="rounded-md bg-white p-4 text-sm text-zinc-600">
            Keine Dokumentstellen für die aktuelle Antwort.
          </div>
        )}
        <div className="relative">
          <div className="absolute bottom-0 left-[7px] top-4 w-px bg-zinc-200" aria-hidden="true" />
        {displayedGroups.map((group, index) => (
          <section
            key={group.answerMessageId}
            id={`evidence-group-${group.answerMessageId}`}
            data-evidence-group-id={group.answerMessageId}
            className={[
              "relative pl-7",
              index > 0 ? "mt-6 pt-5" : "",
            ].join(" ")}
          >
            {index > 0 && (
              <div className="absolute left-7 right-0 top-0 h-px bg-zinc-200/80" aria-hidden="true" />
            )}
            <span
              className={[
                "absolute left-0 top-3 size-4 rounded-full border-2 bg-white transition",
                group.answerMessageId === selectedAnswerId ? "border-teal-500" : "border-zinc-300",
              ].join(" ")}
              aria-hidden="true"
            />
            <div
              className={[
                "sticky top-0 z-10 -mx-2 mb-3 rounded-md px-3 py-3 backdrop-blur transition",
                group.answerMessageId === selectedAnswerId
                  ? "bg-teal-50/95 shadow-[0_8px_22px_rgba(15,118,110,0.12)] ring-1 ring-teal-200/70"
                  : "bg-white/95 shadow-[0_6px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-200/70",
              ].join(" ")}
            >
              <div className="space-y-2">
              <button
                type="button"
                onClick={() => onJumpToAnswer(group.answerMessageId)}
                className="block w-full min-w-0 text-left"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <MessageSquareText className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{group.answerLabel}</span>
                  <span className="text-zinc-300" aria-hidden="true">/</span>
                  <span className="whitespace-nowrap tracking-normal text-zinc-500">
                    {sourceCountLabel(group.sources.length)}
                  </span>
                </span>
                <p className="mt-1 text-xs leading-5 text-zinc-700">{group.summary}</p>
              </button>
              <GroundingBadge status={group.groundingStatus} />
              </div>
            </div>
            <div className="space-y-3">
              {group.sources.map((source, index) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  index={index}
                  isSelected={source.id === selectedSourceId}
                  onSelect={(sourceId) => onSelectSource(sourceId, group.answerMessageId)}
                  onOpenFullscreen={onOpenFullscreen}
                />
              ))}
            </div>
          </section>
        ))}
        </div>
      </div>
    </aside>
  );
}
