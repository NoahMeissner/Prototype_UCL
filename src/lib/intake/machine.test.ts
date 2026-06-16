import { describe, expect, it } from "vitest";
import { buildChatContext, createGeneralIntakeContext } from "./context";
import { runIntakeEvents, runIntakeScenario } from "./test-utils";

describe("MDRO intake machine", () => {
  it("routes MRSA to chat with structured context", () => {
    const snapshot = runIntakeScenario("mrsa-chat");

    expect(snapshot.value).toBe("chatReady");
    expect(snapshot.context.questionnaireResponse.status).toBe("completed");
    expect(snapshot.context.common.minimumViableState).toBe(true);
    expect(snapshot.context.mdro.organism).toBe("mrsa");
  });

  it("routes VRE to chat", () => {
    const snapshot = runIntakeScenario("vre-chat");

    expect(snapshot.value).toBe("chatReady");
    expect(snapshot.context.mdro.organism).toBe("vre");
  });

  it("routes 3MRGN source conflicts to deferral", () => {
    const snapshot = runIntakeScenario("three-mrgn-conflict");

    expect(snapshot.value).toBe("conflict");
    expect(snapshot.context.common.terminalTarget).toBe("source_conflict");
    expect(snapshot.context.questionnaireResponse.status).toBe("stopped");
  });

  it("routes 4MRGN without red flag to chat", () => {
    const snapshot = runIntakeScenario("four-mrgn-chat");

    expect(snapshot.value).toBe("chatReady");
    expect(snapshot.context.mdro.isolationDefault).toBe("single_room");
  });

  it("routes 4MRGN red flags to escalation", () => {
    const snapshot = runIntakeScenario("four-mrgn-red-flag");

    expect(snapshot.value).toBe("escalation");
    expect(snapshot.context.common.terminalTarget).toBe("red_flag_escalation");
  });

  it("routes unknown organism to insufficient information", () => {
    const snapshot = runIntakeScenario("unknown-organism");

    expect(snapshot.value).toBe("insufficient");
    expect(snapshot.context.common.terminalTarget).toBe("insufficient_information");
  });

  it("preserves free-text context for chat", () => {
    const snapshot = runIntakeEvents([
      { type: "SELECT_ORGANISM", organism: "mrsa" },
      { type: "SELECT_CARRIAGE_STATUS", status: "unknown" },
      { type: "SELECT_CARE_CONTEXT", context: "other" },
      { type: "ENTER_OTHER_CONTEXT", text: "Rückfrage zur Dialyse" },
    ]);

    expect(snapshot.value).toBe("chatReady");
    const chatContext = buildChatContext(snapshot.context);
    expect(chatContext.summary).toContain("Rückfrage zur Dialyse");
    expect(chatContext.questionnaireResponse.item.some((entry) => entry.valueString === "Rückfrage zur Dialyse")).toBe(true);
  });

  it("supports a general hygiene chat context without MDRO fields", () => {
    const chatContext = buildChatContext(createGeneralIntakeContext());

    expect(chatContext.common.topicClass).toBe("general");
    expect(chatContext.summary).toEqual(["Allgemeine Hygienefrage"]);
    expect(chatContext.mdro.organism).toBeNull();
  });

  it("keeps source conflict available as an internal/debug route", () => {
    const snapshot = runIntakeEvents([
      { type: "SELECT_ORGANISM", organism: "mrsa" },
      { type: "SELECT_CARRIAGE_STATUS", status: "colonization" },
      { type: "SELECT_CARE_CONTEXT", context: "ppe" },
      { type: "SELECT_SOURCE_STATUS", sourceAgreement: "known_conflict" },
    ]);

    expect(snapshot.value).toBe("conflict");
    expect(snapshot.context.questionnaireResponse.status).toBe("stopped");
    expect(snapshot.context.common.terminalTarget).toBe("source_conflict");
  });
});
