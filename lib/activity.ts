import { db } from "@/db";
import { activityLog } from "@/db/schema";

// Server-side only. Appends to the activity feed powering Recent Updates
// and each record's History tab. No auth yet, so userId is null for now.
export async function logActivity(entry: {
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(activityLog).values({
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    entityLabel: entry.entityLabel ?? null,
    metadata: entry.metadata ?? null,
  });
}
