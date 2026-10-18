import { AdminProfileGate } from "@/components/admin/profile-gate";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await readSession())) redirect("/auth/login");
  return <AdminProfileGate>{children}</AdminProfileGate>;
}
