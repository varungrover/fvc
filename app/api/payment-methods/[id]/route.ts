import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { setDefaultPaymentMethod, removePaymentMethod } from "@/lib/db/paymentMethods";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;
  const body = await request.json();
  const { customerId } = body;

  try {
    const method = await setDefaultPaymentMethod(supabase, id, customerId);
    return NextResponse.json(method);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    await removePaymentMethod(supabase, id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
