"use client";

import { useMachine } from "@xstate/react";
import { buildChatContext } from "@/lib/intake/context";
import { intakeMachine } from "@/lib/intake/machine";
import { intakeScenarios } from "@/lib/intake/scenarios";
import { assumptionsMeta, organismAssumptions } from "@/lib/intake/assumptions";
import { IntakeEvent } from "@/lib/intake/schemas";

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      <pre className="mt-3 max-h-[420px] overflow-auto rounded-md bg-zinc-950 p-4 text-xs leading-5 text-zinc-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export default function DebugIntake() {
  const [snapshot, send] = useMachine(intakeMachine);
  const chatContext = String(snapshot.value) === "chatReady" ? buildChatContext(snapshot.context) : null;

  function runScenario(events: IntakeEvent[]) {
    send({ type: "RESET" });
    queueMicrotask(() => {
      events.forEach((event) => send(event));
    });
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-zinc-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">ASEPSIS debug</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">MDRO intake state</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Internal route for machine state, assumptions, path trace, and chat context.
          </p>
        </header>

        <section className="mb-5 flex flex-wrap gap-2">
          {intakeScenarios.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              onClick={() => runScenario(scenario.events)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-500"
            >
              {scenario.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => send({ type: "RESET" })}
            className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
          >
            Reset
          </button>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <JsonBlock title="Machine state" value={snapshot.value} />
          <JsonBlock title="Context" value={snapshot.context} />
          <JsonBlock title="QuestionnaireResponse" value={snapshot.context.questionnaireResponse} />
          <JsonBlock title="Chat context" value={chatContext} />
          <JsonBlock title="Assumptions" value={{ assumptionsMeta, organismAssumptions }} />
          <JsonBlock title="Path trace" value={snapshot.context.pathTrace} />
        </div>
      </div>
    </main>
  );
}
