import type { DashboardDocument } from "@/lib/domain/dashboard";

export type DocumentFilterId =
  | "all"
  | "root"
  | "nested"
  | "in-folder"
  | "shared";

export type DocumentSortId = "updated" | "created" | "title";

export const DOCUMENT_FILTERS: {
  id: DocumentFilterId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "root", label: "Root pages" },
  { id: "nested", label: "Nested" },
  { id: "in-folder", label: "In folders" },
  { id: "shared", label: "Shared" },
];

function matchesFilter(doc: DashboardDocument, filter: DocumentFilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "root":
      return !doc.isNested;
    case "nested":
      return doc.isNested;
    case "in-folder":
      return Boolean(doc.folderId);
    case "shared":
      return doc.isShared;
    default:
      return true;
  }
}

function matchesSearch(doc: DashboardDocument, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = doc.title.toLowerCase();
  const folder = doc.folderName?.toLowerCase() ?? "";
  const tag = doc.categoryTag.toLowerCase();
  return title.includes(q) || folder.includes(q) || tag.includes(q);
}

function compareDocs(
  a: DashboardDocument,
  b: DashboardDocument,
  sort: DocumentSortId,
): number {
  switch (sort) {
    case "title":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "created":
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "updated":
    default:
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
}

export function filterDashboardDocuments(
  documents: DashboardDocument[] | null | undefined,
  options: {
    search: string;
    filter: DocumentFilterId;
    sort: DocumentSortId;
  },
): DashboardDocument[] {
  const { search, filter, sort } = options;
  const list = Array.isArray(documents) ? documents : [];
  return list
    .filter((doc) => matchesFilter(doc, filter) && matchesSearch(doc, search))
    .sort((a, b) => compareDocs(a, b, sort));
}
