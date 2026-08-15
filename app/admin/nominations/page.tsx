import type { Metadata } from "next";
import AdminNominations from "./AdminNominations";

export const metadata: Metadata = {
  title: "Nomination Desk | API Excellence Awards 2026",
  description: "Private administration area for API Excellence Awards nominations.",
  robots: { index: false, follow: false },
};

export default function AdminNominationsPage() {
  return <AdminNominations />;
}
