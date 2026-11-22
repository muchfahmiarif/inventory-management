import { ContactForm } from "@/components/office/contacts/contact-views";

export default function NewVendorPage() {
  return (
    <ContactForm
      mode="new"
      contactType="vendor"
      defaultValues={{ displayName: "" }}
    />
  );
}
