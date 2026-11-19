"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import React from "react";

import {
  createPriceList,
  deletePriceList,
  deletePriceLists,
  updatePriceList,
} from "@/actions/price-lists";
import DetailPageShell from "@/components/shared/detail-page";
import CustomViewsDropdown, {
  CustomView,
} from "@/components/shared/custom-views-dropdown";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import KebabMenu from "@/components/shared/kebab-menu";
import ListToolbar from "@/components/shared/list-toolbar";
import PageFormShell from "@/components/shared/page-form-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { formatMoney } from "@/lib/format";
import {
  priceListFormSchema,
  type PriceListFormInput,
} from "@/lib/schemas/price-lists";

const FORM_ID = "price-list-form";

export interface PriceListFormValues {
  name: string;
  description?: string;
  currencyCode: string;
  priceType: "markup" | "markdown";
  percentage?: string;
}

interface PriceListFormProps {
  mode: "new" | "edit";
  priceListId?: string;
  defaultValues: PriceListFormValues;
  currencies: { code: string; name: string; symbol: string }[];
}

const PriceListForm = ({
  mode,
  priceListId,
  defaultValues,
  currencies,
}: PriceListFormProps) => {
  const form = useForm<PriceListFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(priceListFormSchema) as unknown as Resolver<PriceListFormValues>,
    defaultValues,
  });

  const onSubmit = async (values: PriceListFormValues) => {
    if (mode === "new") {
      await createPriceList(values as PriceListFormInput);
    } else {
      await updatePriceList(priceListId!, values as PriceListFormInput);
    }
  };

  return (
    <PageFormShell
      title={mode === "new" ? "New Price List" : "Edit Price List"}
      formId={FORM_ID}
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-3xl flex-col gap-4 pb-4"
        >
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Price List Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price List Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Price List Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} ({c.code})
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
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="markup">Markup</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

// ---------- list ----------

export interface PriceListRow {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  priceType: "markup" | "markdown";
  percentage: number;
}

const CUSTOM_VIEWS: CustomView[] = [{ name: "All Price Lists", value: "all" }];

function PriceListsList({ data, title }: { data: PriceListRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, PriceListRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Price List Name",
      cell: ({ row }) => (
        <Link
          href={`/office/inventory/price-lists/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "currencyCode",
      header: "Currency",
      cell: ({ row }) => row.original.currencyCode,
    },
    {
      accessorKey: "priceType",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.priceType}</span>
      ),
    },
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => `${row.original.percentage}%`,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">
          {row.original.description ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<CustomViewsDropdown title={title} views={CUSTOM_VIEWS} selected="all" />}
        right={
          <>
            <Button
              className="flex flex-row"
              size={"sm"}
              onClick={() => router.push("/office/inventory/price-lists/new")}
            >
              New
            </Button>
            <KebabMenu moduleLabel="Price Lists" onRefresh={() => router.refresh()} />
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No price lists found"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} price list(s)?`)) {
                  await deletePriceLists(ids);
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

// ---------- detail (computed prices for all items) ----------

export interface PriceListDetailData {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  priceType: "markup" | "markdown";
  percentage: number;
  items: Array<{ id: string; name: string; sellingPrice: number | null }>;
}

function PriceListDetail({ data }: { data: PriceListDetailData }) {
  const router = useRouter();

  const adjusted = data.items.map((item) => {
    const base = item.sellingPrice ?? 0;
    const price =
      data.priceType === "markup"
        ? base * (1 + data.percentage / 100)
        : base * (1 - data.percentage / 100);
    return { ...item, adjustedPrice: price };
  });

  return (
    <DetailPageShell
      title={data.name}
      subtitle={`${data.priceType === "markup" ? "Markup" : "Markdown"} ${data.percentage}% · ${data.currencyCode}`}
      primaryActionLabel="Edit"
      onPrimaryAction={() =>
        router.push(`/office/inventory/price-lists/${data.id}/edit`)
      }
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete price list?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete &quot;{data.name}&quot;? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deletePriceList(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">
                  {data.currencyCode} Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjusted.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/office/inventory/items/${item.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(item.sellingPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(item.adjustedPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { PriceListForm, PriceListsList, PriceListDetail };
