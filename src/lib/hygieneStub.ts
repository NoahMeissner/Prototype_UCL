import {
  OPTION_LABELS,
  STEP_LABELS,
  getActiveSteps,
  getOptionsForStep,
} from "@/lib/graph";
import { Message, StepId, WizardState } from "@/lib/types";

function buildContext(
  selections: WizardState["selections"],
  freitextValues: WizardState["freitextValues"]
): string {
  const activeSteps = getActiveSteps(selections) as StepId[];
  const lines: string[] = [];

  for (const stepId of activeSteps) {
    const label = STEP_LABELS[stepId];
    const selected = selections[stepId] ?? [];
    const step2 = selections[2] ?? [];
    const options = getOptionsForStep(stepId, step2);

    const parts = selected.map((key) => {
      const optLabel = OPTION_LABELS[key] ?? key;
      const opt = options.find((o) => o.key === key);
      if (opt?.hasFreitext) {
        const ft = freitextValues[`${stepId}-${key}`];
        return ft ? `${optLabel}: "${ft}"` : optLabel;
      }
      return optLabel;
    });

    lines.push(`- ${label}: ${parts.join(", ")}`);
  }

  return lines.join("\n");
}

export async function getStubAnswer(
  selections: WizardState["selections"],
  freitextValues: WizardState["freitextValues"],
  _messages: Message[]
): Promise<string> {
  await new Promise((r) => setTimeout(r, 1000));
  const context = buildContext(selections, freitextValues);
  return (
    `Based on the patient context:\n${context}\n\n` +
    `Recommendation: The following protective measures are required:\n\n` +
    `• Gloves (powder-free, nitrile) mandatory before every patient contact\n` +
    `• Protective gown for personal care and invasive procedures\n` +
    `• FFP2 mask for respiratory pathogens or aerosol-generating procedures\n` +
    `• Hand disinfection before and after patient contact (min. 30 seconds)\n\n` +
    `Please consult the responsible infection control physician for uncertainties or high-risk situations.\n\n` +
    `*(Stub response — configure ANTHROPIC_API_KEY in .env.local to enable real answers)*`
  );
}
