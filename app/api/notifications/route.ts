import { api } from "@/lib/api-client";

// BFF proxy to the Go backend notifications feed.
export async function GET() {
  const { notifications } = await api.get<{ notifications: unknown[] }>("/notifications");
  return Response.json({ notifications });
}
