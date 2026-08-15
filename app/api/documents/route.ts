import {
  createDocument,
  listDocuments,
} from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { Document } from "@/lib/domain/types";

export const GET = withAuth(async (_request, auth) => {
  const documents = await listDocuments(auth.accessToken);
  return jsonOk(documents);
});

export const POST = withAuth(async (request, auth) => {
  const body = (await request.json()) as Document;
  if (!body?.id || !body.title) {
    return jsonError("Document id and title are required", 400);
  }
  const created = await createDocument(auth.accessToken, auth.userId, body);
  return jsonOk(created, 201);
});
