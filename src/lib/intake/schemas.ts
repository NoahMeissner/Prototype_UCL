import { z } from "zod";

export const organismGroupSchema = z.enum(["mrsa", "vre", "3mrgn", "4mrgn", "unknown"]);
export const carriageStatusSchema = z.enum(["colonization", "infection", "unknown"]);
export const topicClassSchema = z.enum(["mdro", "general"]);
export const careContextSchema = z.enum([
  "screening",
  "wound_care",
  "transport",
  "room_isolation",
  "ppe",
  "ward_routine",
  "other",
]);
export const sourceAgreementSchema = z.enum(["agree", "known_conflict", "not_checked"]);
export const terminalTargetSchema = z.enum([
  "insufficient_information",
  "specialist_review",
  "source_conflict",
  "red_flag_escalation",
]);

export const questionnaireResponseItemSchema = z.object({
  linkId: z.string(),
  text: z.string(),
  answer: z.string(),
  valueCoding: z.string().optional(),
  valueString: z.string().optional(),
});

export const questionnaireResponseSchema = z.object({
  resourceType: z.literal("QuestionnaireResponse"),
  status: z.enum(["in-progress", "completed", "stopped"]),
  item: z.array(questionnaireResponseItemSchema),
});

export const commonContractSchema = z.object({
  topicClass: topicClassSchema,
  organismGroup: organismGroupSchema.nullable(),
  scopeStatus: z.literal("in_scope"),
  safetyGatesResolved: z.boolean(),
  minimumViableState: z.boolean(),
  sourceAgreement: sourceAgreementSchema,
  terminalTarget: terminalTargetSchema.nullable(),
});

export const mdroPayloadSchema = z.object({
  organism: organismGroupSchema.nullable(),
  carriageStatus: carriageStatusSchema.nullable(),
  careContext: careContextSchema.nullable(),
  preemptiveIsolationRisk: z.boolean().nullable(),
  isolationDefault: z.enum(["standard", "contact", "single_room"]).nullable(),
  treatmentLimitationFlag: z.boolean(),
  otherContextText: z.string(),
});

export const intakeContextSchema = z.object({
  common: commonContractSchema,
  mdro: mdroPayloadSchema,
  questionnaireResponse: questionnaireResponseSchema,
  pathTrace: z.array(z.string()),
});

export const groundingStatusSchema = z.enum([
  "not_connected",
  "grounded",
  "partially_grounded",
  "insufficient_evidence",
  "source_conflict",
]);

export const sourceBoundingBoxSchema = z.object({
  page: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const sourceAssetSchema = z.object({
  type: z.enum(["image", "table", "link"]),
  title: z.string().optional(),
  url: z.string().optional(),
  markdown: z.string().optional(),
});

export const sourceCitationSchema = z.object({
  id: z.string(),
  title: z.string(),
  documentType: z.enum(["ukr", "rki", "other"]).optional(),
  section: z.string().optional(),
  page: z.number().int().positive().optional(),
  excerpt: z.string().optional(),
  url: z.string().optional(),
  pdfUrl: z.string().optional(),
  bbox: sourceBoundingBoxSchema.optional(),
  bboxes: z.array(sourceBoundingBoxSchema).optional(),
  selectionReason: z.string().optional(),
  assets: z.array(sourceAssetSchema).optional(),
});

export const answerGroundingSchema = z.object({
  status: groundingStatusSchema,
  summary: z.string(),
  sources: z.array(sourceCitationSchema),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  shortAnswer: z.string().optional(),
  recommendedAction: z.string().optional(),
  rationale: z.string().optional(),
  limitations: z.string().optional(),
  grounding: answerGroundingSchema.optional(),
});

export const chatContextSchema = z.object({
  summary: z.array(z.string()),
  common: commonContractSchema,
  mdro: mdroPayloadSchema,
  questionnaireResponse: questionnaireResponseSchema,
});

export type OrganismGroup = z.infer<typeof organismGroupSchema>;
export type CarriageStatus = z.infer<typeof carriageStatusSchema>;
export type TopicClass = z.infer<typeof topicClassSchema>;
export type CareContext = z.infer<typeof careContextSchema>;
export type SourceAgreement = z.infer<typeof sourceAgreementSchema>;
export type TerminalTarget = z.infer<typeof terminalTargetSchema>;
export type QuestionnaireResponseItem = z.infer<typeof questionnaireResponseItemSchema>;
export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;
export type CommonContract = z.infer<typeof commonContractSchema>;
export type MdroPayload = z.infer<typeof mdroPayloadSchema>;
export type IntakeContext = z.infer<typeof intakeContextSchema>;
export type GroundingStatus = z.infer<typeof groundingStatusSchema>;
export type SourceBoundingBox = z.infer<typeof sourceBoundingBoxSchema>;
export type SourceAsset = z.infer<typeof sourceAssetSchema>;
export type SourceCitation = z.infer<typeof sourceCitationSchema>;
export type AnswerGrounding = z.infer<typeof answerGroundingSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatContext = z.infer<typeof chatContextSchema>;

export type IntakeStep =
  | "organism"
  | "redFlag"
  | "carriage"
  | "careContext"
  | "otherContext"
  | "chatReady"
  | "insufficient"
  | "conflict"
  | "escalation";

export type IntakeEvent =
  | { type: "SELECT_ORGANISM"; organism: OrganismGroup }
  | { type: "SELECT_RED_FLAG_RISK"; risk: "yes" | "no" | "unknown" }
  | { type: "SELECT_CARRIAGE_STATUS"; status: CarriageStatus }
  | { type: "SELECT_CARE_CONTEXT"; context: CareContext }
  | { type: "ENTER_OTHER_CONTEXT"; text: string }
  | { type: "SELECT_SOURCE_STATUS"; sourceAgreement: SourceAgreement }
  | { type: "BACK" }
  | { type: "RESET" };
