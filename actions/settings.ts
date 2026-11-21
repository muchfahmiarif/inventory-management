"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  brands,
  categories,
  currencies,
  taxes,
  organization,
  roles,
  templates,
  units,
  users,
  orgFlags,
  numberingSeries,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ---------- generic entity CRUD (units, brands, categories, taxes, currencies)

const ENTITY_TABLES = {
  units,
  brands,
  categories,
  taxes,
  currencies,
} as const;

type EntitySlug = keyof typeof ENTITY_TABLES;

const ENTITY_PATHS: Record<EntitySlug, string> = {
  units: "/office/settings/units",
  brands: "/office/settings/brands",
  categories: "/office/settings/categories",
  taxes: "/office/settings/taxes",
  currencies: "/office/settings/currencies",
};

const ENTITY_SCHEMAS: Record<EntitySlug, z.ZodTypeAny> = {
  units: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
  brands: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
  categories: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
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

function revalidateEntity(slug: EntitySlug) {
  revalidatePath(ENTITY_PATHS[slug]);
}

export async function createSettingEntity(
  slug: EntitySlug,
  values: Record<string, unknown>,
) {
  const schema = ENTITY_SCHEMAS[slug];
  if (!schema) throw new Error(`Unknown settings entity: ${slug}`);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = ENTITY_TABLES[slug] as any;
  // currencies uses code as PK
  if (slug === "currencies") {
    const v = parsed.data as { code: string; name: string; symbol: string; exchangeRate: number };
    await db
      .insert(table)
      .values({ code: v.code, name: v.name, symbol: v.symbol, exchangeRate: v.exchangeRate })
      .onConflictDoNothing();
  } else {
    await db.insert(table).values(parsed.data as never);
  }

  await logActivity({
    action: `created ${slug.replace(/s$/, "")} setting`,
    entityType: `setting_${slug}`,
  });

  revalidateEntity(slug);
  return { ok: true as const };
}

export async function updateSettingEntity(
  slug: EntitySlug,
  id: string,
  values: Record<string, unknown>,
) {
  const schema = ENTITY_SCHEMAS[slug];
  if (!schema) throw new Error(`Unknown settings entity: ${slug}`);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = ENTITY_TABLES[slug] as any;
  const v = parsed.data as Record<string, unknown>;
  if (slug === "currencies") {
    await db
      .update(table)
      .set({ name: v.name as string, symbol: v.symbol as string, exchangeRate: v.exchangeRate as number })
      .where(eq((table as typeof currencies).code, id));
  } else if (slug === "taxes") {
    await db
      .update(table)
      .set({
        name: v.name as string,
        rate: v.rate as number,
        isGroup: (v.isGroup as boolean) ?? false,
      })
      .where(eq((table as typeof taxes).id, id));
  } else {
    await db
      .update(table)
      .set({ name: v.name as string, description: (v.description as string) || null })
      .where(eq((table as typeof units).id, id));
  }

  revalidateEntity(slug);
  return { ok: true as const };
}

export async function deleteSettingEntity(slug: EntitySlug, id: string) {
  const table = ENTITY_TABLES[slug];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = ENTITY_TABLES[slug] as any;
    if (slug === "currencies") {
      await db.delete(table).where(eq(table.code, id));
    } else {
      await db.delete(table).where(eq(table.id, id));
    }
  } catch {
    return {
      ok: false as const,
      error: "This item is in use and cannot be deleted.",
    };
  }

  revalidateEntity(slug);
  return { ok: true as const };
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

export async function updateOrganization(values: Record<string, unknown>) {
  const parsed = orgSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const [org] = await db.select().from(organization).limit(1);
  const payload = {
    name: data.name,
    legalName: data.legalName || null,
    addressLine1: data.addressLine1 || null,
    city: data.city || null,
    state: data.state || null,
    zip: data.zip || null,
    country: data.country || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    taxId: data.taxId || null,
    currencyCode: data.currencyCode || "IDR",
    timezone: data.timezone || "Asia/Jakarta",
    updatedAt: new Date(),
  };

  if (org) {
    await db.update(organization).set(payload).where(eq(organization.id, org.id));
  } else {
    await db.insert(organization).values(payload);
  }

  await logActivity({
    action: "updated organization profile",
    entityType: "organization",
  });

  revalidatePath("/office/settings/organization");
  revalidatePath("/office");
  return { ok: true as const };
}

// ---------- numbering series

export async function updateNumberingSeries(
  module: string,
  values: { prefix: string; nextNumber: number; padding: number },
) {
  const parsed = z
    .object({
      prefix: z.string().min(1, "Prefix is required"),
      nextNumber: z.coerce.number().int().min(1),
      padding: z.coerce.number().int().min(1).max(10),
    })
    .safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }

  await db
    .update(numberingSeries)
    .set({
      prefix: parsed.data.prefix,
      nextNumber: parsed.data.nextNumber,
      padding: parsed.data.padding,
    })
    .where(eq(numberingSeries.module, module));

  await logActivity({
    action: `updated numbering series for ${module}`,
    entityType: "numbering_series",
    entityLabel: module,
  });

  revalidatePath("/office/settings/numbering-series");
  return { ok: true as const };
}

// ---------- users & roles

export async function inviteUser(values: { name: string; email: string; roleId?: string }) {
  const parsed = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      roleId: z.string().optional(),
    })
    .safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }

  try {
    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      roleId: parsed.data.roleId || null,
    });
  } catch {
    return { ok: false as const, errors: { email: ["Email already invited"] } };
  }

  await logActivity({
    action: "invited user",
    entityType: "user",
    entityLabel: parsed.data.name,
  });

  revalidatePath("/office/settings/users");
  return { ok: true as const };
}

export async function setUserStatus(id: string, status: "active" | "inactive") {
  await db.update(users).set({ status }).where(eq(users.id, id));
  revalidatePath("/office/settings/users");
}

export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
  await logActivity({
    action: "removed user",
    entityType: "user",
    entityId: id,
  });
  revalidatePath("/office/settings/users");
}

export async function listRoles() {
  return db.select().from(roles);
}

// ---------- templates

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export async function createTemplate(values: Record<string, unknown>) {
  const parsed = templateSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const [tpl] = await db
    .insert(templates)
    .values({
      name: parsed.data.name,
      type: parsed.data.type,
      subject: parsed.data.subject || null,
      body: parsed.data.body || null,
    })
    .returning();

  await logActivity({
    action: "created template",
    entityType: "template",
    entityId: tpl.id,
    entityLabel: tpl.name,
  });
  revalidatePath("/office/settings/templates");
  return { ok: true as const };
}

export async function updateTemplate(
  id: string,
  values: Record<string, unknown>,
) {
  const parsed = templateSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await db
    .update(templates)
    .set({
      name: parsed.data.name,
      type: parsed.data.type,
      subject: parsed.data.subject || null,
      body: parsed.data.body || null,
    })
    .where(eq(templates.id, id));

  revalidatePath("/office/settings/templates");
  return { ok: true as const };
}

export async function deleteTemplate(id: string) {
  await db.delete(templates).where(eq(templates.id, id));
  revalidatePath("/office/settings/templates");
}

// ---------- preference flags (notifications / automations)

export async function setOrgFlag(key: string, value: boolean) {
  const [existing] = await db
    .select()
    .from(orgFlags)
    .where(eq(orgFlags.key, key));
  if (existing) {
    await db.update(orgFlags).set({ value }).where(eq(orgFlags.id, existing.id));
  } else {
    await db.insert(orgFlags).values({ key, value });
  }
  revalidatePath("/office/settings/preferences");
  return { ok: true as const };
}
