"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";

type DocumentTitleInputProps = {
  docId: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  onRenameDone?: () => void;
};

export function DocumentTitleInput({
  docId,
  className,
  placeholder = "Untitled",
  autoFocus = false,
  readOnly = false,
  onRenameDone,
}: DocumentTitleInputProps) {
  const { getDocument, renameDocument } = useDocumentStore();
  const document = getDocument(docId);
  const [draft, setDraft] = useState(document?.title ?? "");

  useEffect(() => {
    setDraft(document?.title ?? "");
  }, [document?.title, docId]);

  if (!document) return null;

  const commit = () => {
    const next = draft.trim() || "Untitled";
    if (next !== document.title) {
      renameDocument(docId, next);
    } else if (draft !== document.title) {
      setDraft(document.title);
    }
    onRenameDone?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(document.title);
      event.currentTarget.blur();
      onRenameDone?.();
    }
  };

  return (
    <input
      value={draft}
      autoFocus={autoFocus}
      readOnly={readOnly}
      onChange={(e) => {
        if (readOnly) return;
        setDraft(e.target.value);
      }}
      onBlur={() => {
        if (!readOnly) commit();
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label={`Rename ${displayTitle(document.title)}`}
      className={className}
    />
  );
}
