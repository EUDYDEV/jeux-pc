import type { Metadata } from "next";
import { CatalogueClient } from "@/components/CatalogueClient";
import { PageHeading } from "@/components/PageHeading";

export const metadata: Metadata = {
  title: "Catalogue des jeux PC",
  description: "Parcourez les jeux PC disponibles à l'installation à Abidjan : prix en FCFA, configuration minimale, recherche et filtres.",
};

export default function CataloguePage() {
  return (
    <>
      <PageHeading eyebrow="Catalogue" title="Choisissez vos jeux">
        Recherchez, filtrez et ajoutez plusieurs jeux à votre sélection. Le total estimatif se calcule automatiquement.
      </PageHeading>
      <CatalogueClient />
    </>
  );
}
