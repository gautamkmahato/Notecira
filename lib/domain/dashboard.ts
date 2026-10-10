import type { ShareVisibility } from "@/lib/domain/sharing";

export type DashboardDocument = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  folderName: string | null;
  isNested: boolean;
  categoryTag: string;
  isShared: boolean;
  shareVisibility: ShareVisibility | null;
};

export type DashboardSummary = {
  counts: {
    documents: number;
    folders: number;
    blocks: number;
    trashed: number;
    shared: number;
  };
  usage: {
    /** `null` = unlimited (self-hosted). */
    documentLimit: number | null;
    documentsUsed: number;
    atLimit: boolean;
  };
  documents: DashboardDocument[];
  generatedAt: string;
};
