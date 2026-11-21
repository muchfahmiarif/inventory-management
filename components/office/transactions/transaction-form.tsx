"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

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
import { formatMoney } from "@/lib/format";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const FORM_ID = "transaction-form";

export interface TransactionLineValues {
  itemId: string;
  description?: string;
  quantity: string;
  rate: string;
  discountPercent?: string;
  taxId?: string;
}

export interface TransactionFormValues {
  date: string;
  contactId: string;
  warehouseId?: string;
  reference?: string;
  expiryDate?: string;
  notes?: string;
  terms?: string;
  lines: TransactionLineValues[];
}

interface ItemOption {
  id: string;
  name: string;
  sellingPrice: number | null;
}

interface TransactionFormProps {
  mode: "new" | "edit";
  transactionId?: string;
  title: string;
  contactLabel: string;
  defaultValues: TransactionFormValues;
  contacts: { id: string; name: string }[];
  items: ItemOption[];
  taxes: { id: string; name: string; rate: number }[];
  // Server action passed from the page (create or update)
  submitAction: (input: TransactionFormInput) => Promise<unknown>;
  // Optional extra date field, e.g. "Expiry Date" / "Expected Shipment"
  extraDateLabel?: string;
  extraDateKey?: "expiryDate";
  // Purchase orders: delivery warehouse for Receive Items stock-in
  warehouse?: { label: string; options: { id: string; name: string }[] };
}

// Shared transaction form (Zoho-style): header fields + line-item table with
// live totals. Totals are recomputed server-side on save.
const TransactionForm = ({
  title,
  contactLabel,
  defaultValues,
  contacts,
  items,
  taxes,
  submitAction,
  extraDateLabel,
  extraDateKey,
  warehouse,
}: TransactionFormProps) => {
  const form = useForm<TransactionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionFormSchema) as unknown as Resolver<TransactionFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });
  const watchedLines = form.watch("lines");

  // Live totals for UX (server recomputes on save)
  const totals = (watchedLines ?? []).reduce(
    (acc, l) => {
      const gross = (Number(l.quantity) || 0) * (Number(l.rate) || 0);
      const discount = gross * ((Number(l.discountPercent) || 0) / 100);
      const net = gross - discount;
      const taxRate = l.taxId
        ? (taxes.find((t) => t.id === l.taxId)?.rate ?? 0)
        : 0;
      const tax = net * (taxRate / 100);
      return {
        subtotal: acc.subtotal + gross,
        discountTotal: acc.discountTotal + discount,
        taxTotal: acc.taxTotal + tax,
        total: acc.total + net + tax,
      };
    },
    { subtotal: 0, discountTotal: 0, taxTotal: 0, total: 0 },
  );

  const onSubmit = async (values: TransactionFormValues) => {
    // Strip "none" sentinels — taxId must be undefined, not the literal string
    const payload = {
      ...values,
      lines: values.lines.map((l) => ({
        ...l,
        taxId: l.taxId && l.taxId !== "none" ? l.taxId : undefined,
      })),
    };
    // Quantities travel as strings; the schema coerces server-side
    await submitAction(payload as unknown as TransactionFormInput);
  };

  return (
    <PageFormShell title={title} formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-5xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {contactLabel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${contactLabel.toLowerCase()}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
            {extraDateKey && (
              <FormField
                control={form.control}
                name={extraDateKey}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{extraDateLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
            {warehouse && (
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{warehouse.label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouse.options.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">Line Items</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    itemId: "",
                    quantity: "1",
                    rate: "0",
                    discountPercent: "0",
                    taxId: "none",
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Add Line
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => (
                <div key={f.id} className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={(v) => {
                              field.onChange(v);
                              const item = items.find((i) => i.id === v);
                              if (item?.sellingPrice != null) {
                                form.setValue(`lines.${index}.rate`, String(item.sellingPrice));
                              }
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
                        <FormItem className="w-24">
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="number" min={0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.rate`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>Rate</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="number" min={0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.discountPercent`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Disc %</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="number" min={0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.taxId`}
                      render={({ field }) => (
                        <FormItem className="w-40">
                          <FormLabel>Tax</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {taxes.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name} ({t.rate}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                  <FormField
                    control={form.control}
                    name={`lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Line description (optional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-72 rounded-md border p-4 text-sm">
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(totals.subtotal)}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatMoney(totals.discountTotal)}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatMoney(totals.taxTotal)}</span>
              </p>
              <p className="flex justify-between border-t py-1 font-medium">
                <span>Total</span>
                <span>{formatMoney(totals.total)}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default TransactionForm;
