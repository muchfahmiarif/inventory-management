import { ContactForm } from "@/components/office/contacts/contact-views";

export default function NewCustomerPage() {
  return (
    <ContactForm
      mode="new"
      contactType="customer"
      defaultValues={{ displayName: "" }}
    />
  );
}
