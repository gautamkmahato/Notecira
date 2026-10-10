import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderOpen,
  Layers,
  Lightbulb,
} from "lucide-react";
import type { DashboardDocument } from "@/lib/domain/dashboard";
import type { SessionUser } from "@/lib/auth/session-user";
import { userInitial } from "@/lib/auth/session-user";
import { DocumentCardMenu } from "./DocumentCardMenu";
import { dashboardRadiusClass } from "./dashboard-tokens";
import {
  documentCardPattern,
  documentCardShell,
  formatDocumentDate,
} from "./document-card-styles";

function folderLabel(doc: DashboardDocument): string {
  return doc.folderName ?? doc.categoryTag;
}

function iconForDocument(doc: DashboardDocument): LucideIcon {
  if (doc.isShared) return Lightbulb;
  if (doc.folderId) return FolderOpen;
  if (doc.isNested) return Layers;
  return FileText;
}

type DocumentListRowProps = {
  doc: DashboardDocument;
  user: SessionUser | null;
};

export function DocumentListRow({ doc, user }: DocumentListRowProps) {
  const Icon = iconForDocument(doc);
  const href = `/documents?doc=${encodeURIComponent(doc.id)}`;
  const initial = user ? userInitial(user) : "Y";

  return (
    <article
      className={`${documentCardShell} ${dashboardRadiusClass} relative flex items-center gap-4 px-4 py-3`}
    >
      <Link
        href={href}
        className={`absolute inset-0 z-0 ${dashboardRadiusClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`}
        aria-label={`Open ${doc.title}`}
      />
      <div className={documentCardPattern} aria-hidden />
      <div
        className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white pointer-events-none"
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>

      <div className="relative z-[1] min-w-0 flex-1 pointer-events-none">
        <p className="truncate text-sm font-semibold text-white">{doc.title}</p>
        <p className="text-xs text-white/50">
          {formatDocumentDate(doc.updatedAt)}
        </p>
      </div>

      <span
        className="relative z-[1] hidden shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 sm:inline-block pointer-events-none"
      >
        {folderLabel(doc)}
      </span>

      <div className="relative z-[1] flex shrink-0 -space-x-2 pointer-events-none" aria-hidden>
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-[#1a1c1e] object-cover"
          />
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1a1c1e] bg-white/15 text-[10px] font-semibold text-white"
          >
            {initial}
          </span>
        )}
      </div>

      <div className="relative z-[1] shrink-0 pointer-events-auto">
        <DocumentCardMenu documentId={doc.id} title={doc.title} />
      </div>
    </article>
  );
}
