# ADR 0003: Separate Practitioner And Debug Surfaces

## Status

Accepted

## Context

The practitioner system should feel finished and should not expose provisional assumptions, path traces, source-conflict controls, or implementation details. The team still needs those internals for validation and Susanne review.

## Decision

Keep `/Prototype_UCL` as the clean practitioner surface and `/Prototype_UCL/debug` as the internal debug surface.

Source-conflict simulation remains debug/internal logic. Practitioners are never asked to identify conflicts between UKR and external recommendations.

## Consequences

- The practitioner flow stays minimal and clinically oriented.
- Internal validation remains possible without leaking debug controls into the user experience.
- Future source-conflict detection can be implemented behind the same internal seam once a curated conflict list exists.
