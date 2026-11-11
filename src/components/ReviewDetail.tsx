"use client";

import React, { useState } from "react";
import { GroupedQuestion, SurgicalEdit } from "@/lib/types";
import MathRenderer from "./MathRenderer";
import DiffViewer from "./DiffViewer";
import StudentReplyCard from "./StudentReplyCard";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Sparkles,
  AlertTriangle,
  History,
  ShieldAlert,
  ChevronRight,
  Send,
  Zap,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

interface ReviewDetailProps {
  item: GroupedQuestion;
  onApprove: (questionId: string) => void;
  onReject: (questionId: string, notes?: string) => void;
  onEditAndApprove: (questionId: string, customEdit: SurgicalEdit, notes?: string) => void;
  className?: string;
}

export const ReviewDetail: React.FC<ReviewDetailProps> = ({
  item,
  onApprove,
  onReject,
  onEditAndApprove,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"question" | "solution" | "diff" | "replies">("diff");
  const [isEditingDiff, setIsEditingDiff] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const q = item.question;
  const qtype = q.questionType;
  const qData = q[qtype] || { question: "", solution: "", answer: "" };
  const primaryRes = item.primaryResult;

  // Custom edit draft state
  const [editDraft, setEditDraft] = useState<SurgicalEdit>({
    field: primaryRes.edit.field || "answer",
    find: primaryRes.edit.find || "",
    replace: primaryRes.edit.replace || "",
  });
  const [facultyNotes, setFacultyNotes] = useState("");

  const handleSaveCustomEdit = () => {
    onEditAndApprove(q._id, editDraft, facultyNotes || "Faculty customized the surgical replacement.");
    setIsEditingDiff(false);
  };

  const handleConfirmReject = () => {
    onReject(q._id, rejectReason || "Rejected by faculty (kept original record).");
    setRejectModalOpen(false);
  };

  const originalTargetText =
    primaryRes.edit.field === "solution"
      ? qData.solution
      : primaryRes.edit.field === "question"
      ? qData.question
      : Array.isArray(qData.answer)
      ? JSON.stringify(qData.answer)
      : String(qData.answer || "");

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 overflow-y-auto ${className}`}>
      {/* Top Banner / Question Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {q.subject}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {q.chapter}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                {qtype}
              </span>
              {q.level && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Level: {q.level}
                </span>
              )}
            </div>

            <h1 className="text-sm font-mono text-slate-500 dark:text-slate-400">
              ID: <span className="text-slate-800 dark:text-slate-200 font-semibold">{q._id}</span>
              {q.qid && <span className="ml-2 text-indigo-600 font-bold">({q.qid})</span>}
            </h1>
          </div>

          {/* Action Buttons for Faculty (10 PM Shift optimization) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(q._id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Shortcut: Press 'A'"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Fix [A]</span>
            </button>

            <button
              onClick={() => setIsEditingDiff(true)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
              title="Shortcut: Press 'E'"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Diff [E]</span>
            </button>

            <button
              onClick={() => setRejectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              title="Shortcut: Press 'R'"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject [R]</span>
            </button>
          </div>
        </div>

        {/* AI Triage Verdict Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Verdict & Classification:</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-slate-100 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              {primaryRes.verdict}
              {primaryRes.repair && (
                <span className="text-indigo-600 font-mono">({primaryRes.repair})</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Routing Pipeline:</span>
            <span
              className={`inline-block mt-1 font-bold uppercase tracking-wider ${
                primaryRes.route === "auto_apply"
                  ? "text-blue-600 dark:text-blue-400"
                  : primaryRes.route === "faculty_review"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-500"
              }`}
            >
              {primaryRes.route.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">AI Confidence:</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${primaryRes.confidence * 100}%` }}
                />
              </div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {(primaryRes.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Decision Status:</span>
            <span className="inline-block mt-1 font-bold capitalize text-slate-800 dark:text-slate-200">
              {item.decisionStatus === "pending" ? (
                <span className="text-slate-500">Pending Faculty Action</span>
              ) : item.decisionStatus === "approved" ? (
                <span className="text-emerald-600">Approved</span>
              ) : item.decisionStatus === "edited" ? (
                <span className="text-amber-600">Customized & Approved</span>
              ) : (
                <span className="text-rose-600">Rejected</span>
              )}
            </span>
          </div>
        </div>

        {/* AI Evidence Insight */}
        {primaryRes.evidence && (
          <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
            <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">STEM Solver Ground Truth & Evidence: </span>
              <span>{primaryRes.evidence}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs inside detail */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "diff"
                ? "border-b-indigo-600 text-indigo-600 font-bold"
                : "border-b-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Proposed Surgical Diff
          </button>

          <button
            onClick={() => setActiveTab("question")}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "question"
                ? "border-b-indigo-600 text-indigo-600 font-bold"
                : "border-b-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Rendered Question & Options
          </button>

          <button
            onClick={() => setActiveTab("solution")}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "solution"
                ? "border-b-indigo-600 text-indigo-600 font-bold"
                : "border-b-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Stored Solution
          </button>

          <button
            onClick={() => setActiveTab("replies")}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "replies"
                ? "border-b-indigo-600 text-indigo-600 font-bold"
                : "border-b-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Student Reports & Replies ({item.reports.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 flex-1 space-y-6 max-w-5xl">
        {/* Tab 1: Proposed Surgical Diff */}
        {activeTab === "diff" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Surgical Field Replacement
              </h2>
              <span className="text-xs text-slate-400">
                Never rewrites whole HTML; targets minimal substring
              </span>
            </div>

            <DiffViewer
              edit={item.customEdit || primaryRes.edit}
              originalText={originalTargetText}
            />

            {/* Rendered Question in Context */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Question Context (HTML + Native MathML)
              </h3>
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <MathRenderer content={qData.question} />
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 flex items-center gap-2">
                  <span>Stored Key:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 font-bold">
                    {Array.isArray(qData.answer) ? qData.answer.join(", ") : qData.answer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rendered Question */}
        {activeTab === "question" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Live Question Presentation
            </h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <MathRenderer content={qData.question} />
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Stored Answer:</span>
                <span className="font-mono px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-bold">
                  {Array.isArray(qData.answer) ? qData.answer.join(", ") : qData.answer}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Stored Solution */}
        {activeTab === "solution" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Stored Reference Solution
            </h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <MathRenderer content={qData.solution || "<em>No solution text stored.</em>"} />
            </div>
          </div>
        )}

        {/* Tab 4: Student Reports & Reply Previews */}
        {activeTab === "replies" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Student Reports ({item.reports.length}) & Automated Reply Previews
            </h2>

            <div className="space-y-4">
              {item.reports.map((rep) => {
                const repResult =
                  item.results.find((res) => res.reportId === rep.reportId) || primaryRes;
                return (
                  <StudentReplyCard
                    key={rep.reportId}
                    report={rep}
                    result={repResult}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Error History if present */}
        {q.errorHistory && q.errorHistory.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
              <History className="w-4 h-4" />
              Prior Question Revision History
            </div>
            {q.errorHistory.map((h, i) => (
              <div key={i} className="text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span className="font-mono text-slate-500">{new Date(h.at).toLocaleDateString()}:</span>
                <span className="font-semibold">{h.type}</span>
                <span>by {h.actor}</span>
                {h.note && <span className="italic text-slate-600 dark:text-slate-400">({h.note})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Edit Modal */}
      {isEditingDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Customize Proposed Surgical Diff
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Target Field:</label>
                <select
                  value={editDraft.field}
                  onChange={(e) => setEditDraft({ ...editDraft, field: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                >
                  <option value="answer">answer (Key modification)</option>
                  <option value="question">question (Stem or Option replacement)</option>
                  <option value="solution">solution (Step fix or explanation)</option>
                  <option value="questionType">questionType (scq / mcq / integer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Target Substring (Find):</label>
                <textarea
                  value={editDraft.find || ""}
                  onChange={(e) => setEditDraft({ ...editDraft, find: e.target.value })}
                  rows={3}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  placeholder="Exact string to find in database..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Replacement Content (Replace):</label>
                <textarea
                  value={editDraft.replace || ""}
                  onChange={(e) => setEditDraft({ ...editDraft, replace: e.target.value })}
                  rows={3}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  placeholder="Replacement string..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Faculty Review Note:</label>
                <input
                  type="text"
                  value={facultyNotes}
                  onChange={(e) => setFacultyNotes(e.target.value)}
                  placeholder="Why this replacement was adjusted..."
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsEditingDiff(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomEdit}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Save & Approve Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              Reject Report & Keep Original
            </h3>
            <p className="text-xs text-slate-500">
              This will discard any proposed changes and keep the question unmodified in production.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Reason for Rejection:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Student calculation mistake; checked independently; original answer key is sound."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;
