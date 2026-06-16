import { createActor } from "xstate";
import { intakeMachine } from "./machine";
import { getIntakeScenario } from "./scenarios";
import { IntakeEvent } from "./schemas";

export function runIntakeEvents(events: IntakeEvent[]) {
  const actor = createActor(intakeMachine);
  actor.start();
  events.forEach((event) => actor.send(event));
  return actor.getSnapshot();
}

export function runIntakeScenario(id: string) {
  const scenario = getIntakeScenario(id);
  if (!scenario) throw new Error(`Unknown intake scenario: ${id}`);
  return runIntakeEvents(scenario.events);
}
