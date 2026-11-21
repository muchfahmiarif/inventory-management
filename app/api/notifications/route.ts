import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { activityLog } from "@/db/schema";

// Latest activity entries for the header notifications dropdown
export async function GET() {
  const rows = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      entityLabel: activityLog.entityLabel,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(10);

  return NextResponse.json({
    notifications: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityLabel: r.entityLabel,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
