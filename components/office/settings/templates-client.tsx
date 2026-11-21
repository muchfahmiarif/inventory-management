"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TemplateRow {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
}

export function TemplatesClient({ rows }: { rows: TemplateRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>("new");
  const [draft, setDraft] = React.useState<Partial<TemplateRow>>({
    name: "",
    type: "invoice",
    subject: "",
    body: "",
  });
  const [saving, setSaving] = React.useState(false);

  const openNew = () => {
    setDraft({ name: "", type: "invoice", subject: "", body: "" });
    setEditingId("new");
  };
  const openEdit = (row: TemplateRow) => {
    setDraft(row);
    setEditingId(row.id);
  };

  const save = async () => {
    setSaving(true);
    if (editingId === "new") {
      await createTemplate(draft as unknown as Record<string, unknown>);
    } else if (editingId !== null) {
      await updateTemplate(editingId, draft as unknown as Record<string, unknown>);
    }
    setSaving(false);
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 px-2 pb-8">
      <div className="sticky top-0 mx-2 my-4 flex items-center justify-between">
        <h2 className="px-2 text-xl font-medium">Templates</h2>
        <Button
          size={"sm"}
          onClick={() => {
            openNew();
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> New Template
        </Button>
      </div>

      {editingId !== null && (
        <div className="mx-2 rounded-md border bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium">Name *</p>
              <Input
                value={draft.name ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Type</p>
              <Input
                value={draft.type ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                placeholder="invoice / estimate / email"
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-sm font-medium">Subject</p>
              <Input
                value={draft.subject ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-sm font-medium">Body</p>
              <Textarea
                rows={5}
                value={draft.body ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="capitalize">{row.type}</TableCell>
                <TableCell className="text-muted-foreground">{row.subject}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${row.name}`}
                      onClick={async () => {
                        if (window.confirm(`Delete ${row.name}?`)) {
                          await deleteTemplate(row.id);
                          router.refresh();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
