import type { DashboardDocument, DashboardSummary } from "@/lib/domain/dashboard";

type LegacyRecentDocument = {
  id: string;
  title: string;
  updatedAt: string;
  folderId: string | null;
  isNested: boolean;
};

type RawDashboardSummary = Partial<DashboardSummary> & {
  recentDocuments?: LegacyRecentDocument[];
};

function legacyToDocument(row: LegacyRecentDocument): DashboardDocument {
  return {
    id: row.id,
    title: row.title?.trim() || "Untitled",
    createdAt: row.updatedAt,
    updatedAt: row.updatedAt,
    folderId: row.folderId,
    folderName: null,
    isNested: row.isNested,
    categoryTag: row.isNested ? "Nested" : "Page",
    isShared: false,
    shareVisibility: null,
  };
}

/** Ensures `documents` is always an array (handles stale cache / older API shape). */
export function normalizeDashboardSummary(
  raw: RawDashboardSummary,
): DashboardSummary {
  let documents = raw.documents;
  if (!Array.isArray(documents)) {
    documents = Array.isArray(raw.recentDocuments)
      ? raw.recentDocuments.map(legacyToDocument)
      : [];
  }

  const counts = raw.counts ?? {
    documents: documents.length,
    folders: 0,
    blocks: 0,
    trashed: 0,
    shared: 0,
  };

  const usage = raw.usage ?? {
    documentLimit: 10,
    documentsUsed: counts.documents,
    atLimit: false,
  };

  return {
    counts,
    usage,
    documents,
    generatedAt: raw.generatedAt ?? new Date().toISOString(),
  };
}
