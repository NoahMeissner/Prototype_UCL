export type StepId = 1 | 2 | 3 | 4 | 5;

export interface Option {
  key: string;
  label: string;
  hasFreitext?: boolean;
}

export interface Step {
  id: StepId;
  question: string;
  hint?: string;
  options: Option[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface WizardState {
  currentStep: StepId;
  selections: Partial<Record<StepId, string[]>>;
  freitextValues: Record<string, string>;
}
