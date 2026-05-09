import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
    }
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK ERROR] ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const { memberId, productVariantId, batchIds, userId } = session.metadata;
      const parsedBatchIds = JSON.parse(batchIds);

      console.log(`[STRIPE WEBHOOK] Checkout completed for user ${userId}, member ${memberId}`);

      // 1. Fetch variant and related IDs (location and ownership)
      // In this schema, variant -> location_course_offerings -> locations -> ownerships
      const { data: variantOffering, error: variantError } = await supabase
        .from("location_course_offerings")
        .select(`
          location_id,
          price,
          setup_fee,
          locations!inner (
            ownership_id
          )
        `)
        .eq("product_variant_id", productVariantId)
        .single();

      if (variantError || !variantOffering) {
        console.error("Variant offering not found for enrollment creation:", variantError);
        break;
      }

      const { data: memberData } = await supabase
        .from("members")
        .select("customer_id")
        .eq("id", memberId)
        .single();

      // In this schema, enrollment.customer_id points to profiles.id
      // But member.customer_id points to customers.id (which has a profile_id)
      const { data: customerData } = await supabase
        .from("customers")
        .select("profile_id")
        .eq("id", memberData?.customer_id)
        .single();

      // 2. Create the Enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .insert({
          member_id: memberId,
          customer_id: customerData?.profile_id,
          product_variant_id: productVariantId,
          location_id: variantOffering.location_id,
          ownership_id: (variantOffering.locations as any).ownership_id,
          status: "active",
          offering_price: variantOffering.price,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
        })
        .select()
        .single();

      if (enrollError) {
        console.error("Enrollment error:", enrollError);
        break;
      }

      // 3. Link batches
      if (parsedBatchIds.length > 0) {
        const batchLinks = parsedBatchIds.map((bid: string) => ({
          enrollment_id: enrollment.id,
          batch_id: bid
        }));
        await supabase.from("enrollment_batches").insert(batchLinks);
      }

      // 4. Create initial Invoice
      await supabase.from("invoices").insert({
        member_id: memberId,
        amount: session.amount_total / 100,
        status: "paid",
        stripe_invoice_id: session.invoice,
        due_date: new Date().toISOString(),
        description: `Initial Enrollment - ${session.metadata.levelName}`
      });

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      console.log(`[STRIPE WEBHOOK] Recurring payment succeeded for invoice ${invoice.id}`);
      
      // Update enrollment 'valid_until' or status if needed
      // For now, we just log it. In a production app, you'd find the enrollment by stripe_subscription_id
      break;
    }

    default:
      console.log(`[STRIPE WEBHOOK] Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
