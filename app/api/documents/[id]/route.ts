import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.BACKEND_API_URL ?? "http://localhost:8080/api/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken();

  const upstream = await fetch(`${BASE_URL}/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!upstream.ok || !upstream.body) {
    const status = upstream.status === 404 ? 404 : upstream.status === 410 ? 410 : 502;
    return Response.json({ error: upstream.statusText }, { status });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? `attachment; filename="${id}"`,
    },
  });
}
