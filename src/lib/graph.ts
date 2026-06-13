import { Option, Step, StepId, WizardState } from "./types";
import wizardConfig from "./wizard.json";

interface SkipCondition {
  step: number;
  ifAny?: string[];
  ifOnly?: string[];
}

interface ConditionalConfig {
  skipConditions: SkipCondition[];
  optionsBySelection: Record<string, Option[]>;
}

interface StepConfig {
  id: number;
  label: string;
  question: string;
  hint?: string;
  options?: Option[];
  conditional?: ConditionalConfig;
}

const config = wizardConfig as { steps: StepConfig[] };

// Derived lookups built from JSON at module load time
export const STEP_LABELS: Record<StepId, string> = Object.fromEntries(
  config.steps.map((s) => [s.id, s.label])
) as Record<StepId, string>;

export const OPTION_LABELS: Record<string, string> = Object.fromEntries(
  config.steps.flatMap((s) => {
    const flat: Option[] = [
      ...(s.options ?? []),
      ...Object.values(s.conditional?.optionsBySelection ?? {}).flat(),
    ];
    return flat.map((o) => [o.key, o.label]);
  })
);

export function getStepData(stepId: StepId): Step {
  const s = config.steps.find((x) => x.id === stepId)!;
  return { id: stepId, question: s.question, hint: s.hint, options: s.options ?? [] };
}

export function getOptionsForStep(stepId: StepId, step2Selections: string[]): Option[] {
  const s = config.steps.find((x) => x.id === stepId);
  if (!s) return [];
  if (s.conditional) return getConditionalOptions(s.conditional, step2Selections);
  return s.options ?? [];
}

function getConditionalOptions(cond: ConditionalConfig, selections: string[]): Option[] {
  const seen = new Set<string>();
  const result: Option[] = [];
  for (const key of selections) {
    for (const opt of cond.optionsBySelection[key] ?? []) {
      if (!seen.has(opt.key)) {
        seen.add(opt.key);
        result.push(opt);
      }
    }
  }
  return result;
}

export function getStep3Options(step2Selections: string[]): Option[] {
  return getOptionsForStep(3, step2Selections);
}

export function shouldSkipStep3(selections: WizardState["selections"]): boolean {
  const cond = config.steps.find((s) => s.id === 3)?.conditional;
  if (!cond) return false;
  return cond.skipConditions.some((sc) => {
    const sel = selections[sc.step as StepId] ?? [];
    if (sc.ifAny) return sc.ifAny.some((k) => sel.includes(k));
    if (sc.ifOnly) {
      return (
        sel.length > 0 &&
        sel.length === sc.ifOnly.length &&
        sc.ifOnly.every((k) => sel.includes(k))
      );
    }
    return false;
  });
}

export function getActiveSteps(selections: WizardState["selections"]): StepId[] {
  const all = config.steps.map((s) => s.id as StepId);
  if (shouldSkipStep3(selections)) {
    const skipId = config.steps.find((s) => s.conditional)?.id;
    return all.filter((id) => id !== skipId);
  }
  return all;
}

// Re-export base step shape for components that need the question text only
export { config as WIZARD_CONFIG };
