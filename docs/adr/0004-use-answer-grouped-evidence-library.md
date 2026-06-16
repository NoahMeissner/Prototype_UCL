# ADR 0004: Use An Answer-Grouped Evidence Library

## Status

Accepted

## Context

Practitioners need to inspect the document evidence behind source-grounded answers without losing the relationship between an answer and its supporting documents. Inline source chips are useful for scanning, but they are not enough for PDF inspection, highlighted document regions, or longer conversations with multiple answers.

## Decision

Use an answer-grouped evidence library for practitioner source inspection.

- Evidence is grouped by assistant answer.
- Desktop uses a docked right-side evidence library.
- Mobile uses a focused source sheet instead of a sidebar.
- PDF pages are rendered with `react-pdf`.
- Fullscreen source inspection uses Radix Dialog.
- Source/answer synchronization is soft: clicks select and scroll; chat and evidence scrolling are not hard-locked.
- Raw retrieval diagnostics remain out of the practitioner surface unless needed to render visual citations.

## Consequences

- Source evidence remains visibly tied to the answer it supports.
- The chat provider seam stays clean: RAG returns grounding metadata, while the UI owns rendering.
- Future claim-level citations can be added without replacing the evidence library.
- The implementation adds only targeted UI primitives rather than a full chat framework.
