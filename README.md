# ASEPSIS Hygiene Assistant

German-first practitioner prototype with two entry paths: deterministic MDRO/MRE intake followed by chat, or direct chat for general hygiene questions.

The structured path asks only the questions that change MDRO/MRE handling for MRSA, VRE, 3MRGN, and 4MRGN. If the intake is complete and safe, the app opens chat and passes the structured questionnaire context into the chat provider. If required information is missing or a 4MRGN red flag is present, the app stops before chat and shows a practitioner-facing action screen.

The general path skips the questionnaire and opens chat directly for non-MDRO hygiene questions. Real UKR document retrieval is not connected yet; the chat provider is isolated so it can be replaced by the RAG adapter later. The chat message contract already supports grounding status and document citations so PageIndex/PaddleOCR-derived source references can be surfaced in the UI when the RAG backend is ready.

Clinical thresholds are provisional and isolated in config so Susanne's feedback can be applied without rewriting traversal logic.

## Structure

- `/Prototype_UCL`: clean two-door practitioner surface
- `/Prototype_UCL/debug`: internal machine/debug route, including source-conflict simulation
- `CONTEXT.md`: domain vocabulary and current architecture notes
- `docs/adr/*`: accepted architecture decisions
- `src/lib/intake/schemas.ts`: Zod schemas and inferred domain types
- `src/lib/intake/machine.ts`: XState deterministic intake machine
- `src/lib/intake/context.ts`: intake context construction and chat handoff shaping
- `src/lib/intake/scenarios.ts`: shared debug/test scenario catalog
- `src/lib/intake/chat.ts`: replaceable chat provider interface, current stub provider, and future source-grounding seam
- `src/lib/intake/assumptions.ts`: provisional clinical defaults
- `src/components/practitioner/*`: practitioner-facing UI
- `src/components/debug/*`: internal debug UI

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

The project is configured for static export under `/Prototype_UCL` for GitHub Pages.
