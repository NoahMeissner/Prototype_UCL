"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { EvidenceGroup } from "@/lib/intake/evidence";
import { SourceCitation } from "@/lib/intake/schemas";
import GroundingBadge from "./GroundingBadge";
import SourceCard from "./SourceCard";

interface MobileEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: EvidenceGroup | null;
  selectedSourceId: string | null;
  onSelectSource: (sourceId: string, answerMessageId: string) => void;
  onOpenFullscreen: (source: SourceCitation) => void;
  onJumpToAnswer: (answerMessageId: string) => void;
}

export default function MobileEvidenceDialog({
  open,
  onOpenChange,
  group,
  selectedSourceId,
  onSelectSource,
  onOpenFullscreen,
  onJumpToAnswer,
}: MobileEvidenceDialogProps) {
  if (!group) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-950 sm:hidden">
          <header className="flex shrink-0 items-start justify-between gap-3 px-4 py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                Quellen
              </p>
              <Dialog.Title className="mt-1 text-lg font-semibold tracking-tight">
                Dokumentstellen zu {group.answerLabel}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs leading-5 text-zinc-600">
                {group.summary}
              </Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Quellen schließen</span>
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onJumpToAnswer(group.answerMessageId);
                  onOpenChange(false);
                }}
                className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
              >
                Zur Antwort
              </button>
              <GroundingBadge status={group.groundingStatus} />
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
