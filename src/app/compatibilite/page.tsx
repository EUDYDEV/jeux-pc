import type { Metadata } from "next";
import { PageHeading, Steps } from "@/components/PageHeading";
import { CompatClient } from "@/components/CompatClient";

export const metadata: Metadata = {
  title: "Vérifier la compatibilité de mon PC",
  description: "Renseignez processeur, RAM, carte graphique et stockage : estimation instantanée de la compatibilité de vos jeux.",
};

export default function CompatPage() {
  return (
    <>
      <PageHeading eyebrow="Compatibilité" title="Votre PC peut-il le faire tourner ?">
        Renseignez les caractéristiques de votre ordinateur. Vous obtenez une première estimation, puis le technicien valide.
      </PageHeading>
      <Steps current={1} />
      <CompatClient />
    </>
  );
}
