import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { createSubscriptionCheckout } from "@/lib/stripe";
import { computeFirstMonthAmount, computeMultiPlanetDiscount } from "@/lib/billing/invoice";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { memberId, productVariantId, batchIds } = body;

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[CHECKOUT ERROR] STRIPE_SECRET_KEY is missing. Did you restart the server?");
      return new NextResponse("Stripe is not configured", { status: 500 });
    }

    const supabase = await createClient();

    // 1. Fetch the level (product variant) details
    console.log("[CHECKOUT] Fetching variant:", productVariantId);
    const { data: level, error: levelError } = await supabase
      .from("product_variants")
      .select(`
        *,
        product:products(name, planet:planets(name))
      `)
      .eq("id", productVariantId)
      .single();

    if (levelError || !level) {
      console.error("Level error:", levelError);
      return new NextResponse("Invalid course level", { status: 400 });
    }

    // 2. Fetch discount tiers for calculations
    const { data: tiers } = await supabase
      .from("discount_tiers")
      .select("*")
      .eq("is_active", true);

    // 3. Fetch active enrollments for this member to calculate multi-planet discount
    const { count: activeCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "active");

    // 4. Calculate final price
    const basePrice = level.price;
    const proratedAmount = computeFirstMonthAmount(basePrice, new Date());
    const setupFee = level.setup_fee || 0;
    const activeEnrollments = (activeCount || 0) + 1; // +1 for the new one
    const discount = computeMultiPlanetDiscount(proratedAmount, activeEnrollments, tiers || []);
    
    const finalAmount = Math.max(0, proratedAmount + setupFee - discount);
    const productName = `${level.product.planet.name}: ${level.product.name} (${level.name})`;

    // 5. Create Stripe Checkout Session
    const stripeSession = await createSubscriptionCheckout({
      email: session.email,
      priceAmount: finalAmount,
      productName,
      successUrl: `${req.headers.get("origin")}/customer/enroll/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.headers.get("origin")}/customer/enroll`,
      metadata: {
        memberId,
        productVariantId,
        batchIds: JSON.stringify(batchIds),
        userId: session.id,
        levelName: level.name,
        planetName: level.product.planet.name
      }
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    console.error("[CHECKOUT ERROR] Full Error Details:", err);
    return new NextResponse(err.message || "Internal Server Error", { status: 500 });
  }
}
