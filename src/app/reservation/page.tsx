import type { Metadata } from "next";
import { PageHeading, Steps } from "@/components/PageHeading";
import { ReservationClient } from "@/components/ReservationClient";

export const metadata: Metadata = {
  title: "Réserver une installation",
  description: "Demandez un rendez-vous d'installation de jeux PC à Abidjan, à domicile ou à distance, et envoyez le récapitulatif sur WhatsApp.",
};

export default function ReservationPage() {
  return (
    <>
      <PageHeading eyebrow="Réservation" title="Réserver mon installation">
        Remplissez le formulaire : votre demande est résumée puis envoyée au technicien sur WhatsApp.
      </PageHeading>
      <Steps current={2} />
      <ReservationClient />
    </>
  );
}
