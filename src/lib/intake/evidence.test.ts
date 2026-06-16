import { describe, expect, it } from "vitest";
import { buildEvidenceGroups, findEvidenceSource, sourceDisplayLabel } from "./evidence";
import { ChatMessage } from "./schemas";

const messages: ChatMessage[] = [
  {
    id: "user-1",
    role: "user",
    content: "Welche Schutzmassnahmen gelten?",
  },
  {
    id: "assistant-1",
    role: "assistant",
    content: "Antwort",
    grounding: {
      status: "grounded",
      summary: "Mit Dokumentstellen belegt.",
      sources: [
        {
          id: "source-1",
          title: "UKR Hygieneplan",
          documentType: "ukr",
          section: "Isolation",
          page: 12,
          excerpt: "Relevanter Auszug.",
        },
      ],
    },
  },
  {
    id: "assistant-2",
    role: "assistant",
    content: "Antwort ohne Quellen",
  },
];

describe("evidence grouping", () => {
  it("groups evidence by grounded assistant answer", () => {
    const groups = buildEvidenceGroups(messages);

    expect(groups).toHaveLength(1);
    expect(groups[0].answerMessageId).toBe("assistant-1");
    expect(groups[0].answerLabel).toBe("Antwort 1");
    expect(groups[0].sources[0].id).toBe("source-1");
  });

  it("numbers only assistant answers with evidence", () => {
    const groups = buildEvidenceGroups([
      messages[0],
      messages[1],
      { id: "user-2", role: "user", content: "Weitere Frage" },
      {
        id: "assistant-3",
        role: "assistant",
        content: "Zweite belegte Antwort",
        grounding: {
          status: "grounded",
          summary: "Weitere Dokumentstelle.",
          sources: [{ id: "source-2", title: "RKI", documentType: "rki" }],
        },
      },
    ]);

    expect(groups.map((group) => group.answerLabel)).toEqual(["Antwort 1", "Antwort 2"]);
  });

  it("finds a source and its owning answer group", () => {
    const selection = findEvidenceSource(buildEvidenceGroups(messages), "source-1");

    expect(selection?.group.answerMessageId).toBe("assistant-1");
    expect(selection?.source.id).toBe("source-1");
    expect(selection?.sourceIndex).toBe(0);
  });

  it("formats source labels with section and page when available", () => {
    expect(sourceDisplayLabel(messages[1].grounding!.sources[0])).toBe(
      "UKR Hygieneplan · Isolation · S. 12"
    );
  });
});
