import { describe, expect, it } from "vitest";
import {
  getOrganismAssumption,
  requiresRedFlagCheck,
  shouldEscalateUnknownCarriage,
} from "./assumptions";

describe("organism assumptions", () => {
  it("does not expose assumptions for unknown organisms", () => {
    expect(getOrganismAssumption("unknown")).toBeNull();
    expect(getOrganismAssumption(null)).toBeNull();
  });

  it("drives the 4MRGN red-flag and unknown-carriage behavior", () => {
    expect(requiresRedFlagCheck("4mrgn")).toBe(true);
    expect(shouldEscalateUnknownCarriage("4mrgn")).toBe(true);
    expect(requiresRedFlagCheck("mrsa")).toBe(false);
    expect(shouldEscalateUnknownCarriage("mrsa")).toBe(false);
  });
});
