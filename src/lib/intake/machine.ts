import { assign, setup } from "xstate";
import {
  getOrganismAssumption,
  requiresRedFlagCheck,
  shouldEscalateUnknownCarriage,
} from "./assumptions";
import { createMdroIntakeContext, initialMdroIntakeContext } from "./context";
import { carriageLabels, contextLabels, organismLabels, questions } from "./copy";
import { questionnaireItem } from "./questionnaire";
import {
  IntakeContext,
  IntakeEvent,
  IntakeStep,
  QuestionnaireResponseItem,
  TerminalTarget,
} from "./schemas";

function appendItem(context: IntakeContext, responseItem: QuestionnaireResponseItem) {
  return {
    ...context.questionnaireResponse,
    item: [...context.questionnaireResponse.item, responseItem],
  };
}

function trace(context: IntakeContext, step: IntakeStep) {
  return [...context.pathTrace, step];
}

export const intakeMachine = setup({
  types: {
    context: {} as IntakeContext,
    events: {} as IntakeEvent,
  },
  guards: {
    isUnknownOrganism: ({ event }) =>
      event.type === "SELECT_ORGANISM" && event.organism === "unknown",
    needsRedFlagCheck: ({ event }) =>
      event.type === "SELECT_ORGANISM" && requiresRedFlagCheck(event.organism),
    isRedFlag: ({ event }) =>
      event.type === "SELECT_RED_FLAG_RISK" && (event.risk === "yes" || event.risk === "unknown"),
    isUnknownFourMrgnCarriage: ({ context, event }) =>
      event.type === "SELECT_CARRIAGE_STATUS" &&
      event.status === "unknown" &&
      shouldEscalateUnknownCarriage(context.mdro.organism),
    isOtherContext: ({ event }) =>
      event.type === "SELECT_CARE_CONTEXT" && event.context === "other",
    isSourceConflict: ({ event }) =>
      event.type === "SELECT_SOURCE_STATUS" && event.sourceAgreement === "known_conflict",
    isSourceUnchecked: ({ event }) =>
      event.type === "SELECT_SOURCE_STATUS" && event.sourceAgreement === "not_checked",
    hasMinimumState: ({ context }) =>
      Boolean(
        context.mdro.organism &&
          context.mdro.organism !== "unknown" &&
          context.mdro.carriageStatus &&
          context.mdro.careContext
      ),
  },
  actions: {
    resetContext: assign(() => createMdroIntakeContext()),
    recordOrganism: assign(({ context, event }) => {
      if (event.type !== "SELECT_ORGANISM") return context;
      if (event.organism === "unknown") {
        return {
          ...context,
          common: { ...context.common, organismGroup: "unknown" },
          mdro: { ...context.mdro, organism: "unknown" },
          questionnaireResponse: appendItem(
            context,
            questionnaireItem("organism", questions.organism.title, organismLabels.unknown, "unknown")
          ),
          pathTrace: trace(context, "insufficient"),
        };
      }

      const assumption = getOrganismAssumption(event.organism);
      if (!assumption) return context;
      return {
        ...context,
        common: { ...context.common, organismGroup: event.organism, terminalTarget: null },
        mdro: {
          ...context.mdro,
          organism: event.organism,
          isolationDefault: assumption.isolationDefault,
          treatmentLimitationFlag: assumption.treatmentLimitationFlag,
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("organism", questions.organism.title, organismLabels[event.organism], event.organism)
        ),
        pathTrace: trace(context, event.organism === "4mrgn" ? "redFlag" : "carriage"),
      };
    }),
    recordRedFlag: assign(({ context, event }) => {
      if (event.type !== "SELECT_RED_FLAG_RISK") return context;
      const answer = event.risk === "yes" ? "Ja" : event.risk === "no" ? "Nein" : "Nicht sicher";
      const isEscalation = event.risk !== "no";
      return {
        ...context,
        mdro: {
          ...context.mdro,
          preemptiveIsolationRisk: event.risk === "unknown" ? null : event.risk === "yes",
          isolationDefault: isEscalation ? "single_room" : context.mdro.isolationDefault,
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("red-flag-risk", questions.redFlag.title, answer, event.risk)
        ),
        pathTrace: trace(context, isEscalation ? "escalation" : "carriage"),
      };
    }),
    recordCarriage: assign(({ context, event }) => {
      if (event.type !== "SELECT_CARRIAGE_STATUS") return context;
      const escalation = event.status === "unknown" && context.mdro.organism === "4mrgn";
      return {
        ...context,
        common: {
          ...context.common,
          safetyGatesResolved: !escalation,
        },
        mdro: {
          ...context.mdro,
          carriageStatus: event.status,
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("carriage-status", questions.carriage.title, carriageLabels[event.status], event.status)
        ),
        pathTrace: trace(context, escalation ? "escalation" : "careContext"),
      };
    }),
    recordCareContext: assign(({ context, event }) => {
      if (event.type !== "SELECT_CARE_CONTEXT") return context;
      return {
        ...context,
        mdro: {
          ...context.mdro,
          careContext: event.context,
          otherContextText: event.context === "other" ? context.mdro.otherContextText : "",
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("care-context", questions.careContext.title, contextLabels[event.context], event.context)
        ),
        pathTrace: trace(context, event.context === "other" ? "otherContext" : "chatReady"),
      };
    }),
    recordOtherContext: assign(({ context, event }) => {
      if (event.type !== "ENTER_OTHER_CONTEXT") return context;
      return {
        ...context,
        mdro: {
          ...context.mdro,
          otherContextText: event.text.trim(),
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("other-context", questions.otherContext.title, "Freitext", "other", event.text.trim())
        ),
        pathTrace: trace(context, "chatReady"),
      };
    }),
    recordSourceStatus: assign(({ context, event }) => {
      if (event.type !== "SELECT_SOURCE_STATUS") return context;
      const nextStep =
        event.sourceAgreement === "agree"
          ? "chatReady"
          : event.sourceAgreement === "known_conflict"
            ? "conflict"
            : "insufficient";
      const answer =
        event.sourceAgreement === "agree"
          ? "Kein bekannter Konflikt"
          : event.sourceAgreement === "known_conflict"
            ? "Bekannter Konflikt"
            : "Nicht geprüft";
      return {
        ...context,
        common: {
          ...context.common,
          sourceAgreement: event.sourceAgreement,
        },
        questionnaireResponse: appendItem(
          context,
          questionnaireItem("source-status", "Interne Quellenprüfung", answer, event.sourceAgreement)
        ),
        pathTrace: trace(context, nextStep),
      };
    }),
    stopInsufficient: assign(({ context }) => ({
      ...context,
      common: {
        ...context.common,
        terminalTarget: "insufficient_information" as TerminalTarget,
      },
      questionnaireResponse: {
        ...context.questionnaireResponse,
        status: "stopped" as const,
      },
    })),
    stopConflict: assign(({ context }) => ({
      ...context,
      common: {
        ...context.common,
        terminalTarget: "source_conflict" as TerminalTarget,
      },
      questionnaireResponse: {
        ...context.questionnaireResponse,
        status: "stopped" as const,
      },
    })),
    stopEscalation: assign(({ context }) => ({
      ...context,
      common: {
        ...context.common,
        terminalTarget: "red_flag_escalation" as TerminalTarget,
      },
      questionnaireResponse: {
        ...context.questionnaireResponse,
        status: "stopped" as const,
      },
    })),
    completeForChat: assign(({ context }) => ({
      ...context,
      common: {
        ...context.common,
        sourceAgreement: "agree",
        safetyGatesResolved: true,
        minimumViableState: true,
        terminalTarget: null,
      },
      questionnaireResponse: {
        ...context.questionnaireResponse,
        status: "completed" as const,
      },
    })),
  },
}).createMachine({
  id: "asepsis-mdro-intake",
  initial: "organism",
  context: initialMdroIntakeContext,
  on: {
    RESET: {
      target: ".organism",
      actions: "resetContext",
    },
    SELECT_SOURCE_STATUS: [
      {
        guard: "isSourceConflict",
        target: ".conflict",
        actions: ["recordSourceStatus", "stopConflict"],
      },
      {
        guard: "isSourceUnchecked",
        target: ".insufficient",
        actions: ["recordSourceStatus", "stopInsufficient"],
      },
      {
        target: ".validateMinimumState",
        actions: "recordSourceStatus",
      },
    ],
  },
  states: {
    organism: {
      on: {
        SELECT_ORGANISM: [
          {
            guard: "isUnknownOrganism",
            target: "insufficient",
            actions: ["recordOrganism", "stopInsufficient"],
          },
          {
            guard: "needsRedFlagCheck",
            target: "redFlag",
            actions: "recordOrganism",
          },
          {
            target: "carriage",
            actions: "recordOrganism",
          },
        ],
      },
    },
    redFlag: {
      on: {
        SELECT_RED_FLAG_RISK: [
          {
            guard: "isRedFlag",
            target: "escalation",
            actions: ["recordRedFlag", "stopEscalation"],
          },
          {
            target: "carriage",
            actions: "recordRedFlag",
          },
        ],
        BACK: "organism",
      },
    },
    carriage: {
      on: {
        SELECT_CARRIAGE_STATUS: [
          {
            guard: "isUnknownFourMrgnCarriage",
            target: "escalation",
            actions: ["recordCarriage", "stopEscalation"],
          },
          {
            target: "careContext",
            actions: "recordCarriage",
          },
        ],
        BACK: [
          {
            guard: ({ context }) => requiresRedFlagCheck(context.mdro.organism),
            target: "redFlag",
          },
          { target: "organism" },
        ],
      },
    },
    careContext: {
      on: {
        SELECT_CARE_CONTEXT: [
          {
            guard: "isOtherContext",
            target: "otherContext",
            actions: "recordCareContext",
          },
          {
            target: "validateMinimumState",
            actions: "recordCareContext",
          },
        ],
        BACK: "carriage",
      },
    },
    otherContext: {
      on: {
        ENTER_OTHER_CONTEXT: {
          target: "validateMinimumState",
          actions: "recordOtherContext",
        },
        BACK: "careContext",
      },
    },
    validateMinimumState: {
      always: [
        {
          guard: "hasMinimumState",
          target: "chatReady",
          actions: "completeForChat",
        },
        {
          target: "insufficient",
          actions: "stopInsufficient",
        },
      ],
    },
    chatReady: {
      on: {
        BACK: [
          {
            guard: ({ context }) => context.mdro.careContext === "other",
            target: "otherContext",
          },
          { target: "careContext" },
        ],
      },
    },
    insufficient: {
      on: {
        BACK: "organism",
      },
    },
    conflict: {
      on: {
        BACK: "careContext",
      },
    },
    escalation: {
      on: {
        BACK: "organism",
      },
    },
  },
});
