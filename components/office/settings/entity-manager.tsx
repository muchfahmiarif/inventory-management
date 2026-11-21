"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  createSettingEntity,
  deleteSettingEntity,
  updateSettingEntity,
} from "@/actions/settings";
import ListToolbar from "@/components/shared/list-toolbar";
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
import { formatMoney } from "@/lib/format";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface EntityField {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  width?: string;
}

export interface EntityManagerConfig {
  slug: string;
  title: string;
  entityLabel: string;
  columns: Array<{ key: string; header: string; money?: boolean }>;
  fields: EntityField[];
  /** which row property is the identifier ("id" for uuid tables, "code" for currencies) */
  idKey?: string;
}

type Row = Record<string, unknown> & { __id: string };

export function EntityManager({
  config,
  rows,
}: {
  config: EntityManagerConfig;
  rows: Record<string, unknown>[];
}) {
  const router = useRouter();
  const idKey = config.idKey ?? "id";

  const data: Row[] = rows.map((r) => ({ ...r, __id: String(r[idKey]) }));

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const openAdd = () => {
    const blank: Record<string, string> = {};
    for (const f of config.fields) blank[f.key] = f.type === "number" ? "0" : "";
    setValues(blank);
    setEditingId(null);
    setShowForm(true);
    setFormError(null);
  };

  const openEdit = (row: Row) => {
    const vals: Record<string, string> = {};
    for (const f of config.fields) {
      const v = row[f.key];
      vals[f.key] = v === null || v === undefined ? "" : String(v);
    }
    setValues(vals);
    setEditingId(row.__id);
    setShowForm(true);
    setFormError(null);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        payload[f.key] =
          f.type === "number" ? Number(values[f.key] ?? 0) : (values[f.key] ?? "");
      }
      const res =
        editingId === null
          ? await createSettingEntity(config.slug as "units", payload)
          : await updateSettingEntity(config.slug as "units", editingId, payload);

      if (res && "errors" in res && res.errors) {
        const flat = res.errors as unknown as Record<string, string[] | undefined>;
        const first = Object.values(flat).flat()[0];
        setFormError(first ?? "Validation failed");
        return;
      }
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const res = await deleteSettingEntity(config.slug as "units", id);
    if (res && "error" in res && res.error) {
      window.alert(res.error);
      return;
    }
    router.refresh();
  };


  return (
    <div className="flex flex-col gap-4 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{config.title}</h2>}
        right={
          <Button
            size={"sm"}
            onClick={() => {
              openAdd();
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        }
      />

      {showForm && (
        <div className="mx-2 rounded-md border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-medium">
            {editingId === null ? `New ${config.entityLabel}` : `Edit ${config.entityLabel}`}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} style={f.width ? { width: f.width } : undefined}>
                <p className="mb-1 text-sm font-medium">
                  {f.label}
                  {f.required ? <span className="text-red-500"> *</span> : null}
                </p>
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          {formError && (
            <p className="mt-2 text-sm text-red-500">{formError}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row) => (
                <TableRow key={row.__id}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.money
                        ? formatMoney(Number(row[col.key] ?? 0))
                        : (row[col.key] as string) ?? "-"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${config.entityLabel}`}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${config.entityLabel}`}
                        onClick={async () => {
                          if (
                            window.confirm(
                              `Delete this ${config.entityLabel.toLowerCase()}?`,
                            )
                          ) {
                            await remove(row.__id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={config.columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No {config.entityLabel.toLowerCase()}s yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
