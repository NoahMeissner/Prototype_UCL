import { ChatMessage, GroundingStatus, SourceCitation } from "./schemas";

export interface EvidenceGroup {
  answerMessageId: string;
  answerLabel: string;
  groundingStatus: GroundingStatus;
  summary: string;
  sources: SourceCitation[];
}

export interface EvidenceSourceSelection {
  group: EvidenceGroup;
  source: SourceCitation;
  sourceIndex: number;
}

export function sourceDisplayLabel(source: SourceCitation) {
  const details = [source.section, source.page ? `S. ${source.page}` : null].filter(Boolean);
  return details.length > 0 ? `${source.title} · ${details.join(" · ")}` : source.title;
}

export function sourceDocumentTypeLabel(source: SourceCitation) {
  if (source.documentType === "ukr") return "UKR";
  if (source.documentType === "rki") return "RKI";
  if (source.documentType === "other") return "Sonstige";
  return "Quelle";
}

export function buildEvidenceGroups(messages: ChatMessage[]): EvidenceGroup[] {
  let answerIndex = 0;

  return messages.flatMap((message) => {
    const grounding = message.role === "assistant" ? message.grounding : undefined;
    if (!grounding || grounding.sources.length === 0) return [];

    answerIndex += 1;

    return [
      {
        answerMessageId: message.id,
        answerLabel: `Antwort ${answerIndex}`,
        groundingStatus: grounding.status,
        summary: grounding.summary,
        sources: grounding.sources,
      },
    ];
  });
}

export function findEvidenceSource(
  groups: EvidenceGroup[],
  sourceId: string | null
): EvidenceSourceSelection | null {
  if (!sourceId) return null;

  for (const group of groups) {
    const sourceIndex = group.sources.findIndex((source) => source.id === sourceId);
    if (sourceIndex >= 0) {
      return {
        group,
        source: group.sources[sourceIndex],
        sourceIndex,
      };
    }
  }

  return null;
}
