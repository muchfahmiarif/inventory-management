import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { documents } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), ".data", "uploads", doc.storedName);
  const file = await readFile(filePath).catch(() => null);
  if (!file) {
    return NextResponse.json({ error: "File missing on disk" }, { status: 410 });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": doc.mimeType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.fileName}"`,
    },
  });
}
