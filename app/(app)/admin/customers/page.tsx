import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCustomers } from "@/lib/db/customers";
import type { Role } from "@/lib/types";
import CustomersClient from "./CustomersClient";

export const metadata = {
  title: "Customers - LMS Admin",
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id, ownership_id, roles(name)")
    .eq("id", user.id)
    .single();

  if (!profile || !(['franchisor_admin','franchisor_mgmt'].includes((profile.roles as any)?.name))) {
    redirect("/login");
  }

  const sessionUser = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name ?? "",
    role: (profile.roles as any)?.name as Role,
    ownershipId: profile.ownership_id ?? null,
    mustChangePassword: false,
  };

  const customers = await listCustomers(supabase, sessionUser);

  return <CustomersClient initialCustomers={customers} />;
}
