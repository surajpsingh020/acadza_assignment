"use client";

import React, { useState } from "react";
import { SurgicalEdit } from "@/lib/types";
import { ArrowRight, Check, Copy, Eye, SplitSquareVertical } from "lucide-react";
import MathRenderer from "./MathRenderer";

interface DiffViewerProps {
  edit: SurgicalEdit;
  originalText?: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ edit, originalText = "", className = "" }) => {
  const [viewMode, setViewMode] = useState<"surgical" | "sideBySide">("surgical");
  const [copied, setCopied] = useState(false);

  const hasEdit = edit && edit.field && (edit.find !== undefined || edit.replace !== undefined);

  if (!hasEdit) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 text-sm flex items-center justify-center ${className}`}>
        <span>No surgical content replacement required (verdict: No Change / Faculty Confirmation)</span>
      </div>
    );
  }

  const findText = edit.find ?? "";
  const replaceText = edit.replace ?? "";

  // Compute preview of full text after replacement
  let previewText = originalText;
  if (originalText && findText) {
    previewText = originalText.replace(findText, replaceText);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(edit, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Target Field:</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono font-semibold uppercase">
            {edit.field}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-700/70 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode("surgical")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                viewMode === "surgical"
                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Surgical Diff
            </button>
            <button
              onClick={() => setViewMode("sideBySide")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                viewMode === "sideBySide"
                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Before & After
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy diff JSON"
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content Diff Body */}
      {viewMode === "surgical" ? (
        <div className="p-4 space-y-3 font-mono text-sm">
          {/* Removed snippet */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold text-xs select-none">
              &minus;
            </span>
            <div className="flex-1 overflow-x-auto text-rose-800 dark:text-rose-300 line-through decoration-rose-400 dark:decoration-rose-600">
              {findText ? (
                edit.field === "question" || edit.field === "solution" ? (
                  <MathRenderer content={findText} />
                ) : (
                  <span>{findText}</span>
                )
              ) : (
                <span className="italic opacity-60 font-sans text-xs">(no deletion)</span>
              )}
            </div>
          </div>

          {/* Added snippet */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs select-none">
              +
            </span>
            <div className="flex-1 overflow-x-auto text-emerald-800 dark:text-emerald-300 font-medium">
              {replaceText ? (
                edit.field === "question" || edit.field === "solution" ? (
                  <MathRenderer content={replaceText} />
                ) : (
                  <span>{replaceText}</span>
                )
              ) : (
                <span className="italic opacity-60 font-sans text-xs">(empty removal)</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-sm">
          {/* Before */}
          <div className="p-4 bg-rose-50/30 dark:bg-rose-950/10">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Original Content
            </div>
            <div className="text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed">
              <MathRenderer content={originalText || findText} />
            </div>
          </div>

          {/* After */}
          <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Proposed Fixed Content
            </div>
            <div className="text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed">
              <MathRenderer content={previewText || replaceText} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
