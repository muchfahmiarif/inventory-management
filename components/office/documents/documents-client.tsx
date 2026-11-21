"use client";

import { Download, FileUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

import { deleteDocument, uploadDocument } from "@/actions/documents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export interface DocumentRow {
  id: string;
  fileName: string;
  sizeBytes: number;
  entityType: string;
  uploadedAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentsClient({ docs }: { docs: DocumentRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "general");
    try {
      await uploadDocument(formData);
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="rounded-md border border-dashed p-6 text-center">
        <FileUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Upload documents to keep them alongside your records
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <button
          type="button"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload File"}
        </button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-24"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length ? (
              docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.fileName}</TableCell>
                  <TableCell className="capitalize">{doc.entityType}</TableCell>
                  <TableCell className="text-right">
                    {formatSize(doc.sizeBytes)}
                  </TableCell>
                  <TableCell>{formatDate(doc.uploadedAt.slice(0, 10))}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/api/documents/${doc.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        aria-label={`Download ${doc.fileName}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        aria-label={`Delete ${doc.fileName}`}
                        onClick={async () => {
                          if (window.confirm(`Delete ${doc.fileName}?`)) {
                            await deleteDocument(doc.id);
                            router.refresh();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No documents uploaded yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
