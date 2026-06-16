import { describe, expect, it } from "vitest";
import { buildChatContext, createGeneralIntakeContext } from "./context";
import { stubChatProvider } from "./chat";
import { answerGroundingSchema } from "./schemas";
import { runIntakeScenario } from "./test-utils";

describe("chat provider stub", () => {
  it("keeps general hygiene answers free of MDRO placeholder context", async () => {
    const message = await stubChatProvider({
      context: buildChatContext(createGeneralIntakeContext()),
      messages: [{ id: "user-1", role: "user", content: "Duerfen Getraenke im Stationskuehlschrank gelagert werden?" }],
    });

    expect(message.id).toMatch(/^assistant-/);
    expect(message.content).toContain("Ihre Frage");
    expect(message.content).toContain("stationäre Hygienepraxis");
    expect(message.content).not.toContain("MDRO/MRE");
    expect(message.shortAnswer).toContain("Dokumentensuche");
    expect(message.recommendedAction).toContain("Ablauf");
    expect(message.grounding?.status).toBe("not_connected");
    expect(message.grounding?.sources.map((source) => source.documentType)).toEqual(["ukr", "rki"]);
    expect(message.grounding?.sources[0].pdfUrl).toContain("asepsis-demo.pdf");
  });

  it("carries structured MDRO context into MDRO answers", async () => {
    const snapshot = runIntakeScenario("mrsa-chat");
    const message = await stubChatProvider({
      context: buildChatContext(snapshot.context),
      messages: [{ id: "user-1", role: "user", content: "Welche Schutzmassnahmen gelten?" }],
    });

    expect(message.id).toMatch(/^assistant-/);
    expect(message.content).toContain("MRSA");
    expect(message.content).toContain("Kolonisation");
    expect(message.content).toContain("Wundversorgung");
    expect(message.shortAnswer).toContain("MRSA");
    expect(message.recommendedAction).toContain("Kontaktmaßnahmen");
    expect(message.grounding?.status).toBe("not_connected");
    expect(message.grounding?.sources[0].bboxes?.[0].page).toBe(1);
  });

  it("accepts future page-indexed citation metadata", () => {
    const parsed = answerGroundingSchema.parse({
      status: "grounded",
      summary: "Antwort ist mit UKR-Dokumentstellen belegt.",
      sources: [
        {
          id: "ukr-mrsa-12",
          title: "UKR Hygieneplan MRSA",
          documentType: "ukr",
          section: "Isolierung",
          page: 12,
          excerpt: "Relevanter Auszug aus der Dokumentstelle.",
          url: "/documents/ukr-mrsa.pdf#page=12",
          pdfUrl: "/documents/ukr-mrsa.pdf",
          bboxes: [
            {
              page: 12,
              x: 0.15,
              y: 0.32,
              width: 0.5,
              height: 0.08,
            },
          ],
          selectionReason: "Enthaelt den relevanten Isolierungshinweis.",
        },
      ],
    });

    expect(parsed.sources[0].page).toBe(12);
    expect(parsed.sources[0].bboxes?.[0].page).toBe(12);
    expect(parsed.sources[0].selectionReason).toContain("Isolierung");
  });
});
