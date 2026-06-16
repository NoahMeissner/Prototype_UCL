import { IntakeEvent } from "./schemas";

export type IntakeScenario = {
  id: string;
  label: string;
  events: IntakeEvent[];
};

export const intakeScenarios = [
  {
    id: "mrsa-chat",
    label: "MRSA -> chat",
    events: [
      { type: "SELECT_ORGANISM", organism: "mrsa" },
      { type: "SELECT_CARRIAGE_STATUS", status: "colonization" },
      { type: "SELECT_CARE_CONTEXT", context: "wound_care" },
    ],
  },
  {
    id: "vre-chat",
    label: "VRE -> chat",
    events: [
      { type: "SELECT_ORGANISM", organism: "vre" },
      { type: "SELECT_CARRIAGE_STATUS", status: "infection" },
      { type: "SELECT_CARE_CONTEXT", context: "transport" },
    ],
  },
  {
    id: "three-mrgn-conflict",
    label: "3MRGN conflict",
    events: [
      { type: "SELECT_ORGANISM", organism: "3mrgn" },
      { type: "SELECT_CARRIAGE_STATUS", status: "colonization" },
      { type: "SELECT_CARE_CONTEXT", context: "ward_routine" },
      { type: "SELECT_SOURCE_STATUS", sourceAgreement: "known_conflict" },
    ],
  },
  {
    id: "four-mrgn-chat",
    label: "4MRGN -> chat",
    events: [
      { type: "SELECT_ORGANISM", organism: "4mrgn" },
      { type: "SELECT_RED_FLAG_RISK", risk: "no" },
      { type: "SELECT_CARRIAGE_STATUS", status: "colonization" },
      { type: "SELECT_CARE_CONTEXT", context: "screening" },
    ],
  },
  {
    id: "four-mrgn-red-flag",
    label: "4MRGN red flag",
    events: [
      { type: "SELECT_ORGANISM", organism: "4mrgn" },
      { type: "SELECT_RED_FLAG_RISK", risk: "yes" },
    ],
  },
  {
    id: "unknown-organism",
    label: "Unknown organism",
    events: [{ type: "SELECT_ORGANISM", organism: "unknown" }],
  },
] satisfies IntakeScenario[];

export function getIntakeScenario(id: string) {
  return intakeScenarios.find((scenario) => scenario.id === id);
}
