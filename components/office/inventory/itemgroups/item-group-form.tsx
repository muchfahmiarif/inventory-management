"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

import { createItemGroup, updateItemGroup } from "@/actions/item-groups";
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
import { Textarea } from "@/components/ui/textarea";
import { itemGroupFormSchema, type ItemGroupFormInput } from "@/lib/schemas/item-groups";

export interface ItemGroupFormValues {
  name: string;
  description?: string;
  attributes?: Array<{ name: string }>;
}

const FORM_ID = "item-group-form";

interface ItemGroupFormProps {
  mode: "new" | "edit";
  itemGroupId?: string;
  defaultValues: ItemGroupFormValues;
}

const ItemGroupForm = ({ mode, itemGroupId, defaultValues }: ItemGroupFormProps) => {
  const form = useForm<ItemGroupFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemGroupFormSchema) as unknown as Resolver<ItemGroupFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "attributes" });

  const onSubmit = async (values: ItemGroupFormValues) => {
    if (mode === "new") {
      await createItemGroup(values as ItemGroupFormInput);
    } else {
      await updateItemGroup(itemGroupId!, values as ItemGroupFormInput);
    }
  };

  return (
    <PageFormShell
      title={mode === "new" ? "New Item Group" : "Edit Item Group"}
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
              Item Group Details
            </div>
            <div className="flex flex-col gap-4 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Group Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Group Name" />
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
                      <Textarea {...field} value={field.value ?? ""} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">Attributes (for variants)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Attribute
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add attributes like Color or Size to differentiate variants of this
                  group.
                </p>
              )}
              {fields.map((f, index) => (
                <div key={f.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`attributes.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Attribute name (e.g. Color)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove attribute"
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

export default ItemGroupForm;
