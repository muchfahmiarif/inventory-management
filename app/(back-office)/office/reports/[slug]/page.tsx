import { notFound } from "next/navigation";

import { ReportTable } from "@/components/office/reports/report-views";
import { ApiError, api } from "@/lib/api-client";

type ReportPayload = {
  title: string;
  description: string;
  columns: { key: string; header: string; align?: "left" | "right"; money?: boolean; qty?: boolean }[];
  rows: Record<string, unknown>[];
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let report: ReportPayload;
  try {
    report = await api.get<ReportPayload>(`/reports/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <ReportTable title={report.title} columns={report.columns} rows={report.rows} />;
}
