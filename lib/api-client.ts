import { auth } from "@clerk/nextjs/server";

/**
 * Typed fetch wrapper for the Go backend (inventory-backend).
 * All calls run server-side (server components + server actions proxies) and
 * carry the Clerk session token, which the backend verifies with clerk-sdk-go.
 */

const BASE_URL = process.env.BACKEND_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public fieldErrors: Record<string, string> | undefined,
    message: string,
  ) {
    super(message);
  }
}

// Envelope matching the Go backend's respond.go contract.
type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string; errors?: Record<string, string> };

async function sessionToken(): Promise<string | null> {
  try {
    const { getToken } = await auth();
    return await getToken();
  } catch {
    // Clerk not configured yet (gate period) — call unauthenticated.
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  const token = await sessionToken();

  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const hasBody = init?.body !== undefined;
  if (hasBody) headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: hasBody ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !json || !json.ok) {
    const message =
      json && "error" in json && json.error
        ? json.error
        : `API ${init?.method ?? "GET"} ${path} failed (${res.status})`;
    throw new ApiError(res.status, json && "errors" in json ? json.errors : undefined, message);
  }
  return json.data;
}

// Convenience verbs used by the server-action proxies.
export const api = {
  get: <T,>(path: string) => apiFetch<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),
  put: <T,>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body }),
  patch: <T,>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),
  delete: <T,>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
