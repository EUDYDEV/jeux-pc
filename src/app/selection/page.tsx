import type { Metadata } from "next";
import { PageHeading, Steps } from "@/components/PageHeading";
import { SelectionClient } from "@/components/SelectionClient";

export const metadata: Metadata = {
  title: "Ma sélection",
  description: "Retrouvez les jeux sélectionnés et le total estimatif de votre installation.",
};

export default function SelectionPage() {
  return (
    <>
      <PageHeading eyebrow="Panier" title="Ma sélection" />
      <Steps current={0} />
      <SelectionClient />
    </>
  );
}
