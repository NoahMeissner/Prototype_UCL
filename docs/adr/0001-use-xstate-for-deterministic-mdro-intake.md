# ADR 0001: Use XState For Deterministic MDRO Intake

## Status

Accepted

## Context

The MDRO/MRE questionnaire must be deterministic, auditable, and free of LLM/RAG behavior during data gathering.

## Decision

Use XState for the structured MDRO intake.

LangGraph is not used for the deterministic questionnaire. It may be considered later for RAG/chat orchestration if the retrieval workflow needs graph-style control.

## Consequences

- Questionnaire branching is explicit and testable.
- Clinical assumptions stay outside the graph in configuration.
- The chat handoff receives structured context only after the machine reaches `chatReady`.
