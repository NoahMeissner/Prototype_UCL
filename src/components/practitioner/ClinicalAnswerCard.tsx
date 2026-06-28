import { chatCopy } from "@/lib/intake/copy";
import { AnswerGrounding, ChatMessage, SourceCitation } from "@/lib/intake/schemas";
import AnswerSection from "./AnswerSection";
import GroundingBadge from "./GroundingBadge";
import SourceEvidenceList from "./SourceEvidenceList";

const fallbackGrounding: AnswerGrounding = {
  status: "not_connected",
  summary: "Die UKR-Dokumentensuche ist noch nicht angebunden.",
  sources: [],
};

interface ClinicalAnswerCardProps {
  message: ChatMessage;
  onOpenFullscreen?: (source: SourceCitation) => void;
}

export default function ClinicalAnswerCard({
  message,
  onOpenFullscreen,
}: ClinicalAnswerCardProps) {
  const grounding = message.grounding ?? fallbackGrounding;
  const sections = [
    { label: chatCopy.shortAnswerLabel, value: message.shortAnswer },
    { label: chatCopy.recommendedActionLabel, value: message.recommendedAction },
    { label: chatCopy.rationaleLabel, value: message.rationale },
    { label: chatCopy.limitationsLabel, value: message.limitations },
  ].flatMap((section) => (section.value?.trim() ? [{ label: section.label, value: section.value }] : []));
  const hasStructuredAnswer = sections.length > 0;

  return (
    <article
      id={`answer-${message.id}`}
      className="max-w-[94%] overflow-hidden rounded-md border-l-4 border-l-transparent bg-white text-sm shadow-[0_8px_24px_rgba(15,23,42,0.045)] sm:max-w-[82%]"
    >
      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {chatCopy.answerLabel}
          </p>
          <GroundingBadge status={grounding.status} />
        </div>
        {hasStructuredAnswer ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <AnswerSection key={section.label} label={section.label} value={section.value} />
            ))}
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-6 text-zinc-800">{message.content}</div>
        )}
      </div>
      <SourceEvidenceList
        grounding={grounding}
        answerMessageId={message.id}
        onOpenFullscreen={onOpenFullscreen}
      />
    </article>
  );
}
