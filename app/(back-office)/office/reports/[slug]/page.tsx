import { notFound } from "next/navigation";

import { ReportTable } from "@/components/office/reports/report-views";
import { getReportBySlug } from "@/lib/reports";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) notFound();

  const rows = await report.load();

  return <ReportTable title={report.title} columns={report.columns} rows={rows} />;
}
