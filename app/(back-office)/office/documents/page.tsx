import { DocumentsClient } from "@/components/office/documents/documents-client";
import ListToolbar from "@/components/shared/list-toolbar";
import { api } from "@/lib/api-client";

type DocumentRow = {
  id: string;
  fileName: string;
  sizeBytes: number;
  entityType: string;
  uploadedAt: string;
};

export default async function DocumentsPage() {
  const rows = await api.get<DocumentRow[]>("/documents");

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Documents</h2>}
        right={null}
      />
      <DocumentsClient docs={rows} />
    </div>
  );
}
