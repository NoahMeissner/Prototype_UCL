# ASEPSIS Context

ASEPSIS is a German-first practitioner assistant for hospital hygiene questions.

## Domain Language

- **Practitioner surface**: the clean user-facing app at `/Prototype_UCL`. It must not expose debug state, provisional assumptions, source-conflict simulation, or implementation wording.
- **Debug surface**: the internal route at `/Prototype_UCL/debug`. It may expose machine state, path trace, assumptions, `QuestionnaireResponse`, and source-conflict simulation.
- **Two-door entry**: the first practitioner choice:
  - `MDRO/MRE-Fall`: structured deterministic intake for MRSA, VRE, 3MRGN, and 4MRGN.
  - `Allgemeine Hygienefrage`: direct chat for non-MDRO hygiene questions.
- **Structured MDRO intake**: the XState questionnaire that gathers only fields that change MDRO handling: organism group, 4MRGN red-flag risk, carriage status, care context, and optional free-text context.
- **General hygiene chat**: direct chat without MDRO questionnaire context. It is for the long tail of hygiene questions that do not benefit from structured branching.
- **Chat handoff**: the point where the deterministic intake has ended and the chat receives `ChatContext`.
- **Source-grounded answer**: an assistant answer with explicit `grounding` metadata. The current stub uses `not_connected`; the future RAG adapter should fill source status and citations.
- **Grounding status**: the source state for an answer: `not_connected`, `grounded`, `partially_grounded`, `insufficient_evidence`, or `source_conflict`.
- **Source citation**: a traceable document reference for a specific answer. It can include document type, section, page, excerpt, URL, and future page-region metadata from PageIndex/PaddleOCR.
- **Evidence library**: the practitioner-facing source workspace that groups document evidence by assistant answer. On desktop it docks beside the chat; on mobile it opens as a focused source sheet.
- **Visual citation**: PDF-backed source viewing based on source page and bounding-box metadata. It renders the relevant PDF page, highlights the supporting region, and can open fullscreen for inspection.
- **Source conflict**: a known divergence or uncertainty between local UKR guidance and external recommendations. Practitioners must not be asked to identify this; it is system/debug logic until a curated conflict list exists.
- **Red-flag escalation**: a terminal state that stops before chat, currently used for 4MRGN high-risk or unknown red-flag answers.
- **Minimum viable state**: the smallest structured MDRO context required before chat can open. Exact clinical thresholds remain pending Susanne review.
- **Provisional clinical assumptions**: clinical defaults isolated in `src/lib/intake/assumptions.ts` pending Susanne review.

## Current Architecture

- XState owns the deterministic MDRO traversal.
- Zod owns runtime schemas and inferred TypeScript types.
- `src/lib/intake/context.ts` owns context construction and chat handoff shaping.
- `src/lib/intake/scenarios.ts` is the shared catalog for debug runs and tests.
- `src/lib/intake/chat.ts` is the chat-provider seam. The current adapter is a stub; RAG integration belongs behind this seam later and should return answer grounding metadata with citations.

## Future UI Notes

- The practitioner chat uses inline source status plus an answer-grouped evidence library. Raw retrieval metrics, OCR confidence, PageIndex node paths, token usage, and pruning reasons belong in the debug surface unless they are required to render a practitioner-facing visual citation.
