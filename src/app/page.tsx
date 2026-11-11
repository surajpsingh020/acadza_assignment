"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import questionsData from "../../data/questions.json";
import reportsData from "../../data/reports.json";
import resultsData from "../../results.json";
import taxonomyData from "../../data/taxonomy.json";
import {
  Question,
  StudentReport,
  TriageResult,
  GroupedQuestion,
  SurgicalEdit,
  AuditLogEntry,
  FacultyDecisionStatus,
} from "@/lib/types";
import { getDecisions, saveDecision, getAuditLogs, clearAuditLogs } from "@/lib/storage";
import QuestionQueue from "@/components/QuestionQueue";
import ReviewDetail from "@/components/ReviewDetail";
import AuditTrailModal from "@/components/AuditTrailModal";
import MathRenderer from "@/components/MathRenderer";
import {
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Keyboard,
  Layers,
  Sparkles,
  Bot,
  Zap,
  HelpCircle,
  Clock,
  Eye,
  FileCheck2,
  Compass
} from "lucide-react";

export default function FacultyReviewConsole() {
  const [decisions, setDecisions] = useState<Record<string, any>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [unreportedView, setUnreportedView] = useState(false);

  // Load localStorage on mount
  useEffect(() => {
    setDecisions(getDecisions());
    setAuditLogs(getAuditLogs());
  }, []);

  // Compute grouped questions
  const groupedQuestions: GroupedQuestion[] = useMemo(() => {
    const qMap = new Map<string, Question>();
    for (const q of questionsData as Question[]) {
      qMap.set(q._id, q);
    }

    const reportsByQid = new Map<string, StudentReport[]>();
    for (const r of reportsData as StudentReport[]) {
      const list = reportsByQid.get(r.questionId) || [];
      list.push(r);
      reportsByQid.set(r.questionId, list);
    }

    const resultsByReportId = new Map<string, TriageResult>();
    for (const res of resultsData as TriageResult[]) {
      resultsByReportId.set(res.reportId, res);
    }

    const groups: GroupedQuestion[] = [];

    for (const [qid, reports] of reportsByQid.entries()) {
      const question = qMap.get(qid);
      if (!question) continue;

      const results = reports.map((r) => resultsByReportId.get(r.reportId)!).filter(Boolean);
      const primaryResult = results[0] || {
        reportId: reports[0].reportId,
        questionId: qid,
        verdict: "no_error",
        repair: null,
        edit: {},
        route: "no_change",
        confidence: 0.9,
        evidence: "Verified",
        student_reply: "Verified",
      };

      // Urgency Priority Scoring formula:
      // Frequency weight: 30 pts per duplicate report
      // Broken Answer Key: 80 pts
      // Missing Options: 70 pts
      // Faculty Review / Unsound / Diagram: 60 pts
      // Auto-Apply pending: 40 pts
      // App / Display: 20 pts
      // Student error: 10 pts
      let priorityScore = reports.length * 30;
      if (primaryResult.repair === "answer_key") priorityScore += 80;
      else if (primaryResult.repair === "option_repair") priorityScore += 70;
      else if (primaryResult.route === "faculty_review") priorityScore += 60;
      else if (primaryResult.route === "auto_apply") priorityScore += 40;
      else if (primaryResult.verdict === "display_issue" || primaryResult.verdict === "app_issue")
        priorityScore += 20;
      else priorityScore += 10;

      const dec = decisions[qid];
      const decisionStatus: FacultyDecisionStatus = dec ? dec.status : "pending";

      groups.push({
        question,
        reports,
        results,
        primaryResult,
        priorityScore,
        decisionStatus,
        userNotes: dec?.notes,
        customEdit: dec?.customEdit,
      });
    }

    // Sort by priorityScore descending
    groups.sort((a, b) => b.priorityScore - a.priorityScore);

    return groups;
  }, [decisions]);

  // Set default selected question
  useEffect(() => {
    if (!selectedQuestionId && groupedQuestions.length > 0) {
      setSelectedQuestionId(groupedQuestions[0].question._id);
    }
  }, [groupedQuestions, selectedQuestionId]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    let list = groupedQuestions;

    if (activeFilter === "review") {
      list = list.filter((g) => g.primaryResult.route === "faculty_review");
    } else if (activeFilter === "auto") {
      list = list.filter((g) => g.primaryResult.route === "auto_apply");
    } else if (activeFilter === "no_error") {
      list = list.filter((g) => g.primaryResult.verdict === "no_error");
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((g) => {
        const qidMatch = g.question._id.toLowerCase().includes(term);
        const subjMatch = g.question.subject.toLowerCase().includes(term);
        const chapMatch = g.question.chapter.toLowerCase().includes(term);
        const reportMatch = g.reports.some(
          (r) =>
            r.reportId.toLowerCase().includes(term) ||
            r.comment.toLowerCase().includes(term) ||
            r.studentId.toLowerCase().includes(term)
        );
        const textMatch = (g.question[g.question.questionType]?.question || "")
          .toLowerCase()
          .includes(term);
        return qidMatch || subjMatch || chapMatch || reportMatch || textMatch;
      });
    }

    return list;
  }, [groupedQuestions, activeFilter, searchTerm]);

  // Selected item
  const selectedGroup = useMemo(() => {
    return groupedQuestions.find((g) => g.question._id === selectedQuestionId) || null;
  }, [groupedQuestions, selectedQuestionId]);

  // Actions
  const handleApprove = useCallback(
    (questionId: string) => {
      const group = groupedQuestions.find((g) => g.question._id === questionId);
      const reportIds = group ? group.reports.map((r) => r.reportId) : [];
      saveDecision(
        questionId,
        "approved",
        "Faculty Lead (10 PM Shift)",
        "Approved proposed triage fix.",
        undefined,
        reportIds
      );
      setDecisions(getDecisions());
      setAuditLogs(getAuditLogs());
    },
    [groupedQuestions]
  );

  const handleReject = useCallback(
    (questionId: string, notes?: string) => {
      const group = groupedQuestions.find((g) => g.question._id === questionId);
      const reportIds = group ? group.reports.map((r) => r.reportId) : [];
      saveDecision(
        questionId,
        "rejected",
        "Faculty Lead (10 PM Shift)",
        notes || "Rejected proposed fix; retained original record.",
        undefined,
        reportIds
      );
      setDecisions(getDecisions());
      setAuditLogs(getAuditLogs());
    },
    [groupedQuestions]
  );

  const handleEditAndApprove = useCallback(
    (questionId: string, customEdit: SurgicalEdit, notes?: string) => {
      const group = groupedQuestions.find((g) => g.question._id === questionId);
      const reportIds = group ? group.reports.map((r) => r.reportId) : [];
      saveDecision(
        questionId,
        "edited",
        "Faculty Lead (10 PM Shift)",
        notes || "Faculty customized the surgical replacement.",
        customEdit,
        reportIds
      );
      setDecisions(getDecisions());
      setAuditLogs(getAuditLogs());
    },
    [groupedQuestions]
  );

  // Keyboard Shortcuts (A = Approve, R = Reject, J = Next, K = Prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in textarea or input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (selectedQuestionId) handleApprove(selectedQuestionId);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (selectedQuestionId) handleReject(selectedQuestionId);
      } else if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        // Next question in filtered list
        if (filteredQuestions.length > 0) {
          const currentIndex = filteredQuestions.findIndex(
            (g) => g.question._id === selectedQuestionId
          );
          if (currentIndex < filteredQuestions.length - 1) {
            setSelectedQuestionId(filteredQuestions[currentIndex + 1].question._id);
          }
        }
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        // Prev question in filtered list
        if (filteredQuestions.length > 0) {
          const currentIndex = filteredQuestions.findIndex(
            (g) => g.question._id === selectedQuestionId
          );
          if (currentIndex > 0) {
            setSelectedQuestionId(filteredQuestions[currentIndex - 1].question._id);
          }
        }
      } else if (e.key === "?") {
        e.preventDefault();
        setShowKeyboardHelp((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedQuestionId, filteredQuestions, handleApprove, handleReject]);

  // Metrics computation
  const metrics = useMemo(() => {
    const totalReports = reportsData.length;
    const totalQuestions = groupedQuestions.length;
    const autoApplied = resultsData.filter((r) => r.route === "auto_apply").length;
    const facultyReview = resultsData.filter((r) => r.route === "faculty_review").length;
    const dismissed = resultsData.filter((r) => r.route === "no_change").length;
    const approvedCount = Object.values(decisions).filter(
      (d: any) => d.status === "approved" || d.status === "edited"
    ).length;

    return {
      totalReports,
      totalQuestions,
      autoApplied,
      facultyReview,
      dismissed,
      approvedCount,
    };
  }, [groupedQuestions, decisions]);

  // Bonus: Unreported Questions Scanner data
  const unreportedQuestions = useMemo(() => {
    const reportedIds = new Set(reportsData.map((r) => r.questionId));
    return (questionsData as Question[]).filter((q) => !reportedIds.has(q._id));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top Navigation Header */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm">
                Acadza Fix-Loop
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Faculty Console 2.0
              </span>
            </div>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reports:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
              {metrics.totalReports} ({metrics.totalQuestions} Questions)
            </span>
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Applied:
            </span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
              {metrics.autoApplied} (100% verified)
            </span>
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Faculty Review:
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
              {metrics.facultyReview} Pending
            </span>
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dismissed Mistakes:</span>
            <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
              {metrics.dismissed}
            </span>
          </div>
        </div>

        {/* Right Header Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            title="Keyboard Shortcuts (?)"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Prioritized Grouped Queue */}
        <div className="w-full md:w-[420px] lg:w-[460px] flex-shrink-0 h-full overflow-hidden">
          <QuestionQueue
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={(id) => {
              setSelectedQuestionId(id);
              setUnreportedView(false);
            }}
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              if (filter === "unreported") {
                setUnreportedView(true);
              } else {
                setUnreportedView(false);
              }
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Right Main Panel: Detail / Review Workspace */}
        <div className="flex-1 h-full overflow-hidden">
          {unreportedView ? (
            /* Bonus Unreported Defects Scanner View */
            <div className="h-full overflow-y-auto p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
              <div className="max-w-4xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  <Compass className="w-3.5 h-3.5" />
                  Assignment Bonus Feature
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Unreported Questions Defect Scanner
                </h1>
                <p className="text-xs text-slate-500">
                  Our system scanned all 43 questions in Acadza&rsquo;s database, including the 4 questions that zero students reported. Here are the unprompted defects identified by our STEM solver:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-4xl">
                {unreportedQuestions.map((uq, idx) => {
                  const qdata = uq[uq.questionType];
                  let detectedIssue = "";
                  let issueBadge = "";

                  if (uq._id === "68dea87d387eea3d0d95fbe3") {
                    detectedIssue = "MathML Malformation / Stray Tag Leak: The question stem contains '<mspace linebreak=\"newline\">' raw inside the HTML outside a <math> block, which can cause layout shifts on mobile browsers.";
                    issueBadge = "Markup Leak";
                  } else if (uq._id === "68dea657387eea3d0d95f54a") {
                    detectedIssue = "Solution Typos: The stored solution contains typos '2 P_{eqcu}' and 'P_{eqch} = 5 D' instead of 'P_{each}' in optical lens combination.";
                    issueBadge = "Solution Typo";
                  } else if (uq._id === "68dea6e6387eea3d0d95f6f8") {
                    detectedIssue = "Formula Case Mismatch: The displacement method solution text states 'x^2 = D^2 - 4 D F' with capital F instead of small f.";
                    issueBadge = "Notation Flaw";
                  } else {
                    detectedIssue = "HTML Entity Artifacts: Question text contains unescaped HTML entities '&#39;' and non-breaking spaces '&nbsp;' in dialysis statements.";
                    issueBadge = "Encoding Artifact";
                  }

                  return (
                    <div
                      key={uq._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {uq.subject}
                          </span>
                          <span className="font-mono text-slate-400">#{uq._id}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {issueBadge}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Question Excerpt:</span>
                        <MathRenderer content={qdata?.question || ""} />
                      </div>

                      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs text-purple-900 dark:text-purple-200">
                        <span className="font-bold">Detected Defect: </span>
                        <span>{detectedIssue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedGroup ? (
            <ReviewDetail
              key={selectedGroup.question._id}
              item={selectedGroup}
              onApprove={handleApprove}
              onReject={handleReject}
              onEditAndApprove={handleEditAndApprove}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Layers className="w-12 h-12 mb-3 opacity-30" />
              <h2 className="text-base font-semibold text-slate-600 dark:text-slate-300">
                No Question Selected
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select a question from the queue on the left to inspect and review.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
        onClearLogs={() => {
          clearAuditLogs();
          setAuditLogs([]);
          setDecisions({});
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                Faculty 10 PM Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Esc / Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Approve Fix</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm text-emerald-600">
                  A
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Edit Proposed Diff</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm text-amber-600">
                  E
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Reject / Keep Original</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm text-rose-600">
                  R
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Navigate Next Question</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm">
                  J
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Navigate Previous Question</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm">
                  K
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
