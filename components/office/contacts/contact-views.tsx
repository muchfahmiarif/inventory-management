"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import React from "react";

import {
  createContact,
  deleteContact,
  deleteContacts,
  toggleContactStatus,
  updateContact,
} from "@/actions/contacts";
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
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas/contacts";

const FORM_ID = "contact-form";

export interface ContactFormValues {
  displayName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  billingAddressLine1?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingAddressLine1?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  taxNumber?: string;
  currencyCode?: string;
  notes?: string;
}

const textField = (
  form: ReturnType<typeof useForm<ContactFormValues>>,
  name: keyof ContactFormValues,
  label: string,
  placeholder = "",
) => (
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

const ContactForm = ({
  mode,
  contactId,
  contactType,
  defaultValues,
}: {
  mode: "new" | "edit";
  contactId?: string;
  contactType: "customer" | "vendor";
  defaultValues: ContactFormValues;
}) => {
  const form = useForm<ContactFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactFormSchema) as unknown as Resolver<ContactFormValues>,
    defaultValues,
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (mode === "new") {
      await createContact(contactType, values as ContactFormInput);
    } else {
      await updateContact(contactId!, values as ContactFormInput);
    }
  };

  const label = contactType === "customer" ? "Customer" : "Vendor";

  return (
    <PageFormShell
      title={mode === "new" ? `New ${label}` : `Edit ${label}`}
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
              Contact Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {textField(form, "displayName", `${label} Name *`, `${label} Name`)}
              {textField(form, "companyName", "Company Name", "")}
              {textField(form, "email", "Email", "")}
              {textField(form, "phone", "Phone", "")}
              {textField(form, "mobile", "Mobile", "")}
              {textField(form, "website", "Website", "")}
            </div>
          </div>

          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Billing Address
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {textField(form, "billingAddressLine1", "Street", "")}
              {textField(form, "billingCity", "City", "")}
              {textField(form, "billingState", "State", "")}
              {textField(form, "billingZip", "Zip Code", "")}
              {textField(form, "billingCountry", "Country", "")}
            </div>
          </div>

          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Shipping Address
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {textField(form, "shippingAddressLine1", "Street", "")}
              {textField(form, "shippingCity", "City", "")}
              {textField(form, "shippingState", "State", "")}
              {textField(form, "shippingZip", "Zip Code", "")}
              {textField(form, "shippingCountry", "Country", "")}
            </div>
          </div>

          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Other Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {textField(form, "taxNumber", "Tax / VAT Number", "")}
              {textField(form, "currencyCode", "Currency", "IDR")}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
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

export interface ContactRow {
  id: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
}

function ContactsList({
  data,
  basePath,
  label,
  title,
}: {
  data: ContactRow[];
  basePath: string;
  label: string;
  title: string;
}) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, ContactRow, unknown>[] = [
    {
      accessorKey: "displayName",
      header: `${label} Name`,
      cell: ({ row }) => (
        <Link
          href={`${basePath}/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.displayName}
        </Link>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => row.original.companyName ?? "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "secondary" : "outline"}>
          {row.original.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <>
            <Button size={"sm"} onClick={() => router.push(`${basePath}/new`)}>
              New
            </Button>
            <KebabMenu moduleLabel={`${label}s`} onRefresh={() => router.refresh()} />
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage={`No ${label.toLowerCase()}s yet`}
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} contact(s)?`)) {
                  await deleteContacts(ids);
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

export interface ContactDetailData {
  id: string;
  type: "customer" | "vendor";
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  website: string | null;
  status: "active" | "inactive";
  billingAddressLine1: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZip: string | null;
  billingCountry: string | null;
  shippingAddressLine1: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  taxNumber: string | null;
  notes: string | null;
}

function ContactDetail({ data }: { data: ContactDetailData }) {
  const router = useRouter();
  const label = data.type === "customer" ? "Customer" : "Vendor";
  const basePath = data.type === "customer" ? "/office/sales/customers" : "/office/purchases/vendors";

  const row = (labelText: string, value: string | null) => (
    <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm uppercase tracking-wide text-muted-foreground">
        {labelText}
      </span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  );

  return (
    <DetailPageShell
      title={data.displayName}
      subtitle={data.companyName}
      status={data.status === "active" ? "Active" : "Inactive"}
      statusVariant={data.status === "active" ? "secondary" : "outline"}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`${basePath}/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              toggleContactStatus(data.id, data.status === "active" ? "inactive" : "active")
            }
          >
            Mark as {data.status === "active" ? "Inactive" : "Active"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {label.toLowerCase()}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete &quot;{data.displayName}&quot;? This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteContact(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      tabs={
        <Tabs defaultValue="overview" className="px-8 pt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <Tabs defaultValue="overview">
        <TabsContent value="overview" className="mt-4 max-w-3xl">
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              {label} Details
            </div>
            <div className="px-4 py-2">
              {row("Name", data.displayName)}
              {row("Company Name", data.companyName)}
              {row("Email", data.email)}
              {row("Phone", data.phone)}
              {row("Mobile", data.mobile)}
              {row("Website", data.website)}
              {row("Tax / VAT Number", data.taxNumber)}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="address" className="mt-4 max-w-3xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border">
              <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
                Billing Address
              </div>
              <div className="px-4 py-2">
                {row("Street", data.billingAddressLine1)}
                {row("City", data.billingCity)}
                {row("State", data.billingState)}
                {row("Zip Code", data.billingZip)}
                {row("Country", data.billingCountry)}
              </div>
            </div>
            <div className="rounded-md border">
              <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
                Shipping Address
              </div>
              <div className="px-4 py-2">
                {row("Street", data.shippingAddressLine1)}
                {row("City", data.shippingCity)}
                {row("State", data.shippingState)}
                {row("Zip Code", data.shippingZip)}
                {row("Country", data.shippingCountry)}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-4 max-w-3xl">
          <div className="rounded-md border p-4 text-sm">{data.notes ?? "No notes"}</div>
        </TabsContent>
      </Tabs>
    </DetailPageShell>
  );
}

export { ContactForm, ContactsList, ContactDetail };
