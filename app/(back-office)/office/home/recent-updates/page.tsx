import { desc } from "drizzle-orm";

import { db } from "@/db";
import { activityLog } from "@/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RecentUpdatesPage() {
  const rows = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      entityType: activityLog.entityType,
      entityLabel: activityLog.entityLabel,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-4 px-8 py-6">
      <h2 className="text-2xl font-semibold">Recent Updates</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-56">Time</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="capitalize">{row.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.entityLabel ?? row.entityType}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No activity yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
