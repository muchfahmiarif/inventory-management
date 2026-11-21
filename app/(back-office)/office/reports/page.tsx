import Link from "next/link";

import { REPORTS } from "@/lib/reports";

export default async function ReportsIndexPage() {
  const groups = ["Inventory", "Sales", "Purchases"] as const;

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-2xl font-semibold">Reports</h2>
      {groups.map((group) => {
        const reports = REPORTS.filter((r) => r.group === group);
        if (!reports.length) return null;
        return (
          <section key={group}>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {group}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((r) => (
                <Link
                  key={r.slug}
                  href={`/office/reports/${r.slug}`}
                  className="rounded-md border bg-white p-4 drop-shadow-sm transition-colors hover:border-primary dark:bg-card"
                >
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
