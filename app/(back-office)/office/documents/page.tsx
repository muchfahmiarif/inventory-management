import { desc } from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { DocumentsClient } from "@/components/office/documents/documents-client";
import ListToolbar from "@/components/shared/list-toolbar";

export default async function DocumentsPage() {
  const rows = await db
    .select({
      id: documents.id,
      fileName: documents.fileName,
      sizeBytes: documents.sizeBytes,
      entityType: documents.entityType,
      uploadedAt: documents.uploadedAt,
    })
    .from(documents)
    .orderBy(desc(documents.uploadedAt));

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Documents</h2>}
        right={null}
      />
      <DocumentsClient
        docs={rows.map((r) => ({
          ...r,
          uploadedAt: r.uploadedAt.toISOString(),
        }))}
      />
    </div>
  );
}
