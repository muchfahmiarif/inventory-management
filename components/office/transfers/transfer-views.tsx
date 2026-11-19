"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Plus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import React from "react";

import {
  createTransfer,
  deleteTransfer,
  deleteTransfers,
  markTransferReceived,
  markTransferShipped,
} from "@/actions/transfers";
import DetailPageShell from "@/components/shared/detail-page";
import ListToolbar from "@/components/shared/list-toolbar";
import PageFormShell from "@/components/shared/page-form-shell";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatQty } from "@/lib/format";
import {
  transferFormSchema,
  type TransferFormInput,
} from "@/lib/schemas/transfers";

const FORM_ID = "transfer-form";

// ---------- form ----------

export interface TransferFormValues {
  date: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  lines: Array<{ itemId: string; quantity?: string }>;
}

interface TransferFormProps {
  defaultValues: TransferFormValues;
  warehouses: { id: string; name: string }[];
  items: Array<{ id: string; name: string; sku: string | null }>;
}

const TransferForm = ({ defaultValues, warehouses, items }: TransferFormProps) => {
  const form = useForm<TransferFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transferFormSchema) as unknown as Resolver<TransferFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  const onSubmit = async (values: TransferFormValues) => {
    await createTransfer(values as unknown as TransferFormInput);
  };

  return (
    <PageFormShell title="New Transfer Order" formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-4xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    From Warehouse <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To Warehouse <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">Items</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ itemId: "", quantity: "1" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => (
                <div key={f.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Item</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {items.map((o) => (
                              <SelectItem key={o.id} value={o.id}>
                                {o.name}
                                {o.sku ? ` (${o.sku})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lines.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-28">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="number" min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

// ---------- list ----------

export interface TransferRow {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "received";
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
}

const STATUS_VARIANTS: Record<TransferRow["status"], "outline" | "secondary" | "default"> = {
  draft: "outline",
  shipped: "secondary",
  received: "default",
};

function TransfersList({ data }: { data: TransferRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, TransferRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Transfer #",
      cell: ({ row }) => (
        <Link
          href={`/office/transfers/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      accessorKey: "fromWarehouseName",
      header: "From",
      cell: ({ row }) => row.original.fromWarehouseName ?? "-",
    },
    {
      accessorKey: "toWarehouseName",
      header: "To",
      cell: ({ row }) => row.original.toWarehouseName ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status]}>
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Transfer Orders</h2>}
        right={
          <>
            <Button size={"sm"} onClick={() => router.push("/office/transfers/new")}>
              New
            </Button>
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No transfer orders yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} draft transfer(s)?`)) {
                  await deleteTransfers(ids);
                  clear();
                }
              }}
            >
              Delete
            </Button>
          )}
        />
      </div>
    </div>
  );
}

// ---------- detail ----------

export interface TransferDetailData {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "received";
  notes: string | null;
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
  lines: Array<{
    id: string;
    itemName: string;
    sku: string | null;
    quantity: number;
  }>;
}

function TransferDetail({ data }: { data: TransferDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={formatDate(data.date)}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={STATUS_VARIANTS[data.status]}
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {data.status === "draft" && (
            <Button size="sm" onClick={() => markTransferShipped(data.id)}>
              <Send className="mr-1 h-4 w-4" /> Mark as Shipped
            </Button>
          )}
          {data.status === "shipped" && (
            <Button size="sm" onClick={() => markTransferReceived(data.id)}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark as Received
            </Button>
          )}
          {data.status !== "received" && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (window.confirm("Delete this transfer? Shipped stock is reversed.")) {
                  await deleteTransfer(data.id);
                }
              }}
            >
              Delete
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/office/transfers")}
          >
            Back to Transfers
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
            Transfer Details
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 text-sm md:grid-cols-2">
            <p>
              <span className="text-muted-foreground">From: </span>
              {data.fromWarehouseName ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">To: </span>
              {data.toWarehouseName ?? "-"}
            </p>
            <p className="md:col-span-2">
              <span className="text-muted-foreground">Notes: </span>
              {data.notes ?? "-"}
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.itemName}</TableCell>
                  <TableCell className="text-right">{formatQty(line.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { TransferForm, TransfersList, TransferDetail };
