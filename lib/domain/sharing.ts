export type ShareVisibility = "private" | "public" | "restricted";

export type DocumentShareSettings = {
  documentId: string;
  visibility: ShareVisibility;
  shareToken: string | null;
  allowedEmails: string[];
  shareUrl: string | null;
};

export type SharedDocumentPayload = {
  rootDocumentId: string;
  documents: Record<
    string,
    {
      id: string;
      title: string;
      parentBlockId: string | null;
    }
  >;
  blocks: Record<
    string,
    {
      id: string;
      documentId: string;
      type: string;
      content: string;
      attrs: Record<string, unknown>;
      position: number;
      linkedDocumentId: string | null;
    }
  >;
};
