import { QuestionnaireResponseItem } from "./schemas";

export function questionnaireItem(
  linkId: string,
  text: string,
  answer: string,
  valueCoding?: string,
  valueString?: string
) {
  return {
    linkId,
    text,
    answer,
    ...(valueCoding ? { valueCoding } : null),
    ...(valueString ? { valueString } : null),
  } satisfies QuestionnaireResponseItem;
}
