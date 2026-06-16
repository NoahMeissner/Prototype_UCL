import { OrganismGroup } from "./schemas";

type OrganismAssumption = {
  label: string;
  isolationDefault: "standard" | "contact" | "single_room";
  unknownCarriageHandling: "continue_conservative" | "escalate";
  treatmentLimitationFlag: boolean;
  requiresRedFlagCheck: boolean;
};

type KnownOrganismGroup = Exclude<OrganismGroup, "unknown">;

export const organismAssumptions: Record<KnownOrganismGroup, OrganismAssumption> = {
  mrsa: {
    label: "MRSA",
    isolationDefault: "contact",
    unknownCarriageHandling: "continue_conservative",
    treatmentLimitationFlag: false,
    requiresRedFlagCheck: false,
  },
  vre: {
    label: "VRE",
    isolationDefault: "contact",
    unknownCarriageHandling: "continue_conservative",
    treatmentLimitationFlag: false,
    requiresRedFlagCheck: false,
  },
  "3mrgn": {
    label: "3MRGN",
    isolationDefault: "contact",
    unknownCarriageHandling: "continue_conservative",
    treatmentLimitationFlag: false,
    requiresRedFlagCheck: false,
  },
  "4mrgn": {
    label: "4MRGN",
    isolationDefault: "single_room",
    unknownCarriageHandling: "escalate",
    treatmentLimitationFlag: true,
    requiresRedFlagCheck: true,
  },
};

export function getOrganismAssumption(organism: OrganismGroup | null) {
  if (!organism || organism === "unknown") return null;
  return organismAssumptions[organism];
}

export function requiresRedFlagCheck(organism: OrganismGroup | null) {
  return getOrganismAssumption(organism)?.requiresRedFlagCheck ?? false;
}

export function shouldEscalateUnknownCarriage(organism: OrganismGroup | null) {
  return getOrganismAssumption(organism)?.unknownCarriageHandling === "escalate";
}

export const knownConflictIds = {
  threeMrgnIsolation: "3mrgn-isolation-history",
} as const;

export const assumptionsMeta = {
  status: "Provisional clinical defaults pending Susanne review",
  conflictList: "Known UKR-vs-RKI conflict examples are currently curated manually",
} as const;
