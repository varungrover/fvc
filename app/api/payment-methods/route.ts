import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listPaymentMethods, addPaymentMethod } from "@/lib/db/paymentMethods";
import { attachPaymentMethod } from "@/lib/stripe";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const methods = await listPaymentMethods(supabase, customerId);
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { customerId, stripePmId, last4, cardBrand, expMonth, expYear, isDefault } = body;

  try {
    // 1. Attach to Stripe (Mock)
    await attachPaymentMethod("cus_mock_123", stripePmId);

    // 2. Save to DB
    const method = await addPaymentMethod(supabase, {
      customerId,
      stripePmId,
      last4,
      cardBrand,
      expMonth,
      expYear,
      isDefault,
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
