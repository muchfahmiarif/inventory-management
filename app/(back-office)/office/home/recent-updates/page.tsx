import { api } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityLabel: string | null;
  createdAt: string;
};

export default async function RecentUpdatesPage() {
  const rows = await api.get<ActivityRow[]>("/notifications?limit=100");

  return (
    <div className="flex flex-col gap-4 px-8 py-6">
      <h2 className="text-2xl font-semibold">Recent Updates</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.action}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.entityLabel ?? row.entityType}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
