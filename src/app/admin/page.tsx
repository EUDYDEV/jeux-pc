import type { Metadata } from "next";
import { PageHeading } from "@/components/PageHeading";
import { AdminClient } from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Espace administrateur (aperçu)",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <PageHeading eyebrow="Aperçu" title="Espace administrateur" />
      <AdminClient />
    </>
  );
}
