import { AuditLogEntry, FacultyDecisionStatus, SurgicalEdit } from "./types";

const DECISIONS_KEY = "acadza_faculty_decisions";
const AUDIT_KEY = "acadza_audit_trail";
const EDITS_KEY = "acadza_custom_edits";

export interface DecisionRecord {
  status: FacultyDecisionStatus;
  actor: string;
  timestamp: string;
  notes?: string;
  customEdit?: SurgicalEdit;
}

export function getDecisions(): Record<string, DecisionRecord> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(DECISIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to read decisions from localStorage", e);
    return {};
  }
}

export function saveDecision(
  questionId: string,
  status: FacultyDecisionStatus,
  actor: string = "Faculty Lead (10 PM Shift)",
  notes?: string,
  customEdit?: SurgicalEdit,
  reportIds: string[] = []
): void {
  if (typeof window === "undefined") return;
  try {
    const decisions = getDecisions();
    const timestamp = new Date().toISOString();

    decisions[questionId] = {
      status,
      actor,
      timestamp,
      notes,
      customEdit,
    };
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));

    // Append to audit trail
    const auditLogs = getAuditLogs();
    const actionMap: Record<FacultyDecisionStatus, AuditLogEntry["action"]> = {
      approved: "faculty_approved",
      edited: "faculty_edited",
      rejected: "faculty_rejected",
      pending: "auto_applied",
    };

    const newAuditEntry: AuditLogEntry = {
      id: "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp,
      questionId,
      reportIds,
      action: actionMap[status],
      actor,
      notes: notes || `Marked as ${status}`,
      appliedEdit: customEdit,
    };

    auditLogs.unshift(newAuditEntry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs));
  } catch (e) {
    console.error("Failed to save decision", e);
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read audit logs", e);
    return [];
  }
}

export function clearAuditLogs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUDIT_KEY);
  localStorage.removeItem(DECISIONS_KEY);
}
