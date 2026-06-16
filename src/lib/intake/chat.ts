import { carriageLabels, contextLabels, organismLabels } from "./copy";
import { AnswerGrounding, ChatContext, ChatMessage } from "./schemas";

export function createChatMessageId(prefix: "user" | "assistant" = "assistant") {
  const random =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export type ChatProvider = (input: {
  context: ChatContext;
  messages: ChatMessage[];
}) => Promise<ChatMessage>;

const demoGroundingTemplate: AnswerGrounding = {
  status: "not_connected",
  summary: "Die UKR-Dokumentensuche ist noch nicht angebunden.",
  sources: [
    {
      id: "demo-source-ukr-hygieneplan",
      title: "Beispiel-Dokumentstelle UKR Hygieneplan",
      documentType: "ukr",
      section: "Schutzmaßnahmen",
      page: 1,
      excerpt:
        "Diese Beispielstelle zeigt, wie spaeter eine konkrete UKR-Dokumentstelle mit Seitenbezug angezeigt wird.",
      url: "/Prototype_UCL/demo-sources/asepsis-demo.pdf#page=1",
      pdfUrl: "/Prototype_UCL/demo-sources/asepsis-demo.pdf",
      bboxes: [
        {
          page: 1,
          x: 0.16,
          y: 0.36,
          width: 0.68,
          height: 0.12,
        },
      ],
      selectionReason: "Beispiel fuer eine lokale UKR-Dokumentstelle mit hervorgehobener Passage.",
    },
    {
      id: "demo-source-rki-reference",
      title: "Beispiel-Dokumentstelle RKI",
      documentType: "rki",
      section: "Einordnung",
      page: 1,
      excerpt:
        "Diese Beispielstelle steht fuer eine externe Referenz, die spaeter neben lokalen UKR-Dokumenten geprueft werden kann.",
      url: "/Prototype_UCL/demo-sources/asepsis-demo.pdf#page=1",
      pdfUrl: "/Prototype_UCL/demo-sources/asepsis-demo.pdf",
      bboxes: [
        {
          page: 1,
          x: 0.16,
          y: 0.55,
          width: 0.68,
          height: 0.1,
        },
      ],
      selectionReason: "Beispiel fuer eine zweite Dokumentstelle zur Gegenpruefung.",
    },
  ],
};

function createDemoGrounding(answerMessageId: string): AnswerGrounding {
  return {
    ...demoGroundingTemplate,
    sources: demoGroundingTemplate.sources.map((source) => ({
      ...source,
      id: `${answerMessageId}-${source.id}`,
    })),
  };
}

export const stubChatProvider: ChatProvider = async ({ context, messages }) => {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const last = messages.at(-1)?.content ?? "";
  const answerMessageId = createChatMessageId("assistant");
  if (context.common.topicClass === "general") {
    return {
      id: answerMessageId,
      role: "assistant",
      grounding: createDemoGrounding(answerMessageId),
      shortAnswer:
        "Die Dokumentensuche ist noch nicht angebunden. Die spaetere Antwort wird hier als belegte Kurzantwort erscheinen.",
      recommendedAction: "Nutzen Sie diese Ansicht derzeit zur Pruefung des Ablaufs und der Quellenanzeige.",
      rationale:
        "Die Frage wird bereits an den Chat-Kontext uebergeben; die echte UKR-Dokumentensuche wird spaeter hinter diesem Provider angeschlossen.",
      limitations: "Diese Ausgabe enthaelt Demo-Quellen und ist keine fachliche Antwort.",
      content:
        `Ihre Frage: „${last}“\n\n` +
        "Sobald die UKR-Dokumentensuche angebunden ist, wird hier eine dokumentengestützte Antwort für die stationäre Hygienepraxis erscheinen.",
    };
  }

  const organism = context.mdro.organism ? organismLabels[context.mdro.organism] : "MDRO/MRE";
  const carriage = context.mdro.carriageStatus
    ? carriageLabels[context.mdro.carriageStatus]
    : "Status unklar";
  const careContext = context.mdro.careContext
    ? contextLabels[context.mdro.careContext]
    : "Kontext unklar";
  const isolation =
    context.mdro.isolationDefault === "single_room"
      ? "Einzelzimmer / erhöhte Isolierungsprüfung"
      : context.mdro.isolationDefault === "contact"
        ? "Kontaktmaßnahmen prüfen"
        : "Standardhygiene prüfen";

  return {
    id: answerMessageId,
    role: "assistant",
    grounding: createDemoGrounding(answerMessageId),
    shortAnswer: `Der strukturierte Kontext wurde uebernommen: ${organism}, ${carriage}, ${careContext}.`,
    recommendedAction: `Vorlaeufige Demo-Einordnung: ${isolation}.`,
    rationale:
      "Der MDRO-Kontext wird deterministisch erfasst und an den Chat uebergeben. Die spaetere RAG-Antwort soll dazu passende UKR-Dokumentstellen liefern.",
    limitations: "Diese Ausgabe enthaelt Demo-Quellen und ersetzt noch keine dokumentengestuetzte Antwort.",
    content:
      `Übernommener Kontext: ${organism}, ${carriage}, ${careContext}.\n` +
      `Vorläufige Einordnung: ${isolation}.\n\n` +
      `Ihre Frage: „${last}“\n\n` +
      `Für eine belastbare Antwort muss im nächsten Schritt die lokale UKR-Dokumentensuche angebunden werden. Bei Unsicherheit oder Abweichungen bitte die Krankenhaushygiene einbeziehen.`,
  };
};
