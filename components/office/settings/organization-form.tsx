"use client";

import { Resolver, useForm } from "react-hook-form";
import React from "react";

import { updateOrganization } from "@/actions/settings";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const FORM_ID = "org-form";

const orgProfileSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export interface OrganizationFormValues {
  name: string;
  legalName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  currencyCode?: string;
  timezone?: string;
}

function Field({
  control,
  name,
  label,
  type = "text",
  placeholder,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: any;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} type={type} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function OrganizationForm({
  defaults,
  currencies,
}: {
  defaults: OrganizationFormValues;
  currencies: { code: string; name: string }[];
}) {
  const form = useForm<OrganizationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orgProfileSchema) as unknown as Resolver<OrganizationFormValues>,
    defaultValues: defaults,
  });

  const onSubmit = async (values: OrganizationFormValues) => {
    await updateOrganization(values as unknown as Record<string, unknown>);
  };

  return (
    <PageFormShell title="Organization Profile" formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-3xl flex-col gap-4 pb-4"
        >
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Organization Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <Field control={form.control} name="name" label="Organization Name *" />
              <Field control={form.control} name="legalName" label="Legal Name" />
              <Field control={form.control} name="email" label="Email" />
              <Field control={form.control} name="phone" label="Phone" />
              <Field control={form.control} name="website" label="Website" />
              <Field control={form.control} name="taxId" label="Tax ID" />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Address
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <Field control={form.control} name="addressLine1" label="Street" />
              <Field control={form.control} name="city" label="City" />
              <Field control={form.control} name="state" label="State" />
              <Field control={form.control} name="zip" label="Zip Code" />
              <Field control={form.control} name="country" label="Country" />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Preferences
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "IDR"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
              <Field control={form.control} name="timezone" label="Time Zone" />
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
}
