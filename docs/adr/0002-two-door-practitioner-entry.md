# ADR 0002: Use A Two-Door Practitioner Entry

## Status

Accepted

## Context

Only the MDRO/MRE domain benefits from a structured graph right now. Many real UKR hygiene questions are direct document-grounded questions and should not be forced through an organism questionnaire.

## Decision

The practitioner surface starts with two entries:

- `MDRO/MRE-Fall`: structured deterministic intake, then chat with MDRO context.
- `Allgemeine Hygienefrage`: direct chat without MDRO questionnaire fields.

Do not build a broad topic router until there is evidence that additional structured domains need branching.

## Consequences

- The system remains focused and low-friction.
- MDRO branching stays explicit where it adds value.
- Non-MDRO questions get a clean path without artificial form fields.
