"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink } from "node:fs/promises";
import path from "node:path";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { logActivity } from "@/lib/activity";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }

  const entityType = String(formData.get("entityType") ?? "general");
  const entityId = (formData.get("entityId") as string) || null;
  const entityLabel = (formData.get("entityLabel") as string) || null;

  const { randomUUID } = await import("node:crypto");
  const storedName = `${randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const [doc] = await db
    .insert(documents)
    .values({
      fileName: file.name,
      storedName,
      mimeType: file.type || null,
      sizeBytes: file.size,
      entityType,
      entityId,
      entityLabel,
    })
    .returning();

  await logActivity({
    action: "uploaded document",
    entityType: "document",
    entityId: doc.id,
    entityLabel: file.name,
  });

  revalidatePath("/office/documents");
}

export async function deleteDocument(id: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (doc) {
    await unlink(path.join(UPLOAD_DIR, doc.storedName)).catch(() => {
      // file already gone — still remove the row
    });
    await db.delete(documents).where(eq(documents.id, id));
    await logActivity({
      action: "deleted document",
      entityType: "document",
      entityId: id,
      entityLabel: doc.fileName,
    });
  }
  revalidatePath("/office/documents");
}

// Download target for the documents list
export async function redirectToDocument(id: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) redirect("/office/documents");
  redirect(`/api/documents/${id}`);
}
