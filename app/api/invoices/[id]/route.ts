import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getInvoice } from "@/lib/db/invoices";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const invoice = await getInvoice(supabase, id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
