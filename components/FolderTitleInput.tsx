"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useDocumentStore } from "@/lib/document-store";
import { displayFolderName } from "@/lib/domain/helpers";

type FolderTitleInputProps = {
  folderId: string;
  className?: string;
  autoFocus?: boolean;
  onRenameDone?: () => void;
};

export function FolderTitleInput({
  folderId,
  className,
  autoFocus = false,
  onRenameDone,
}: FolderTitleInputProps) {
  const { getFolder, renameFolder } = useDocumentStore();
  const folder = getFolder(folderId);
  const [draft, setDraft] = useState(folder?.name ?? "");

  useEffect(() => {
    setDraft(folder?.name ?? "");
  }, [folder?.name, folderId]);

  if (!folder) return null;

  const commit = () => {
    const next = draft.trim() || "Untitled folder";
    if (next !== folder.name) {
      renameFolder(folderId, next);
    } else if (draft !== folder.name) {
      setDraft(folder.name);
    }
    onRenameDone?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(folder.name);
      event.currentTarget.blur();
      onRenameDone?.();
    }
  };

  return (
    <input
      value={draft}
      autoFocus={autoFocus}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      placeholder="Untitled folder"
      aria-label={`Rename ${displayFolderName(folder.name)}`}
      className={className}
    />
  );
}
