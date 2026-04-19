import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MerchandiseOrderList from "./MerchandiseOrderList";

export default async function AdminMerchandisePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("merchandise_orders")
    .select("*, profiles!merchandise_orders_parent_id_fkey(full_name, email), locations(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Merchandise Orders</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage in-person pickup orders.
        </p>
      </div>

      <MerchandiseOrderList initialOrders={orders ?? []} />
    </div>
  );
}
