"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { toast } from "sonner";

import { setOrgFlag } from "@/actions/settings";
import { Switch } from "@/components/ui/switch";

export interface FlagRow {
  key: string;
  value: boolean;
}

const FLAGS = [
  { key: "notify_low_stock", label: "Low stock alerts", section: "Notifications" },
  { key: "notify_new_order", label: "Email me when a new order arrives", section: "Notifications" },
  { key: "notify_payment", label: "Email me when a payment is recorded", section: "Notifications" },
  { key: "auto_mark_shipped", label: "Mark sales orders as shipped when a shipment is created", section: "Automations" },
  { key: "auto_bill_on_receive", label: "Create a draft bill when a purchase order is received", section: "Automations" },
] as const;

export function PreferencesClient({ flags }: { flags: FlagRow[] }) {
  const router = useRouter();
  const [state, setState] = React.useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const f of flags) map[f.key] = f.value;
    return map;
  });

  const toggle = async (key: string, value: boolean) => {
    setState((s) => ({ ...s, [key]: value }));
    await setOrgFlag(key, value);
    toast.success("Preference saved");
    router.refresh();
  };

  const sections = ["Notifications", "Automations"] as const;

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-2xl font-semibold">Notifications & Automations</h2>
      {sections.map((section) => (
        <section key={section} className="max-w-2xl">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {section}
          </h3>
          <div className="rounded-md border">
            {FLAGS.filter((f) => f.section === section).map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
              >
                <span className="text-sm">{f.label}</span>
                <Switch
                  checked={state[f.key] ?? false}
                  onCheckedChange={(v) => toggle(f.key, v)}
                  aria-label={f.label}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
