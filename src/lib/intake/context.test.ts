import { describe, expect, it } from "vitest";
import { buildChatContext, createGeneralIntakeContext, initialMdroIntakeContext } from "./context";

describe("intake context", () => {
  it("creates a completed general chat context without MDRO payload", () => {
    const context = createGeneralIntakeContext();
    const chatContext = buildChatContext(context);

    expect(context.common.topicClass).toBe("general");
    expect(context.questionnaireResponse.status).toBe("completed");
    expect(chatContext.summary).toEqual(["Allgemeine Hygienefrage"]);
    expect(chatContext.mdro.organism).toBeNull();
  });

  it("starts MDRO intake with no completed safety gates", () => {
    expect(initialMdroIntakeContext.common.topicClass).toBe("mdro");
    expect(initialMdroIntakeContext.common.safetyGatesResolved).toBe(false);
    expect(initialMdroIntakeContext.common.minimumViableState).toBe(false);
    expect(initialMdroIntakeContext.questionnaireResponse.status).toBe("in-progress");
    expect(initialMdroIntakeContext.pathTrace).toEqual(["organism"]);
  });
});
