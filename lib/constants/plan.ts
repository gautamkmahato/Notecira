import {
  DEFAULT_WORKSPACE_MAX_DOCUMENTS,
  getMaxDocumentsPerUser,
} from "@/lib/constants/workspace-limits";

/** @deprecated Use {@link DEFAULT_WORKSPACE_MAX_DOCUMENTS} or {@link getMaxDocumentsPerUser}. */
export const FREE_CLOUD_DOCUMENT_LIMIT = DEFAULT_WORKSPACE_MAX_DOCUMENTS;

export { DEFAULT_WORKSPACE_MAX_DOCUMENTS, getMaxDocumentsPerUser };
