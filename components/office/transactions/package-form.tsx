"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

import { createPackage } from "@/actions/packages";
import PageFormShell from "@/components/shared/page-form-shell";
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
import { formatQty } from "@/lib/format";
import { packageFormSchema } from "@/lib/schemas/packages";

const FORM_ID = "package-form";

export interface PackageFormValues {
  date: string;
  warehouseId: string;
  notes?: string;
  lines: Array<{ itemId: string; quantity: string }>;
}

interface PackageFormProps {
  soId: string;
  soNumber: string;
  customerName: string;
  defaultValues: PackageFormValues;
  warehouses: { id: string; name: string }[];
  lines: Array<{ itemId: string; name: string; ordered: number }>;
}

// Create Package from a Sales Order: packed quantity per line, capped at the
// ordered quantity. Stock leaves the warehouse when the shipment is created.
const PackageForm = ({
  soId,
  soNumber,
  customerName,
  defaultValues,
  warehouses,
  lines,
}: PackageFormProps) => {
  const form = useForm<PackageFormValues>({
    // Input quantities are strings; the schema coerces server-side. The
    // packed ≤ ordered check runs against the SO in the action.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packageFormSchema) as unknown as Resolver<PackageFormValues>,
    defaultValues,
  });
  const { fields } = useFieldArray({ control: form.control, name: "lines" });
  const watched = form.watch("lines");

  const totalPacked = (watched ?? []).reduce(
    (sum, l) => sum + (Number(l.quantity) || 0),
    0,
  );

  const onSubmit = async (values: PackageFormValues) => {
    await createPackage({
      ...values,
      salesOrderId: soId,
      lines: values.lines.map((l) => ({
        ...l,
        quantity: Number(l.quantity) || 0,
      })),
    });
  };

  return (
    <PageFormShell title={`New Package — ${soNumber}`} formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-4xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-medium">{customerName}</span>
            </p>
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
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ship From Warehouse <span className="text-red-500">*</span>
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
              <span className="text-sm font-medium">Items to Pack</span>
              <span className="text-xs text-muted-foreground">
                quantities are capped at the ordered amount
              </span>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => {
                const ordered = lines[index]?.ordered ?? 0;
                return (
                  <div key={f.id} className="flex items-end gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lines[index]?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Ordered: {formatQty(ordered)}
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel>Pack Qty</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              min={0}
                              max={ordered}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
              <p className="text-sm text-muted-foreground">
                Total packed:{" "}
                <span className="font-medium text-foreground">
                  {formatQty(totalPacked)}
                </span>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default PackageForm;
