import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getInvoice, updateInvoiceStatus } from "@/lib/db/invoices";
import { createPaymentIntent } from "@/lib/stripe/client";

export async function POST(
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

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    // Simulate Stripe retry
    const pi = await createPaymentIntent(
      Math.round(invoice.total * 100),
      "cad",
      invoice.customer_id,
      invoice.payment_method_id
    );

    const updated = await updateInvoiceStatus(
      supabase,
      id,
      pi.status === "succeeded" ? "paid" : "failed",
      pi.id,
      pi.status === "succeeded" ? new Date().toISOString() : undefined
    );

    return NextResponse.json({ invoice: updated, paymentIntent: pi });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
