import { carriageLabels, contextLabels, organismLabels } from "./copy";
import { ChatContext, IntakeContext, chatContextSchema } from "./schemas";

function createEmptyMdroPayload(): IntakeContext["mdro"] {
  return {
    organism: null,
    carriageStatus: null,
    careContext: null,
    preemptiveIsolationRisk: null,
    isolationDefault: null,
    treatmentLimitationFlag: false,
    otherContextText: "",
  };
}

export function createMdroIntakeContext(): IntakeContext {
  return {
    common: {
      topicClass: "mdro",
      organismGroup: null,
      scopeStatus: "in_scope",
      safetyGatesResolved: false,
      minimumViableState: false,
      sourceAgreement: "not_checked",
      terminalTarget: null,
    },
    mdro: createEmptyMdroPayload(),
    questionnaireResponse: {
      resourceType: "QuestionnaireResponse",
      status: "in-progress",
      item: [],
    },
    pathTrace: ["organism"],
  };
}

export const initialMdroIntakeContext: IntakeContext = createMdroIntakeContext();

export function createGeneralIntakeContext(): IntakeContext {
  return {
    common: {
      topicClass: "general",
      organismGroup: null,
      scopeStatus: "in_scope",
      safetyGatesResolved: true,
      minimumViableState: true,
      sourceAgreement: "not_checked",
      terminalTarget: null,
    },
    mdro: createEmptyMdroPayload(),
    questionnaireResponse: {
      resourceType: "QuestionnaireResponse",
      status: "completed",
      item: [],
    },
    pathTrace: ["general", "chatReady"],
  };
}

export function buildChatContext(context: IntakeContext): ChatContext {
  const summary: string[] = [];
  if (context.common.topicClass === "general") {
    summary.push("Allgemeine Hygienefrage");
  }
  const organism = context.mdro.organism;
  if (organism) summary.push(organismLabels[organism]);
  if (context.mdro.carriageStatus) summary.push(carriageLabels[context.mdro.carriageStatus]);
  if (context.mdro.careContext) summary.push(contextLabels[context.mdro.careContext]);
  if (context.mdro.otherContextText) summary.push(context.mdro.otherContextText);

  return chatContextSchema.parse({
    summary,
    common: context.common,
    mdro: context.mdro,
    questionnaireResponse: context.questionnaireResponse,
  });
}
