import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listInvoices } from "@/lib/db/invoices";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const ownershipId = searchParams.get("ownershipId");
  const status = searchParams.get("status") as any;

  try {
    const invoices = await listInvoices(supabase, {
      customerId: customerId || undefined,
      ownershipId: ownershipId || undefined,
      status,
    });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
