"use client";

import Link from "next/link";
import React from "react";

import { Input } from "@/components/ui/input";

const GROUPS = [
  {
    group: "Organization",
    items: [
      { title: "Organization Profile", desc: "Company details, address, tax ID", href: "/office/settings/organization" },
      { title: "Users & Roles", desc: "Invite users and manage roles", href: "/office/settings/users" },
    ],
  },
  {
    group: "Items & Inventory",
    items: [
      { title: "Taxes", desc: "Tax rates applied to transactions", href: "/office/settings/taxes" },
      { title: "Currencies", desc: "Currencies and exchange rates", href: "/office/settings/currencies" },
      { title: "Units", desc: "Units of measurement for items", href: "/office/settings/units" },
      { title: "Brands", desc: "Item brands", href: "/office/settings/brands" },
      { title: "Categories", desc: "Item categories", href: "/office/settings/categories" },
    ],
  },
  {
    group: "Preferences",
    items: [
      { title: "Numbering Series", desc: "Auto-number prefixes per module", href: "/office/settings/numbering-series" },
      { title: "Templates", desc: "Email and print templates", href: "/office/settings/templates" },
      { title: "Notifications & Automations", desc: "Alert and automation toggles", href: "/office/settings/preferences" },
      { title: "Integrations", desc: "Connect external services", href: "/office/settings/integrations" },
    ],
  },
];

const ALL_CARDS = GROUPS.flatMap((g) =>
  g.items.map((i) => ({ ...i, group: g.group })),
);

export default function SettingsIndexPage() {
  const [query, setQuery] = React.useState("");
  const q = query.toLowerCase();
  const groups = GROUPS.map((g) => ({
    ...g,
    items: ALL_CARDS.filter(
      (c) =>
        c.group === g.group &&
        (c.title.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q)),
    ),
  }));

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <Input
          placeholder="Search settings ( / )"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {groups.map((g) =>
        g.items.length ? (
          <section key={g.group}>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {g.group}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-md border bg-white p-4 drop-shadow-sm transition-colors hover:border-primary dark:bg-card"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
