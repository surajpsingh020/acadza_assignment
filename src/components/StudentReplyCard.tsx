"use client";

import React, { useState } from "react";
import { StudentReport, TriageResult } from "@/lib/types";
import { MessageSquare, Smartphone, Laptop, Apple, Check, Copy, Edit2, Send, Clock, User } from "lucide-react";

interface StudentReplyCardProps {
  report: StudentReport;
  result: TriageResult;
  onUpdateReply?: (newReply: string) => void;
  className?: string;
}

export const StudentReplyCard: React.FC<StudentReplyCardProps> = ({
  report,
  result,
  onUpdateReply,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState(result.student_reply);
  const [copied, setCopied] = useState(false);

  const getDeviceIcon = (src: string) => {
    switch (src) {
      case "android":
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "ios":
        return <Apple className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onUpdateReply) onUpdateReply(replyText);
  };

  const formatReportTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ${className}`}>
      {/* Student Claim Context */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5" />
              {report.studentId}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatReportTime(report.reportedAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 capitalize text-[11px] font-medium">
            {getDeviceIcon(report.source)}
            {report.source}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 italic bg-amber-50/60 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 w-full">
            &ldquo;{report.comment}&rdquo;
          </div>
        </div>
      </div>

      {/* AI Automated Response Preview */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Student Resolution Reply Preview
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2 py-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Reply"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="w-full text-sm p-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" />
                Save Reply
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
            {replyText}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentReplyCard;
