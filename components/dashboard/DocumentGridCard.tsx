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

function iconForDocument(doc: DashboardDocument): LucideIcon {
  if (doc.isShared) return Lightbulb;
  if (doc.folderId) return FolderOpen;
  if (doc.isNested) return Layers;
  return FileText;
}

function folderLabel(doc: DashboardDocument): string {
  return doc.folderName ?? doc.categoryTag;
}

type DocumentGridCardProps = {
  doc: DashboardDocument;
  user: SessionUser | null;
};

export function DocumentGridCard({ doc, user }: DocumentGridCardProps) {
  const Icon = iconForDocument(doc);
  const href = `/documents?doc=${encodeURIComponent(doc.id)}`;
  const initial = user ? userInitial(user) : "Y";

  return (
    <article
      className={`${documentCardShell} ${dashboardRadiusClass} relative flex min-h-[176px] flex-col p-4`}
    >
      <Link
        href={href}
        className={`absolute inset-0 z-0 ${dashboardRadiusClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`}
        aria-label={`Open ${doc.title}`}
      />
      <div className={documentCardPattern} aria-hidden />

      <div className="relative z-[1] flex flex-1 flex-col pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
              aria-hidden
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="truncate text-base font-semibold tracking-tight text-white">
                {doc.title}
              </h3>
              <p className="mt-1 text-sm text-white/50">
                {formatDocumentDate(doc.updatedAt)}
              </p>
            </div>
          </div>
          <div className="pointer-events-auto shrink-0">
            <DocumentCardMenu documentId={doc.id} title={doc.title} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          <div className="flex -space-x-2" aria-label="Owner">
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
          <span
            className="max-w-[50%] truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80"
          >
            {folderLabel(doc)}
          </span>
        </div>
      </div>
    </article>
  );
}
