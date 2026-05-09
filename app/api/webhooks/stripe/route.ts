import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  console.log("[STRIPE WEBHOOK] Received request at " + new Date().toISOString());
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
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { memberId, productVariantId, batchIds, userId } = session.metadata;
        const parsedBatchIds = JSON.parse(batchIds || "[]");

        console.log(`[STRIPE WEBHOOK] Checkout completed for user ${userId}, member ${memberId}`);
        console.log(`[STRIPE WEBHOOK] Fetching offering for variant: ${productVariantId}`);
        
        const { data: offering, error: offeringError } = await supabase
          .from("location_course_offerings")
          .select("location_id, price, setup_fee")
          .eq("product_variant_id", productVariantId)
          .limit(1)
          .single();

        if (offeringError || !offering) {
          console.error("[STRIPE WEBHOOK] Offering not found:", offeringError);
          break;
        }

        console.log(`[STRIPE WEBHOOK] Offering found at location: ${offering.location_id}`);

        // Fetch location to get ownership_id
        const { data: locationData, error: locError } = await supabase
          .from("locations")
          .select("ownership_id")
          .eq("id", offering.location_id)
          .single();

        if (locError || !locationData) {
          console.error("[STRIPE WEBHOOK] Location not found:", locError);
          break;
        }

        const ownershipId = locationData.ownership_id;

        // Fetch member and customer details
        const { data: memberData, error: memberFetchError } = await supabase
          .from("members")
          .select("customer_id")
          .eq("id", memberId)
          .single();

        if (memberFetchError || !memberData) {
          console.error("[STRIPE WEBHOOK] Member not found:", memberFetchError);
          break;
        }

        // Fetch customer (which links to profile)
        const { data: customerData, error: customerFetchError } = await supabase
          .from("customers")
          .select("profile_id")
          .eq("id", memberData.customer_id)
          .single();

        if (customerFetchError || !customerData) {
          console.error("[STRIPE WEBHOOK] Customer not found:", customerFetchError);
          break;
        }

        // 2. Create the Enrollment
        const { data: enrollment, error: enrollError } = await supabase
          .from("enrollments")
          .insert({
            member_id: memberId,
            customer_id: customerData.profile_id,
            product_variant_id: productVariantId,
            location_id: offering.location_id,
            ownership_id: ownershipId,
            status: "active",
            offering_price: offering.price,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
          })
          .select()
          .single();

        if (enrollError) {
          console.error("[STRIPE WEBHOOK] Enrollment error:", enrollError);
          break;
        }

        console.log(`[STRIPE WEBHOOK] Enrollment created: ${enrollment.id}`);

        // 3. Link batches
        if (parsedBatchIds.length > 0) {
          const batchLinks = parsedBatchIds.map((bid: string) => ({
            enrollment_id: enrollment.id,
            batch_id: bid
          }));
          const { error: batchError } = await supabase.from("enrollment_batches").insert(batchLinks);
          if (batchError) {
            console.error("[STRIPE WEBHOOK] Batch link error:", batchError);
          }
        }

        // 4. Create initial Invoice
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);

        const { error: invoiceError } = await supabase.from("invoices").insert({
          customer_id: customerData.profile_id,
          ownership_id: ownershipId,
          amount: session.amount_total / 100,
          discount: 0,
          tax: 0,
          total: session.amount_total / 100,
          status: "paid",
          stripe_pi_id: session.payment_intent || session.id,
          due_date: now.toISOString(),
          billing_period_start: now.toISOString(),
          billing_period_end: nextMonth.toISOString(),
          issued_at: now.toISOString(),
          paid_at: now.toISOString(),
          notes: `Initial Enrollment - ${session.metadata.levelName || 'Course'}`
        });

        if (invoiceError) {
          console.error("[STRIPE WEBHOOK] Invoice creation error:", invoiceError);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        console.log(`[STRIPE WEBHOOK] Recurring payment succeeded for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type ${event.type}`);
    }
  } catch (handlerError: any) {
    console.error(`[STRIPE WEBHOOK HANDLER CRASH] ${handlerError.message}`);
    return NextResponse.json({ error: `Handler Error: ${handlerError.message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
