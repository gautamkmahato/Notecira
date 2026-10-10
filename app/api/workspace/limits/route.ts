import { withAuth } from "@/lib/api/with-auth";
import { jsonOk } from "@/lib/api/responses";
import {
  countActiveDocumentsInDb,
  getWorkspaceLimitsPayload,
} from "@/lib/workspace/document-limit";

export const GET = withAuth(async (_request, auth) => {
  const activeDocuments = await countActiveDocumentsInDb(auth.accessToken);
  return jsonOk(getWorkspaceLimitsPayload(activeDocuments));
});
