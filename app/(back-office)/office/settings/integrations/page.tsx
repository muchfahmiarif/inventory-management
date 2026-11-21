import Link from "next/link";

const INTEGRATIONS = [
  { name: "Tokopedia", desc: "Sync online sales from Tokopedia", enabled: true },
  { name: "Shopee", desc: "Sync online sales from Shopee", enabled: true },
  { name: "Xendit Payments", desc: "Accept online payments via Xendit", enabled: false },
  { name: "Shipping Providers", desc: "Connect JNE, J&T, SiCepat and more", enabled: false },
  { name: "Accounting Sync", desc: "Push transactions to your accounting app", enabled: false },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-2xl font-semibold">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Connect external services to your organization.
      </p>
      <div className="grid max-w-3xl grid-cols-1 gap-3">
        {INTEGRATIONS.map((i) => (
          <div
            key={i.name}
            className="flex items-center justify-between rounded-md border bg-white p-4 drop-shadow-sm dark:bg-card"
          >
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-xs text-muted-foreground">{i.desc}</p>
            </div>
            {i.enabled ? (
              <Link
                href="/office/settings"
                className="text-sm font-medium text-primary hover:underline"
              >
                Configure →
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Coming soon</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
