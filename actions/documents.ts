"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api-client";

const BASE_URL = process.env.BACKEND_API_URL ?? "http://localhost:8080/api/v1";

// uploadDocument forwards the multipart form to the Go backend, which stores
// the file through the configured storage backend (local | s3 | mega).
export async function uploadDocument(formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/documents`, {
    method: "POST",
    headers,
    body: formData, // multipart passthrough — Go parses file + fields
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Upload failed (${res.status})`);
  }
  revalidatePath("/office/documents");
}

export async function deleteDocument(id: string) {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/documents/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Delete failed (${res.status})`);
  }
  revalidatePath("/office/documents");
}

// Download target for the documents list — streams from Go via the proxy route.
export async function redirectToDocument(id: string) {
  redirect(`/api/documents/${id}`);
}
