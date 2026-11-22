"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ApiError, api } from "@/lib/api-client";

// Thin proxies to the Go backend; signatures match the original actions.
// Result shapes ({ok:false, errors} / {ok:false, error}) are preserved because
// the settings clients read them as return values, not thrown exceptions.

type EntitySlug = "units" | "brands" | "categories" | "taxes" | "currencies";

const ENTITY_PATHS: Record<EntitySlug, string> = {
  units: "/office/settings/units",
  brands: "/office/settings/brands",
  categories: "/office/settings/categories",
  taxes: "/office/settings/taxes",
  currencies: "/office/settings/currencies",
};

const ENTITY_SCHEMAS: Record<EntitySlug, z.ZodTypeAny> = {
  units: z.object({ name: z.string().min(1, "Name is required"), description: z.string().optional() }),
  brands: z.object({ name: z.string().min(1, "Name is required"), description: z.string().optional() }),
  categories: z.object({ name: z.string().min(1, "Name is required"), description: z.string().optional() }),
  taxes: z.object({
    name: z.string().min(1, "Name is required"),
    rate: z.coerce.number().min(0, "Rate must be ≥ 0"),
    isGroup: z.coerce.boolean().optional(),
  }),
  currencies: z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    symbol: z.string().min(1, "Symbol is required"),
    exchangeRate: z.coerce.number().positive("Exchange rate must be > 0"),
  }),
};

type ActionResult = { ok: true } | { ok: false; errors?: Record<string, string[]>; error?: string };

function fieldErrorsFrom(err: unknown): Record<string, string[]> | undefined {
  if (err instanceof ApiError && err.fieldErrors) {
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(err.fieldErrors)) out[k] = [v];
    return out;
  }
  return undefined;
}

export async function createSettingEntity(
  slug: EntitySlug,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  const schema = ENTITY_SCHEMAS[slug];
  if (!schema) throw new Error(`Unknown settings entity: ${slug}`);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.post(`/settings/${slug}`, parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath(ENTITY_PATHS[slug]);
  return { ok: true };
}

export async function updateSettingEntity(
  slug: EntitySlug,
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  const schema = ENTITY_SCHEMAS[slug];
  if (!schema) throw new Error(`Unknown settings entity: ${slug}`);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.patch(`/settings/${slug}/${encodeURIComponent(id)}`, parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath(ENTITY_PATHS[slug]);
  return { ok: true };
}

export async function deleteSettingEntity(slug: EntitySlug, id: string): Promise<ActionResult> {
  try {
    await api.delete(`/settings/${slug}/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof ApiError && err.message.includes("in use")) {
      return { ok: false, error: "This item is in use and cannot be deleted." };
    }
    return { ok: false, error: "Failed to delete." };
  }
  revalidatePath(ENTITY_PATHS[slug]);
  return { ok: true };
}

// ---------- organization profile

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  legalName: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  currencyCode: z.string().optional(),
  timezone: z.string().optional(),
});

export async function updateOrganization(values: Record<string, unknown>): Promise<ActionResult> {
  const parsed = orgSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.patch("/settings/organization", parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath("/office/settings/organization");
  revalidatePath("/office");
  return { ok: true };
}

// ---------- numbering series

export async function updateNumberingSeries(
  module: string,
  values: { prefix: string; nextNumber: number; padding: number },
): Promise<ActionResult> {
  const parsed = z
    .object({
      prefix: z.string().min(1, "Prefix is required"),
      nextNumber: z.coerce.number().int().min(1),
      padding: z.coerce.number().int().min(1).max(10),
    })
    .safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.patch(`/settings/numbering-series/${encodeURIComponent(module)}`, parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath("/office/settings/numbering-series");
  return { ok: true };
}

// ---------- users & roles

export async function inviteUser(values: { name: string; email: string; roleId?: string }): Promise<ActionResult> {
  const parsed = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      roleId: z.string().optional(),
    })
    .safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.post("/settings/users", parsed.data);
  } catch (err) {
    if (err instanceof ApiError && err.fieldErrors?.email) {
      return { ok: false, errors: { email: ["Email already invited"] } };
    }
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath("/office/settings/users");
  return { ok: true };
}

export async function setUserStatus(id: string, status: "active" | "inactive") {
  await api.patch(`/settings/users/${id}/status`, { status });
  revalidatePath("/office/settings/users");
}

export async function deleteUser(id: string) {
  await api.delete(`/settings/users/${id}`);
  revalidatePath("/office/settings/users");
}

export async function listRoles() {
  const { roles } = await api.get<{ users: unknown[]; roles: { id: string; name: string }[] }>(
    "/settings/users",
  );
  return roles;
}

// ---------- templates

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export async function createTemplate(values: Record<string, unknown>): Promise<ActionResult> {
  const parsed = templateSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.post("/settings/templates", parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath("/office/settings/templates");
  return { ok: true };
}

export async function updateTemplate(id: string, values: Record<string, unknown>): Promise<ActionResult> {
  const parsed = templateSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error) as unknown as Record<string, string[]> };
  }
  try {
    await api.patch(`/settings/templates/${id}`, parsed.data);
  } catch (err) {
    return { ok: false, errors: fieldErrorsFrom(err) };
  }
  revalidatePath("/office/settings/templates");
  return { ok: true };
}

export async function deleteTemplate(id: string) {
  await api.delete(`/settings/templates/${id}`);
  revalidatePath("/office/settings/templates");
}

// ---------- preference flags

export async function setOrgFlag(key: string, value: boolean): Promise<ActionResult> {
  await api.put(`/settings/flags/${encodeURIComponent(key)}`, { value });
  revalidatePath("/office/settings/preferences");
  return { ok: true };
}
