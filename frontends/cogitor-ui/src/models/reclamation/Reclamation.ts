// /srv/clone/frontends/cogitor-ui/src/models/reclamation/Reclamation.ts

export type ReclamationStatus =
  | "draft"
  | "registered"
  | "accepted"
  | "in_progress"
  | "waiting_response"
  | "resolved"
  | "rejected"
  | "escalated"
  | "with_chairman"
  | "completed"
  | "closed"
  | "cancelled";

export type ReclamationType =
  | "content"
  | "context"
  | "behavior"
  | "transaction"
  | "governance"
  | "system";

/**
 * ВАЖНО:
 * Оставляем и "critical", и "urgent", чтобы не ломать текущий фронт,
 * пока все места не переведены на единый enum.
 */
export type ReclamationPriority =
  | "low"
  | "normal"
  | "high"
  | "critical"
  | "urgent";

export type ReclamationSourceType = "user" | "system" | "moderator" | "auto";

export interface ReclamationSummary {
  reclamationId: string;
  reclamationType: ReclamationType;
  sourceType?: ReclamationSourceType;
  status: ReclamationStatus;
  priority: ReclamationPriority;
  title: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  createdBySubjectId?: string;
  respondentSubjectId?: string | null;
  currentResponsibleSubjectId?: string | null;
  communityId?: string | null;
  deadlineAt?: string | null;
  hasUnread?: boolean;
  unreadCount?: number;
  claimantEffectiveSubjectId?: string | null;
  respondentEffectiveSubjectId?: string | null;
  escalationLevel?: number;
  isCurrentActor?: boolean;
}

export interface ReclamationDashboard {
  inboxCount: number;
  outboxCount: number;
  waitingResponseCount: number;
  escalatedCount: number;
  overdueCount: number;
  closedCount: number;
}

export interface ReclamationCreateRequest {
  actorSubjectId: string;
  reclamationType: ReclamationType;
  sourceType?: ReclamationSourceType;
  priority?: ReclamationPriority;
  respondentSubjectId?: string;
  targetType: string;
  targetId: string;
  communityId?: string | null;
  title: string;
  description?: string;
}

export interface ReclamationPatchRequest {
  actorSubjectId: string;
  status?: ReclamationStatus;
  priority?: ReclamationPriority;
  description?: string;
  deadlineAt?: string | null;
  currentResponsibleSubjectId?: string | null;
}

export interface ReclamationAcceptRequest {
  actorSubjectId: string;
  responsibleSubjectId?: string;
}

export interface ReclamationAssignRequest {
  actorSubjectId: string;
  responsibleSubjectId: string;
}

export interface ReclamationWithdrawRequest {
  actorSubjectId: string;
}

export interface ReclamationCloseRequest {
  actorSubjectId: string;
}

export type ReclamationEscalationReason =
  | "no_response"
  | "conflict_of_interest"
  | "timeout"
  | "appeal"
  | "insufficient_authority"
  | "manual"
  | "no_reason_provided";

export interface ReclamationEscalateRequest {
  actorSubjectId: string;
  escalationReason: ReclamationEscalationReason;
  comment: string;
}

export interface ReclamationEscalateResponse {
  escalationId: string;
  reclamationId: string;
  status: ReclamationStatus;
  claimantEffectiveSubjectId: string;
  respondentEffectiveSubjectId: string;
  escalationLevel: number;
}

export interface ReclamationCore {
  reclamationId: string;
  reclamationType: ReclamationType;
  sourceType: ReclamationSourceType;
  status: ReclamationStatus;
  priority: ReclamationPriority;
  createdBySubjectId: string;
  respondentSubjectId?: string | null;
  currentResponsibleSubjectId?: string | null;
  claimantEffectiveSubjectId?: string | null;
  respondentEffectiveSubjectId?: string | null;
  escalationLevel?: number;
  targetType: string;
  targetId: string;
  communityId?: string | null;
  processId?: string | null;
  dealId?: string | null;
  title: string;
  description?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
  closedAt?: string | null;
  deadlineAt?: string | null;
}

export type ReclamationParticipantRole =
  | "claimant"
  | "respondent"
  | "moderator"
  | "responsible"
  | "guarantor"
  | "supervisor"
  | "observer"
  | "board"
  | "veche";

export interface ReclamationParticipant {
  participantId: string;
  reclamationId?: string;
  subjectId: string;
  participantRole: ReclamationParticipantRole;
  status?: "active" | "removed" | "replaced";
  addedAt?: string;
  addedBySubjectId?: string | null;
}

export type ReclamationMessageType =
  | "comment"
  | "explanation"
  | "clarification_request"
  | "objection"
  | "correction"
  | "system_note";

export type ReclamationVisibility =
  | "public"
  | "participants"
  | "moderators"
  | "system";

export interface ReclamationMessage {
  messageId: string;
  reclamationId?: string;
  authorSubjectId: string;
  messageType: ReclamationMessageType;
  body: string;
  createdAt: string;
  visibility: ReclamationVisibility;
}

export interface ReclamationCreateMessageRequest {
  actorSubjectId: string;
  messageType: ReclamationMessageType;
  body: string;
  visibility?: ReclamationVisibility;
}

export interface ReclamationAttachment {
  attachmentId: string;
  reclamationId?: string;
  messageId?: string | null;
  uploadedBySubjectId: string;
  fileRefId?: string | null;
  uri?: string | null;
  title: string;
  description?: string | null;
  createdAt: string;
}

export interface ReclamationCreateAttachmentRequest {
  actorSubjectId: string;
  messageId?: string | null;
  uri: string;
  title?: string;
  description?: string;
}

export type ReclamationResponseType =
  | "accept"
  | "reject"
  | "explain"
  | "correct"
  | "apologize"
  | "compensate"
  | "appeal";

export interface ReclamationResponse {
  responseId: string;
  reclamationId?: string;
  respondentSubjectId: string;
  responseType: ReclamationResponseType;
  body: string;
  createdAt: string;
}

export interface ReclamationCreateResponseRequest {
  actorSubjectId: string;
  responseType: ReclamationResponseType;
  body?: string;
}

export type ReclamationDecisionType =
  | "reject"
  | "accept"
  | "correct"
  | "warn"
  | "hide"
  | "archive"
  | "move"
  | "restore"
  | "compensate"
  | "restrict"
  | "escalate"
  | "vote"
  | "veche";

export interface ReclamationDecision {
  reclamationDecisionId: string;
  reclamationId?: string;
  decisionBySubjectId: string;
  decisionType: ReclamationDecisionType;
  decisionText: string;
  reason: string;
  createdAt: string;
  effectiveFrom?: string | null;
  isFinal: boolean;
}

export interface ReclamationCreateDecisionRequest {
  actorSubjectId: string;
  decisionType: ReclamationDecisionType;
  decisionText?: string;
  reason?: string;
  isFinal?: boolean;
}

export interface ReclamationEscalation {
  escalationId: string;
  reclamationId?: string;
  fromSubjectId?: string | null;
  toSubjectId?: string | null;
  fromLevel: number;
  toLevel: number;
  escalationReason: ReclamationEscalationReason;
  createdAt: string;
  createdBySubjectId?: string | null;
}

export type ReclamationEventType =
  | "created"
  | "taken_in_progress"
  | "message_added"
  | "response_added"
  | "decision_made"
  | "action_created"
  | "action_done"
  | "escalated"
  | "closed"
  | "cancelled"
  | "status_changed"
  | "responsible_assigned";

export interface ReclamationEvent {
  eventId: string;
  reclamationId?: string;
  eventType: ReclamationEventType;
  actorSubjectId?: string | null;
  payload?: unknown;
  createdAt: string;
}

export interface ReclamationFullData extends ReclamationCore {
  participants: ReclamationParticipant[];
  messages: ReclamationMessage[];
  attachments?: ReclamationAttachment[];
  responses?: ReclamationResponse[];
  decisions: ReclamationDecision[];
  escalations: ReclamationEscalation[];
  events?: ReclamationEvent[];
}

export interface ReclamationFullResponse {
  data: ReclamationFullData;
}

export interface ReclamationListEnvelope {
  data: ReclamationSummary[];
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ReclamationDashboardResponse {
  data: ReclamationDashboard;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ReclamationStatusTransitionResponse {
  reclamationId: string;
  status: ReclamationStatus;
  message: string;
}