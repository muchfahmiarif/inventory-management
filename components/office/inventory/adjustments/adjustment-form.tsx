"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

import { createAdjustment } from "@/actions/adjustments";
import PageFormShell from "@/components/shared/page-form-shell";
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
import { formatQty } from "@/lib/format";
import {
  adjustmentFormSchema,
  type AdjustmentFormInput,
} from "@/lib/schemas/adjustments";

export interface AdjustmentFormValues {
  date: string;
  reference?: string;
  reason?: string;
  warehouseId: string;
  lines: Array<{ itemId: string; systemQuantity?: string; adjustedQuantity: string }>;
}

interface AdjustmentFormProps {
  defaultValues: AdjustmentFormValues;
  warehouses: { id: string; name: string }[];
  items: Array<{ id: string; name: string; sku: string | null; unitName: string | null }>;
  stockByItem: Record<string, number>;
}

const FORM_ID = "adjustment-form";

const today = () => new Date().toISOString().slice(0, 10);

const AdjustmentForm = ({
  defaultValues,
  warehouses,
  items,
  stockByItem,
}: AdjustmentFormProps) => {
  const form = useForm<AdjustmentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adjustmentFormSchema) as unknown as Resolver<AdjustmentFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  const onSubmit = async (values: AdjustmentFormValues) => {
    // Quantities travel as strings; the schema coerces server-side
    await createAdjustment(values as unknown as AdjustmentFormInput);
  };

  return (
    <PageFormShell title="New Adjustment" formId={FORM_ID}>
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
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference #</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Optional" />
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
                    Warehouse <span className="text-red-500">*</span>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={2}
                      placeholder="Why is stock being adjusted?"
                    />
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
                onClick={() => append({ itemId: "", systemQuantity: "0", adjustedQuantity: "0" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => {
                const itemId = form.watch(`lines.${index}.itemId`);
                const systemQty =
                  itemId && stockByItem[itemId] !== undefined
                    ? stockByItem[itemId]
                    : 0;
                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={(v) => {
                              field.onChange(v);
                              form.setValue(
                                `lines.${index}.systemQuantity`,
                                String(stockByItem[v] ?? 0),
                              );
                            }}
                            value={field.value ?? ""}
                          >
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
                    <div className="w-28">
                      <span className="text-sm font-medium">System</span>
                      <p className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                        {formatQty(systemQty)}
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.adjustedQuantity`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel>Adjusted</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
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
                );
              })}
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default AdjustmentForm;
