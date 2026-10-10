import { getMaxDocumentsPerUser } from "@/lib/constants/workspace-limits";
import type { ShareVisibility } from "@/lib/domain/sharing";
import type { DashboardDocument, DashboardSummary } from "@/lib/domain/dashboard";
import { getUserInsforge } from "@/lib/insforge/server";

const DASHBOARD_DOCUMENT_LIMIT = 200;

type DocumentRow = {
  id: string;
  title: string;
  folder_id: string | null;
  parent_block_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type FolderRow = {
  id: string;
  name: string;
};

type ShareRow = {
  document_id: string;
  visibility: ShareVisibility;
};

type CountQuery = {
  is: (column: string, value: null) => CountQuery;
  not: (column: string, operator: string, value: null) => CountQuery;
  eq: (column: string, value: string) => CountQuery;
  neq: (column: string, value: string) => CountQuery;
};

async function countForUser(
  accessToken: string,
  table: "documents" | "folders" | "blocks" | "document_shares",
  apply?: (query: CountQuery) => CountQuery,
): Promise<number> {
  const db = getUserInsforge(accessToken).database;
  let query = db.from(table).select("*", {
    count: "exact",
    head: true,
  });
  if (apply) {
    query = apply(query as unknown as CountQuery) as unknown as typeof query;
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function toIso(value: string): string {
  return new Date(value).toISOString();
}

function categoryTagFor(
  folderName: string | null,
  isNested: boolean,
): string {
  if (folderName) return folderName;
  if (isNested) return "Nested";
  return "Page";
}

function documentFromRow(
  row: DocumentRow,
  folderNames: Map<string, string>,
  shareByDoc: Map<string, ShareVisibility>,
): DashboardDocument {
  const isNested = Boolean(row.parent_block_id);
  const folderName = row.folder_id
    ? folderNames.get(row.folder_id) ?? "Folder"
    : null;
  const visibility = shareByDoc.get(row.id) ?? null;
  const isShared = visibility !== null && visibility !== "private";

  return {
    id: row.id,
    title: row.title?.trim() || "Untitled",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    folderId: row.folder_id,
    folderName,
    isNested,
    categoryTag: categoryTagFor(folderName, isNested),
    isShared,
    shareVisibility: visibility,
  };
}

export async function fetchDashboardSummary(
  accessToken: string,
  userId: string,
): Promise<DashboardSummary> {
  const db = getUserInsforge(accessToken).database;

  const [documents, trashed, folders, blocks, docsRes, foldersRes] =
    await Promise.all([
      countForUser(accessToken, "documents", (q) => q.is("deleted_at", null)),
      countForUser(accessToken, "documents", (q) =>
        q.not("deleted_at", "is", null),
      ),
      countForUser(accessToken, "folders"),
      countForUser(accessToken, "blocks"),
      db
        .from("documents")
        .select(
          "id, title, folder_id, parent_block_id, created_at, updated_at, deleted_at",
        )
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(DASHBOARD_DOCUMENT_LIMIT),
      db.from("folders").select("id, name"),
    ]);

  let shared = 0;
  let shareRows: ShareRow[] = [];
  try {
    shared = await countForUser(accessToken, "document_shares", (q) =>
      q.eq("owner_user_id", userId).neq("visibility", "private"),
    );
    const sharesRes = await db
      .from("document_shares")
      .select("document_id, visibility")
      .eq("owner_user_id", userId);
    if (!sharesRes.error) {
      shareRows = (sharesRes.data ?? []) as ShareRow[];
    }
  } catch {
    shared = 0;
  }

  if (docsRes.error) throw docsRes.error;
  if (foldersRes.error) throw foldersRes.error;

  const folderNames = new Map(
    ((foldersRes.data ?? []) as FolderRow[]).map((f) => [f.id, f.name]),
  );
  const shareByDoc = new Map(
    shareRows.map((row) => [row.document_id, row.visibility]),
  );

  const docRows = ((docsRes.data ?? []) as DocumentRow[]).filter(
    (row) => row.deleted_at === null,
  );
  const dashboardDocuments = docRows.map((row) =>
    documentFromRow(row, folderNames, shareByDoc),
  );

  const documentsUsed = documents;
  const documentLimit = getMaxDocumentsPerUser();

  return {
    counts: {
      documents,
      folders,
      blocks,
      trashed,
      shared,
    },
    usage: {
      documentLimit,
      documentsUsed,
      atLimit:
        documentLimit !== null && documentsUsed >= documentLimit,
    },
    documents: dashboardDocuments,
    generatedAt: new Date().toISOString(),
  };
}
