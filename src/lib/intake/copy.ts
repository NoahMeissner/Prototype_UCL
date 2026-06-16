import { CareContext, CarriageStatus, OrganismGroup, TerminalTarget } from "./schemas";

export const organismLabels: Record<OrganismGroup, string> = {
  mrsa: "MRSA",
  vre: "VRE",
  "3mrgn": "3MRGN",
  "4mrgn": "4MRGN",
  unknown: "Nicht sicher / nicht bestätigt",
};

export const carriageLabels: Record<CarriageStatus, string> = {
  colonization: "Kolonisation",
  infection: "Infektion",
  unknown: "Nicht sicher",
};

export const contextLabels: Record<CareContext, string> = {
  screening: "Screening / Aufnahme",
  wound_care: "Wundversorgung",
  transport: "Transport",
  room_isolation: "Zimmer / Isolierung",
  ppe: "Schutzausrüstung / Patientenkontakt",
  ward_routine: "Stationsalltag / Geschirr",
  other: "Anderer Kontext",
};

export const questions = {
  entry: {
    eyebrow: "ASEPSIS",
    title: "Was möchten Sie tun?",
    hint: "Wählen Sie den Einstieg, der zur aktuellen Situation passt.",
  },
  organism: {
    eyebrow: "MDRO / MRE",
    title: "Welche Erregergruppe ist betroffen?",
    hint: "Wählen Sie nur aus, was im Befund oder in der Situation bekannt ist.",
  },
  redFlag: {
    eyebrow: "4MRGN",
    title: "Liegt ein Risikohinweis für präemptive Isolierung vor?",
    hint: "Zum Beispiel relevanter Auslandsaufenthalt, Kontakt im selben Zimmer oder Aufenthalt in einer Hochprävalenzregion.",
  },
  carriage: {
    eyebrow: "Befundstatus",
    title: "Handelt es sich um Kolonisation oder Infektion?",
    hint: "Wenn der Status unklar ist, wählen Sie „Nicht sicher“.",
  },
  careContext: {
    eyebrow: "Versorgungskontext",
    title: "Worum geht es in der konkreten Situation?",
    hint: "Diese Angabe steuert, welche lokale Handlungsempfehlung später relevant ist.",
  },
  otherContext: {
    eyebrow: "Freitext",
    title: "Beschreiben Sie den Versorgungskontext kurz.",
    hint: "Der Text wird als Kontext übernommen, steuert aber keine automatische Verzweigung.",
  },
} as const;

export const entryChoices = {
  mdro: {
    title: "MDRO/MRE-Fall",
    description: "Geführte Erfassung für MRSA, VRE, 3MRGN oder 4MRGN. Danach stellen Sie Ihre Frage mit übernommenem Kontext.",
  },
  general: {
    title: "Allgemeine Hygienefrage",
    description: "Direkt zur Frage, wenn kein konkreter MDRO/MRE-Fall erfasst werden muss.",
  },
} as const;

export const terminalCopy: Record<
  TerminalTarget,
  { title: string; body: string; action: string; tone: "warning" | "danger" | "neutral" }
> = {
  insufficient_information: {
    title: "Es fehlen entscheidende Angaben",
    body: "Die Angaben reichen für eine sichere Weiterleitung in den Chat noch nicht aus.",
    action: "Bitte fehlende Informationen klären oder die Krankenhaushygiene einbeziehen.",
    tone: "warning",
  },
  specialist_review: {
    title: "Fachliche Rücksprache erforderlich",
    body: "Diese Konstellation sollte nicht automatisiert weiterbearbeitet werden.",
    action: "Bitte Krankenhaushygiene oder zuständige Fachperson einbeziehen.",
    tone: "warning",
  },
  source_conflict: {
    title: "Bekannter Regelkonflikt",
    body: "Für diese Konstellation ist eine Abweichung oder Unsicherheit zwischen Quellen hinterlegt.",
    action: "Bitte fachlich rückfragen, bevor aus den Quellen eine Handlung abgeleitet wird.",
    tone: "warning",
  },
  red_flag_escalation: {
    title: "Sofortige Rücksprache erforderlich",
    body: "Die Angaben weisen auf eine Hochrisiko-Konstellation hin.",
    action: "Bitte Krankenhaushygiene einbeziehen und lokale Isolierungsprozesse prüfen.",
    tone: "danger",
  },
};

export const chatCopy = {
  title: "Hygiene-Frage stellen",
  mdroEyebrow: "Kontext erfasst",
  generalEyebrow: "Direkte Frage",
  mdroIntro: "Der strukturierte Kontext wurde übernommen. Stellen Sie jetzt Ihre konkrete Frage.",
  generalIntro: "Stellen Sie direkt Ihre Frage zur stationären Hygienepraxis.",
  mdroEmpty: "Der strukturierte Kontext ist übernommen. Fragen Sie jetzt zu Maßnahmen, Isolierung, Transport oder Schutzausrüstung.",
  generalEmpty: "Fragen Sie direkt zu Stationsalltag, Schutzausrüstung, Begriffen oder hygienischen Abläufen.",
  emptyPromptLabel: "Beispielfragen",
  emptyPromptHint: "Klicken übernimmt die Frage in das Eingabefeld.",
  generalExamplePrompts: [
    "Darf private Verpflegung im Stationskühlschrank gelagert werden?",
    "Welche Maske ist bei Tuberkulose erforderlich?",
    "Was bedeutet HUS?",
  ],
  mdroExamplePrompts: [
    "Welche Schutzmaßnahmen gelten?",
    "Muss der Patient isoliert werden?",
    "Was gilt beim Transport?",
  ],
  loading: "Antwort wird vorbereitet...",
  inputPlaceholder: "Frage eingeben...",
  send: "Senden",
  sending: "Sendet",
  editContext: "Einstieg ändern",
  prototypeNotice: "Antworten werden später mit UKR-Dokumentstellen belegt. Diese Oberfläche zeigt den vorgesehenen Quellenbereich bereits an.",
  answerLabel: "Antwort",
  shortAnswerLabel: "Kurzantwort",
  recommendedActionLabel: "Empfohlene Maßnahme",
  rationaleLabel: "Begründung",
  limitationsLabel: "Grenzen der Antwort",
  sourceStatusLabel: "Quellenstatus",
  sourceListLabel: "Dokumentstellen",
  noSourcesYet: "Noch keine Dokumentstellen verbunden.",
} as const;
