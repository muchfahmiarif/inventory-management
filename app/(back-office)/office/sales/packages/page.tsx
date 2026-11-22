import { PackagesList } from "@/components/office/transactions/package-shipment-views";
import { api } from "@/lib/api-client";

type PackageRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  customerName: string | null;
  salesOrderNumber: string | null;
};

export default async function PackagesPage() {
  const rows = await api.get<PackageRow[]>("/packages");

  return <PackagesList data={rows} title="Packages" />;
}
