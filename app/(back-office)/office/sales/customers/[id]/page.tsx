import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ContactDetail } from "@/components/office/contacts/contact-views";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [c] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!c || c.type !== "customer") notFound();

  return <ContactDetail data={c} />;
}
