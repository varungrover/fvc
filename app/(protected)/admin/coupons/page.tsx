import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CouponManager from "./CouponManager";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discount & Coupon Manager</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create and manage discount coupons for courses.
        </p>
      </div>

      <CouponManager initialCoupons={coupons ?? []} />
    </div>
  );
}
