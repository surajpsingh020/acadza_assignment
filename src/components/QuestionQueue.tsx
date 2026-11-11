"use client";

import React from "react";
import { GroupedQuestion } from "@/lib/types";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Flame, Sparkles, User, XCircle, Search, HelpCircle, Layers } from "lucide-react";

interface QuestionQueueProps {
  questions: GroupedQuestion[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export const QuestionQueue: React.FC<QuestionQueueProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
}) => {
  const getVerdictBadge = (item: GroupedQuestion) => {
    const verdict = item.primaryResult.verdict;
    const repair = item.primaryResult.repair;
    const route = item.primaryResult.route;
    const decision = item.decisionStatus;

    if (decision === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          Faculty Approved
        </span>
      );
    }
    if (decision === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          <XCircle className="w-3 h-3" />
          Faculty Rejected
        </span>
      );
    }

    if (route === "faculty_review") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Needs Review: {repair || "Defect"}
        </span>
      );
    }

    if (route === "auto_apply") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <Sparkles className="w-3 h-3" />
          Auto-Fix: {repair}
        </span>
      );
    }

    if (verdict === "no_error") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <CheckCircle2 className="w-3 h-3" />
          No Error (Student Mistake)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {verdict}
      </span>
    );
  };

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case "physics":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900";
      case "chemistry":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900";
      case "zoology":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900";
      case "botany":
        return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-900";
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Search and Filter Tabs */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-800/50">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search QID, report ID (e.g. R001), keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "all", label: "All Questions", count: questions.length },
            {
              id: "review",
              label: "Needs Review",
              count: questions.filter((q) => q.primaryResult.route === "faculty_review").length,
            },
            {
              id: "auto",
              label: "Auto-Applied",
              count: questions.filter((q) => q.primaryResult.route === "auto_apply").length,
            },
            {
              id: "no_error",
              label: "Student Errors",
              count: questions.filter((q) => q.primaryResult.verdict === "no_error").length,
            },
            {
              id: "unreported",
              label: "Unreported Scanner",
              count: 4,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] flex items-center gap-1 ${
                activeFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === tab.id ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Queue items list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {questions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No questions match this filter.
          </div>
        ) : (
          questions.map((item, idx) => {
            const isSelected = item.question._id === selectedQuestionId;
            const qtype = item.question.questionType;
            const qData = item.question[qtype];
            const rawStem = stripHtml(qData?.question || "");
            const hasMultipleReports = item.reports.length > 1;

            return (
              <button
                key={item.question._id}
                onClick={() => onSelectQuestion(item.question._id)}
                className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 relative ${
                  isSelected
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600"
                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Top Meta Header */}
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getSubjectColor(
                        item.question.subject
                      )}`}
                    >
                      {item.question.subject}
                    </span>

                    <span className="font-mono text-slate-400 dark:text-slate-500">
                      #{item.question.qid || item.question._id.substring(0, 8)}
                    </span>
                  </div>

                  {hasMultipleReports && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm animate-pulse">
                      <Flame className="w-3 h-3 fill-white" />
                      {item.reports.length} Reports
                    </span>
                  )}
                </div>

                {/* Question Stem Excerpt */}
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                  {rawStem || "No question text available"}
                </p>

                {/* Student report snippet */}
                <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 flex-shrink-0 text-slate-400" />
                  <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold not-italic">
                    {item.reports.map((r) => r.reportId).join(", ")}:
                  </span>
                  <span className="truncate">&ldquo;{item.reports[0]?.comment}&rdquo;</span>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  {getVerdictBadge(item)}

                  <span className="text-[10px] font-mono text-slate-400">
                    Conf: {(item.primaryResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {questions.length} Questions Grouped
        </span>
        <span className="font-mono text-[10px]">Nav: [J] Next &bull; [K] Prev</span>
      </div>
    </div>
  );
};

export default QuestionQueue;
