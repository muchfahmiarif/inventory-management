"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import ListToolbar from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatQty } from "@/lib/format";
import type { ReportColumn } from "@/lib/reports";

function formatCell(col: ReportColumn, value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (col.money) return formatMoney(Number(value));
  if (col.qty) return formatQty(Number(value));
  return String(value);
}

export function ReportTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}) {
  const router = useRouter();

  // CSV export client-side from the loaded rows
  const exportCsv = () => {
    const header = columns.map((c) => `"${c.header}"`).join(",");
    const body = rows
      .map((row) =>
        columns
          .map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <>
            <Button size={"sm"} variant={"outline"} onClick={exportCsv}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
            <Button
              size={"sm"}
              variant={"ghost"}
              onClick={() => router.push("/office/reports")}
            >
              All Reports
            </Button>
          </>
        }
      />
      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.align === "right" ? "text-right" : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={col.align === "right" ? "text-right" : undefined}
                    >
                      {formatCell(col, row[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data for this report yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
