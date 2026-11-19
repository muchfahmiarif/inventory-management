"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import React from "react";

import {
  createWarehouse,
  deleteWarehouse,
  deleteWarehouses,
  updateWarehouse,
} from "@/actions/warehouses";
import DetailPageShell from "@/components/shared/detail-page";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  warehouseFormSchema,
  type WarehouseFormInput,
} from "@/lib/schemas/warehouses";

const FORM_ID = "warehouse-form";

export interface WarehouseFormValues {
  name: string;
  code?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  isDefault?: boolean;
}

interface WarehouseFormProps {
  mode: "new" | "edit";
  warehouseId?: string;
  defaultValues: WarehouseFormValues;
}

const WarehouseForm = ({ mode, warehouseId, defaultValues }: WarehouseFormProps) => {
  const form = useForm<WarehouseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(warehouseFormSchema) as unknown as Resolver<WarehouseFormValues>,
    defaultValues,
  });

  const onSubmit = async (values: WarehouseFormValues) => {
    if (mode === "new") {
      await createWarehouse(values as WarehouseFormInput);
    } else {
      await updateWarehouse(warehouseId!, values as WarehouseFormInput);
    }
  };

  type TextKey =
    | "name"
    | "code"
    | "addressLine1"
    | "city"
    | "state"
    | "zip"
    | "country"
    | "contactName"
    | "phone"
    | "email";

  const textField = (name: TextKey, label: string, placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <PageFormShell
      title={mode === "new" ? "New Warehouse" : "Edit Warehouse"}
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
              Warehouse Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {textField("name", "Warehouse Name *", "Warehouse Name")}
              {textField("code", "Code", "WH-01")}
              {textField("contactName", "Contact Name", "")}
              {textField("phone", "Phone", "")}
              {textField("email", "Email", "")}
              {textField("addressLine1", "Address", "Street address")}
              {textField("city", "City", "")}
              {textField("state", "State", "")}
              {textField("zip", "Zip Code", "")}
              {textField("country", "Country", "")}
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Set as default warehouse
                    </FormLabel>
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

export interface WarehouseRow {
  id: string;
  name: string;
  code: string | null;
  city: string | null;
  contactName: string | null;
  isDefault: boolean;
}

function WarehousesList({ data }: { data: WarehouseRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, WarehouseRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Warehouse Name",
      cell: ({ row }) => (
        <Link
          href={`/office/warehouse/${row.original.id}`}
          className="flex items-center gap-2 font-medium hover:text-primary hover:underline"
        >
          {row.original.name}
          {row.original.isDefault && <Badge variant="secondary">Default</Badge>}
        </Link>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => row.original.code ?? "-",
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.original.city ?? "-",
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: ({ row }) => row.original.contactName ?? "-",
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Warehouses</h2>}
        right={
          <>
            <Button
              size={"sm"}
              onClick={() => router.push("/office/warehouse/new")}
            >
              New
            </Button>
            <KebabMenu moduleLabel="Warehouses" onRefresh={() => router.refresh()} />
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No warehouses yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} warehouse(s)?`)) {
                  await deleteWarehouses(ids);
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

export interface WarehouseDetailData {
  id: string;
  name: string;
  code: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  isDefault: boolean;
}

function WarehouseDetail({ data }: { data: WarehouseDetailData }) {
  const router = useRouter();

  const row = (label: string, value: string | null) => (
    <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  );

  return (
    <DetailPageShell
      title={data.name}
      subtitle={data.code}
      status={data.isDefault ? "Default" : undefined}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/warehouse/${data.id}/edit`)}
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
                <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete &quot;{data.name}&quot;? Stock movements
                  referencing it are kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteWarehouse(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 max-w-3xl rounded-md border">
        <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
          Warehouse Details
        </div>
        <div className="px-4 py-2">
          {row("Name", data.name)}
          {row("Code", data.code)}
          {row("Address", data.addressLine1)}
          {row("City", data.city)}
          {row("State", data.state)}
          {row("Zip Code", data.zip)}
          {row("Country", data.country)}
          {row("Contact Name", data.contactName)}
          {row("Phone", data.phone)}
          {row("Email", data.email)}
        </div>
      </div>
    </DetailPageShell>
  );
}

export { WarehouseForm, WarehousesList, WarehouseDetail };
