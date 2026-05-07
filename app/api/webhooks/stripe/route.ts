import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { updateInvoiceStatus } from "@/lib/db/invoices";

// Stripe requires the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as any;
      console.log(`[STRIPE WEBHOOK] PaymentIntent ${paymentIntent.id} succeeded`);
      // In a real app, find the invoice by paymentIntent.id and mark as paid
      break;
    case "payment_intent.payment_failed":
      const failedPI = event.data.object as any;
      console.log(`[STRIPE WEBHOOK] PaymentIntent ${failedPI.id} failed`);
      break;
    default:
      console.log(`[STRIPE WEBHOOK] Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
