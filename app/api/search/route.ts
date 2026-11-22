import { api } from "@/lib/api-client";

// BFF proxy to the Go backend global search (keeps the Clerk token server-side;
// the command palette client keeps calling /api/search unchanged).
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return Response.json({ results: [] });
  }

  const { results } = await api.get<{ results: unknown[] }>(
    `/search?q=${encodeURIComponent(q)}`,
  );
  return Response.json({ results });
}
