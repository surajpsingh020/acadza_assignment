"use client";

import React, { useMemo } from "react";

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const sanitizedHtml = useMemo(() => {
    if (!content) return "";

    // Clean up rogue script tags or prompt injection vectors
    let cleaned = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "");

    // Normalize empty mspace or broken MathML constructs if any
    cleaned = cleaned.replace(/<mspace\s+linebreak=["']newline["']\s*\/?>/gi, "<br />");
    cleaned = cleaned.replace(/<mspace\s+linebreak=["']newline["']\s*>/gi, "<br />");
    cleaned = cleaned.replace(/<\/mspace>/gi, "");

    return cleaned;
  }, [content]);

  return (
    <div
      className={`prose max-w-none mathml-container leading-relaxed select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default MathRenderer;
