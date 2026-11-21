"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { updateNumberingSeries } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface SeriesRow {
  module: string;
  prefix: string;
  nextNumber: number;
  padding: number;
}

export function NumberingSeriesClient({ rows }: { rows: SeriesRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<Record<string, Partial<SeriesRow>>>({});
  const [saved, setSaved] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<string | null>(null);

  const updateDraft = (module: string, key: keyof SeriesRow, value: string) => {
    setDraft((d) => ({
      ...d,
      [module]: {
        ...d[module],
        [key]: key === "padding" || key === "nextNumber" ? Number(value) : value,
      },
    }));
  };

  const saveRow = async (row: SeriesRow) => {
    setSaving(row.module);
    const changes = draft[row.module] ?? {};
    await updateNumberingSeries(row.module, {
      prefix: (changes.prefix as string) ?? row.prefix,
      nextNumber: (changes.nextNumber as number) ?? row.nextNumber,
      padding: (changes.padding as number) ?? row.padding,
    });
    setSaved(row.module);
    setSaving(null);
    router.refresh();
  };

  const val = (row: SeriesRow, key: keyof SeriesRow) =>
    (draft[row.module]?.[key] as string | number | undefined) ?? row[key];

  return (
    <div className="flex flex-col gap-4 px-2 pb-8">
      <p className="px-2 text-sm text-muted-foreground">
        Documents are auto-numbered as PREFIX-00001. Editing the next number
        affects newly created records only.
      </p>
      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Next Number</TableHead>
              <TableHead>Padding</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.module}>
                <TableCell className="font-medium capitalize">
                  {row.module.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 w-28"
                    value={String(val(row, "prefix"))}
                    onChange={(e) => updateDraft(row.module, "prefix", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 w-24"
                    type="number"
                    min={1}
                    value={String(val(row, "nextNumber"))}
                    onChange={(e) => updateDraft(row.module, "nextNumber", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 w-20"
                    type="number"
                    min={1}
                    max={10}
                    value={String(val(row, "padding"))}
                    onChange={(e) => updateDraft(row.module, "padding", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Save ${row.module}`}
                    disabled={saving === row.module}
                    onClick={() => saveRow(row)}
                  >
                    {saved === row.module ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
