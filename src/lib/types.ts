export type QuestionType = "scq" | "mcq" | "integerQuestion";

export interface QuestionData {
  question: string;
  solution: string;
  answer: string | string[];
  quesImages?: string[];
  solutionImages?: string[];
}

export interface ErrorHistoryItem {
  type: string;
  actor: "faculty" | "ai" | "admin";
  at: string;
  note?: string;
}

export interface Question {
  _id: string;
  qid: string | null;
  questionType: QuestionType;
  subject: string;
  chapter: string;
  concept?: string | null;
  subConcept?: string | null;
  level?: "EASY" | "MEDIUM" | "HARD" | null;
  error?: number;
  updatedAt?: string;
  scq?: QuestionData;
  mcq?: QuestionData;
  integerQuestion?: QuestionData;
  errorHistory?: ErrorHistoryItem[];
}

export interface StudentReport {
  reportId: string;
  questionId: string;
  studentId: string;
  source: "web" | "android" | "ios";
  reportedAt: string;
  comment: string;
}

export interface SurgicalEdit {
  field?: "question" | "solution" | "answer" | "questionType";
  find?: string;
  replace?: string;
}

export type Verdict =
  | "defect"
  | "no_error"
  | "display_issue"
  | "app_issue"
  | "language_mode"
  | "already_fixed"
  | "not_actionable";

export type RepairType =
  | "spelling"
  | "noise"
  | "exam_reference"
  | "markup_leak"
  | "answer_form"
  | "notation"
  | "stem_data"
  | "option_repair"
  | "solution_fix"
  | "solution_missing"
  | "answer_key"
  | "type_mismatch"
  | "identical_options"
  | "diagram"
  | "wrong_question"
  | "unsound"
  | "wrong_chapter"
  | "syllabus";

export type Route = "auto_apply" | "faculty_review" | "no_change";

export interface TriageResult {
  reportId: string;
  questionId: string;
  verdict: Verdict;
  repair: RepairType | null;
  edit: SurgicalEdit;
  route: Route;
  confidence: number;
  evidence: string;
  student_reply: string;
}

export type FacultyDecisionStatus = "pending" | "approved" | "edited" | "rejected";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  questionId: string;
  reportIds: string[];
  action: "auto_applied" | "faculty_approved" | "faculty_edited" | "faculty_rejected";
  actor: string;
  notes?: string;
  appliedEdit?: SurgicalEdit;
}

export interface GroupedQuestion {
  question: Question;
  reports: StudentReport[];
  results: TriageResult[];
  primaryResult: TriageResult;
  priorityScore: number;
  decisionStatus: FacultyDecisionStatus;
  userNotes?: string;
  customEdit?: SurgicalEdit;
}
